"use client";

import {
  Dispatch, FormEvent, InputHTMLAttributes, ReactNode, SetStateAction,
  useEffect, useMemo, useState,
} from "react";
import {
  AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check,
  CheckCircle2, ChevronDown, Clock3, DollarSign, Info, LoaderCircle,
  MapPin, Minus, Plus, Sparkles, X,
} from "lucide-react";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import { createClient } from "@/lib/supabase/client";

type Mode = "time" | "price";
type Condition = "maintained" | "attention" | "heavy";
type Phase = "base" | "detail";
type Category = "bedroom" | "bathroom" | "kitchen" | "common" | "basement";
type Basis = "bedrooms" | "bathrooms" | "property" | "basement" | "item";
type Task = {
  id: string; category: Category; phase: Phase; label: string;
  min: number; max: number; basis: Basis; baseline?: boolean;
  helper?: string; wall?: boolean; defaultQty?: number;
};
type Property = {
  type: "" | "house" | "townhouse" | "condo" | "apartment";
  bedrooms: number; fullBaths: number; halfBaths: number;
  size: "under-900" | "900-1499" | "1500-1999" | "2000-2499" | "2500-plus";
  basement: "none" | "finished" | "unfinished";
  pets: boolean; petHair: boolean; condition: Condition; cleaners: number;
};
type Carpet = {
  enabled: boolean; rooms: number; largeRooms: number; halls: number;
  stairs: number; closets: number; heavySoil: boolean; petTreatment: boolean;
  furniture: "customer" | "assessment" | "none";
};
type Range = { min: number; max: number };

const FALLBACK_CONFIG = {
  version: "camz-estimator-2026-09-v1",
  baseCents: 17900,
  includedMinutes: 240,
  extraHourCents: 4000,
  incrementMinutes: 15,
  gstRate: 0.05,
  carpetMinimumCents: 10000,
  carpetRoomCents: 4000,
  carpetHallCents: 2500,
  carpetStairsCents: 5000,
  carpetClosetCents: 1500,
  carpetHeavyFromCents: 2500,
  manualQuoteMinutes: 600,
  popupTriggerMinutes: 210,
  timeModeEnabled: true,
  priceModeEnabled: true,
} as const;
const CONFIG = FALLBACK_CONFIG;

const t = (
  id: string, category: Category, phase: Phase, label: string,
  min: number, max: number, basis: Basis, extra: Partial<Task> = {},
): Task => ({ id, category, phase, label, min, max, basis, ...extra });

const FALLBACK_TASKS: Task[] = [
  t("bed_dust","bedroom","base","General dusting and accessible surfaces",8,12,"bedrooms",{baseline:true}),
  t("bed_vacuum","bedroom","base","Vacuum flooring",5,10,"bedrooms",{baseline:true}),
  t("bed_mop","bedroom","base","Mop hard flooring",5,8,"bedrooms"),
  t("bed_furniture","bedroom","base","Wipe accessible furniture surfaces",5,10,"bedrooms",{baseline:true}),
  t("bed_baseboards","bedroom","detail","Detail baseboards",8,12,"bedrooms"),
  t("bed_sills","bedroom","detail","Clean window sills and ledges",3,5,"item",{defaultQty:1}),
  t("bed_blinds","bedroom","detail","Detail blinds",5,10,"item",{defaultQty:1}),
  t("bed_doors","bedroom","detail","Wipe doors and frames",3,6,"bedrooms"),
  t("bed_closet","bedroom","detail","Clean accessible empty closet interior",10,20,"item",{defaultQty:1,helper:"Closet must be empty and accessible."}),
  t("bed_wall_spot","bedroom","detail","Spot-clean accessible wall marks",15,30,"item",{defaultQty:1,wall:true}),
  t("bed_wall_full","bedroom","detail","Full wall washing",30,60,"item",{defaultQty:1,wall:true,helper:"Large or heavily soiled walls may require assessment."}),

  t("bath_toilet","bathroom","base","Clean and disinfect toilet",7,10,"bathrooms",{baseline:true}),
  t("bath_sink","bathroom","base","Clean sink, vanity and counter",7,10,"bathrooms",{baseline:true}),
  t("bath_mirror","bathroom","base","Clean mirror",3,5,"bathrooms",{baseline:true}),
  t("bath_tub","bathroom","base","Routine tub or shower cleaning",10,15,"bathrooms",{baseline:true}),
  t("bath_floor","bathroom","base","Vacuum and mop bathroom floor",5,8,"bathrooms",{baseline:true}),
  t("bath_cabinets","bathroom","detail","Wipe exterior cabinets",5,8,"bathrooms"),
  t("bath_baseboards","bathroom","detail","Detail baseboards",5,8,"bathrooms"),
  t("bath_doors","bathroom","detail","Wipe doors and frames",3,5,"bathrooms"),
  t("bath_soap","bathroom","detail","Heavy soap scum or mineral buildup",15,30,"item",{defaultQty:1,helper:"Apply only to affected bathrooms."}),
  t("bath_grout","bathroom","detail","Detailed grout attention",15,30,"item",{defaultQty:1}),
  t("bath_wall_spot","bathroom","detail","Spot-clean accessible wall marks",10,20,"item",{defaultQty:1,wall:true}),
  t("bath_wall_full","bathroom","detail","Full bathroom wall washing",25,45,"item",{defaultQty:1,wall:true}),

  t("kit_surfaces","kitchen","base","Counters and accessible surfaces",8,12,"property",{baseline:true}),
  t("kit_sink","kitchen","base","Clean sink and faucet",5,8,"property",{baseline:true}),
  t("kit_cooktop","kitchen","base","Clean cooktop exterior",8,12,"property",{baseline:true}),
  t("kit_appliances","kitchen","base","Wipe appliance exteriors",8,12,"property",{baseline:true}),
  t("kit_floor","kitchen","base","Vacuum and mop kitchen floor",10,15,"property",{baseline:true}),
  t("kit_backsplash","kitchen","detail","Detail backsplash",5,10,"property"),
  t("kit_cabinet_fronts","kitchen","detail","Detail cabinet fronts",10,20,"property"),
  t("kit_baseboards","kitchen","detail","Detail baseboards",8,12,"property"),
  t("kit_oven","kitchen","detail","Clean inside oven",30,60,"item",{defaultQty:1,helper:"Severe carbon buildup may require assessment."}),
  t("kit_fridge","kitchen","detail","Clean inside emptied refrigerator",25,45,"item",{defaultQty:1,helper:"Customer removes food before arrival."}),
  t("kit_cabinets","kitchen","detail","Clean inside emptied cabinets",45,90,"property",{helper:"Cabinets must be empty and accessible."}),
  t("kit_grease","kitchen","detail","Heavy grease or buildup",30,120,"property",{helper:"Results depend on material and severity."}),
  t("kit_wall_spot","kitchen","detail","Spot-clean accessible wall marks",15,30,"property",{wall:true}),
  t("kit_wall_full","kitchen","detail","Full kitchen wall washing",30,60,"property",{wall:true}),

  t("common_living","common","base","Living room general cleaning",25,40,"property",{baseline:true}),
  t("common_dining","common","base","Dining area cleaning",15,25,"property",{baseline:true}),
  t("common_hall","common","base","Hall and entrance cleaning",10,20,"property",{baseline:true}),
  t("common_stairs","common","base","Vacuum and wipe standard staircase",10,20,"item",{defaultQty:1}),
  t("common_baseboards","common","detail","Detail common-area baseboards",15,30,"property"),
  t("common_sills","common","detail","Clean window sills",3,5,"item",{defaultQty:4}),
  t("common_blinds","common","detail","Detail blinds",5,10,"item",{defaultQty:4}),
  t("common_doors","common","detail","Detail interior doors and frames",3,6,"item",{defaultQty:3}),
  t("common_wall_spot","common","detail","Spot-clean wall marks in selected area",15,30,"item",{defaultQty:1,wall:true}),
  t("common_wall_full","common","detail","Full wall washing in selected area",30,60,"item",{defaultQty:1,wall:true}),
  t("common_pet_hair","common","detail","Heavy pet-hair detailing",30,90,"property"),

  t("basement_general","basement","base","Basement common-area cleaning",30,60,"basement",{baseline:true}),
  t("basement_stairs","basement","detail","Detail basement stairs",10,20,"basement"),
  t("basement_baseboards","basement","detail","Detail basement baseboards",15,30,"basement"),
];
const TASKS = FALLBACK_TASKS;

