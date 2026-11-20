import {useEffect,useState} from "react";
import {Bell,Users} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";

export default function SuperAdminAlerts(){
  const [businesses,setBusinesses]=useState([]),[scope,setScope]=useState("ALL"),[businessIds,setBusinessIds]=useState([]),[subject,setSubject]=useState(""),[body,setBody]=useState(""),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState("");
  useEffect(()=>{
    let active=true;
    api.get("/super-admin/businesses").then(({data})=>{
      if(active){setBusinesses(data.businesses||[]);setError("");}
    }).catch(error=>{if(active)setError(getApiError(error));}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);

  function toggleBusiness(id,checked){
    if(checked&&businessIds.length>=100){setError("A selected-business alert can include up to 100 businesses.");return;}
    setError("");
    setBusinessIds(current=>checked?[...current,id]:current.filter(item=>item!==id));
  }

  async function sendAlert(event){
    event.preventDefault();
    setBusy(true);setError("");
    try{
      const {data}=await api.post("/super-admin/notifications",{
        scope,
        businessIds:scope==="ALL"?[]:businessIds,
        subject,
        category:"OTHER",
        body,
        important:true
      });
      notify(data.message);
      setSubject("");setBody("");setBusinessIds([]);
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setBusy(false);}
  }

  return <section className="support-page">
    <header className="admin-head"><div><small>PLATFORM NOTIFICATIONS</small><h1>Important business alerts</h1><p>Send a persistent, highlighted dashboard notification to active businesses.</p></div><span><Users size={16}/> Super Admin</span></header>
    {error&&<div className="error" role="alert">{error}</div>}
    <form className="panel admin-alert-form" onSubmit={sendAlert}>
      <span className="admin-section-kicker">SUPER ADMIN ONLY</span>
      <h2>Compose an alert</h2>
      <p>Businesses see these alerts in their Notifications page. Opening an alert clears its unread badge.</p>
      <label>Recipients<select value={scope} onChange={event=>setScope(event.target.value)}><option value="ALL">All active businesses ({businesses.length})</option><option value="SELECTED">Choose businesses</option></select></label>
      {scope==="SELECTED"&&<><p>Select up to 100 active businesses.</p><div className="broadcast-businesses" aria-label="Choose active businesses">{businesses.map(business=><label key={business._id}><input type="checkbox" checked={businessIds.includes(business._id)} onChange={event=>toggleBusiness(business._id,event.target.checked)}/><span>{business.name}<small>/{business.slug}</small></span></label>)}</div></>}
      <label>Alert title<input value={subject} onChange={event=>setSubject(event.target.value)} minLength="3" maxLength="120" required/></label>
      <label>Message<textarea value={body} onChange={event=>setBody(event.target.value)} minLength="2" maxLength="2000" rows="6" required/></label>
      <button className="primary" type="submit" disabled={loading||busy||!businesses.length||(scope==="SELECTED"&&!businessIds.length)}><Bell size={15}/>{busy?"Sending alert…":loading?"Loading businesses…":"Send important alert"}</button>
    </form>
  </section>;
}
