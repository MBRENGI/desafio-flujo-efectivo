import { NextResponse } from "next/server";
import { db,ensureSecuritySchema } from "../../../lib/db";
import { clientHash,hmac,makeSession,safeEqual,sameOrigin } from "../../../lib/security";

export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Origen no autorizado"},{status:403});
 await ensureSecuritySchema();const body=await request.json().catch(()=>null) as {email?:string;code?:string}|null;
 const email=body?.email?.trim().toLowerCase()||"";const code=body?.code?.trim()||"";if(!/^\d{6}$/.test(code))return NextResponse.json({error:"Código inválido"},{status:400});
 const now=Math.floor(Date.now()/1000);const d=await db();const row=await d.prepare("SELECT id,name,code_hash,expires_at,failed_attempts,consumed_at FROM verification_codes WHERE email=? ORDER BY id DESC LIMIT 1").bind(email).first<{id:number;name:string;code_hash:string;expires_at:number;failed_attempts:number;consumed_at:number|null}>();
 if(!row||row.consumed_at||row.expires_at<now||row.failed_attempts>=5)return NextResponse.json({error:"Código vencido o bloqueado. Solicita uno nuevo."},{status:401});
 const expected=await hmac(`${email}:${code}`);const stored=row.code_hash.split(":").at(-1)||"";
 if(!safeEqual(expected,stored)){await d.prepare("UPDATE verification_codes SET failed_attempts=failed_attempts+1 WHERE id=?").bind(row.id).run();return NextResponse.json({error:"Código incorrecto"},{status:401})}
 await d.prepare("UPDATE verification_codes SET consumed_at=? WHERE id=?").bind(now,row.id).run();
 const token=await makeSession({role:"student",email,name:row.name,ip:await clientHash(request)},7200);
 return NextResponse.json({ok:true,name:row.name},{headers:{"Set-Cookie":`fl_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=7200`}});
}