const CATEGORIES: { id: Category; label: string; description: string }[] = [
  {id:"bedroom",label:"Bedrooms",description:"General room cleaning and selected details"},
  {id:"bathroom",label:"Bathrooms",description:"Full and half-bath cleaning"},
  {id:"kitchen",label:"Kitchen",description:"Routine kitchen cleaning and appliance options"},
  {id:"common",label:"Living & common areas",description:"Living, dining, hall, entrance and stairs"},
  {id:"basement",label:"Basement",description:"Shown when a basement is selected"},
];
const STEPS = ["Property","Cleaning Plan","Detail & Priorities","Carpet & Specialty","Live Summary","Review / Book"];
const serviceAreas = ["Calgary","Airdrie","Cochrane","Chestermere"] as const;
type ServiceArea = (typeof serviceAreas)[number];
const areaPrefixes: Record<ServiceArea, RegExp> = {
  Calgary:/^(T1Y|T2[A-Z]|T3[A-Z])$/, Airdrie:/^T4[AB]$/,
  Cochrane:/^T4C$/, Chestermere:/^T1X$/,
};
const postalPattern = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTVWXYZ][ -]?\d[ABCEGHJ-NPRSTVWXYZ]\d$/i;
const inputClass = "h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#00B7EB] focus:ring-2 focus:ring-[#00B7EB]/20";
const wallDisclaimer = "Stain and mark removal is not guaranteed. Permanent stains, ink, grease, discoloration, paint transfer, damage, absorbed marks, and delicate or damaged paint may remain or limit the method that can safely be used.";
const carpetDisclaimer = "Professional carpet cleaning improves soil removal and appearance, but stain, odour and discoloration removal is not guaranteed. Results depend on carpet fibre, age, prior treatments, contamination, stain type and depth. Specialty stain or pet treatment may require assessment and additional charges.";

const clamp = (n:number,min:number,max:number) => Math.min(max,Math.max(min,n));
const money = (n:number) => `$${(n/100).toFixed(2)}`;
const round15 = (n:number) => Math.round(n/15)*15;
const duration = (n:number) => {
  const r=Math.max(0,round15(n)), h=Math.floor(r/60), m=r%60;
  return `${h?`${h} hr`:""}${h&&m?" ":""}${m?`${m} min`:""}` || "0 min";
};
const durationRange = (r:Range) => `${duration(r.min)}-${duration(r.max)}`;
const moneyRange = (r:Range) => r.min===r.max ? money(r.min) : `${money(r.min)}-${money(r.max)}`;
const trackEstimatorEvent=(event:string,details:Record<string,unknown>={})=>{
  if(typeof window==="undefined")return;
  const analyticsWindow=window as Window&{dataLayer?:Array<Record<string,unknown>>;gtag?:(...args:unknown[])=>void};
  analyticsWindow.dataLayer?.push({event,...details});
  analyticsWindow.gtag?.("event",event,details);
};

