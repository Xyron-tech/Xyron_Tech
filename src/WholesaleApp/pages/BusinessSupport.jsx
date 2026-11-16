import {useCallback,useEffect,useState} from "react";
import {MessageCircle,RefreshCw,Send} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";
import {useLocation} from "react-router-dom";

const categories=["SUBSCRIPTION","PAYMENT","STORE","TECHNICAL","OTHER"];
const formatDate=value=>new Date(value).toLocaleString();

export default function BusinessSupport(){
  const location=useLocation();
  const upgradeRequested=new URLSearchParams(location.search).get("upgrade")==="1";
  const [conversations,setConversations]=useState([]),[selected,setSelected]=useState(null),[subject,setSubject]=useState(()=>upgradeRequested?"Request a plan upgrade":""),[category,setCategory]=useState(()=>upgradeRequested?"SUBSCRIPTION":"OTHER"),[body,setBody]=useState(()=>upgradeRequested?"Please review my business plan and share the available upgrade options.":""),[reply,setReply]=useState(""),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
  const load=useCallback(async(quiet=false)=>{
    try{
      const {data}=await api.get("/business/support");
      setConversations(data.conversations);
      setSelected(current=>current?data.conversations.find(item=>item._id===current._id)||null:null);
      if(!quiet)setError("");
    }catch(error){setError(getApiError(error));if(!quiet)notify(getApiError(error),"error");}
    finally{if(!quiet)setLoading(false);}
  },[]);
  useEffect(()=>{
    let active=true;
    api.get("/business/support").then(({data})=>{
      if(active){setConversations(data.conversations);setSelected(current=>current?data.conversations.find(item=>item._id===current._id)||null:null);setError("");}
    }).catch(error=>{if(active)setError(getApiError(error));}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    const refresh=()=>load(true);
    const timer=window.setInterval(refresh,15000);
    window.addEventListener("focus",refresh);
    return ()=>{window.clearInterval(timer);window.removeEventListener("focus",refresh);};
  },[load]);

  async function openConversation(id){
    setError("");
    try{
      const {data}=await api.get(`/business/support/${id}`);
      setSelected(data.conversation);
      setConversations(current=>current.map(item=>item._id===id?data.conversation:item));
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
  }

  async function startConversation(event){
    event.preventDefault();setBusy(true);setError("");setNotice("");
    try{
      const {data}=await api.post("/business/support",{subject,category,body});
      setSubject("");setBody("");setNotice(data.message);notify(data.message);setSelected(data.conversation);await load();
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setBusy(false);}
  }

  async function sendReply(event){
    event.preventDefault();if(!selected)return;
    setBusy(true);setError("");
    try{
      const {data}=await api.post(`/business/support/${selected._id}/messages`,{body:reply});
      setSelected(data.conversation);setReply("");await load();notify("Reply sent to Xyron Admin.");
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setBusy(false);}
  }

  return <section className="support-page">
    <header className="admin-head"><div><small>BUSINESS SUPPORT</small><h1>Contact Xyron Admin</h1><p>Send subscription, payment, store, or technical questions to the platform team.</p></div><span><MessageCircle size={16}/> Private support</span></header>
    {error&&<div className="error" role="alert">{error}</div>}{notice&&<div className="support-notice" role="status">{notice}</div>}
    <div className="support-layout">
      <div className="support-sidebar">
        <form className="panel support-new-form" onSubmit={startConversation}>
          <h2>New message</h2>
          <label>Subject<input value={subject} onChange={event=>setSubject(event.target.value)} minLength="3" maxLength="120" required placeholder="What can we help with?"/></label>
          <label>Topic<select value={category} onChange={event=>setCategory(event.target.value)}>{categories.map(item=><option key={item} value={item}>{item.replace("_"," ")}</option>)}</select></label>
          <label>Message<textarea value={body} onChange={event=>setBody(event.target.value)} minLength="2" maxLength="2000" rows="4" required placeholder="Describe what you need help with."/></label>
          <button className="primary" type="submit" disabled={busy}><Send size={15}/>{busy?"Sending…":"Send to Xyron Admin"}</button>
        </form>
        <section className="panel support-list">
          <div className="list-head"><h2>Your conversations</h2><button type="button" onClick={load} aria-label="Refresh support messages"><RefreshCw size={15}/></button></div>
          {loading?<p>Loading messages…</p>:conversations.length?conversations.map(item=><button type="button" key={item._id} onClick={()=>openConversation(item._id)} className={`support-list-item ${selected?._id===item._id?"selected":""}`}><span className="support-list-title">{item.subject}</span><span>{item.category} · {item.status.replace("_"," ")}</span>{item.requestedPlan&&<small>Requested plan: {item.requestedPlan}</small>}{item.unreadForBusiness&&<small>New reply</small>}</button>):<p>No support conversations yet.</p>}
        </section>
      </div>
      <section className="panel support-thread">
        {selected?<><header className="support-thread-head"><div><small>{selected.category} · {selected.status.replace("_"," ")}</small><h2>{selected.subject}</h2></div></header>
          {selected.requestedPlan&&<div className="support-plan-approval"><b>Plan request sent: {selected.requestedPlan}</b><span>Xyron Admin will review and activate this plan if approved.</span></div>}
          {selected.messages.filter(message=>message.important).slice(-1).map(message=><div className="important-support-highlight" key={`important-${message._id}`}><b>Important message from Xyron Admin</b><p>{message.body}</p></div>)}
          <div className="support-messages">{selected.messages.map(message=><article key={message._id} className={`support-message ${message.senderRole==="BUSINESS_OWNER"?"mine":""} ${message.important?"important":""}`}><span>{message.important&&<b className="important-message-label">IMPORTANT</b>} {message.senderRole==="BUSINESS_OWNER"?"Your business":"Xyron Super Admin"}</span><p>{message.body}</p><time>{formatDate(message.createdAt)}</time></article>)}</div>
          <form className="support-reply-form" onSubmit={sendReply}><label htmlFor="business-support-reply">Reply to this conversation</label><textarea id="business-support-reply" value={reply} onChange={event=>setReply(event.target.value)} maxLength="2000" rows="3" required/><button className="primary" type="submit" disabled={busy}><Send size={15}/>{busy?"Sending…":"Send reply"}</button></form>
        </>:<div className="support-empty"><MessageCircle size={28}/><h2>Select a conversation</h2><p>Start a new message or choose one of your previous support requests.</p></div>}
      </section>
    </div>
  </section>;
}
