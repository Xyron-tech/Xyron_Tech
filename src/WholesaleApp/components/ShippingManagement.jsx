import {useState} from "react";
import {Check,MapPin,Pencil,Plus,Trash2,X} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";

const emptyDraft={name:"",matchType:"PINCODE",pincode:"",district:"",state:"",pricePerKg:""};
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const rateFields=[
  ["localPaisa","Same PIN / local"],
  ["sameDistrictPaisa","Same district"],
  ["sameStatePaisa","Same state"],
  ["otherStatePaisa","Other state"]
];
const rateText=value=>value==null?"":(Number(value)/100).toFixed(2);
const normalize=value=>String(value||"").trim().toLocaleUpperCase("en-IN");
const regionPayload=({ _id,name,matchType,pincode,district,state,ratePerKgPaisa })=>({...(_id?{_id}:{}),name,matchType,pincode,district,state,ratePerKgPaisa});

function ruleDescription(region){
  if(region.matchType==="PINCODE")return `PIN ${region.pincode}`;
  if(region.matchType==="DISTRICT")return [region.district,region.state].filter(Boolean).join(", ");
  if(region.matchType==="STATE")return region.state;
  return "Manual billing only";
}

export default function ShippingManagement({business,onSaved}){
  const [deliveryRegions,setDeliveryRegions]=useState(()=> (business?.deliveryRegions||[]).map(region=>({...region,key:String(region._id)})));
  const [deliveryRates,setDeliveryRates]=useState(()=>Object.fromEntries(rateFields.map(([key])=>[key,rateText(business?.deliveryRates?.[key])])));
  const [draft,setDraft]=useState(emptyDraft),[editingKey,setEditingKey]=useState(""),[editorOpen,setEditorOpen]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState("");

  function resetDraft(){
    setDraft(emptyDraft);
    setEditingKey("");
    setEditorOpen(false);
    setError("");
  }
  function openNewRegion(){
    setDraft(emptyDraft);
    setEditingKey("");
    setError("");
    setEditorOpen(true);
  }
  function editRegion(region){
    setEditingKey(region.key);
    setDraft({
      name:region.name,
      matchType:region.matchType||"MANUAL",
      pincode:region.pincode||"",
      district:region.district||"",
      state:region.state||"",
      pricePerKg:(Number(region.ratePerKgPaisa)/100).toFixed(2)
    });
    setError("");
    setEditorOpen(true);
  }
  function validateDraft(){
    const name=draft.name.trim(),price=Number(draft.pricePerKg);
    if(name.length<2)return "Enter a delivery region name.";
    if(!Number.isFinite(price)||price<0||price>1000000)return "Enter a valid delivery price per kg.";
    if(draft.matchType==="PINCODE"&&!/^[1-9]\d{5}$/.test(draft.pincode))return "Enter a valid 6-digit PIN code for this rate.";
    if(draft.matchType==="DISTRICT"&&(!draft.district.trim()||!draft.state.trim()))return "Enter both the district and state for this rate.";
    if(draft.matchType==="STATE"&&!draft.state.trim())return "Enter the state for this rate.";
    const matches=region=>{
      if(draft.matchType==="MANUAL"||region.matchType!==draft.matchType)return false;
      if(draft.matchType==="PINCODE")return region.pincode===draft.pincode;
      if(draft.matchType==="DISTRICT")return normalize(region.district)===normalize(draft.district)&&normalize(region.state)===normalize(draft.state);
      return normalize(region.state)===normalize(draft.state);
    };
    if(deliveryRegions.some(region=>region.key!==editingKey&&(region.name.trim().toLocaleUpperCase("en-IN")===name.toLocaleUpperCase("en-IN")||matches(region)))){
      return "A delivery rate already exists with this name or location.";
    }
    return "";
  }
  function buildRegion(){
    const existing=editingKey?deliveryRegions.find(item=>item.key===editingKey):null;
    return {
      ...(existing||{}),
      key:editingKey||`new-${Date.now()}`,
      name:draft.name.trim(),
      matchType:draft.matchType,
      pincode:draft.matchType==="PINCODE"?draft.pincode:"",
      district:draft.matchType==="DISTRICT"?draft.district.trim():"",
      state:["DISTRICT","STATE"].includes(draft.matchType)?draft.state.trim():"",
      ratePerKgPaisa:Math.round(Number(draft.pricePerKg)*100)
    };
  }
  async function persistSettings(nextRates,nextRegions){
    const {data}=await api.patch("/business/shipping-settings",{
      ...(nextRates?{deliveryRates:Object.fromEntries(rateFields.map(([key])=>[key,nextRates[key]===""?null:Math.round(Number(nextRates[key])*100)]))}:{}),
      deliveryRegions:nextRegions.map(regionPayload)
    });
    setDeliveryRegions((data.business.deliveryRegions||[]).map(region=>({...region,key:String(region._id)})));
    if(nextRates)setDeliveryRates(Object.fromEntries(rateFields.map(([key])=>[key,rateText(data.business.deliveryRates?.[key])])));
    onSaved?.(data.business);
    notify(data.message);
  }
  async function saveRegion(event){
    event.preventDefault();
    const validationMessage=validateDraft();
    if(validationMessage){setError(validationMessage);return;}
    const region=buildRegion();
    const nextRegions=editingKey?deliveryRegions.map(item=>item.key===editingKey?region:item):[...deliveryRegions,region];
    setSaving(true);
    setError("");
    try{
      await persistSettings(null,nextRegions);
      resetDraft();
    }catch(error){
      const message=getApiError(error);
      setError(message);
      notify(message,"error");
    }finally{
      setSaving(false);
    }
  }
  async function removeRegion(key){
    const region=deliveryRegions.find(item=>item.key===key);
    if(!region||!window.confirm(`Delete delivery rate "${region.name}"?`))return;
    const nextRegions=deliveryRegions.filter(item=>item.key!==key);
    setSaving(true);
    setError("");
    try{
      await persistSettings(null,nextRegions);
      if(editingKey===key)resetDraft();
    }catch(error){
      const message=getApiError(error);
      setError(message);
      notify(message,"error");
    }finally{
      setSaving(false);
    }
  }
  async function saveBaseRates(event){
    event.preventDefault();
    setSaving(true);
    setError("");
    try{
      await persistSettings(deliveryRates,deliveryRegions);
    }catch(error){
      const message=getApiError(error);
      setError(message);
      notify(message,"error");
    }finally{
      setSaving(false);
    }
  }

  return <section className="panel store-admin-form shipping-management">
    <span className="admin-section-kicker">DELIVERY SETUP</span>
    <h2>Automatic delivery rates</h2>
    <p>These per-kg prices are matched to the customer PIN using India Post. Add a PIN, district/city, or state-specific rate for areas outside your default rates. Orders without a matching rate are still placed, but customers must confirm the delivery charge with you before paying.</p>
    <form className="delivery-base-rates" onSubmit={saveBaseRates}><div className="delivery-base-rates-fields">{rateFields.map(([key,label])=><label key={key}>{label} · ₹/kg<input type="number" min="0" max="1000000" step="0.01" value={deliveryRates[key]} onChange={event=>setDeliveryRates(current=>({...current,[key]:event.target.value}))} placeholder="Set later"/></label>)}</div><button className="primary" disabled={saving}>{saving?"Saving…":<><Check size={15}/> Save base rates</>}</button></form>

    <div className="delivery-zone-heading"><div><h3>Location-specific rates</h3><p>Set an exact PIN, district/city with state, or state rate. These saved rates take priority over your four default prices.</p></div><button className="primary" type="button" disabled={saving||deliveryRegions.length>=100} onClick={openNewRegion}><Plus size={15}/> Add location rate</button></div>
    {deliveryRegions.length?<div className="delivery-region-list" aria-label="Saved location rates">{deliveryRegions.map(region=><article className="delivery-region-row" key={region.key}>
      <span className="delivery-region-icon"><MapPin size={16}/></span>
      <div><b>{region.name}</b><small>{ruleDescription(region)} · {money.format(Number(region.ratePerKgPaisa)/100)}/kg</small></div>
      <button className="icon-action" type="button" disabled={saving} onClick={()=>editRegion(region)} aria-label={`Edit ${region.name}`}><Pencil size={15}/></button>
      <button className="icon-action danger" type="button" disabled={saving} onClick={()=>removeRegion(region.key)} aria-label={`Delete ${region.name}`}><Trash2 size={15}/></button>
    </article>)}</div>:<div className="delivery-region-empty"><MapPin size={20}/><b>No location-specific rates saved</b><span>Add one when orders start coming from a new PIN, district, or state.</span></div>}

    {error&&!editorOpen&&<div className="store-admin-error-banner" role="alert">{error}</div>}
    {editorOpen&&<div className="product-modal-backdrop delivery-region-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget&&!saving)resetDraft();}}>
      <section className="product-modal delivery-region-modal" role="dialog" aria-modal="true" aria-labelledby="delivery-region-modal-title">
        <header><h2 id="delivery-region-modal-title">{editingKey?"Edit location rate":"Add location rate"}</h2><button className="secondary-button" type="button" disabled={saving} aria-label="Close location rate editor" onClick={resetDraft}><X size={15}/></button></header>
        <form className="delivery-region-editor" onSubmit={saveRegion}>
          <label>Rate name<input required minLength="2" maxLength="100" placeholder="For example, Thanjavur city" value={draft.name} onChange={event=>setDraft(current=>({...current,name:event.target.value}))}/></label>
          <label>Apply this rate to<select value={draft.matchType} onChange={event=>setDraft(current=>({...current,matchType:event.target.value}))}><option value="PINCODE">Exact PIN code</option><option value="DISTRICT">District and state</option><option value="STATE">State</option><option value="MANUAL">Manual bill only</option></select></label>
          {draft.matchType==="PINCODE"&&<label>6-digit PIN<input required inputMode="numeric" maxLength="6" pattern="[1-9]\d{5}" value={draft.pincode} onChange={event=>setDraft(current=>({...current,pincode:event.target.value.replace(/\D/g,"").slice(0,6)}))}/></label>}
          {draft.matchType==="DISTRICT"&&<><label>District / city<input required maxLength="100" value={draft.district} onChange={event=>setDraft(current=>({...current,district:event.target.value}))}/></label><label>State<input required maxLength="100" value={draft.state} onChange={event=>setDraft(current=>({...current,state:event.target.value}))}/></label></>}
          {draft.matchType==="STATE"&&<label>State<input required maxLength="100" value={draft.state} onChange={event=>setDraft(current=>({...current,state:event.target.value}))}/></label>}
          <label>Delivery price · ₹/kg<input required type="number" min="0" max="1000000" step="0.01" value={draft.pricePerKg} onChange={event=>setDraft(current=>({...current,pricePerKg:event.target.value}))}/></label>
          {error&&<div className="store-admin-error-banner" role="alert">{error}</div>}
          <div className="delivery-region-actions"><button className="primary" type="submit" disabled={saving}>{saving?"Saving…":<>{editingKey?<Pencil size={15}/>:<Plus size={15}/>} {editingKey?"Update rate":"Add rate"}</>}</button><button className="secondary-button" type="button" disabled={saving} onClick={resetDraft}><X size={15}/> Cancel</button></div>
        </form>
      </section>
    </div>}
  </section>;
}
