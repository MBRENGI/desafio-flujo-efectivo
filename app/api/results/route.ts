import { NextResponse } from "next/server";
import { db,ensureSecuritySchema } from "../../lib/db";
import { clientHash,cookieValue,readSession,sameOrigin } from "../../lib/security";

export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Origen no autorizado"},{status:403});
 const session=await readSession(cookieValue(request,"fl_session"));if(!session||session.role!=="student")return NextResponse.json({error:"Sesión requerida"},{status:401});
 const body=await request.json().catch(()=>null) as {remainingSeconds?:number;scenario?:string;level?:number}|null;
 const remaining=Math.max(0,Math.min(1800,Math.round(Number(body?.remainingSeconds))));const level=Math.max(1,Math.min(3,Math.round(Number(body?.level))));const scenario=String(body?.scenario||"").slice(0,100);
 if(!Number.isFinite(remaining)||!Number.isFinite(level)||!scenario)return NextResponse.json({error:"Resultado inválido"},{status:400});
 await ensureSecuritySchema();const d=await db();const count=await d.prepare("SELECT COUNT(*) AS n FROM attempts WHERE email=?").bind(session.email).first<{n:number}>();if((count?.n||0)>=3)return NextResponse.json({error:"Ya utilizaste los tres intentos disponibles."},{status:409});
 const aggregate=await d.prepare("SELECT COUNT(*) AS answered, COALESCE(SUM(is_correct),0) AS correct FROM (SELECT exercise_id, MAX(is_correct) AS is_correct FROM activity_progress WHERE email=? AND scenario=? AND level=? GROUP BY exercise_id)").bind(session.email,scenario,level).first<{answered:number;correct:number}>();const expected=level===1?8:level===2?12:20;if((aggregate?.answered||0)<expected)return NextResponse.json({error:"El intento aún no está completo en el servidor."},{status:409});const score=Math.round((aggregate?.correct||0)/expected*100);const grade=Math.round((1+score*.06)*10)/10;
 await d.prepare("INSERT INTO attempts(student_name,email,attempt_number,score,grade,remaining_seconds,scenario,level,consent_version,ip_hash) VALUES(?,?,?,?,?,?,?,?,?,?)").bind(String(session.name).slice(0,100),String(session.email).slice(0,160),(count?.n||0)+1,score,grade,remaining,scenario,level,"2026-08",await clientHash(request)).run();
 return NextResponse.json({ok:true,attemptNumber:(count?.n||0)+1});
}
