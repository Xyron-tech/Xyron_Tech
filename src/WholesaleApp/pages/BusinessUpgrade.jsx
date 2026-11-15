import {useEffect,useState} from "react";
import {Check,MessageCircle,RefreshCw,Send,X} from "lucide-react";
import {Link} from "react-router-dom";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";
import {planCatalog} from "../data/planCatalog";

export default function BusinessUpgrade(){
  const [business,setBusiness]=useState(null),[selectedPlan,setSelectedPlan]=useState(""),[note,setNote]=useState(""),[modalOpen,setModalOpen]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[loadError,setLoadError]=useState(""),[error,setError]=useState(""),[notice,setNotice]=useState("");
  useEffect(()=>{api.get("/business/storefront").then(({data})=>setBusiness(data.business)).catch(error=>setLoadError(getApiError(error))).finally(()=>setLoading(false));},[]);
  useEffect(()=>{
    if(!modalOpen)return undefined;
    const previousOverflow=document.body.style.overflow;
    const closeOnEscape=event=>{if(event.key==="Escape"&&!busy)setModalOpen(false);};
    document.body.style.overflow="hidden";
    window.addEventListener("keydown",closeOnEscape);
    return ()=>{document.body.style.overflow=previousOverflow;window.removeEventListener("keydown",closeOnEscape);};
  },[modalOpen,busy]);
  function choosePlan(planId){
    setSelectedPlan(planId);setNote("");setError("");setNotice("");setModalOpen(true);
  }
  function closePlanModal(){
    if(busy)return;
    setModalOpen(false);setSelectedPlan("");setNote("");setError("");
  }
  async function requestUpgrade(event){
    event.preventDefault();
    if(!selectedPlan)return;
    setBusy(true);setError("");setNotice("");
    const plan=planCatalog.find(item=>item.id===selectedPlan);
    if(!plan){setError("Choose a valid subscription plan.");setBusy(false);return;}
    try{
      const {data}=await api.post("/business/support",{subject:`Plan upgrade request: ${plan.name}`,category:"SUBSCRIPTION",requestedPlan:plan.id,body:`Current plan: ${business?.subscriptionPlan||"Unknown"}.\nRequested plan: ${plan.name} (₹${plan.price}/month).${note.trim()?`\n\nAdditional details: ${note.trim()}`:""}`});
      setNotice(data.message||"Your plan upgrade request was sent to Xyron Admin.");
      setModalOpen(false);setSelectedPlan("");setNote("");notify(data.message||"Plan upgrade request sent.");
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setBusy(false);}
  }
  return <section className="business-upgrade">
    <header className="orders-admin-heading"><div><span className="eyebrow"><i/> BUSINESS WORKSPACE</span><h1>Upgrade your plan</h1><p>Choose the plan you would like Xyron Admin to review for your store.</p></div><Link className="secondary-button" to="/dashboard/support"><MessageCircle size={15}/> Subscription inbox</Link></header>
    {loading?<div className="panel">Loading plan details…</div>:loadError?<div className="error" role="alert">{loadError}<button type="button" onClick={()=>window.location.reload()}><RefreshCw size={14}/> Retry</button></div>:<>
      <p className="upgrade-current-plan">Current plan: <b>{business?.subscriptionPlan||"Starter"}</b></p>
      {notice&&<div className="support-notice" role="status">{notice}</div>}
      <div className="upgrade-plan-grid">{planCatalog.map(plan=><article className="upgrade-plan-card" key={plan.id}><span>{plan.name}</span><strong>₹{plan.price}<small>/month</small></strong><p>{plan.products} · {plan.slides}</p><ul>{plan.features.map(feature=><li key={feature}><Check size={14}/>{feature}</li>)}</ul><button type="button" className="secondary-button" onClick={()=>choosePlan(plan.id)}>Request this plan</button></article>)}</div>
      {modalOpen&&<div className="upgrade-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)closePlanModal();}}>
        <section className="upgrade-plan-modal" role="dialog" aria-modal="true" aria-labelledby="upgrade-modal-title">
          <header><div><span className="admin-section-kicker">SUBSCRIPTION REQUEST</span><h2 id="upgrade-modal-title">Request {planCatalog.find(plan=>plan.id===selectedPlan)?.name}</h2></div><button type="button" aria-label="Close plan request" onClick={closePlanModal} disabled={busy}><X size={18}/></button></header>
          <p>Plan changes are reviewed by Xyron Admin. This request does not activate a subscription or take payment.</p>
          <div className="upgrade-modal-plan"><b>{planCatalog.find(plan=>plan.id===selectedPlan)?.name}</b><strong>₹{planCatalog.find(plan=>plan.id===selectedPlan)?.price}<small>/month</small></strong></div>
          <form className="upgrade-request-form" onSubmit={requestUpgrade}>
            <label>Additional details <small>Optional</small><textarea value={note} onChange={event=>setNote(event.target.value)} maxLength="1500" rows="4" placeholder="Share any details for Xyron Admin."/></label>
            {error&&<div className="error" role="alert">{error}</div>}
            <div className="upgrade-modal-actions"><button type="button" className="secondary-button" onClick={closePlanModal} disabled={busy}>Cancel</button><button className="primary" type="submit" disabled={!selectedPlan||busy}><Send size={15}/>{busy?"Sending…":"Send request"}</button></div>
          </form>
        </section>
      </div>}
    </>}
  </section>;
}
