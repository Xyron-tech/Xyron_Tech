import {useEffect,useState} from "react";
import {RefreshCw,ShieldCheck} from "lucide-react";
import {api,getApiError} from "../lib/api";

const statuses=["OPEN","IN_REVIEW","RESOLVED"];

export default function CustomerRecoveryRequests(){
  const [requests,setRequests]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[busy,setBusy]=useState("");

  async function load(){
    setError("");
    try{
      const {data}=await api.get("/super-admin/customer-recovery-requests");
      setRequests(data.requests);
    }catch(error){setError(getApiError(error));}
    finally{setLoading(false);}
  }

  useEffect(()=>{load();},[]);

  async function updateStatus(request,status){
    setError("");
    setBusy(request._id);
    try{
      await api.patch(`/super-admin/customer-recovery-requests/${request._id}`,{status});
      setRequests(current=>current.map(item=>item._id===request._id?{...item,status}:item));
    }catch(error){setError(getApiError(error));}
    finally{setBusy("");}
  }

  return <section className="panel recovery-requests">
    <div className="list-head"><div><h2>Customer password-help requests</h2><p><ShieldCheck size={13}/> Private account details · Super Admin only</p></div><button type="button" onClick={()=>{setLoading(true);load();}} aria-label="Refresh help requests"><RefreshCw size={15}/></button></div>
    {error&&<div className="error" role="alert">{error}</div>}
    {loading?<p>Loading help requests…</p>:requests.length===0?<p>No customer help requests.</p>:<div className="recovery-request-list">{requests.map(request=><article className="recovery-request" key={request._id}>
      <div><b>{request.email}</b><span>{request.phone}</span></div>
      <div><b>{request.businessId?.name||"Store unavailable"}</b><span>{request.businessId?.slug?`/${request.businessId.slug}`:""} · {new Date(request.createdAt).toLocaleString()}</span></div>
      <label>Status<select value={request.status} disabled={busy===request._id} onChange={event=>updateStatus(request,event.target.value)}>{statuses.map(status=><option key={status} value={status}>{status.replace("_"," ")}</option>)}</select></label>
    </article>)}</div>}
  </section>;
}
