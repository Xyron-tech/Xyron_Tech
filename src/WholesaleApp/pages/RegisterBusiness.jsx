import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {ArrowLeft,ArrowRight,Building2} from "lucide-react";
import {api,getApiError,waitForApi} from "../lib/api";
import {useAuth} from "../context/useAuth";
import {planCatalog} from "../data/planCatalog";

const initial={
  ownerName:"",email:"",phone:"",password:"",confirmPassword:"",
  businessName:"",category:"",description:"",address:"",city:"",state:"",pincode:"",
  localRatePerKg:"",sameDistrictRatePerKg:"",sameStateRatePerKg:"",otherStateRatePerKg:"",
  selectedPlan:"STARTER"
};
const baseDeliveryRates=[
  ["localRatePerKg","Same PIN / local"],
  ["sameDistrictRatePerKg","Same district"],
  ["sameStateRatePerKg","Same state"],
  ["otherStateRatePerKg","Other state"]
];

export default function RegisterBusiness(){
  const [form,setForm]=useState(initial),[error,setError]=useState(""),[connectionMessage,setConnectionMessage]=useState(""),[pincodeMessage,setPincodeMessage]=useState(""),[busy,setBusy]=useState(false);
  const navigate=useNavigate(),{apiConnectionMessage}=useAuth(),visibleConnectionMessage=connectionMessage||apiConnectionMessage;

  function change(event){
    setForm(current=>({...current,[event.target.name]:event.target.value}));
    if(event.target.name==="pincode")setPincodeMessage("");
  }

  async function lookupBusinessPincode(){
    if(!/^[1-9]\d{5}$/.test(form.pincode))return;
    setPincodeMessage("Checking the PIN with India Post…");
    try{
      const {data}=await api.get(`/pincodes/${form.pincode}`);
      setForm(current=>({...current,city:data.details.district,state:data.details.state}));
      setPincodeMessage(`${data.details.district}, ${data.details.state} verified.`);
    }catch(error){
      setPincodeMessage(`Could not verify this PIN. Enter the city and state manually. ${getApiError(error)}`);
    }
  }

  async function submit(event){
    event.preventDefault();
    setError("");
    if(form.password!==form.confirmPassword){setError("Passwords do not match.");return;}
    setBusy(true);
    try{
      await waitForApi(setConnectionMessage);
      setConnectionMessage("Server is ready. Submitting your application…");
      await api.post("/auth/register-business",form,{timeout:30000});
      navigate("/login",{state:{registered:true}});
    }catch(error){setError(getApiError(error));}
    finally{setBusy(false);setConnectionMessage("");}
  }

  return <section className="register">
    <Link className="back wholesale-back-link" to="/login"><ArrowLeft size={15}/> Back to sign in</Link>
    <div className="heading"><Building2/><div><small>BUSINESS ONBOARDING</small><h1>Apply for your store</h1><p>Choose a monthly plan. Features begin after Super Admin approval.</p></div></div>
    <form className="panel" onSubmit={submit}>
      <h3>Owner information</h3>
      <div className="grid">
        {[["ownerName","Owner full name","text"],["email","Business email","email"],["phone","Mobile number","tel"],["password","Password (10+ characters)","password"],["confirmPassword","Confirm password","password"]].map(([name,label,type])=><label key={name}>{label}<input name={name} type={type} required minLength={["password","confirmPassword"].includes(name)?10:undefined} autoComplete={["password","confirmPassword"].includes(name)?"new-password":undefined} value={form[name]} onChange={change}/></label>)}
      </div>
      <hr/>
      <h3>Business information</h3>
      <div className="grid">
        {[["businessName","Business name"],["category","Business category"],["description","Business description"],["address","Business address"]].map(([name,label])=><label key={name} className={["description","address"].includes(name)?"wide":""}>{label}{name==="description"?<textarea name={name} rows="3" value={form[name]} onChange={change}/>:<input name={name} required value={form[name]} onChange={change}/>}</label>)}
        <label>City / District<input name="city" required value={form.city} onChange={change}/></label>
        <label>State<input name="state" required value={form.state} onChange={change}/></label>
        <label>6-digit PIN code<input name="pincode" inputMode="numeric" autoComplete="postal-code" required minLength="6" maxLength="6" pattern="[1-9]\d{5}" value={form.pincode} onBlur={lookupBusinessPincode} onChange={event=>{setPincodeMessage("");setForm(current=>({...current,pincode:event.target.value.replace(/\D/g,"").slice(0,6)}));}}/>{pincodeMessage&&<small role="status">{pincodeMessage}</small>}</label>
      </div>
      <section className="registration-delivery-rates">
        <h3>Starting delivery rates · per kg</h3>
        <p>Optional. PIN-based location rates can be added or adjusted later in Shipping. Orders without a matching rate are still placed with delivery pending.</p>
        <div className="grid">{baseDeliveryRates.map(([name,label])=><label key={name}>{label} · ₹/kg<input name={name} type="number" min="0" max="1000000" step="0.01" value={form[name]} onChange={change} placeholder="Set later"/></label>)}</div>
      </section>
      <h3>Choose a plan · billed monthly</h3>
      <div className="plan-choice-grid">{planCatalog.map(plan=><label className={`plan-choice ${form.selectedPlan===plan.id?"selected":""}`} key={plan.id}><input type="radio" name="selectedPlan" value={plan.id} checked={form.selectedPlan===plan.id} onChange={change}/><b>{plan.name}</b><strong>₹{plan.price}<small> / month</small></strong><span>{plan.products} · {plan.slides}</span><small>{plan.features.join(", ")}</small></label>)}</div>
      {visibleConnectionMessage&&<div className="api-connecting form-connection" role="status" aria-live="polite">{visibleConnectionMessage}</div>}
      {error&&<div className="error" role="alert">{error}</div>}
      <div className="submit"><p>Your application will be reviewed by Xyron WebTech.</p><button className="primary" disabled={busy}>{busy?visibleConnectionMessage?.startsWith("Server is ready")?"Submitting…":"Connecting…":"Submit application"} <ArrowRight size={16}/></button></div>
    </form>
  </section>;
}
