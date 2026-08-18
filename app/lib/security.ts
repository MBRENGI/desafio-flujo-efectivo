const enc=new TextEncoder();
const cfg=()=>process.env as Record<string,string|undefined>;
const b64=(bytes:Uint8Array)=>{let s="";for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")};
const unb64=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((s.length+3)%4)),c=>c.charCodeAt(0));
const secret=()=>{const c=cfg();const value=c.COOKIE_SECRET||c.ACCESS_CODE_SECRET||c.PROFESSOR_COOKIE_SECRET;if(!value||value.length<32)throw new Error("A session secret with at least 32 characters is required");return value};
export const hmac=async(value:string)=>{const key=await crypto.subtle.importKey("raw",enc.encode(secret()),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64(new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(value))))};
export const hashSubject=async(value:string)=>hmac(value.trim().toLowerCase());
export const safeEqual=(a:string,b:string)=>{if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0};
export const makeSession=async(payload:Record<string,unknown>,seconds:number)=>{const body=b64(enc.encode(JSON.stringify({...payload,exp:Math.floor(Date.now()/1000)+seconds})));return `${body}.${await hmac(body)}`};
export const readSession=async(token:string|undefined)=>{if(!token)return null;const [body,sig]=token.split(".");if(!body||!sig||!safeEqual(await hmac(body),sig))return null;try{const data=JSON.parse(new TextDecoder().decode(unb64(body)));return typeof data.exp==="number"&&data.exp>Date.now()/1000?data:null}catch{return null}};
export const cookieValue=(request:Request,name:string)=>request.headers.get("cookie")?.split(";").map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.slice(name.length+1);
export const sameOrigin=(request:Request)=>{const origin=request.headers.get("origin");return !origin||origin===new URL(request.url).origin};
export const clientHash=async(request:Request)=>hashSubject(request.headers.get("cf-connecting-ip")||"unknown");
export const emailAllowed=(email:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim())
export const runtimeConfig=cfg;
