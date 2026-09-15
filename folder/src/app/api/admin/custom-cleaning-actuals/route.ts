import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceMutationSecurity, readJsonBody, securityErrorResponse } from "@/lib/security/http";

async function authorizeAdmin(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return {allowed:false,supabase};
  const {data:profile}=await supabase.from("users").select("role,is_blocked").eq("id",user.id).maybeSingle();
  return {allowed:profile?.role?.toLowerCase()==="admin"&&profile.is_blocked===false,supabase};
}

export async function PATCH(request:NextRequest){
  const securityError=await enforceMutationSecurity(request,{bucket:"admin-custom-cleaning-actuals",limit:30,windowSeconds:60});
  if(securityError)return securityError;
  const {allowed,supabase}=await authorizeAdmin();
  if(!allowed)return NextResponse.json({error:"Admin access required."},{status:403});
  let body:{request_id?:unknown;actual_general_minutes?:unknown;actual_task_minutes?:unknown};
  try{body=await readJsonBody(request,64*1024);}catch(error){return securityErrorResponse(error)||NextResponse.json({error:"Invalid request."},{status:400});}
  const requestId=typeof body.request_id==="string"?body.request_id:"";
  const actualMinutes=Math.round(Number(body.actual_general_minutes));
  if(!/^[0-9a-f-]{36}$/i.test(requestId)||!Number.isFinite(actualMinutes)||actualMinutes<=0||actualMinutes>10000)return NextResponse.json({error:"Enter valid completed-job labour minutes."},{status:400});
  const taskMinutes:Record<string,number>={};
  if(body.actual_task_minutes&&typeof body.actual_task_minutes==="object"&&!Array.isArray(body.actual_task_minutes)){
    for(const [taskId,value] of Object.entries(body.actual_task_minutes as Record<string,unknown>)){
      const minutes=Math.round(Number(value));
      if(/^[a-z0-9_-]{1,80}$/i.test(taskId)&&Number.isFinite(minutes)&&minutes>=0&&minutes<=3000)taskMinutes[taskId]=minutes;
    }
  }
  const {data:record,error:readError}=await supabase.from("custom_cleaning_requests").select("property_details").eq("id",requestId).maybeSingle();
  if(readError||!record)return NextResponse.json({error:"Cleaning request not found."},{status:404});
  const estimate=(record.property_details as {estimate?:{general_minutes_min?:number;general_minutes_max?:number}}|null)?.estimate;
  const estimatedMinutes=((Number(estimate?.general_minutes_min)||0)+(Number(estimate?.general_minutes_max)||0))/2;
  if(estimatedMinutes<=0)return NextResponse.json({error:"This request does not contain a valid estimator snapshot."},{status:400});
  const errorPercent=Number((((actualMinutes-estimatedMinutes)/estimatedMinutes)*100).toFixed(2));
  const {error}=await supabase.from("custom_cleaning_requests").update({actual_general_minutes:actualMinutes,actual_task_minutes:taskMinutes,estimator_error_percent:errorPercent,completed_at:new Date().toISOString(),status:"completed"}).eq("id",requestId);
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true,estimator_error_percent:errorPercent});
}
