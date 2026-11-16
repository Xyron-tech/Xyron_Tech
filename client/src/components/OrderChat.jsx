import {useCallback,useEffect,useRef,useState} from "react";
import {MessageCircle,RefreshCw,Send} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";

export default function OrderChat({orderId,orderNumber,token="",customer=false,slug="",quickReplies=false}){
  const [messages,setMessages]=useState([]),[body,setBody]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(true),[sending,setSending]=useState(false);
  const listRef=useRef(null);
  const mountedRef=useRef(true);
  const requestInFlight=useRef(false);
  const endpoint=customer?`/stores/${encodeURIComponent(slug)}/orders/${encodeURIComponent(orderNumber)}/chat`:`/business/orders/${encodeURIComponent(orderId)}/chat`;
  const config=customer&&token?{headers:{"X-Order-Access-Token":token}}:undefined;
  useEffect(()=>{mountedRef.current=true;return()=>{mountedRef.current=false;};},[]);
  const loadMessages=useCallback(async()=>{
    if(requestInFlight.current)return;
    requestInFlight.current=true;
    try{
      const {data}=await api.get(endpoint,config);
      if(mountedRef.current){setMessages(data.messages);setError("");}
    }catch(error){
      if(mountedRef.current)setError(getApiError(error));
    }finally{
      requestInFlight.current=false;
      if(mountedRef.current)setLoading(false);
    }
  },[endpoint,customer,token]);
  useEffect(()=>{
    setLoading(true);
    loadMessages();
    const timer=window.setInterval(loadMessages,5000);
    return ()=>window.clearInterval(timer);
  },[loadMessages]);
  useEffect(()=>{
    if(listRef.current)listRef.current.scrollTop=listRef.current.scrollHeight;
  },[messages]);
  async function sendMessage(event){
    event.preventDefault();
    const message=body.trim();
    if(!message)return;
    setSending(true);
    setError("");
    try{
      const {data}=await api.post(endpoint,{body:message},config);
      if(data.message)setMessages(current=>[...current,data.message]);
      setBody("");
      await loadMessages();
      notify("Message sent.");
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setSending(false);}
  }
  return <section className="order-chat" id="order-chat">
    <header><MessageCircle size={17}/><div><b>Order chat</b><small>Messages refresh automatically</small></div></header>
    <div className="order-chat-messages" ref={listRef} aria-live="polite">
      {loading?<p className="chat-state">Loading messages…</p>:messages.length?messages.map(message=><article className={`chat-message ${customer?message.senderRole==="CUSTOMER"?"mine":"":message.senderRole==="BUSINESS_OWNER"?"mine":""}`} key={message._id}><span>{message.senderRole==="CUSTOMER"?"Customer":"Store"} · {message.senderName}</span><p>{message.body}</p><time>{new Date(message.createdAt).toLocaleString()}</time></article>):<p className="chat-state">No messages yet. Send a message to this store.</p>}
    </div>
    {error&&<div className="chat-error-row" role="alert"><p className="chat-error">{error}</p><button type="button" onClick={()=>{setLoading(true);loadMessages();}}><RefreshCw size={13}/> Retry</button></div>}
    {quickReplies&&!customer&&<div className="chat-quick-replies" aria-label="Quick reply suggestions">{["Thanks, we received your message.","Your order is being prepared.","Please contact us if you need more help."].map(reply=><button type="button" key={reply} onClick={()=>setBody(reply)}>{reply}</button>)}</div>}
    <form onSubmit={sendMessage}><input aria-label="Message" value={body} onChange={event=>setBody(event.target.value)} maxLength={2000} placeholder="Write a message…"/><button aria-label="Send message" type="submit" disabled={sending||!body.trim()}><Send size={16}/></button></form>
  </section>;
}
