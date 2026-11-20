import {useCallback,useEffect,useState} from "react";
import {Bell,RefreshCw} from "lucide-react";
import {api,getApiError} from "../lib/api";

const formatDate=value=>new Date(value).toLocaleString();

export default function BusinessNotifications(){
  const [alerts,setAlerts]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const load=useCallback(async()=>{
    try{
      const {data}=await api.get("/business/notifications");
      setAlerts(data.notifications||[]);
      setError("");
    }catch(error){setError(getApiError(error));}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{
    const initialLoad=window.setTimeout(()=>load(),0);
    const timer=window.setInterval(load,15000);
    window.addEventListener("focus",load);
    return ()=>{window.clearTimeout(initialLoad);window.clearInterval(timer);window.removeEventListener("focus",load);};
  },[load]);

  async function markRead(alert){
    if(!alert.unreadForBusiness)return;
    setError("");
    try{
      const {data}=await api.post(`/business/notifications/${alert._id}/read`);
      setAlerts(current=>current.map(item=>item._id===alert._id?data.notification:item));
      window.dispatchEvent(new CustomEvent("xyron:business-alert-read"));
    }catch(error){setError(getApiError(error));}
  }

  return <section className="business-alerts-page">
    <header className="admin-head"><div><small>BUSINESS WORKSPACE</small><h1>Notifications</h1><p>Important updates from Xyron Super Admin.</p></div><button type="button" className="refresh-orders" onClick={()=>{setLoading(true);void load();}}><RefreshCw size={15}/> Refresh</button></header>
    {error&&<div className="error" role="alert">{error}</div>}
    {loading?<div className="panel">Loading notifications…</div>:alerts.length?<div className="business-alerts-list">{alerts.map(alert=>{
      const message=alert.messages?.[0];
      return <button type="button" className={`business-alert-card ${alert.unreadForBusiness?"unread":""}`} key={alert._id} onClick={()=>markRead(alert)} aria-label={`${alert.unreadForBusiness?"Open unread alert":"Alert"}: ${alert.subject}`}>
        <span className="business-alert-card-header"><span><Bell size={14}/> IMPORTANT ALERT</span>{alert.unreadForBusiness&&<b>NEW</b>}</span>
        <span className="business-alert-title">{alert.subject}</span>
        <span className="business-alert-body">{message?.body||"An important update from Xyron Super Admin."}</span>
        <time>{formatDate(message?.createdAt||alert.createdAt)}</time>
      </button>;
    })}</div>:<section className="panel business-alert-empty"><Bell size={24}/><h2>You’re all caught up</h2><p>Important messages from Xyron Super Admin will appear here.</p></section>}
  </section>;
}
