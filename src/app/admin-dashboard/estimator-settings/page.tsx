"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, Settings2 } from "lucide-react";

type Settings = Record<string, string | number | boolean | null>;
type Task = { task_id: string; category: string; phase: string; label: string; minutes_min: number; minutes_max: number; baseline: boolean; customer_visible: boolean; admin_active: boolean };

const moneyFields = [
  ["base_price_cents","Base package ($)"], ["extra_hour_cents","Extra labour / hour ($)"],
  ["carpet_minimum_cents","Carpet minimum ($)"], ["carpet_room_cents","Additional carpet room ($)"],
  ["carpet_hall_cents","Carpet hall ($)"], ["carpet_stairs_cents","Carpet stairs ($)"],
  ["carpet_closet_cents","Carpet closet ($)"], ["carpet_heavy_from_cents","Heavy soil from ($)"],
] as const;
const minuteFields = [["included_minutes","Included man-minutes"],["billing_increment_minutes","Billing increment (minutes)"],["manual_quote_minutes","Manual review threshold (minutes)"],["popup_trigger_minutes","Included-time notice trigger (minutes)"]] as const;

export default function EstimatorSettingsPage() {
  const [settings,setSettings]=useState<Settings|null>(null);
  const [tasks,setTasks]=useState<Task[]>([]);
  const [status,setStatus]=useState<"loading"|"idle"|"saving"|"saved"|"error">("loading");
  const [message,setMessage]=useState("");
  useEffect(()=>{fetch("/api/admin/estimator-settings").then(async response=>({ok:response.ok,data:await response.json()})).then(({ok,data})=>{
    if(!ok)throw new Error(data.error);setSettings(data.settings);setTasks(data.tasks);setStatus("idle");
  }).catch(error=>{setMessage(error.message||"Could not load settings.");setStatus("error");});},[]);
  const setSetting=(key:string,value:string|number|boolean)=>setSettings(current=>current?{...current,[key]:value}:current);
  const setTask=(id:string,field:keyof Task,value:string|number|boolean)=>setTasks(current=>current.map(item=>item.task_id===id?{...item,[field]:value}:item));
  const submit=async(event:FormEvent)=>{event.preventDefault();if(!settings)return;setStatus("saving");setMessage("");
    const response=await fetch("/api/admin/estimator-settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({settings,tasks})});
    const result=await response.json().catch(()=>({}));if(!response.ok){setMessage(result.error||"Save failed.");setStatus("error");return;}setStatus("saved");setMessage("Estimator settings saved. New calculations use these values immediately.");
  };
  if(status==="loading")return <div className="p-6 text-sm text-slate-500">Loading estimator settings…</div>;
  if(!settings)return <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>;
  return <form onSubmit={submit} className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6">
    <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-3 text-[#0B4E9B]"><Settings2 size={22}/></span><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#4A86F7]">Cleaning estimator</p><h1 className="text-xl font-bold text-[#13263A]">Time, price and task settings</h1></div></div><p className="mt-3 text-sm text-slate-500">These values drive both the customer preview and the server-authoritative saved estimate.</p></header>
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-[#13263A]">Pricing rules</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {moneyFields.map(([key,label])=><NumberField key={key} label={label} value={Number(settings[key]||0)/100} step="0.01" onChange={value=>setSetting(key,Math.round(Number(value)*100))}/>) }
      {minuteFields.map(([key,label])=><NumberField key={key} label={label} value={Number(settings[key]||0)} step="1" onChange={value=>setSetting(key,Math.round(Number(value)))}/>) }
      <NumberField label="GST (%)" value={Number(settings.gst_rate||0)*100} step="0.01" onChange={value=>setSetting("gst_rate",Number(value)/100)}/>
    </div><div className="mt-5 flex flex-wrap gap-5 rounded-lg bg-slate-50 p-4">{([["time_mode_enabled","Offer time-only mode"],["price_mode_enabled","Offer live-price mode"]] as const).map(([key,label])=><label key={key} className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" className="h-4 w-4 accent-[#0B4E9B]" checked={settings[key]===true} onChange={event=>setSetting(key,event.target.checked)}/>{label}</label>)}</div></section>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="font-bold text-[#13263A]">Checklist labour times</h2><p className="mt-1 text-xs text-slate-500">Edit customer-facing labels and minimum/maximum labour minutes.</p></div><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Area</th><th className="p-3">Task</th><th className="p-3">Min</th><th className="p-3">Max</th><th className="p-3">Baseline</th><th className="p-3">Visible</th><th className="p-3">Active</th></tr></thead><tbody className="divide-y divide-slate-100">{tasks.map(item=><tr key={item.task_id}><td className="p-3 capitalize text-slate-500">{item.category}<br/><span className="text-[10px]">{item.phase}</span></td><td className="p-3"><input className="h-9 w-full rounded-lg border border-slate-200 px-3" value={item.label} onChange={event=>setTask(item.task_id,"label",event.target.value)}/></td><td className="p-3"><input type="number" min="0" className="h-9 w-20 rounded-lg border border-slate-200 px-2" value={item.minutes_min} onChange={event=>setTask(item.task_id,"minutes_min",Number(event.target.value))}/></td><td className="p-3"><input type="number" min={item.minutes_min} className="h-9 w-20 rounded-lg border border-slate-200 px-2" value={item.minutes_max} onChange={event=>setTask(item.task_id,"minutes_max",Number(event.target.value))}/></td>{(["baseline","customer_visible","admin_active"] as const).map(field=><td key={field} className="p-3"><input type="checkbox" className="h-4 w-4 accent-[#0B4E9B]" checked={item[field]} onChange={event=>setTask(item.task_id,field,event.target.checked)}/></td>)}</tr>)}</tbody></table></div></section>
    <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur"><p className={`text-xs ${status==="error"?"text-red-600":"text-emerald-700"}`}>{message}</p><button disabled={status==="saving"} className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-[#0B4E9B] px-5 text-sm font-bold text-white disabled:opacity-50"><Save size={16}/>{status==="saving"?"Saving…":"Save settings"}</button></div>
  </form>;
}

function NumberField({label,value,step,onChange}:{label:string;value:number;step:string;onChange:(value:string)=>void}){return <label className="text-xs font-semibold text-slate-600">{label}<input type="number" min="0" step={step} value={value} onChange={event=>onChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900"/></label>}
