import {useEffect,useMemo,useState} from "react";
import {Check,RefreshCw,ShieldCheck,X} from "lucide-react";
import {api,getApiError} from "../lib/api";

const filters=["ALL","PENDING","PUBLISHED","REJECTED"];

export default function SuperAdminTestimonials(){
  const [testimonials,setTestimonials]=useState([]),[filter,setFilter]=useState("PENDING"),[loading,setLoading]=useState(true),[error,setError]=useState(""),[busy,setBusy]=useState("");
  async function load(){
    setError("");
    try{
      const {data}=await api.get("/super-admin/testimonials");
      setTestimonials(data.testimonials);
    }catch(error){setError(getApiError(error));}
    finally{setLoading(false);}
  }
  useEffect(()=>{
    let active=true;
    api.get("/super-admin/testimonials").then(({data})=>{
      if(active){setTestimonials(data.testimonials);setError("");}
    }).catch(error=>{if(active)setError(getApiError(error));}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);

  async function update(id,changes){
    setBusy(id);setError("");
    try{
      const {data}=await api.patch(`/super-admin/testimonials/${id}`,changes);
      setTestimonials(current=>current.map(item=>item.id===id?data.testimonial:item));
    }catch(error){setError(getApiError(error));}
    finally{setBusy("");}
  }

  const visible=useMemo(()=>filter==="ALL"?testimonials:testimonials.filter(item=>item.status===filter),[filter,testimonials]);
  const counts=useMemo(()=>Object.fromEntries(filters.map(status=>[status,status==="ALL"?testimonials.length:testimonials.filter(item=>item.status===status).length])),[testimonials]);

  return <section className="super-admin-testimonials">
    <header className="admin-head"><div><small>PLATFORM CONTENT</small><h1>Client testimonials</h1><p>Review and publish testimonials shared by clients from the portfolio and Wholesale pages.</p></div><span><ShieldCheck size={15}/> Super Admin</span></header>
    <div className="testimonial-admin-filters" role="group" aria-label="Filter testimonials">
      {filters.map(status=><button type="button" className={filter===status?"active":""} key={status} onClick={()=>setFilter(status)}>{status==="ALL"?"All":status[0]+status.slice(1).toLowerCase()} <b>{counts[status]}</b></button>)}
      <button type="button" className="testimonial-admin-refresh" onClick={load} disabled={loading} aria-label="Refresh testimonials"><RefreshCw size={15}/></button>
    </div>
    {error&&<div className="error" role="alert">{error}</div>}
    {loading?<div className="panel">Loading testimonials…</div>:visible.length===0?<div className="panel testimonial-admin-empty">No testimonials in this section.</div>:<div className="testimonial-admin-list">
      {visible.map(item=><article className="testimonial-admin-card" key={item.id}>
        <div className="testimonial-admin-heading">
          {item.photo?<img src={item.photo} alt=""/>:<span className="testimonial-admin-avatar">{item.name?.[0]?.toUpperCase()||"C"}</span>}
          <div><h2>{item.name}{item.verified&&<span className="testimonial-admin-verified">Verified</span>}</h2><p>{[item.role,item.company,item.location].filter(Boolean).join(" · ")||"Client"}</p><small>{item.service||"Service not specified"} · {new Date(item.createdAt).toLocaleDateString()}</small></div>
          <span className={`tag ${item.status.toLowerCase()}`}>{item.status}</span>
        </div>
        <p className="testimonial-admin-message">{item.message}</p>
        <div className="testimonial-admin-actions">
          {item.status!=="PUBLISHED"&&<button type="button" className="approve" disabled={busy===item.id} onClick={()=>update(item.id,{status:"PUBLISHED"})}><Check size={14}/> Publish</button>}
          {item.status==="PUBLISHED"&&<button type="button" className="secondary-button" disabled={busy===item.id} onClick={()=>update(item.id,{status:"PENDING"})}>Unpublish</button>}
          {item.status!=="REJECTED"&&<button type="button" className="reject" disabled={busy===item.id} onClick={()=>update(item.id,{status:"REJECTED"})}><X size={14}/> Reject</button>}
          <button type="button" className="secondary-button" disabled={busy===item.id} onClick={()=>update(item.id,{verified:!item.verified})}>{item.verified?"Remove verification":"Mark verified"}</button>
        </div>
      </article>)}
    </div>}
  </section>;
}
