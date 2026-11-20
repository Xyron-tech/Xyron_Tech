import {useEffect,useState} from "react";
import {Link,useOutletContext,useParams,useSearchParams} from "react-router-dom";
import {Check,ClipboardList,LogOut,Pencil,ShieldCheck,Trash2,UserRound,X} from "lucide-react";
import {api,getApiError} from "../lib/api";
import CustomerAuthForm from "../components/CustomerAuthForm";
import CustomerStorePage from "../components/CustomerStoreChrome";
import BrandLoader from "../../Components/BrandLoader";
import {InstallAppButton} from "../../Components/InstallAppContext";

export default function CustomerAccount(){
  const {storeBusiness}=useOutletContext();
  const {slug}=useParams(),[searchParams]=useSearchParams(),base=`/stores/${encodeURIComponent(slug)}/customer`;
  const initialMode=searchParams.get("mode")==="register"?"register":"login";
  const [customer,setCustomer]=useState(null),[profile,setProfile]=useState({customerName:"",email:"",phone:"",pincode:"",district:"",state:"",deliveryAddress:"",currentPassword:"",newPassword:"",confirmNewPassword:""}),[editing,setEditing]=useState(false),[deleting,setDeleting]=useState(false),[deletePassword,setDeletePassword]=useState(""),[error,setError]=useState(""),[notice,setNotice]=useState(""),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);

  useEffect(()=>{
    document.title=`Customer account | Xyron Wholesale`;
    let robots=document.head.querySelector('meta[name="robots"]');
    const originalRobots=robots?.getAttribute("content")??null;
    if(!robots){robots=document.createElement("meta");robots.name="robots";document.head.appendChild(robots);}
    robots.content="noindex,nofollow";
    const canonical=document.head.querySelector('link[rel="canonical"]');
    const originalCanonical=canonical?.href||null;
    canonical?.remove();
    return ()=>{
      if(originalRobots===null)robots.remove();
      else robots.content=originalRobots;
      if(originalCanonical){
        let restoredCanonical=document.head.querySelector('link[rel="canonical"]');
        if(!restoredCanonical){restoredCanonical=document.createElement("link");restoredCanonical.rel="canonical";document.head.appendChild(restoredCanonical);}
        restoredCanonical.href=originalCanonical;
      }
    };
  },[]);

  useEffect(()=>{
    let active=true;
    async function loadAccount(){
      try{
        const {data}=await api.get(`${base}/me`);
        if(!active)return;
        setCustomer(data.customer);
        if(data.customer)setProfile(current=>({...current,customerName:data.customer.customerName||"",email:data.customer.email||"",phone:data.customer.phone||"",pincode:data.customer.pincode||"",district:data.customer.district||"",state:data.customer.state||"",deliveryAddress:data.customer.deliveryAddress||"",currentPassword:"",newPassword:"",confirmNewPassword:""}));
      }catch(error){if(active)setError(getApiError(error));}
      finally{if(active)setLoading(false);}
    }
    loadAccount();
    return ()=>{active=false;};
  },[base]);

  async function signOut(){
    setError("");
    setBusy(true);
    try{
      await api.post(`${base}/logout`);
      setCustomer(null);
    }catch(error){setError(getApiError(error));}
    finally{setBusy(false);}
  }

  async function saveProfile(event){
    event.preventDefault();
    setError("");setNotice("");setBusy(true);
    try{
      const {data}=await api.patch(`${base}/profile`,profile);
      setCustomer(data.customer);
      setProfile(current=>({...current,...data.customer,currentPassword:"",newPassword:"",confirmNewPassword:""}));
      setEditing(false);setNotice(data.message);
    }catch(error){setError(getApiError(error));}
    finally{setBusy(false);}
  }

  async function deleteProfile(event){
    event.preventDefault();
    setError("");setNotice("");setBusy(true);
    try{
      const {data}=await api.delete(`${base}/profile`,{data:{currentPassword:deletePassword}});
      setCustomer(null);setEditing(false);setDeleting(false);setDeletePassword("");setNotice(data.message);
    }catch(error){setError(getApiError(error));}
    finally{setBusy(false);}
  }

  if(loading)return <CustomerStorePage business={storeBusiness} slug={slug}><BrandLoader label="Loading your account"/></CustomerStorePage>;

  return <CustomerStorePage business={storeBusiness} slug={slug} isSignedIn={Boolean(customer)}><section className="customer-account" id="profile">
    <header className="customer-account-heading">
      <span className="store-eyebrow">CUSTOMER ACCOUNT · {slug.toUpperCase()}</span>
      <h1>Customer profile</h1>
      <p>Manage your customer login and account details. Your account works across Xyron stores.</p>
      {!customer&&<InstallAppButton/>}
    </header>
    {error&&!editing&&<div className="store-inline-error" role="alert">{error}</div>}
    {notice&&!customer&&<div className="customer-auth-notice" role="status">{notice}</div>}
    {customer?<div className="customer-profile-layout">
      <section className="panel customer-account-profile">
        <span className="customer-account-icon"><UserRound size={20}/></span>
        <small>ACCOUNT PROFILE</small>
        <h2>Customer account</h2>
        {notice&&<div className="customer-auth-notice" role="status">{notice}</div>}
        <dl className="customer-account-details"><div><dt>Full name</dt><dd>{customer.customerName||"Add your name"}</dd></div><div><dt>Email address</dt><dd>{customer.email}</dd></div><div><dt>Mobile number</dt><dd>{customer.phone}</dd></div><div><dt>Default pincode</dt><dd>{customer.pincode||"Add your pincode"}</dd></div><div><dt>District</dt><dd>{customer.district||"Add your district"}</dd></div><div><dt>State</dt><dd>{customer.state||"Add your state"}</dd></div><div className="wide"><dt>Delivery address</dt><dd>{customer.deliveryAddress||"Add your delivery address"}</dd></div></dl>
        <div className="customer-account-actions">
          <button className="secondary-button" type="button" onClick={()=>{setEditing(true);setDeleting(false);setError("");setNotice("");setProfile(current=>({...current,customerName:customer.customerName||"",email:customer.email||"",phone:customer.phone||"",pincode:customer.pincode||"",district:customer.district||"",state:customer.state||"",deliveryAddress:customer.deliveryAddress||"",currentPassword:"",newPassword:"",confirmNewPassword:""}));}} disabled={busy}><Pencil size={14}/> Edit profile</button>
          <button className="customer-delete-toggle" type="button" onClick={()=>{setDeleting(value=>!value);setEditing(false);setError("");setDeletePassword("");}} disabled={busy}><Trash2 size={14}/> {deleting?"Cancel delete":"Delete profile"}</button>
          <Link className="secondary-button" to={`/store/${encodeURIComponent(slug)}/orders`}><ClipboardList size={15}/>View orders and chat</Link>
          <InstallAppButton containerClassName="customer-account-install"/>
          <button className="secondary-button" type="button" onClick={signOut} disabled={busy}><LogOut size={14}/>{busy?"Signing out…":"Sign out"}</button>
        </div>
        {deleting&&<form className="customer-delete-panel" onSubmit={deleteProfile}><p>Deleting removes your customer login from all stores. Existing order and chat records stay with the stores.</p><label>Confirm with your current password<input type="password" autoComplete="current-password" required value={deletePassword} onChange={event=>setDeletePassword(event.target.value)}/></label><div><button className="secondary-button" type="button" onClick={()=>{setDeleting(false);setDeletePassword("");setError("");}} disabled={busy}>Cancel</button><button className="danger-button" type="submit" disabled={busy}><Trash2 size={14}/>{busy?"Deleting…":"Delete account"}</button></div></form>}
        <div className="customer-account-note"><ShieldCheck size={15}/><span>Only you can view your orders. Store managers can access orders from their store only.</span></div>
      </section>
      {editing&&<div className="product-modal-backdrop customer-profile-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget&&!busy){setEditing(false);setError("");}}}>
        <section className="product-modal customer-profile-modal" role="dialog" aria-modal="true" aria-labelledby="customer-profile-modal-title">
          <header><h2 id="customer-profile-modal-title">Edit customer profile</h2><button type="button" aria-label="Close profile editor" disabled={busy} onClick={()=>{setEditing(false);setError("");}}><X size={18}/></button></header>
          {error&&<div className="store-inline-error" role="alert">{error}</div>}
          <form className="customer-account-form customer-profile-modal-form" onSubmit={saveProfile}>
            <label>Full name<input type="text" autoComplete="name" required minLength="2" maxLength="100" value={profile.customerName} onChange={event=>setProfile(current=>({...current,customerName:event.target.value}))}/></label>
            <label>Email address<input type="email" autoComplete="email" required maxLength="160" value={profile.email} onChange={event=>setProfile(current=>({...current,email:event.target.value}))}/></label>
            <label>Mobile number<input type="tel" inputMode="tel" autoComplete="tel" required minLength="10" maxLength="20" value={profile.phone} onChange={event=>setProfile(current=>({...current,phone:event.target.value}))}/></label>
            <label>Default delivery pincode<input type="text" inputMode="numeric" autoComplete="postal-code" required minLength="6" maxLength="6" pattern="[1-9]\d{5}" value={profile.pincode} onChange={event=>setProfile(current=>({...current,pincode:event.target.value.replace(/\D/g,"").slice(0,6)}))}/></label>
            <label>District<input type="text" autoComplete="address-level2" required minLength="2" maxLength="100" value={profile.district} onChange={event=>setProfile(current=>({...current,district:event.target.value}))}/></label>
            <label>State<input type="text" autoComplete="address-level1" required minLength="2" maxLength="100" value={profile.state} onChange={event=>setProfile(current=>({...current,state:event.target.value}))}/></label>
            <label className="customer-profile-modal-wide">Full delivery address<textarea autoComplete="street-address" required minLength="8" maxLength="500" rows="3" value={profile.deliveryAddress} onChange={event=>setProfile(current=>({...current,deliveryAddress:event.target.value}))}/></label>
            <label>Current password<input type="password" autoComplete="current-password" required value={profile.currentPassword} onChange={event=>setProfile(current=>({...current,currentPassword:event.target.value}))}/></label>
            <label>New password <small>Optional</small><input type="password" autoComplete="new-password" minLength="10" maxLength="100" value={profile.newPassword} onChange={event=>setProfile(current=>({...current,newPassword:event.target.value}))}/></label>
            <label>Confirm new password<input type="password" autoComplete="new-password" minLength="10" maxLength="100" value={profile.confirmNewPassword} onChange={event=>setProfile(current=>({...current,confirmNewPassword:event.target.value}))}/></label>
            <div className="product-modal-actions customer-profile-modal-actions"><button className="secondary-button" type="button" disabled={busy} onClick={()=>{setEditing(false);setError("");}}>Cancel</button><button className="primary" type="submit" disabled={busy}><Check size={15}/>{busy?"Saving…":"Save profile"}</button></div>
          </form>
        </section>
      </div>}
    </div>:<CustomerAuthForm key={initialMode} slug={slug} initialMode={initialMode} onAuthenticated={account=>{setCustomer(account);setError("");}}/>}
  </section></CustomerStorePage>;
}
