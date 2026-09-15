"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";

export default function EstimatorActualsEditor({requestId,initialActual,initialTaskMinutes}:{requestId:string;initialActual?:number|null;initialTaskMinutes?:Record<string,number>|null}){
  const [actual,setActual]=useState(initialActual??0);
  const [taskText,setTaskText]=useState(Object.entries(initialTaskMinutes||{}).map(([id,minutes])=>`${id}: ${minutes}`).join("\n"));
  const [status,setStatus]=useState<"idle"|"saving"|"saved"|"error">("idle");
  const [message,setMessage]=useState("");
  const submit=async(event:FormEvent)=>{
    event.preventDefault();
    const taskMinutes:Record<string,number>={};
    for(const line of taskText.split("\n")){const [id,value]=line.split(":").map(part=>part.trim());if(id&&Number.isFinite(Number(value)))taskMinutes[id]=Number(value);}
    setStatus("saving");setMessage("");
    const response=await fetch("/api/admin/custom-cleaning-actuals",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({request_id:requestId,actual_general_minutes:actual,actual_task_minutes:taskMinutes})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){setStatus("error");setMessage(result.error||"Could not save actual time.");return;}
    setStatus("saved");setMessage(`Saved. Estimator error: ${result.estimator_error_percent??0}%`);
  };
  return <form onSubmit={submit} className="mt-4 rounded-lg border border-blue-100 bg-white p-4">
    <h4 className="text-xs font-bold text-[#13263A]">Completed-job actual time</h4>
    <p className="mt-1 text-[10px] text-slate-500">Record actual labour to tune task estimates. Saving marks this request completed.</p>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-[10px] font-semibold text-slate-600">Actual general minutes<input type="number" min="1" max="10000" required value={actual} onChange={event=>setActual(Number(event.target.value))} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs"/></label>
      <label className="text-[10px] font-semibold text-slate-600">Optional task minutes (task_id: minutes)<textarea rows={3} value={taskText} onChange={event=>setTaskText(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-mono text-[10px]"/></label>
    </div>
    <div className="mt-3 flex items-center gap-3"><button disabled={status==="saving"} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B4E9B] px-4 text-[10px] font-bold text-white disabled:opacity-50"><Save size={13}/>{status==="saving"?"Saving…":"Save actual time"}</button>{message&&<span className={`text-[10px] ${status==="error"?"text-red-600":"text-emerald-700"}`}>{message}</span>}</div>
  </form>;
}
