import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {ArrowRight,LockKeyhole,Mail} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {useAuth} from "../context/AuthContext";

export default function Login(){
  const [form,setForm]=useState({email:"",password:""});
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [showRecovery,setShowRecovery]=useState(false);
  const {refreshUser}=useAuth();
  const navigate=useNavigate();

  async function submit(event){
    event.preventDefault();
    setError("");
    setBusy(true);
    try{
      await api.post("/auth/login",form);
      await refreshUser();
      navigate("/");
    }catch(error){setError(getApiError(error));}
    finally{setBusy(false);}
  }

  return <section className="auth">
    <div className="intro"><small>WHOLESALE, REIMAGINED</small><h1>One platform.<br/><em>Your business.</em></h1><p>Independent stores, connected operations, and a simpler way to grow your wholesale business.</p><div>01　Your own business workspace</div><div>02　Secure, tenant-isolated access</div><div>03　Built for wholesale workflows</div></div>
    <form className="panel" onSubmit={submit}>
      <small>WELCOME BACK</small><h2>Sign in to Xyron</h2><p>Use your registered email and password.</p>
      <label>Email address<div className="field"><Mail size={16}/><input type="email" required placeholder="you@business.com" value={form.email} onChange={event=>setForm(current=>({...current,email:event.target.value}))}/></div></label>
      <label>Password<div className="field"><LockKeyhole size={16}/><input type="password" required placeholder="Your password" value={form.password} onChange={event=>setForm(current=>({...current,password:event.target.value}))}/></div></label>
      {error&&<div className="error" role="alert">{error}</div>}
      <button className="primary" disabled={busy}>{busy?"Signing in…":"Sign in"} <ArrowRight size={16}/></button>
      <div className="login-recovery"><button type="button" onClick={()=>setShowRecovery(value=>!value)} aria-expanded={showRecovery}>Forgot password?</button>{showRecovery&&<p>Super Admin recovery: update <code>SUPER_ADMIN_PASSWORD</code> in the server environment, then run <code>npm run seed:super-admin</code> from the project root. Business owners can contact the Super Admin to reset their account.</p>}</div>
      <div className="foot">New to Xyron Wholesale? <Link to="/register">Apply for a business account</Link></div>
    </form>
  </section>;
}