export default function CustomCleaningRequestPage() {
  const [CONFIG,setConfig]=useState(FALLBACK_CONFIG);
  const [TASKS,setTasks]=useState<Task[]>(FALLBACK_TASKS);
  const [mode,setMode]=useState<Mode|null>(null);
  const [step,setStep]=useState(1);
  const [property,setProperty]=useState<Property>({
    type:"",bedrooms:1,fullBaths:1,halfBaths:0,size:"900-1499",
    basement:"none",pets:false,petHair:false,condition:"maintained",cleaners:2,
  });
  const [selectedIds,setSelectedIds]=useState<string[]>([]);
  const [quantities,setQuantities]=useState<Record<string,number>>({});
  const [expanded,setExpanded]=useState<Category|null>("bedroom");
  const [baselineReady,setBaselineReady]=useState(false);
  const [carpet,setCarpet]=useState<Carpet>({
    enabled:false,rooms:1,largeRooms:0,halls:0,stairs:0,closets:0,
    heavySoil:false,petTreatment:false,furniture:"customer",
  });
  const [budget,setBudget]=useState<"fixed"|"extend">("extend");
  const [priorities,setPriorities]=useState<Category[]>(["kitchen","bathroom","bedroom","common","basement"]);
  const [frequency,setFrequency]=useState("One-time");
  const [serviceArea,setServiceArea]=useState("");
  const [postalCode,setPostalCode]=useState("");
  const [photos,setPhotos]=useState<File[]>([]);
  const [locationError,setLocationError]=useState("");
  const [photoError,setPhotoError]=useState("");
  const [noticeDismissed,setNoticeDismissed]=useState(false);
  const [terms,setTerms]=useState(false);
  const [status,setStatus]=useState<"idle"|"submitting"|"success"|"error">("idle");
  const [errorMessage,setErrorMessage]=useState("");
  const [reference,setReference]=useState("");
  useEffect(()=>{
    let active=true;
    fetch("/api/custom-cleaning-estimator",{headers:{Accept:"application/json"}})
      .then(response=>response.ok?response.json():Promise.reject())
      .then(data=>{
        if(!active)return;
        if(data?.config)setConfig(data.config);
        if(Array.isArray(data?.tasks)&&data.tasks.length)setTasks(data.tasks);
      })
      .catch(()=>{/* Built-in defaults keep the estimator available during a temporary settings outage. */});
    return()=>{active=false;};
  },[]);
  useEffect(()=>{if(mode)trackEstimatorEvent("camz_estimator_step_view",{mode,step});},[mode,step]);
  const sizeFactor:Record<Property["size"],number>={
    "under-900":0.9,"900-1499":1,"1500-1999":1.15,"2000-2499":1.3,"2500-plus":1.5,
  };

  const categoryAvailable=(category:Category)=>{
    if(category==="bedroom") return property.bedrooms>0;
    if(category==="bathroom") return property.fullBaths+property.halfBaths>0;
    if(category==="basement") return property.basement!=="none";
    return true;
  };
  const qty=(task:Task)=>{
    if(task.basis==="bedrooms") return property.bedrooms;
    if(task.basis==="bathrooms") return property.fullBaths+property.halfBaths*0.6;
    if(task.basis==="basement") return property.basement==="none"?0:1;
    if(task.basis==="item") return quantities[task.id]??task.defaultQty??1;
    return sizeFactor[property.size];
  };
  const selectedTasks=useMemo(()=>TASKS.filter(task=>selectedIds.includes(task.id)),[selectedIds]);
  const conditionFactor=property.condition==="maintained"?1:property.condition==="attention"?1.2:1.45;
  const rawMinutes=useMemo(()=>selectedTasks.reduce((sum,task)=>({
    min:sum.min+task.min*qty(task),max:sum.max+task.max*qty(task),
  }),{min:0,max:0}),[
    selectedTasks,quantities,property.bedrooms,property.fullBaths,
    property.halfBaths,property.basement,property.size,
  ]);
  const actualMinutes={min:rawMinutes.min*conditionFactor,max:rawMinutes.max*conditionFactor};
  const shownMinutes={
    min:mode==="price"?Math.max(CONFIG.includedMinutes,actualMinutes.min):actualMinutes.min,
    max:mode==="price"?Math.max(CONFIG.includedMinutes,actualMinutes.max):actualMinutes.max,
  };
  const priceFor=(minutes:number)=>{
    if(budget==="fixed"||minutes<=CONFIG.includedMinutes) return CONFIG.baseCents;
    const extra=Math.ceil((minutes-CONFIG.includedMinutes)/CONFIG.incrementMinutes)*CONFIG.incrementMinutes;
    return CONFIG.baseCents+Math.round(extra/60*CONFIG.extraHourCents);
  };
  const generalPrice={min:priceFor(shownMinutes.min),max:priceFor(shownMinutes.max)};
  const carpetSelected=carpet.enabled&&(carpet.rooms+carpet.largeRooms+carpet.halls+carpet.stairs+carpet.closets>0);
  const carpetComponents=(carpet.rooms>0?CONFIG.carpetMinimumCents+Math.max(0,carpet.rooms-1)*CONFIG.carpetRoomCents:0)
    +carpet.largeRooms*Math.round(CONFIG.carpetRoomCents*1.5)
    +carpet.halls*CONFIG.carpetHallCents+carpet.stairs*CONFIG.carpetStairsCents
    +carpet.closets*CONFIG.carpetClosetCents+(carpet.heavySoil?CONFIG.carpetHeavyFromCents:0);
  const carpetPrice=carpetSelected?Math.max(CONFIG.carpetMinimumCents,carpetComponents):0;
  const carpetMinutes=carpetSelected?{
    min:30+Math.max(0,carpet.rooms-1)*20+carpet.largeRooms*30+carpet.halls*10+carpet.stairs*20+carpet.closets*5+(carpet.heavySoil?10:0),
    max:45+Math.max(0,carpet.rooms-1)*30+carpet.largeRooms*45+carpet.halls*15+carpet.stairs*30+carpet.closets*10+(carpet.heavySoil?30:0),
  }:{min:0,max:0};
  const subtotal={min:generalPrice.min+carpetPrice,max:generalPrice.max+carpetPrice};
  const gst={min:Math.round(subtotal.min*CONFIG.gstRate),max:Math.round(subtotal.max*CONFIG.gstRate)};
  const total={min:subtotal.min+gst.min,max:subtotal.max+gst.max};
  const fullWalls=selectedIds.some(id=>id.endsWith("wall_full"));
  const manual=property.condition==="heavy"||fullWalls||carpet.petTreatment||actualMinutes.max>CONFIG.manualQuoteMinutes;
  const selectedCategories=CATEGORIES.filter(c=>selectedTasks.some(task=>task.category===c.id));
  const nearBase=actualMinutes.max>=CONFIG.popupTriggerMinutes;
  const today=new Date().toISOString().slice(0,10);

  const toggleTask=(task:Task)=>{
    setSelectedIds(current=>current.includes(task.id)?current.filter(id=>id!==task.id):[...current,task.id]);
    if(task.basis==="item"&&quantities[task.id]===undefined)
      setQuantities(current=>({...current,[task.id]:task.defaultQty??1}));
  };
  const next=()=>{
    if(step===1&&!baselineReady){
      setSelectedIds(TASKS.filter(task=>task.baseline&&categoryAvailable(task.category)).map(task=>task.id));
      setBaselineReady(true);
    }
    if(step<STEPS.length)setStep(current=>current+1);
    window.scrollTo({top:360,behavior:"smooth"});
  };
  const back=()=>{
    if(step>1)setStep(current=>current-1);
    window.scrollTo({top:360,behavior:"smooth"});
  };
  const sectionMinutes=(category:Category,phase:Phase)=>{
    const raw=TASKS.filter(task=>task.category===category&&task.phase===phase&&selectedIds.includes(task.id))
      .reduce((sum,task)=>({min:sum.min+task.min*qty(task),max:sum.max+task.max*qty(task)}),{min:0,max:0});
    return {min:raw.min*conditionFactor,max:raw.max*conditionFactor};
  };
  const movePriority=(category:Category,direction:-1|1)=>{
    setPriorities(current=>{
      const next=[...current],index=next.indexOf(category),destination=index+direction;
      if(index<0||destination<0||destination>=next.length)return current;
      [next[index],next[destination]]=[next[destination],next[index]];
      return next;
    });
  };
  const handlePhotos=(files:FileList|null)=>{
    if(!files)return;
    const next=Array.from(files);
    if(next.length>6||next.some(file=>file.size>8*1024*1024)){
      setPhotoError("Add up to 6 images, maximum 8 MB each.");return;
    }
    setPhotoError("");setPhotos(next);
  };

  const handleSubmit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(step!==STEPS.length||!terms)return;
    const form=new FormData(event.currentTarget);
    const compact=postalCode.replace(/\s|-/g,"").toUpperCase();
    const normalized=compact.length===6?`${compact.slice(0,3)} ${compact.slice(3)}`:postalCode.trim().toUpperCase();
    if(!serviceAreas.includes(serviceArea as ServiceArea)){
      setLocationError("Please select one of our supported service areas.");return;
    }
    if(!postalPattern.test(normalized)){
      setLocationError("Enter a valid Alberta postal code, for example T2P 1J9.");return;
    }
    if(!areaPrefixes[serviceArea as ServiceArea].test(compact.slice(0,3))){
      setLocationError(`This postal code does not match ${serviceArea}. Please check the city and postal code.`);return;
    }
    setLocationError("");setStatus("submitting");setErrorMessage("");
    const supabase=createClient(),requestId=crypto.randomUUID(),photoPaths:string[]=[];
    for(const file of photos){
      const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
      const path=`${requestId}/assessment/${crypto.randomUUID()}-${safe}`;
      const {error}=await supabase.storage.from("custom-cleaning-photos").upload(path,file,{contentType:file.type,upsert:false});
      if(error){setStatus("error");setErrorMessage("We could not attach the photos. Check their size and try again.");return;}
      photoPaths.push(path);
    }
    const taskSnapshot=selectedTasks.map(task=>({
      task_id:task.id,category:task.category,label:task.label,
      minutes_min:task.min,minutes_max:task.max,quantity:qty(task),quantity_basis:task.basis,
    }));
    const estimate={
      estimator_version:CONFIG.version,mode,
      general_minutes_min:Math.round(actualMinutes.min),general_minutes_max:Math.round(actualMinutes.max),
      general_man_hours_min:Number((actualMinutes.min/60).toFixed(2)),
      general_man_hours_max:Number((actualMinutes.max/60).toFixed(2)),
      cleaner_count:property.cleaners,
      onsite_minutes_min:Math.round(actualMinutes.min/property.cleaners),
      onsite_minutes_max:Math.round(actualMinutes.max/property.cleaners),
      base_price_cents:CONFIG.baseCents,included_minutes:CONFIG.includedMinutes,
      additional_hour_cents:CONFIG.extraHourCents,billing_increment_minutes:CONFIG.incrementMinutes,
      budget_choice:budget,
      general_price_min_cents:mode==="price"?generalPrice.min:null,
      general_price_max_cents:mode==="price"?generalPrice.max:null,
      carpet_price_cents:mode==="price"?carpetPrice:null,
      subtotal_min_cents:mode==="price"?subtotal.min:null,
      subtotal_max_cents:mode==="price"?subtotal.max:null,
      gst_rate:CONFIG.gstRate,gst_min_cents:mode==="price"?gst.min:null,gst_max_cents:mode==="price"?gst.max:null,
      total_min_cents:mode==="price"?total.min:null,total_max_cents:mode==="price"?total.max:null,
      requires_manual_quote:manual,calculated_at:new Date().toISOString(),
    };
    const payload={
      id:requestId,customer_name:form.get("customer_name"),email:form.get("email"),
      phone:form.get("phone"),address:form.get("address"),
      service_types:["professional_cleaning"],
      property_details:{...property,service_area:serviceArea,postal_code:normalized,province:"Alberta",country:"Canada",
        frequency,parking:form.get("parking"),access_method:form.get("access_method"),estimate},
      checklist:{selected_tasks:taskSnapshot,carpet,priority_order:priorities.filter(category=>selectedCategories.some(item=>item.id===category)),
        photo_paths:photoPaths,consent:{terms_accepted:true,accepted_at:new Date().toISOString()}},
      if_time_allows:form.get("if_time_allows"),additional_notes:form.get("additional_notes"),
      preferred_contact:form.get("preferred_contact"),preferred_date:form.get("preferred_date"),
      status:"new",mode,budget,
    };
    const response=await fetch("/api/custom-cleaning-estimator",{
      method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload),
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok){setStatus("error");setErrorMessage(result.error||"We could not submit your cleaning plan. Please try again.");return;}
    trackEstimatorEvent("camz_estimator_submit",{mode,budget,requires_manual_quote:manual,selected_task_count:selectedTasks.length});
    setReference(result.reference||requestId.slice(0,8).toUpperCase());setStatus("success");
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const taskGroups=(phase:Phase)=>(
    <div className="space-y-3">
      {CATEGORIES.filter(category=>categoryAvailable(category.id)).map(category=>{
        const tasks=TASKS.filter(task=>task.category===category.id&&task.phase===phase);
        if(!tasks.length)return null;
        const open=expanded===category.id;
        const count=tasks.filter(task=>selectedIds.includes(task.id)).length;
        const minutes=sectionMinutes(category.id,phase);
        return <div key={category.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <button type="button" aria-expanded={open} onClick={()=>setExpanded(open?null:category.id)}
            className="flex min-h-16 w-full items-center justify-between gap-3 p-4 text-left sm:p-5">
            <span><span className="block font-bold text-slate-900">{category.label}</span>
              <span className="mt-1 block text-xs text-slate-500">{count} selected{count?` · ~${durationRange(minutes)}`:""}</span></span>
            <ChevronDown className={`shrink-0 text-[#4276B2] transition ${open?"rotate-180":""}`} size={22}/>
          </button>
          {open&&<div className="space-y-3 border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
            {tasks.map(task=>{
              const checked=selectedIds.includes(task.id),quantity=qty(task);
              return <div key={task.id} className={`rounded-lg border p-3 ${checked?"border-[#00B7EB] bg-white":"border-slate-200 bg-white/70"}`}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={checked} onChange={()=>toggleTask(task)} className="mt-1 h-5 w-5 shrink-0 accent-[#0B4E9B]"/>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{task.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">~{task.min}-{task.max} min {task.basis==="bedrooms"||task.basis==="bathrooms"?"per room":task.basis==="item"?"per item":""}</span>
                    {task.helper&&<span className="mt-1 block text-xs text-slate-500">{task.helper}</span>}</span>
                </label>
                {checked&&task.basis==="item"&&<div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold text-slate-600">Quantity</span>
                  <Counter value={quantity} min={1} max={30} onChange={value=>setQuantities(current=>({...current,[task.id]:value}))}/>
                </div>}
                {checked&&task.wall&&<p className="mt-3 rounded-md bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"><Info className="mr-1 inline" size={14}/>{wallDisclaimer}</p>}
              </div>;
            })}
          </div>}
        </div>;
      })}
    </div>
  );

  if(status==="success")return <main className="flex min-h-[70vh] items-center bg-[#F4F8FC] px-4 py-20">
    <div className="mx-auto max-w-xl text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={34}/></div>
      <p className="mb-3 text-sm font-bold uppercase text-[#4276B2]">Cleaning plan received</p>
      <h2 className="text-3xl font-bold text-[#0B4E9B] sm:text-4xl">Thank you. Your selections are saved.</h2>
      <p className="mt-3 text-sm font-semibold text-slate-500">Reference CAMZ-{reference}</p>
      <p className="mx-auto mt-4 max-w-md text-slate-600">{manual||mode==="time"?"Our team will review your scope and contact you with the next step.":"Your estimated scope, time and price were submitted successfully."}</p>
      <button type="button" onClick={()=>window.location.reload()} className="mt-8 rounded-lg bg-[#0B4E9B] px-6 py-3 font-semibold text-white hover:bg-[#00A8D4]">Build another plan</button>
    </div>
  </main>;

  return <>
    <div className="min-w-0 max-w-full overflow-hidden [&_h1]:!mx-auto [&_h1]:!w-full [&_h1]:!max-w-[18ch] [&_h1]:!whitespace-normal [&_h1]:!break-words [&_h1]:!px-4 [&_h1]:!text-center [&_h1]:!text-[clamp(1.5rem,6vw,2rem)] [&_h1]:!leading-[1.15] sm:[&_h1]:!text-5xl lg:[&_h1]:!text-6xl">
      <CommonHeroSection backgroundImage="/p4.webp" title="Build Your Cleaning Plan"/>
    </div>
    {!mode?<main className="bg-[#F4F8FC] px-3 py-10 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10">
        <p className="text-sm font-bold uppercase tracking-wide text-[#4276B2]">CAMZ Cleaning estimator</p>
        <h2 className="mt-2 text-2xl font-bold text-[#0B4E9B] sm:text-4xl">How would you like to plan your cleaning?</h2>
        <p className="mt-3 max-w-2xl text-slate-600">Both choices use the same checklist and labour-time engine. You can switch later without losing selections.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {CONFIG.timeModeEnabled&&<ModeCard icon={<Clock3 size={28}/>} title="Build My Plan" text="Choose rooms and tasks, then see estimated cleaning time. No price is shown." onClick={()=>{trackEstimatorEvent("camz_estimator_mode_selected",{mode:"time"});setMode("time");}}/>} 
          {CONFIG.priceModeEnabled&&<ModeCard icon={<DollarSign size={28}/>} title="See Time & Price" text="See estimated time, live price range, carpet subtotal and GST." onClick={()=>{trackEstimatorEvent("camz_estimator_mode_selected",{mode:"price"});setMode("price");}}/>} 
        </div>
      </section>
    </main>:<>
      <Progress step={step}/>
      <main className="max-w-full overflow-x-hidden bg-[#F4F8FC] pb-36 pt-4 sm:pt-6 lg:pb-20">
        <form id="cleaning-plan-form" onSubmit={handleSubmit} className="px-3 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
            <div className="min-w-0 space-y-5">
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-sm font-bold uppercase text-[#4276B2]">Step {step} of {STEPS.length}</p>
                    <h2 className="mt-2 text-2xl font-bold text-[#0B4E9B] sm:text-3xl">{STEPS[step-1]}</h2></div>
                  {((mode==="time"&&CONFIG.priceModeEnabled)||(mode==="price"&&CONFIG.timeModeEnabled))&&<button type="button" onClick={()=>{const nextMode=mode==="time"?"price":"time";trackEstimatorEvent("camz_estimator_mode_switched",{from:mode,to:nextMode});setMode(nextMode);}}
                    className="rounded-full border border-[#0B4E9B] px-4 py-2 text-xs font-bold text-[#0B4E9B] hover:bg-blue-50">
                    {mode==="time"?"Show time & price":"Switch to time only"}
                  </button>}
                </div>

                {step===1&&<div className="mt-8 space-y-8">
                  <Choice label="Property type" value={property.type} onChange={value=>setProperty(current=>({...current,type:value as Property["type"]}))}
                    options={[["house","House"],["townhouse","Townhouse"],["condo","Condo"],["apartment","Apartment"]]}/>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <CounterField label="Bedrooms" value={property.bedrooms} max={12} onChange={value=>setProperty(current=>({...current,bedrooms:value}))}/>
                    <CounterField label="Full bathrooms" value={property.fullBaths} max={10} onChange={value=>setProperty(current=>({...current,fullBaths:value}))}/>
                    <CounterField label="Half baths" value={property.halfBaths} max={10} onChange={value=>setProperty(current=>({...current,halfBaths:value}))}/>
                    <CounterField label="Cleaning team" value={property.cleaners} min={1} max={4} onChange={value=>setProperty(current=>({...current,cleaners:value}))}/>
                  </div>
                  <Choice label="Approximate home size" value={property.size} onChange={value=>setProperty(current=>({...current,size:value as Property["size"]}))}
                    options={[["under-900","Under 900 sq ft"],["900-1499","900-1,499"],["1500-1999","1,500-1,999"],["2000-2499","2,000-2,499"],["2500-plus","2,500+"]]}/>
                  <Choice label="Basement" value={property.basement} onChange={value=>setProperty(current=>({...current,basement:value as Property["basement"]}))}
                    options={[["none","None"],["finished","Finished"],["unfinished","Unfinished"]]}/>
                  <Choice label="Pets in the home?" value={property.pets?"yes":"no"} onChange={value=>setProperty(current=>({...current,pets:value==="yes",petHair:value==="yes"?current.petHair:false}))}
                    options={[["no","No"],["yes","Yes"]]}/>
                  {property.pets&&<label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold">
                    <input type="checkbox" checked={property.petHair} onChange={event=>setProperty(current=>({...current,petHair:event.target.checked}))} className="h-5 w-5 accent-[#0B4E9B]"/>
                    Include heavy pet-hair detailing suggestions
                  </label>}
                  <Choice label="Current condition" value={property.condition} onChange={value=>setProperty(current=>({...current,condition:value as Condition}))}
                    options={[["maintained","Maintained regularly","Normal routine cleaning"],["attention","Needs extra attention","Some buildup or detail"],["heavy","Heavy buildup","Photos or assessment may be needed"]]}/>
                </div>}

                {step===2&&<div className="mt-8"><p className="mb-5 text-sm text-slate-600">Baseline tasks are preselected from your property. Turn off anything you do not need.</p>{taskGroups("base")}</div>}
                {step===3&&<div className="mt-8">
                  <p className="mb-5 text-sm text-slate-600">Add detailed work where it matters. Each choice adds estimated labour time.</p>
                  {property.petHair&&!selectedIds.includes("common_pet_hair")&&<Recommendation onAdd={()=>{trackEstimatorEvent("camz_estimator_recommendation_accepted",{task_id:"common_pet_hair"});toggleTask(TASKS.find(task=>task.id==="common_pet_hair")!);}}/>}
                  {taskGroups("detail")}
                </div>}
                {step===4&&<CarpetStep carpet={carpet} setCarpet={setCarpet}/>}
                {step===5&&<SummaryStep mode={mode} setMode={setMode} priceModeEnabled={CONFIG.priceModeEnabled} shownMinutes={shownMinutes} cleaners={property.cleaners}
                  carpetSelected={carpetSelected} carpetMinutes={carpetMinutes} generalPrice={generalPrice} carpetPrice={carpetPrice}
                  subtotal={subtotal} gst={gst} total={total} manual={manual} actualMinutes={actualMinutes}
                  budget={budget} setBudget={value=>{trackEstimatorEvent("camz_estimator_budget_selected",{budget:value});setBudget(value);}} selectedCategories={selectedCategories} selectedTasks={selectedTasks}/>}
                {step===6&&<ReviewStep priorities={priorities} selectedCategories={selectedCategories} selectedTasks={selectedTasks}
                  movePriority={movePriority} serviceArea={serviceArea} setServiceArea={setServiceArea}
                  postalCode={postalCode} setPostalCode={setPostalCode} locationError={locationError} setLocationError={setLocationError}
                  frequency={frequency} setFrequency={setFrequency} today={today} photos={photos} photoError={photoError}
                  handlePhotos={handlePhotos} terms={terms} setTerms={setTerms}/>}
              </section>
              <div className="flex gap-3">
                <button type="button" onClick={back} disabled={step===1} className="flex h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 font-bold text-slate-700 disabled:opacity-40"><ArrowLeft size={18}/>Back</button>
                {step<STEPS.length&&<button type="button" onClick={next} disabled={step===1&&!property.type}
                  className="ml-auto flex h-12 items-center gap-2 rounded-lg bg-[#00B7EB] px-6 font-bold text-white disabled:opacity-40">Continue<ArrowRight size={18}/></button>}
              </div>
              {status==="error"&&<p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 lg:hidden">{errorMessage}</p>}
            </div>
            <DesktopSummary mode={mode} generalMinutes={shownMinutes} cleaners={property.cleaners}
              generalPrice={generalPrice} carpetSelected={carpetSelected} carpetMinutes={carpetMinutes}
              carpetPrice={carpetPrice} subtotal={subtotal} gst={gst} total={total}
              count={selectedTasks.length} manual={manual} step={step} submitting={status==="submitting"}
              canSubmit={terms&&selectedTasks.length>0} onContinue={next} error={status==="error"?errorMessage:""}/>
          </div>
        </form>
      </main>
      {nearBase&&!noticeDismissed&&<BaseNotice onDismiss={()=>setNoticeDismissed(true)}/>}
      <MobileSummary mode={mode} generalMinutes={shownMinutes} total={total} step={step}
        disabled={step===1&&!property.type} canSubmit={terms&&selectedTasks.length>0} submitting={status==="submitting"} onNext={next}/>
    </>}
  </>;
}

function Progress({step}:{step:number}){
  return <div className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:hidden">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B4E9B] text-sm font-bold text-white">{step}</span>
      <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold uppercase text-[#0B4E9B]">Step {step} of {STEPS.length} · {STEPS[step-1]}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#00B7EB]" style={{width:`${step/STEPS.length*100}%`}}/></div></div>
    </div>
    <div className="mx-auto hidden max-w-6xl items-center gap-2 px-4 py-3 sm:flex">
      {STEPS.map((label,index)=><div key={label} className={`flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold ${step>=index+1?"text-[#0B4E9B]":"text-slate-400"}`}>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${step>=index+1?"bg-[#0B4E9B] text-white":"bg-slate-200"}`}>{index+1}</span>
        <span className="hidden xl:inline">{label}</span></div>)}
    </div>
  </div>;
}

function CarpetStep({carpet,setCarpet}:{carpet:Carpet;setCarpet:Dispatch<SetStateAction<Carpet>>}){
  return <div className="mt-8 space-y-6">
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-[#0B4E9B]"><Info className="mr-2 inline" size={18}/><strong>Carpet vacuuming</strong> stays in general cleaning labour. Steam cleaning is calculated separately.</div>
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-5 ${carpet.enabled?"border-[#0B4E9B] bg-blue-50":"border-slate-200"}`}>
      <input type="checkbox" checked={carpet.enabled} onChange={event=>setCarpet(current=>({...current,enabled:event.target.checked}))} className="mt-1 h-5 w-5 accent-[#0B4E9B]"/>
      <span><strong className="block text-slate-900">Add professional carpet steam cleaning</strong><span className="mt-1 block text-sm text-slate-600">Separate specialty time and price calculator.</span></span>
    </label>
    {carpet.enabled&&<div className="space-y-5 rounded-xl border border-slate-200 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CounterField label="Standard rooms" value={carpet.rooms} max={12} onChange={value=>setCarpet(current=>({...current,rooms:value}))}/>
        <CounterField label="Large / oversized rooms" value={carpet.largeRooms} max={8} onChange={value=>setCarpet(current=>({...current,largeRooms:value}))}/>
        <CounterField label="Hallways" value={carpet.halls} max={8} onChange={value=>setCarpet(current=>({...current,halls:value}))}/>
        <CounterField label="Standard staircases" value={carpet.stairs} max={6} onChange={value=>setCarpet(current=>({...current,stairs:value}))}/>
        <CounterField label="Walk-in closets" value={carpet.closets} max={8} onChange={value=>setCarpet(current=>({...current,closets:value}))}/>
      </div>
      <CheckRow checked={carpet.heavySoil} onChange={value=>setCarpet(current=>({...current,heavySoil:value}))} title="Heavy soil / specialty spot treatment" text="Adds assessment time and the configured starting amount."/>
      <CheckRow checked={carpet.petTreatment} onChange={value=>setCarpet(current=>({...current,petTreatment:value}))} title="Pet stain / odour treatment assessment" text="Requires assessment instead of an invented price."/>
      <Choice label="Furniture preparation" value={carpet.furniture} onChange={value=>setCarpet(current=>({...current,furniture:value as Carpet["furniture"]}))}
        options={[["customer","Customer moves furniture"],["assessment","Ask CAMZ to assess"],["none","No furniture moving"]]}/>
      <p className="rounded-lg bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">{carpetDisclaimer}</p>
    </div>}
  </div>;
}

function SummaryStep(props:{
  mode:Mode;setMode:(mode:Mode)=>void;priceModeEnabled:boolean;shownMinutes:Range;cleaners:number;carpetSelected:boolean;
  carpetMinutes:Range;generalPrice:Range;carpetPrice:number;subtotal:Range;gst:Range;total:Range;
  manual:boolean;actualMinutes:Range;budget:"fixed"|"extend";setBudget:(value:"fixed"|"extend")=>void;
  selectedCategories:{id:Category;label:string}[];selectedTasks:Task[];
}){
  const {mode,setMode,priceModeEnabled,shownMinutes,cleaners,carpetSelected,carpetMinutes,generalPrice,carpetPrice,
    subtotal,gst,total,manual,actualMinutes,budget,setBudget,selectedCategories,selectedTasks}=props;
  return <div className="mt-8 space-y-6">
    <div className="grid gap-4 sm:grid-cols-2">
      <Metric label="General cleaning labour" value={durationRange(shownMinutes)}/>
      <Metric label={`Likely on-site duration · ${cleaners} cleaners`} value={durationRange({min:shownMinutes.min/cleaners,max:shownMinutes.max/cleaners})}/>
      {carpetSelected&&<Metric label="Carpet steam service" value={durationRange(carpetMinutes)}/>}
    </div>
    {mode==="price"?<PriceBox generalPrice={generalPrice} carpetPrice={carpetPrice} subtotal={subtotal} gst={gst} total={total} manual={manual}/>:<div className="rounded-xl border border-cyan-200 bg-cyan-50 p-5">
      <h3 className="font-bold text-[#0B4E9B]">Want a price too?</h3><p className="mt-1 text-sm text-slate-600">Switch without losing any selections.</p>
      {priceModeEnabled&&<button type="button" onClick={()=>setMode("price")} className="mt-4 rounded-lg bg-[#0B4E9B] px-5 py-3 text-sm font-bold text-white">Show my estimated price</button>}
    </div>}
    {actualMinutes.max>CONFIG.includedMinutes&&<div><h3 className="mb-3 font-bold">Choose your time and budget approach</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Selection selected={budget==="fixed"} title={mode==="price"?"Keep my cleaning within $179":"Keep within the included 4 man-hours"} text="Work through priorities for up to the included 4 man-hours." onClick={()=>setBudget("fixed")}/>
        <Selection selected={budget==="extend"} title="Include estimated additional time" text="Authorize likely additional cleaning time shown in the estimate." onClick={()=>setBudget("extend")}/>
      </div><p className="mt-3 text-xs leading-relaxed text-slate-500">This is a time-based service. For fixed-time bookings, priority areas are addressed first and every selected task may not be completed.</p></div>}
    <div><h3 className="mb-3 font-bold">Selected scope</h3><div className="space-y-2">
      {selectedCategories.map(category=><div key={category.id} className="flex justify-between rounded-lg border border-slate-200 p-3 text-sm"><strong>{category.label}</strong><span className="text-slate-500">{selectedTasks.filter(task=>task.category===category.id).length} tasks</span></div>)}
    </div></div>
  </div>;
}

function ReviewStep(props:{
  priorities:Category[];selectedCategories:{id:Category;label:string}[];selectedTasks:Task[];
  movePriority:(category:Category,direction:-1|1)=>void;serviceArea:string;setServiceArea:(value:string)=>void;
  postalCode:string;setPostalCode:(value:string)=>void;locationError:string;setLocationError:(value:string)=>void;
  frequency:string;setFrequency:(value:string)=>void;today:string;photos:File[];photoError:string;
  handlePhotos:(files:FileList|null)=>void;terms:boolean;setTerms:(value:boolean)=>void;
}){
  const p=props;
  const visible=p.priorities.filter(category=>p.selectedCategories.some(item=>item.id===category));
  return <div className="mt-8 space-y-8">
    <div><h3 className="mb-2 font-bold">Priority order</h3><p className="mb-4 text-sm text-slate-600">Put the most important areas first.</p>
      <div className="space-y-2">{visible.map((category,index)=><div key={category} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#0B4E9B]">{index+1}</span>
        <span className="min-w-0 flex-1 text-sm font-semibold">{CATEGORIES.find(item=>item.id===category)?.label}</span>
        <button type="button" aria-label="Move priority up" disabled={index===0} onClick={()=>p.movePriority(category,-1)} className="p-2 text-[#0B4E9B] disabled:opacity-30"><ArrowUp size={18}/></button>
        <button type="button" aria-label="Move priority down" disabled={index===visible.length-1} onClick={()=>p.movePriority(category,1)} className="p-2 text-[#0B4E9B] disabled:opacity-30"><ArrowDown size={18}/></button>
      </div>)}</div>
    </div>
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name" name="customer_name" autoComplete="name" required/>
      <Field label="Email address" name="email" type="email" inputMode="email" autoComplete="email" required/>
      <Field label="Phone number" name="phone" type="tel" inputMode="tel" autoComplete="tel" required/>
      <Field label="Property address" name="address" autoComplete="street-address" required/>
      <div><label htmlFor="service_area" className="mb-2 block text-sm font-semibold">Service area *</label>
        <select id="service_area" name="service_area" value={p.serviceArea} required onChange={event=>{p.setServiceArea(event.target.value);p.setLocationError("");}} className={inputClass}>
          <option value="" disabled>Select your city</option>{serviceAreas.map(area=><option key={area} value={area}>{area}, AB</option>)}
        </select></div>
      <div><label htmlFor="postal_code" className="mb-2 block text-sm font-semibold">Postal code *</label>
        <input id="postal_code" name="postal_code" value={p.postalCode} required maxLength={7} autoComplete="postal-code" placeholder="T2P 1J9"
          onChange={event=>{p.setPostalCode(event.target.value.toUpperCase());p.setLocationError("");}} className={inputClass}/></div>
      <SelectField label="Preferred contact" name="preferred_contact" options={["Phone","Email","Text message"]} required/>
      <SelectField label="Frequency" name="frequency" options={["One-time","Weekly","Every 2 weeks","Every 4 weeks"]} required value={p.frequency} onChange={p.setFrequency}/>
      <SelectField label="Property access" name="access_method" options={["I will be home","Key / lockbox","Concierge","Contact me before arrival"]} required/>
      <SelectField label="Parking for cleaning team" name="parking" options={["Free street parking","Visitor parking","Paid parking","No parking nearby"]} required/>
      <Field label="Preferred service date" name="preferred_date" type="date" min={p.today} required/>
      <TextArea label="If time allows" name="if_time_allows" placeholder="What else should the team prioritize if time allows?"/>
      <TextArea label="Special instructions" name="additional_notes" placeholder="Access details, delicate surfaces, allergies or other notes..." wide/>
      <div className="sm:col-span-2"><label htmlFor="assessment_photos" className="mb-2 block text-sm font-semibold">Condition photos <span className="font-normal text-slate-500">(optional, up to 6)</span></label>
        <input id="assessment_photos" type="file" accept="image/*" multiple onChange={event=>p.handlePhotos(event.target.files)} className="block w-full rounded-lg border border-dashed border-slate-300 p-4 text-sm"/>
        {p.photos.length>0&&<p className="mt-2 text-xs text-slate-500">{p.photos.length} photo(s) ready.</p>}{p.photoError&&<p role="alert" className="mt-2 text-sm text-red-700">{p.photoError}</p>}</div>
    </div>
    <div className={`rounded-lg border p-3 text-sm ${p.locationError?"border-red-200 bg-red-50 text-red-700":"border-blue-100 bg-blue-50 text-[#0B4E9B]"}`} role={p.locationError?"alert":undefined}><MapPin className="mr-2 inline" size={18}/>{p.locationError||"We serve Calgary, Airdrie, Cochrane and Chestermere, Alberta."}</div>
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
      <p>Estimated time is based on the details supplied. Actual time may vary with condition, buildup, clutter, accessibility, materials and work required.</p>
      <p>Spot, wall-mark, carpet-stain and odour removal cannot be guaranteed. Identify delicate, damaged or restricted surfaces before work begins.</p>
      <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-slate-800"><input type="checkbox" required checked={p.terms} onChange={event=>p.setTerms(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#0B4E9B]"/>I agree to the estimated-time assumptions, selected scope and applicable service terms.</label>
    </div>
  </div>;
}

function DesktopSummary(props:{
  mode:Mode;generalMinutes:Range;cleaners:number;generalPrice:Range;carpetSelected:boolean;
  carpetMinutes:Range;carpetPrice:number;subtotal:Range;gst:Range;total:Range;count:number;
  manual:boolean;step:number;submitting:boolean;canSubmit:boolean;onContinue:()=>void;error:string;
}){
  const p=props;
  return <aside className="hidden h-fit rounded-xl bg-[#0B4E9B] p-6 text-white shadow-lg lg:sticky lg:top-24 lg:block">
    <h3 className="mb-4 border-b border-white/20 pb-4 text-xl font-bold">Your cleaning plan</h3>
    <div className="space-y-3 text-sm"><Row label="General cleaning labour" value={`~${durationRange(p.generalMinutes)}`}/><Row label={`On-site · ${p.cleaners} cleaners`} value={`~${durationRange({min:p.generalMinutes.min/p.cleaners,max:p.generalMinutes.max/p.cleaners})}`}/><Row label="Selected tasks" value={String(p.count)}/>{p.carpetSelected&&<Row label="Carpet steam" value={`~${durationRange(p.carpetMinutes)}`}/>}</div>
    {p.mode==="price"&&!p.manual&&<div className="mt-5 space-y-3 border-t border-white/20 pt-4 text-sm"><Row label="General cleaning" value={moneyRange(p.generalPrice)}/>{p.carpetSelected&&<Row label="Carpet steam" value={money(p.carpetPrice)}/>}<Row label="Subtotal" value={moneyRange(p.subtotal)}/><Row label="GST (5%)" value={moneyRange(p.gst)}/><div className="rounded-lg border border-white/20 bg-white/10 p-4"><p className="text-xs text-blue-100">Estimated total</p><p className="mt-1 text-2xl font-extrabold">{moneyRange(p.total)}</p></div></div>}
    {p.manual&&<div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900"><AlertCircle className="mr-2 inline" size={18}/><strong className="text-sm">Assessment recommended</strong><p className="mt-1 text-xs">Selections stay saved while CAMZ confirms the affected item.</p></div>}
    {p.error&&<p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{p.error}</p>}
    {p.step<STEPS.length?<button type="button" onClick={p.onContinue} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00B7EB] font-bold">Continue<ArrowRight size={18}/></button>:
      <button type="submit" disabled={p.submitting||!p.canSubmit} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00B7EB] font-bold disabled:opacity-50">{p.submitting?<><LoaderCircle className="animate-spin" size={18}/>Submitting...</>:p.manual||p.mode==="time"?"Request confirmed quote":"Submit cleaning plan"}</button>}
  </aside>;
}

function MobileSummary({mode,generalMinutes,total,step,disabled,canSubmit,submitting,onNext}:{mode:Mode;generalMinutes:Range;total:Range;step:number;disabled:boolean;canSubmit:boolean;submitting:boolean;onNext:()=>void}){
  return <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white p-3 shadow-[0_-6px_20px_rgba(15,23,42,0.12)] lg:hidden">
    <div className="mx-auto flex max-w-lg items-center gap-3"><div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase text-slate-500">Estimated cleaning</p><p className="truncate text-sm font-extrabold text-[#0B4E9B]">{durationRange(generalMinutes)}{mode==="price"?` · ${moneyRange(total)}`:""}</p></div>
      {step<STEPS.length?<button type="button" onClick={onNext} disabled={disabled} className="flex h-11 items-center gap-2 rounded-lg bg-[#00B7EB] px-5 text-sm font-bold text-white disabled:opacity-40">Next<ArrowRight size={17}/></button>:
        <button type="submit" form="cleaning-plan-form" disabled={submitting||!canSubmit} className="h-11 rounded-lg bg-[#00B7EB] px-5 text-sm font-bold text-white disabled:opacity-40">{submitting?"Submitting...":"Submit"}</button>}</div>
  </div>;
}

function PriceBox({generalPrice,carpetPrice,subtotal,gst,total,manual}:{generalPrice:Range;carpetPrice:number;subtotal:Range;gst:Range;total:Range;manual:boolean}){
  if(manual)return <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900"><h3 className="font-bold">Assessment required for part of this plan</h3><p className="mt-2 text-sm">The calculable scope is saved, but CAMZ should confirm heavy, unusual or specialty work before the amount becomes final.</p></div>;
  return <div className="rounded-xl bg-[#0B4E9B] p-5 text-white"><h3 className="mb-4 font-bold">Live price estimate</h3><div className="space-y-3 text-sm"><Row label="General cleaning" value={moneyRange(generalPrice)}/>{carpetPrice>0&&<Row label="Carpet steam cleaning" value={money(carpetPrice)}/>}<Row label="Estimated subtotal" value={moneyRange(subtotal)}/><Row label="GST (5%)" value={moneyRange(gst)}/><div className="border-t border-white/20 pt-3 text-lg"><Row label="Estimated total" value={moneyRange(total)}/></div></div><details className="mt-4 rounded-lg bg-white/10 p-3 text-xs"><summary className="cursor-pointer font-bold">How this is calculated</summary><p className="mt-2 leading-relaxed text-blue-100">The first 4 estimated man-hours are included in $179. Additional general labour uses 15-minute increments at $40/hour. Carpet steam cleaning is separate.</p></details></div>;
}

function BaseNotice({onDismiss}:{onDismiss:()=>void}){return <div className="fixed bottom-24 left-3 right-3 z-30 mx-auto max-w-xl rounded-xl border border-cyan-200 bg-white p-4 shadow-xl lg:bottom-5"><button type="button" aria-label="Dismiss" onClick={onDismiss} className="absolute right-3 top-3 text-slate-400"><X size={18}/></button><p className="pr-8 text-sm font-bold text-[#0B4E9B]">Your plan is using most of the included time.</p><p className="mt-1 text-xs leading-relaxed text-slate-600">Keep adding what matters. If additional time is likely, the estimate updates automatically and you can choose your budget approach at review.</p></div>}
function ModeCard({icon,title,text,onClick}:{icon:ReactNode;title:string;text:string;onClick:()=>void}){return <button type="button" onClick={onClick} className="group rounded-2xl border-2 border-slate-200 p-6 text-left transition hover:border-[#00B7EB] hover:shadow-md"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0B4E9B] group-hover:bg-[#0B4E9B] group-hover:text-white">{icon}</span><span className="mt-5 block text-xl font-bold text-[#0B4E9B]">{title}</span><span className="mt-2 block text-sm leading-relaxed text-slate-600">{text}</span><span className="mt-5 flex items-center gap-2 text-sm font-bold text-[#00A8D4]">Start planning<ArrowRight size={17}/></span></button>}
function Recommendation({onAdd}:{onAdd:()=>void}){return <div className="mb-5 flex flex-col gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 sm:flex-row sm:items-center"><Sparkles className="shrink-0 text-[#00A8D4]" size={22}/><div className="flex-1"><p className="text-sm font-bold text-[#0B4E9B]">Complete pet-hair detailing</p><p className="mt-1 text-xs text-slate-600">Add a property-level pet-hair allowance.</p></div><button type="button" onClick={onAdd} className="rounded-lg bg-[#0B4E9B] px-4 py-2 text-xs font-bold text-white">Add to plan</button></div>}
function Selection({selected,title,text,onClick}:{selected:boolean;title:string;text:string;onClick:()=>void}){return <button type="button" aria-pressed={selected} onClick={onClick} className={`relative rounded-xl border-2 p-4 text-left ${selected?"border-[#0B4E9B] bg-blue-50":"border-slate-200"}`}>{selected&&<Check className="absolute right-3 top-3 text-[#0B4E9B]" size={18}/>}<strong className="block pr-6 text-sm">{title}</strong><span className="mt-2 block text-xs text-slate-600">{text}</span></button>}
function Choice({label,options,value,onChange}:{label:string;options:(string[])[];value:string;onChange:(value:string)=>void}){return <div><h3 className="mb-3 text-sm font-bold">{label}</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{options.map(([id,text,helper])=><button key={id} type="button" aria-pressed={value===id} onClick={()=>onChange(id)} className={`relative min-h-14 rounded-xl border-2 p-3 text-left ${value===id?"border-[#0B4E9B] bg-blue-50 text-[#0B4E9B]":"border-slate-200 text-slate-700 hover:border-[#00B7EB]"}`}><strong className="block pr-5 text-sm">{text}</strong>{helper&&<span className="mt-1 block text-xs font-normal text-slate-500">{helper}</span>}{value===id&&<Check className="absolute right-3 top-3" size={17}/>}</button>)}</div></div>}
function Counter({value,onChange,min=0,max=20}:{value:number;onChange:(value:number)=>void;min?:number;max?:number}){return <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white"><button type="button" aria-label="Decrease" onClick={()=>onChange(clamp(value-1,min,max))} disabled={value<=min} className="flex h-10 w-10 items-center justify-center text-[#0B4E9B] disabled:opacity-30"><Minus size={17}/></button><span className="min-w-9 text-center text-sm font-bold">{value}</span><button type="button" aria-label="Increase" onClick={()=>onChange(clamp(value+1,min,max))} disabled={value>=max} className="flex h-10 w-10 items-center justify-center text-[#0B4E9B] disabled:opacity-30"><Plus size={17}/></button></div>}
function CounterField({label,value,onChange,min=0,max=20}:{label:string;value:number;onChange:(value:number)=>void;min?:number;max?:number}){return <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"><strong className="text-sm">{label}</strong><Counter value={value} onChange={onChange} min={min} max={max}/></div>}
function CheckRow({checked,onChange,title,text}:{checked:boolean;onChange:(value:boolean)=>void;title:string;text:string}){return <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={checked} onChange={event=>onChange(event.target.checked)} className="mt-1 h-5 w-5 accent-[#0B4E9B]"/><span><strong>{title}</strong><span className="block text-xs text-slate-500">{text}</span></span></label>}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-xl font-extrabold text-[#0B4E9B]">{value}</p></div>}
function Field({label,name,...props}:{label:string;name:string}&InputHTMLAttributes<HTMLInputElement>){return <div><label htmlFor={name} className="mb-2 block text-sm font-semibold">{label}{props.required&&" *"}</label><input id={name} name={name} className={inputClass} {...props}/></div>}
function TextArea({label,name,placeholder,wide=false}:{label:string;name:string;placeholder:string;wide?:boolean}){return <div className={wide?"sm:col-span-2":""}><label htmlFor={name} className="mb-2 block text-sm font-semibold">{label} <span className="font-normal text-slate-500">(optional)</span></label><textarea id={name} name={name} rows={3} className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-[#00B7EB]" placeholder={placeholder}/></div>}
function SelectField({label,name,options,required=false,value,onChange}:{label:string;name:string;options:string[];required?:boolean;value?:string;onChange?:(value:string)=>void}){return <div><label htmlFor={name} className="mb-2 block text-sm font-semibold">{label}{required&&" *"}</label><select id={name} name={name} required={required} value={value} defaultValue={value===undefined?"":undefined} onChange={onChange?event=>onChange(event.target.value):undefined} className={inputClass}><option value="" disabled>Select an option</option>{options.map(option=><option key={option} value={option}>{option}</option>)}</select></div>}
function Row({label,value}:{label:string;value:string}){return <div className="flex items-start justify-between gap-4"><span className="text-blue-100">{label}</span><strong className="shrink-0 text-right">{value}</strong></div>}
