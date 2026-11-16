import {useEffect,useState} from "react";
import {Check,MessageCircle,RefreshCw,Send,Users} from "lucide-react";
import {useLocation,useNavigate} from "react-router-dom";
import {api,getApiError} from "../lib/api";
import {planFeatureDefaults} from "../data/planCatalog";

const categories=["SUBSCRIPTION","PAYMENT","STORE","TECHNICAL","OTHER"];
const formatDate=value=>new Date(value).toLocaleString();

export default function SuperAdminSupport(){
  const {hash,pathname,search}=useLocation(),navigate=useNavigate();
  const tab=hash==="#broadcast"?"broadcast":"inbox";
  const [conversations,setConversations]=useState([]),[businesses,setBusinesses]=useState([]),[selected,setSelected]=useState(null),[status,setStatus]=useState("ALL"),[unreadOnly,setUnreadOnly]=useState(false),[reply,setReply]=useState(""),[replyImportant,setReplyImportant]=useState(false),[scope,setScope]=useState("ALL"),[businessIds,setBusinessIds]=useState([]),[subject,setSubject]=useState(""),[category,setCategory]=useState("OTHER"),[body,setBody]=useState(""),[broadcastImportant,setBroadcastImportant]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");

  async function load(){
    setError("");
    try{
      const [supportResult,businessResult]=await Promise.all([
        api.get("/super-admin/support",{params:{...(status==="ALL"?{}:{status}),...(unreadOnly?{unread:"true"}:{})}}),
        api.get("/super-admin/businesses")
      ]);
      setConversations(supportResult.data.conversations);
      setBusinesses(businessResult.data.businesses);
      setSelected(current=>current?supportResult.data.conversations.find(item=>item._id===current._id)||null:null);
    }catch(error){setError(getApiError(error));}
    finally{setLoading(false);}
  }
  useEffect(()=>{
    let active=true;
    Promise.all([
      api.get("/super-admin/support",{params:{...(status==="ALL"?{}:{status}),...(unreadOnly?{unread:"true"}:{})}}),
      api.get("/super-admin/businesses")
    ]).then(([supportResult,businessResult])=>{
      if(active){setConversations(supportResult.data.conversations);setBusinesses(businessResult.data.businesses);setSelected(current=>current?supportResult.data.conversations.find(item=>item._id===current._id)||null:null);setError("");}
    }).catch(error=>{if(active)setError(getApiError(error));}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[status,unreadOnly]);
  function changeTab(nextTab){
    navigate({pathname,search,hash:nextTab==="broadcast"?"#broadcast":"#inbox"},{replace:true});
  }

  async function openConversation(conversation){
    setError("");
    try{
      const {data}=await api.get(`/super-admin/support/${conversation._id}`);
      setSelected(data.conversation);
      setConversations(current=>current.map(item=>item._id===conversation._id?data.conversation:item));
    }catch(error){setError(getApiError(error));}
  }

  async function sendReply(event){
    event.preventDefault();if(!selected)return;
    setBusy(true);setError("");setNotice("");
    try{
      const {data}=await api.post(`/super-admin/support/${selected._id}/messages`,{body:reply,important:replyImportant});
      setSelected(data.conversation);setReply("");setReplyImportant(false);await load();
    }catch(error){setError(getApiError(error));}
    finally{setBusy(false);}
  }

  async function changeStatus(value){
    if(!selected)return;
    setBusy(true);setError("");
    try{
      const {data}=await api.patch(`/super-admin/support/${selected._id}/status`,{status:value});
      setSelected(data.conversation);await load();
    }catch(error){setError(getApiError(error));}
    finally{setBusy(false);}
  }

  async function approveRequestedPlan(){
    if(!selected?.requestedPlan||!selected.businessId?._id)return;
    setBusy(true);setError("");setNotice("");
    try{
      const {data}=await api.patch(`/super-admin/businesses/${selected.businessId._id}/plan`,{plan:selected.requestedPlan,features:planFeatureDefaults[selected.requestedPlan]});
      try{
        await api.post(`/super-admin/support/${selected._id}/messages`,{body:`Your request for the ${selected.requestedPlan} plan has been approved and its plan features are now active.`,important:true});
      }catch(error){
        setNotice(`${data.message} Plan activated, but the confirmation message could not be sent: ${getApiError(error)}`);
        await load();
        return;
      }
      try{
        await api.patch(`/super-admin/support/${selected._id}/status`,{status:"RESOLVED"});
      }catch(error){
        setNotice(`${data.message} The request could not be marked resolved: ${getApiError(error)}`);
        await load();
        return;
      }
      setNotice(`${selected.requestedPlan} plan approved and activated for ${selected.businessId.name}.`);
      await load();
    }catch(error){setError(getApiError(error));}
    finally{setBusy(false);}
  }

  function toggleBusiness(id,checked){
    if(checked&&businessIds.length>=100){setError("A selected-business broadcast can include up to 100 businesses.");return;}
    setError("");
    setBusinessIds(current=>checked?[...current,id]:current.filter(item=>item!==id));
  }

  async function sendBroadcast(event){
    event.preventDefault();setBusy(true);setError("");setNotice("");
    try{
      const {data}=await api.post("/super-admin/support/broadcast",{scope,businessIds:scope==="ALL"?[]:businessIds,subject,category,body,important:broadcastImportant});
      setNotice(data.message);setSubject("");setBody("");setBusinessIds([]);setBroadcastImportant(false);changeTab("inbox");await load();
    }catch(error){setError(getApiError(error));}
    finally{setBusy(false);}
  }

  return <section className="support-page super-support-page">
    <header className="admin-head"><div><small>PLATFORM SUPPORT</small><h1>Business inbox</h1><p>Reply to requests or send persistent dashboard messages to active businesses.</p></div><span><Users size={16}/> Super Admin</span></header>
    <div className="support-tabs" role="tablist" aria-label="Support tools"><button type="button" role="tab" aria-selected={tab==="inbox"} className={tab==="inbox"?"active":""} onClick={()=>changeTab("inbox")}>Inbox</button><button type="button" role="tab" aria-selected={tab==="broadcast"} className={tab==="broadcast"?"active":""} onClick={()=>changeTab("broadcast")}>Broadcast</button></div>
    {error&&<div className="error" role="alert">{error}</div>}{notice&&<div className="support-notice" role="status">{notice}</div>}
    {tab==="broadcast"?<form className="panel support-broadcast" onSubmit={sendBroadcast}>
      <span className="admin-section-kicker">DASHBOARD HIGHLIGHT + INBOX MESSAGE</span><h2>Send a platform message</h2><p>Each selected active business receives a persistent message in its support inbox and a prominent dashboard highlight.</p>
      <label>Recipients<select value={scope} onChange={event=>setScope(event.target.value)}><option value="ALL">All active businesses ({businesses.length})</option><option value="SELECTED">Choose businesses</option></select></label>
      {scope==="SELECTED"&&<><p>Select up to 100 active businesses for one message.</p><div className="broadcast-businesses" aria-label="Choose active businesses">{businesses.map(business=><label key={business._id}><input type="checkbox" checked={businessIds.includes(business._id)} onChange={event=>toggleBusiness(business._id,event.target.checked)}/><span>{business.name}<small>/{business.slug}</small></span></label>)}</div></>}
      <label>Topic<select value={category} onChange={event=>setCategory(event.target.value)}>{categories.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
      <label>Title<input value={subject} onChange={event=>setSubject(event.target.value)} minLength="3" maxLength="120" required/></label>
      <label>Message<textarea value={body} onChange={event=>setBody(event.target.value)} minLength="2" maxLength="2000" rows="6" required/></label>
      <label className="support-important-toggle"><input type="checkbox" checked={broadcastImportant} onChange={event=>setBroadcastImportant(event.target.checked)}/> Highlight this as important for businesses</label>
      <button className="primary" type="submit" disabled={busy||!businesses.length||(scope==="SELECTED"&&!businessIds.length)}><Send size={15}/>{busy?"Sending…":"Send message"}</button>
    </form>:<div className="support-layout super-support-layout">
      <section className="panel support-list">
        <div className="list-head"><h2>Requests</h2><div className="support-list-tools"><label className="support-unread-filter"><input type="checkbox" checked={unreadOnly} onChange={event=>setUnreadOnly(event.target.checked)}/> Unread</label><select value={status} onChange={event=>setStatus(event.target.value)} aria-label="Filter support requests"><option value="ALL">All statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option></select><button type="button" onClick={load} aria-label="Refresh requests"><RefreshCw size={15}/></button></div></div>
        {loading?<p>Loading requests…</p>:conversations.length?conversations.map(item=><button type="button" key={item._id} onClick={()=>openConversation(item)} className={`support-list-item ${selected?._id===item._id?"selected":""}`}><span className="support-list-title">{item.subject}{item.unreadForSuperAdmin&&<b className="support-unread-badge">NEW</b>}</span><span>{item.businessId?.name||"Business"} · {item.category}</span><small>{item.requestedPlan?`Plan request: ${item.requestedPlan} · `:""}{item.status.replace("_"," ")}{item.broadcastId?" · Broadcast":""}{item.unreadForSuperAdmin?" · New reply":""}</small></button>):<p>{unreadOnly?"No unread requests.":"No messages in this queue."}</p>}
      </section>
      <section className="panel support-thread">
        {selected?<><header className="support-thread-head"><div><small>{selected.businessId?.name||"Business"} · {selected.businessId?.slug||""}</small><h2>{selected.subject}</h2></div><label>Status<select value={selected.status} disabled={busy} onChange={event=>changeStatus(event.target.value)}><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option></select></label></header>
          {selected.requestedPlan&&<div className="support-plan-approval"><div><b>Requested plan: {selected.requestedPlan}</b><span>Approve to activate its plan features for {selected.businessId?.name||"this business"}.</span></div><button className="primary" type="button" disabled={busy||selected.status==="RESOLVED"} onClick={approveRequestedPlan}><Check size={14}/>{busy?"Applying…":`Approve ${selected.requestedPlan}`}</button></div>}
          <div className="support-messages">{selected.messages.map(message=><article key={message._id} className={`support-message ${message.senderRole==="SUPER_ADMIN"?"mine":""} ${message.important?"important":""}`}><span>{message.important&&<b className="important-message-label">IMPORTANT</b>} {message.senderRole==="SUPER_ADMIN"?"Xyron Super Admin":selected.businessId?.name||"Business"}</span><p>{message.body}</p><time>{formatDate(message.createdAt)}</time></article>)}</div>
          <form className="support-reply-form" onSubmit={sendReply}><label htmlFor="super-support-reply">Reply to business</label><textarea id="super-support-reply" value={reply} onChange={event=>setReply(event.target.value)} maxLength="2000" rows="3" required/><label className="support-important-toggle"><input type="checkbox" checked={replyImportant} onChange={event=>setReplyImportant(event.target.checked)}/> Highlight this reply as important</label><button className="primary" type="submit" disabled={busy}><Send size={15}/>{busy?"Sending…":"Send reply"}</button></form>
        </>:<div className="support-empty"><MessageCircle size={28}/><h2>Select a message</h2><p>Choose a business request to review and reply.</p></div>}
      </section>
    </div>}
  </section>;
}
