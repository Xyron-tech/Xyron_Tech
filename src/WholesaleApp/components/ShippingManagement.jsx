import {useEffect,useState} from "react";
import {Check,MapPin,Pencil,Plus,Trash2,X} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";

const emptyDraft={name:"",pricePerKg:""};
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});

export default function ShippingManagement({business,onSaved}){
  const [deliveryRegions,setDeliveryRegions]=useState([]),[draft,setDraft]=useState(emptyDraft),[editingKey,setEditingKey]=useState(""),[saving,setSaving]=useState(false),[error,setError]=useState("");

  useEffect(()=>{
    setDeliveryRegions((business?.deliveryRegions||[]).map(region=>({...region,key:String(region._id)})));
  },[business]);

  function resetDraft(){
    setDraft(emptyDraft);
    setEditingKey("");
  }

  function saveRegion(event){
    event.preventDefault();
    setError("");
    const name=draft.name.trim(),price=Number(draft.pricePerKg);
    if(name.length<2){setError("Enter a delivery region name.");return;}
    if(!Number.isFinite(price)||price<0||price>1000000){setError("Enter a valid delivery price per kg.");return;}
    if(deliveryRegions.some(region=>region.key!==editingKey&&region.name.trim().toLocaleUpperCase("en-IN")===name.toLocaleUpperCase("en-IN"))){setError("Each delivery region must have a unique name.");return;}
    const region={...(editingKey?deliveryRegions.find(item=>item.key===editingKey):{}),key:editingKey||`new-${Date.now()}`,name,ratePerKgPaisa:Math.round(price*100)};
    setDeliveryRegions(current=>editingKey?current.map(item=>item.key===editingKey?region:item):[...current,region]);
    resetDraft();
  }

  function editRegion(region){
    setEditingKey(region.key);
    setDraft({name:region.name,pricePerKg:(Number(region.ratePerKgPaisa)/100).toFixed(2)});
  }

  function removeRegion(key){
    const region=deliveryRegions.find(item=>item.key===key);
    if(!region||!window.confirm(`Delete delivery region “${region.name}”?`))return;
    setDeliveryRegions(current=>current.filter(item=>item.key!==key));
    if(editingKey===key)resetDraft();
  }

  async function saveAll(event){
    event.preventDefault();
    setSaving(true);
    setError("");
    try{
      const {data}=await api.patch("/business/shipping-settings",{
        deliveryRegions:deliveryRegions.map(({_id,name,ratePerKgPaisa})=>({...(_id?{_id}:{}),name,ratePerKgPaisa}))
      });
      setDeliveryRegions((data.business.deliveryRegions||[]).map(region=>({...region,key:String(region._id)})));
      onSaved?.(data.business);
      notify(data.message);
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
    <h2>Delivery regions and prices</h2>
    <p>Add the delivery areas your business serves and set a price per kg. When reviewing an order, choose the matching region; the app calculates the starting charge from the order’s trusted product weight. You can adjust it before sending the final bill.</p>

    <form className="delivery-region-editor" onSubmit={saveRegion}>
      <label>Region name<input required minLength="2" maxLength="100" placeholder="For example, Local delivery" value={draft.name} onChange={event=>setDraft(current=>({...current,name:event.target.value}))}/></label>
      <label>Delivery price per kg (₹)<input required type="number" min="0" max="1000000" step="0.01" value={draft.pricePerKg} onChange={event=>setDraft(current=>({...current,pricePerKg:event.target.value}))}/></label>
      <div className="delivery-region-actions"><button className="primary" type="submit">{editingKey?<Pencil size={15}/>:<Plus size={15}/>} {editingKey?"Update region":"Add region"}</button>{editingKey&&<button className="secondary-button" type="button" onClick={resetDraft}><X size={15}/> Cancel</button>}</div>
    </form>

    {deliveryRegions.length?<div className="delivery-region-list" aria-label="Saved delivery regions">{deliveryRegions.map(region=><article className="delivery-region-row" key={region.key}>
      <span className="delivery-region-icon"><MapPin size={16}/></span>
      <div><b>{region.name}</b><small>{money.format(Number(region.ratePerKgPaisa)/100)} per kg · actual weight, no rounding</small></div>
      <button className="icon-action" type="button" onClick={()=>editRegion(region)} aria-label={`Edit ${region.name}`}><Pencil size={15}/></button>
      <button className="icon-action danger" type="button" onClick={()=>removeRegion(region.key)} aria-label={`Delete ${region.name}`}><Trash2 size={15}/></button>
    </article>)}</div>:<div className="delivery-region-empty"><MapPin size={20}/><b>No delivery regions saved</b><span>Add a region before accepting orders that need a delivery bill.</span></div>}

    {error&&<div className="store-admin-error-banner" role="alert">{error}</div>}
    <form onSubmit={saveAll}><button className="primary" disabled={saving}>{saving?"Saving…":<><Check size={15}/> Save delivery regions</>}</button></form>
  </section>;
}
