import { NextResponse } from "next/server";
import { db,ensureSecuritySchema } from "../../../lib/db";
import { clientHash,emailAllowed,hmac,runtimeConfig,sameOrigin } from "../../../lib/security";

export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Origen no autorizado"},{status:403});
 await ensureSecuritySchema();
 const body=await request.json().catch(()=>null) as {name?:string;email?:string;consent?:boolean}|null;
 const name=body?.name?.trim().slice(0,100)||"";const email=body?.email?.trim().toLowerCase()||"";
 if(name.length<3||!emailAllowed(email)||body?.consent!==true)return NextResponse.json({error:"Revisa nombre, correo institucional y consentimiento."},{status:400});
 const now=Math.floor(Date.now()/1000);const subject=await clientHash(request);const d=await db();
 const recent=await d.prepare("SELECT COUNT(*) AS n FROM verification_codes WHERE (email=? OR code_hash LIKE ?) AND created_at>?").bind(email,`${subject}:%`,now-900).first<{n:number}>();
 if((recent?.n||0)>=4)return NextResponse.json({error:"Demasiadas solicitudes. Espera 15 minutos."},{status:429,headers:{"Retry-After":"900"}});
 const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1_000_000).padStart(6,"0");
 const codeHash=`${subject}:${await hmac(`${email}:${code}`)}`;
 await d.prepare("INSERT INTO verification_codes(email,name,code_hash,expires_at,failed_attempts,created_at) VALUES(?,?,?,?,0,?)").bind(email,name,codeHash,now+600,now).run();
 const config=runtimeConfig();const from=config.EMAIL_FROM||config.RESEND_FROM_EMAIL;if(!config.RESEND_API_KEY||!from)return NextResponse.json({error:"El servicio de correo aún no está configurado."},{status:503});
 const sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${config.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[email],subject:"Código de acceso · FlujoLab",html:`<div style="font-family:Arial,sans-serif;max-width:520px"><h2>Tu código de acceso</h2><p>Ingresa este código en FlujoLab. Expira en 10 minutos y solo puede usarse una vez.</p><p style="font-size:32px;font-weight:800;letter-spacing:8px">${code}</p><p>Si no lo solicitaste, ignora este mensaje.</p></div>`})});
 if(!sent.ok){await d.prepare("INSERT INTO security_events(event_type,subject_hash,detail,created_at) VALUES('email_failure',?,'resend',?)").bind(subject,now).run();return NextResponse.json({error:"No fue posible enviar el código."},{status:502})}
 return NextResponse.json({ok:true,expiresIn:600});
}
