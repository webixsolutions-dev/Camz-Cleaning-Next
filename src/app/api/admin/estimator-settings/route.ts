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

export async function GET(){
  const {allowed,supabase}=await authorizeAdmin();
  if(!allowed)return NextResponse.json({error:"Admin access required."},{status:403});
  const [settings,tasks,recommendations,events,actuals]=await Promise.all([
    supabase.from("cleaning_estimator_settings").select("*").eq("id",true).single(),
    supabase.from("cleaning_estimator_tasks").select("*").order("sort_order"),
    supabase.from("cleaning_estimator_recommendations").select("*").order("sort_order"),
    supabase.from("cleaning_estimator_events").select("event_name,mode,details,created_at").order("created_at",{ascending:false}).limit(1000),
    supabase.from("custom_cleaning_requests").select("property_details,checklist,actual_general_minutes,actual_task_minutes,estimator_error_percent").not("actual_general_minutes","is",null).order("completed_at",{ascending:false}).limit(500),
  ]);
  if(settings.error||tasks.error||recommendations.error||events.error||actuals.error)return NextResponse.json({error:"Run the latest estimator database migration first."},{status:500});
  const analytics=(events.data||[]).reduce((summary:Record<string,number>,event:any)=>{
    const key=`${event.event_name}:${event.mode||"unknown"}`;summary[key]=(summary[key]||0)+1;return summary;
  },{});
  const completed=actuals.data||[];
  const errors:number[]=completed.map((item:any)=>Number(item.estimator_error_percent)).filter((value:number)=>Number.isFinite(value));
  const taskBias:Record<string,{samples:number;estimated:number;actual:number;error_percent:number}>={};
  for(const item of completed as any[]){const selected=Array.isArray(item.checklist?.selected_tasks)?item.checklist.selected_tasks:[];const actualTask=item.actual_task_minutes&&typeof item.actual_task_minutes==="object"?item.actual_task_minutes:{};for(const task of selected){const actual=Number(actualTask[task.task_id]);if(!Number.isFinite(actual))continue;const estimated=((Number(task.minutes_min)||0)+(Number(task.minutes_max)||0))/2*(Number(task.quantity)||1);const current=taskBias[task.task_id]||{samples:0,estimated:0,actual:0,error_percent:0};current.samples++;current.estimated+=estimated;current.actual+=actual;current.error_percent=current.estimated?Number(((current.actual-current.estimated)/current.estimated*100).toFixed(2)):0;taskBias[task.task_id]=current;}}
  const performance={sample_size:errors.length,average_error_percent:errors.length?Number((errors.reduce((sum,value)=>sum+value,0)/errors.length).toFixed(2)):0,underestimated:errors.filter(value=>value>10).length,overestimated:errors.filter(value=>value< -10).length,within_ten_percent:errors.filter(value=>Math.abs(value)<=10).length,task_bias:Object.entries(taskBias).sort((a,b)=>Math.abs(b[1].error_percent)-Math.abs(a[1].error_percent)).slice(0,20)};
  return NextResponse.json({settings:settings.data,tasks:tasks.data,recommendations:recommendations.data,analytics,performance});
}

