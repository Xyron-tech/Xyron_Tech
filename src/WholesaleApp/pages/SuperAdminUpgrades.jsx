import {useEffect,useState} from "react";
import {Check,RefreshCw,X} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";
import {planCatalog} from "../data/planCatalog";

export default function SuperAdminUpgrades(){
  const [requests,setRequests]=useState([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(""),[error,setError]=useState("");
  async function load(){setLoading(true);setError("");try{const {data}=await api.get("/super-admin/plan-upgrade-requests");setRequests(data.requests||[]);}catch(e){setError(getApiError(e));}finally{setLoading(false);}}
  useEffect(()=>{load();},[]);
  async function decide(request,decision){
    setBusy(request._id);setError("");
    try{const {data}=await api.patch(`/super-admin/plan-upgrade-requests/${request._id}`,{decision});notify(data.message);await load();}
    catch(e){setError(getApiError(e));notify(getApiError(e),"error");}
    finally{setBusy("");}
  }
  const pending=requests.filter(item=>item.status==="PENDING");
  return <section className="admin">
    <header className="admin-head"><div><small>PLATFORM CONTROL CENTRE</small><h1>Plan upgrade requests</h1><p>Review store plan requests and accept or reject each one. Acceptance applies the selected plan and its features immediately.</p></div><span>{pending.length} pending</span></header>
    {error&&<div className="error" role="alert">{error}</div>}
    <div className="panel"><div className="list-head"><h2>Requests</h2><button type="button" onClick={load} aria-label="Refresh plan requests"><RefreshCw size={15}/></button></div>
      {loading?<p>Loading requests…</p>:requests.length===0?<p>No plan upgrade requests yet.</p>:<div className="upgrade-admin-list">{requests.map(request=>{const plan=planCatalog.find(item=>item.id===request.requestedPlan);return <article className="upgrade-admin-request" key={request._id}><div><span className={`tag ${request.status.toLowerCase()}`}>{request.status}</span><h3>{request.businessId?.name||"Business"}</h3><p>Current: {request.businessId?.subscriptionPlan||"Unknown"} · Requested: <b>{plan?.name||request.requestedPlan}</b> · ₹{plan?.price||"—"}/month</p>{request.note&&<p>{request.note}</p>}<small>{new Date(request.createdAt).toLocaleString()}</small></div>{request.status==="PENDING"&&<div className="upgrade-admin-actions"><button className="approve" type="button" disabled={busy===request._id} onClick={()=>decide(request,"APPROVED")}><Check size={14}/> Accept & activate</button><button className="reject" type="button" disabled={busy===request._id} onClick={()=>decide(request,"REJECTED")}><X size={14}/> Reject</button></div>}</article>;})}</div>}
    </div>
  </section>;
}
