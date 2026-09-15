import { NextRequest, NextResponse } from "next/server";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { enforceMutationSecurity, readJsonBody, securityErrorResponse } from "@/lib/security/http";

const allowed=new Set(["mode_selected","mode_switched","step_view","recommendation_accepted","recommendation_dismissed","budget_selected","submitted"]);

export async function POST(request:NextRequest){
  const securityError=await enforceMutationSecurity(request,{bucket:"estimator-analytics",limit:120,windowSeconds:60});
  if(securityError)return securityError;
  let body:{session_id?:unknown;event_name?:unknown;mode?:unknown;details?:unknown};
  try{body=await readJsonBody(request,16*1024);}catch(error){return securityErrorResponse(error)||NextResponse.json({error:"Invalid event."},{status:400});}
  const eventName=typeof body.event_name==="string"?body.event_name:"";
  if(!allowed.has(eventName))return NextResponse.json({error:"Unsupported event."},{status:400});
  const sessionId=typeof body.session_id==="string"&&/^[0-9a-f-]{36}$/i.test(body.session_id)?body.session_id:null;
  const mode=body.mode==="time"||body.mode==="price"?body.mode:null;
  const details=body.details&&typeof body.details==="object"&&!Array.isArray(body.details)?body.details:{};
  const {error}=await createPublicServerClient().from("cleaning_estimator_events").insert({session_id:sessionId,event_name:eventName,mode,details});
  if(error)return NextResponse.json({ok:false},{status:202});
  return NextResponse.json({ok:true},{status:201});
}
