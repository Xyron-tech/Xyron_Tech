import {useEffect,useRef,useState} from "react";
import {ArrowRight,HelpCircle} from "lucide-react";
import {api,getApiError} from "../lib/api";

function scrollFieldIntoView(field){
  if(!field?.isConnected)return;
  requestAnimationFrame(()=>{
    if(!field.isConnected)return;
    const bounds=field.getBoundingClientRect();
    const viewport=window.visualViewport;
    const visibleTop=viewport?.offsetTop||0;
    const visibleBottom=visibleTop+(viewport?.height||window.innerHeight);
    const delta=bounds.bottom>visibleBottom-20?bounds.bottom-(visibleBottom-20):bounds.top<visibleTop+12?bounds.top-(visibleTop+12):0;
    if(delta)window.scrollBy({top:delta,behavior:"smooth"});
  });
}

export default function CustomerAuthForm({slug,initialMode="login",onAuthenticated}){
  const [mode,setMode]=useState(initialMode),[form,setForm]=useState({identifier:"",customerName:"",email:"",phone:"",pincode:"",district:"",state:"",deliveryAddress:"",password:"",confirmPassword:""}),[error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
  const focusedFieldRef=useRef(null);
  const base=`/stores/${encodeURIComponent(slug)}/customer`;

  useEffect(()=>{
    const viewport=window.visualViewport;
    if(!viewport)return undefined;
    const keepFocusedFieldVisible=()=>{
      const field=focusedFieldRef.current;
      scrollFieldIntoView(field);
    };
    viewport.addEventListener("resize",keepFocusedFieldVisible);
    viewport.addEventListener("scroll",keepFocusedFieldVisible);
    return ()=>{
      viewport.removeEventListener("resize",keepFocusedFieldVisible);
      viewport.removeEventListener("scroll",keepFocusedFieldVisible);
    };
  },[]);

  function keepFieldVisible(event){
    if(!event.target.matches("input,textarea,select"))return;
    focusedFieldRef.current=event.target;
    scrollFieldIntoView(event.target);
  }

  function clearFocusedField(event){
    if(!event.currentTarget.contains(event.relatedTarget))focusedFieldRef.current=null;
  }

  async function submit(event){
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try{
      if(mode==="help"){
        const {data}=await api.post(`${base}/recovery-requests`,{email:form.email,phone:form.phone});
        setNotice(data.message);
        return;
      }
      const {data}=await api.post(`${base}/${mode}`,mode==="register"
        ?{customerName:form.customerName,email:form.email,phone:form.phone,pincode:form.pincode,district:form.district,state:form.state,deliveryAddress:form.deliveryAddress,password:form.password,confirmPassword:form.confirmPassword}
        :{identifier:form.identifier,password:form.password});
      setForm(current=>({...current,password:"",confirmPassword:""}));
      await onAuthenticated?.(data.customer);
    }catch(error){setError(getApiError(error));}
    finally{setBusy(false);}
  }

  function changeMode(next){
    setMode(next);
    setError("");
    setNotice("");
  }

  return <section className="customer-auth-panel">
    <div className="customer-auth-heading"><span className="customer-account-icon"><HelpCircle size={19}/></span><div><small>{mode==="register"?"NEW CUSTOMER":mode==="help"?"ACCOUNT HELP":"CUSTOMER ACCOUNT"}</small><h2>{mode==="register"?"Create account":mode==="help"?"Password help":"Sign in to continue"}</h2></div></div>
    <p className="customer-auth-copy">{mode==="register"?"Add your contact and delivery details once. They’ll be saved to your account for future orders.":mode==="help"?"Send a help request using the email and mobile number on your account.": "Sign in with your email or mobile number and password."}</p>
    <form className="customer-auth-form" onSubmit={submit} onFocusCapture={keepFieldVisible} onBlurCapture={clearFocusedField}>
      {mode==="register"?<>
        <label>Full name<input type="text" autoComplete="name" required minLength="2" maxLength="100" value={form.customerName} onChange={event=>setForm(current=>({...current,customerName:event.target.value}))}/></label>
        <label>Email address<input type="email" autoComplete="email" required maxLength="160" value={form.email} onChange={event=>setForm(current=>({...current,email:event.target.value}))}/></label>
        <label>Mobile number<input type="tel" inputMode="tel" autoComplete="tel" required minLength="10" maxLength="20" placeholder="+91 98765 43210" value={form.phone} onChange={event=>setForm(current=>({...current,phone:event.target.value}))}/></label>
        <label>Delivery pincode<input type="text" inputMode="numeric" autoComplete="postal-code" required minLength="6" maxLength="6" pattern="[1-9]\d{5}" value={form.pincode} onChange={event=>setForm(current=>({...current,pincode:event.target.value.replace(/\D/g,"").slice(0,6)}))} placeholder="6-digit pincode"/></label>
        <label>District<input type="text" autoComplete="address-level2" required minLength="2" maxLength="100" value={form.district} onChange={event=>setForm(current=>({...current,district:event.target.value}))}/></label>
        <label>State<input type="text" autoComplete="address-level1" required minLength="2" maxLength="100" value={form.state} onChange={event=>setForm(current=>({...current,state:event.target.value}))}/></label>
        <label>Full delivery address<textarea autoComplete="street-address" required minLength="8" maxLength="500" rows="3" value={form.deliveryAddress} onChange={event=>setForm(current=>({...current,deliveryAddress:event.target.value}))}/></label>
        <label>Password<input type="password" autoComplete="new-password" required minLength="10" maxLength="100" value={form.password} onChange={event=>setForm(current=>({...current,password:event.target.value}))}/></label>
        <label>Confirm password<input type="password" autoComplete="new-password" required minLength="10" maxLength="100" value={form.confirmPassword} onChange={event=>setForm(current=>({...current,confirmPassword:event.target.value}))}/></label>
      </>:mode==="help"?<>
        <label>Account email address<input type="email" autoComplete="email" required maxLength="160" value={form.email} onChange={event=>setForm(current=>({...current,email:event.target.value}))}/></label>
        <label>Account mobile number<input type="tel" inputMode="tel" autoComplete="tel" required minLength="10" maxLength="20" value={form.phone} onChange={event=>setForm(current=>({...current,phone:event.target.value}))}/></label>
      </>:<>
        <label>Email or mobile number<input autoComplete="username" required maxLength="160" value={form.identifier} onChange={event=>setForm(current=>({...current,identifier:event.target.value}))}/></label>
        <label>Password<input type="password" autoComplete="current-password" required minLength="10" maxLength="100" value={form.password} onChange={event=>setForm(current=>({...current,password:event.target.value}))}/></label>
      </>}
      {error&&<div className="error" role="alert">{error}</div>}
      {notice&&<div className="customer-auth-notice" role="status">{notice}</div>}
      <button className="primary" type="submit" disabled={busy}>{busy?mode==="help"?"Sending…":mode==="register"?"Creating account…":"Signing in…":mode==="help"?"Send help request":mode==="register"?"Create account":"Sign in"} <ArrowRight size={15}/></button>
    </form>
    <div className="customer-auth-options">
      {mode==="login"?<><button type="button" onClick={()=>changeMode("register")}>Create a new account</button><button type="button" onClick={()=>changeMode("help")}>Forgot password? Help</button></>:<button type="button" onClick={()=>changeMode("login")}>Back to sign in</button>}
      {mode==="help"&&<button type="button" onClick={()=>changeMode("register")}>Create a new account</button>}
    </div>
    <p className="customer-auth-security">Your saved address, district, state, and pincode are used for each order. Never share your password.</p>
  </section>;
}