const allowedSettings=[
  "version","base_price_cents","included_minutes","extra_hour_cents","billing_increment_minutes","gst_enabled","gst_rate",
  "carpet_minimum_cents","carpet_room_cents","carpet_large_room_cents","carpet_hall_cents","carpet_stairs_cents","carpet_stair_step_cap","carpet_closet_cents","carpet_heavy_from_cents",
  "carpet_setup_minutes_min","carpet_setup_minutes_max","carpet_room_minutes_min","carpet_room_minutes_max","carpet_large_room_minutes_min","carpet_large_room_minutes_max",
  "carpet_hall_minutes_min","carpet_hall_minutes_max","carpet_stairs_minutes_min","carpet_stairs_minutes_max","carpet_closet_minutes_min","carpet_closet_minutes_max","carpet_heavy_minutes_min","carpet_heavy_minutes_max",
  "condition_maintained_factor","condition_attention_factor","condition_heavy_factor","condition_very_heavy_factor",
  "detail_maintained_min","detail_maintained_max","detail_attention_min","detail_attention_max","detail_heavy_min","detail_heavy_max","detail_very_heavy_min","detail_very_heavy_max",
  "window_maintained_min","window_maintained_max","window_attention_min","window_attention_max","window_heavy_min","window_heavy_max","window_very_heavy_min","window_very_heavy_max",
  "manual_quote_minutes","wall_manual_quote_quantity","popup_trigger_minutes","time_mode_enabled","price_mode_enabled",
  "wall_disclaimer","carpet_disclaimer","near_included_message","exceeded_included_message","fixed_time_disclaimer","consent_terms",
];

export async function PATCH(request:NextRequest){
  const securityError=await enforceMutationSecurity(request,{bucket:"admin-estimator-settings",limit:30,windowSeconds:60});
  if(securityError)return securityError;
  const {allowed,supabase}=await authorizeAdmin();
  if(!allowed)return NextResponse.json({error:"Admin access required."},{status:403});
  let body:{settings?:Record<string,unknown>;tasks?:Array<Record<string,unknown>>;recommendations?:Array<Record<string,unknown>>};
  try{body=await readJsonBody(request,512*1024);}catch(error){return securityErrorResponse(error)||NextResponse.json({error:"Invalid request."},{status:400});}
  if(body.settings){
    if(body.settings.time_mode_enabled===false&&body.settings.price_mode_enabled===false)return NextResponse.json({error:"At least one estimator mode must remain enabled."},{status:400});
    const updates=Object.fromEntries(allowedSettings.filter(key=>key in body.settings!).map(key=>[key,body.settings![key]]));
    const {error}=await supabase.from("cleaning_estimator_settings").update({...updates,updated_at:new Date().toISOString()}).eq("id",true);
    if(error)return NextResponse.json({error:error.message},{status:400});
  }
  for(const item of body.tasks||[]){
    if(typeof item.task_id!=="string")continue;
    const min=Number(item.minutes_min),max=Number(item.minutes_max);
    if(min<0||max<min)return NextResponse.json({error:`Invalid time range for ${item.task_id}.`},{status:400});
    const update={label:item.label,description:item.description||null,pricing_type:item.pricing_type||"labour_minutes",minutes_min:min,minutes_max:max,quantity_basis:item.quantity_basis,included_in_base_template:item.included_in_base_template===true,baseline:item.included_in_base_template===true,customer_visible:item.customer_visible!==false,price_mode_visible:item.price_mode_visible!==false,requires_disclaimer:item.requires_disclaimer===true,admin_active:item.admin_active!==false,sort_order:Number(item.sort_order)||0,service_types:Array.isArray(item.service_types)?item.service_types:["professional_cleaning"],condition_profile:item.condition_profile||null,updated_at:new Date().toISOString()};
    const {error}=await supabase.from("cleaning_estimator_tasks").update(update).eq("task_id",item.task_id);
    if(error)return NextResponse.json({error:error.message},{status:400});
  }
  for(const item of body.recommendations||[]){
    if(typeof item.rule_id!=="string")continue;
    const update={title:item.title,description:item.description,task_ids:Array.isArray(item.task_ids)?item.task_ids:[],enables_carpet:item.enables_carpet===true,customer_visible:item.customer_visible!==false,admin_active:item.admin_active!==false,sort_order:Number(item.sort_order)||0,updated_at:new Date().toISOString()};
    const {error}=await supabase.from("cleaning_estimator_recommendations").update(update).eq("rule_id",item.rule_id);
    if(error)return NextResponse.json({error:error.message},{status:400});
  }
  return NextResponse.json({ok:true});
}
