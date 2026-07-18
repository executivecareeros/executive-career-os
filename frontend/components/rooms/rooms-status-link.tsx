"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type State = "active"|"present"|"question"|"quiet";
type Status = { state:State;label:string;activeRooms:number;presentExecutives:number;unansweredQuestions:number };
const initial:Status={state:"quiet",label:"No one currently in Rooms",activeRooms:0,presentExecutives:0,unansweredQuestions:0};
const colors:Record<State,string>={active:"bg-emerald-500",present:"bg-amber-400",question:"bg-violet-500",quiet:"bg-rose-500"};

export function RoomsStatusLink({ compact=false }: { compact?:boolean }) {
  const [status,setStatus]=useState(initial);
  useEffect(()=>{
    let mounted=true;
    const load=()=>void fetch("/api/rooms/status",{credentials:"same-origin",cache:"no-store"}).then(response=>response.ok?response.json():undefined).then(value=>{if(mounted&&value)setStatus(value);}).catch(()=>undefined);
    load(); const interval=window.setInterval(load,30_000);
    return()=>{mounted=false;window.clearInterval(interval);};
  },[]);
  return <Link href="/rooms" title={status.label} aria-label={`Executive Rooms: ${status.label}`} className="group relative inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d7deea] bg-white px-3 py-2 text-sm font-semibold text-[#4f5d72] shadow-sm transition hover:border-[#9eb3ca] hover:bg-[#f8faff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3457d5]">
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8"><path d="M5 6.5h14v9H9l-4 3v-12Z"/><path d="M8.5 10h7M8.5 12.7h4.5"/></svg>
    <span className={`absolute right-1.5 top-1.5 size-2.5 rounded-full ring-2 ring-white ${colors[status.state]}`}/>
    {!compact&&<span>Rooms</span>}
    {status.unansweredQuestions>0&&<span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-800">{status.unansweredQuestions}?</span>}
  </Link>;
}
