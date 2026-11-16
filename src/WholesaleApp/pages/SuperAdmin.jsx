import {useEffect,useState} from "react";
import {Link,useHref} from "react-router-dom";
import {Check,Copy,KeyRound,RefreshCw,ShieldCheck,Trash2,X} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";
import {planFeatureDefaults} from "../data/planCatalog";

const featureNames={advancedSeo:"Advanced SEO",quickReplies:"Chat quick replies",analytics:"Weekly/monthly analytics"};

export default function SuperAdmin(){
  const storePathPrefix=useHref("/store/");
  const [apps,setApps]=useState([]),[plans,setPlans]=useState({}),[features,setFeatures]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[busy,setBusy]=useState(""),[passwordTarget,setPasswordTarget]=useState(""),[adminPassword,setAdminPassword]=useState(""),[confirmAdminPassword,setConfirmAdminPassword]=useState("");
  async function load(){
    setLoading(true);setError("");
    try{const {data}=await api.get("/super-admin/applications");setApps(data.applications);setPlans(data.plans||{});setFeatures(data.features||[]);}
    catch(e){setError(getApiError(e));}
    finally{setLoading(false);}
  }
  useEffect(()=>{
    let active=true;
    api.get("/super-admin/applications").then(({data})=>{
      if(active){setApps(data.applications);setPlans(data.plans||{});setFeatures(data.features||[]);setError("");}
    }).catch(error=>{if(active)setError(getApiError(error));}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);
  async function decide(id,decision){
    setBusy(id);
    try{const {data}=await api.post(`/super-admin/applications/${id}/${decision}`);notify(data.message);await load();}
    catch(e){setError(getApiError(e));notify(getApiError(e),"error");}
    finally{setBusy("");}
  }
  function updateLocal(applicationId,update){
    setApps(current=>current.map(app=>app._id===applicationId?{...app,...update}:app));
  }
  async function savePlan(application){
    const business=application.businessId;
    if(!business?._id)return;
    setBusy(application._id);
    try{
      const {data}=await api.patch(`/super-admin/businesses/${business._id}/plan`,{plan:application.selectedPlan||business.subscriptionPlan||"STARTER",features:business.subscriptionFeatures||{}});
      notify(data.message);await load();
    }catch(e){setError(getApiError(e));notify(getApiError(e),"error");}
    finally{setBusy("");}
  }
  async function updateAdminPassword(event,application){
    event.preventDefault();
    if(adminPassword.length<10){setError("The admin password must be at least 10 characters.");return;}
    if(adminPassword!==confirmAdminPassword){setError("Passwords do not match.");return;}
    setBusy(`password-${application._id}`);
    setError("");
    try{
      const {data}=await api.patch(`/super-admin/businesses/${application.businessId._id}/password`,{password:adminPassword,confirmPassword:confirmAdminPassword});
      notify(data.message);
      setAdminPassword("");
      setConfirmAdminPassword("");
      setPasswordTarget("");
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setBusy("");}
  }
  async function changeBusinessStatus(application,action){
    const business=application.businessId;
    if(!business?._id)return;
    const message=action==="delete"?"Soft-delete this store? Its orders and audit history will be retained.":"Reject this business and disable its owner account?";
    if(!window.confirm(message))return;
    setBusy(application._id);
    try{
      const {data}=action==="delete"?await api.delete(`/super-admin/businesses/${business._id}`):await api.post(`/super-admin/businesses/${business._id}/reject`);
      notify(data.message);await load();
    }catch(e){setError(getApiError(e));notify(getApiError(e),"error");}
    finally{setBusy("");}
  }
  async function copyStore(slug){
    try{await navigator.clipboard.writeText(new URL(`${storePathPrefix}${encodeURIComponent(slug)}`,window.location.origin).toString());notify("Store address copied.");}
    catch{setError("Could not copy the store address. Please copy the URL from your browser.");notify("Could not copy the store address.","error");}
  }
  const pending=apps.filter(app=>app.status==="PENDING").length;
  const approved=apps.filter(app=>app.status==="APPROVED").length;
  return <section className="admin">
    <div className="admin-head"><div><small>PLATFORM CONTROL CENTRE</small><h1>Business applications</h1><p>Review applications, activate plan features, and manage store access.</p></div><span><ShieldCheck size={15}/> Super Admin</span></div>
    <div className="stats"><div>Total applications <b>{apps.length}</b></div><div>Pending review <b>{pending}</b></div><div>Approved <b>{approved}</b></div></div>
    <div className="panel"><div className="list-head"><h2>Application queue</h2><button onClick={load} aria-label="Refresh applications"><RefreshCw size={15}/></button></div>
      {error&&<div className="error">{error}</div>}
      {loading?<p>Loading…</p>:apps.length===0?<p>No applications yet.</p>:apps.map(application=>{
        const business=application.businessId;
        const plan=application.selectedPlan||business?.subscriptionPlan||"STARTER";
        const isDeleted=application.status==="DELETED"||business?.status==="DELETED";
        return <article className="application application-plan" key={application._id}>
          <div className="avatar">{application.businessName?.[0]?.toUpperCase()}</div>
          <div className="details">
            <b>{application.businessName}</b> <span className={"tag "+application.status.toLowerCase()}>{application.status}</span>
            <p>{application.ownerName} · {application.email} · {application.phone}</p>
            <small>{application.category} · {application.city}, {application.state} · {new Date(application.createdAt).toLocaleDateString()}</small>
            {application.description&&<p>{application.description}</p>}
            <p className="application-plan-summary">Requested plan: <b>{plans[application.selectedPlan]?.name||application.selectedPlan||"Starter"}</b> · ₹{plans[application.selectedPlan]?.monthlyPriceInr??199}/month</p>
            {business?.slug&&<div className="application-store-link"><Link to={`/store/${encodeURIComponent(business.slug)}`} target="_blank" rel="noreferrer">Open customer storefront</Link><button type="button" className="secondary-button" onClick={()=>copyStore(business.slug)}><Copy size={14}/> Copy store link</button></div>}
            {business&&application.status==="APPROVED"&&!isDeleted&&<div className="plan-controls">
              <label>Active plan<select value={plan} onChange={event=>{const nextPlan=event.target.value;updateLocal(application._id,{selectedPlan:nextPlan,business:{...business,subscriptionPlan:nextPlan,subscriptionFeatures:{...planFeatureDefaults[nextPlan]}}});}}>{Object.values(plans).map(item=><option key={item.id} value={item.id}>{item.name} · ₹{item.monthlyPriceInr}/month</option>)}</select></label>
              <div className="plan-feature-editor">
                <div className="plan-features">{features.map(feature=><label key={feature}><input type="checkbox" checked={Boolean(business.subscriptionFeatures?.[feature])} onChange={event=>updateLocal(application._id,{business:{...business,subscriptionFeatures:{...(business.subscriptionFeatures||planFeatureDefaults[plan]),[feature]:event.target.checked}}})}/>{featureNames[feature]||feature}</label>)}</div>
                <p className="plan-feature-note">Set the plan defaults, adjust individual access, then save.</p>
                <button type="button" className="secondary-button" onClick={()=>updateLocal(application._id,{business:{...business,subscriptionPlan:plan,subscriptionFeatures:{...planFeatureDefaults[plan]}}})}>Apply plan defaults</button>
              </div>
              <button type="button" className="primary" disabled={busy===application._id} onClick={()=>savePlan(application)}><Check size={14}/> Save plan & access</button>
            </div>}
          </div>
          {!isDeleted&&<div className="actions">
            {application.status==="PENDING"&&<><button className="approve" disabled={busy===application._id} onClick={()=>decide(application._id,"approve")}><Check size={14}/> Approve</button><button className="reject" disabled={busy===application._id} onClick={()=>decide(application._id,"reject")}><X size={14}/> Reject</button></>}
            {business&&application.status==="APPROVED"&&<><button className="reject" disabled={busy===application._id} onClick={()=>changeBusinessStatus(application,"reject")}><X size={14}/> Reject access</button><button className="reject" disabled={busy===application._id} onClick={()=>changeBusinessStatus(application,"delete")}><Trash2 size={14}/> Delete store</button></>}
          </div>}
          {business&&application.status==="APPROVED"&&!isDeleted&&<div className="admin-password-panel">
            <button type="button" className="secondary-button" aria-expanded={passwordTarget===application._id} onClick={()=>{setPasswordTarget(current=>current===application._id?"":application._id);setAdminPassword("");setConfirmAdminPassword("");setError("");}}><KeyRound size={14}/>{passwordTarget===application._id?"Cancel password update":"Update admin password"}</button>
            {passwordTarget===application._id&&<form className="admin-password-form" onSubmit={event=>updateAdminPassword(event,application)}>
              <p>Set a new sign-in password for {application.ownerName} ({application.email}). Their current sessions will be signed out.</p>
              <label>New password<input type="password" autoComplete="new-password" minLength="10" maxLength="100" required value={adminPassword} onChange={event=>setAdminPassword(event.target.value)}/></label>
              <label>Confirm new password<input type="password" autoComplete="new-password" minLength="10" maxLength="100" required value={confirmAdminPassword} onChange={event=>setConfirmAdminPassword(event.target.value)}/></label>
              <button type="submit" className="primary" disabled={busy===`password-${application._id}`}>{busy===`password-${application._id}`?"Updating…":"Save new password"}</button>
            </form>}
          </div>}
        </article>;
      })}
    </div>
  </section>;
}
