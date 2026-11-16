import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {MessageCircle,RefreshCw,Send} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";

export default function OrderChat({orderId,orderNumber,token="",customer=false,slug="",quickReplies=false}){
  const [messages,setMessages]=useState([]),[body,setBody]=useState(""),[error,setError]=useState(""),[loadedEndpoint,setLoadedEndpoint]=useState(""),[sending,setSending]=useState(false);
  const listRef=useRef(null);
  const mountedRef=useRef(true);
  const requestInFlight=useRef(false);
  const readRequestInFlight=useRef(false);
  const chatVisibleRef=useRef(false);
  const latestMessageIdRef=useRef("");
  const lastMarkedMessageIdRef=useRef("");
  const endpoint=customer?`/stores/${encodeURIComponent(slug)}/orders/${encodeURIComponent(orderNumber)}/chat`:`/business/orders/${encodeURIComponent(orderId)}/chat`;
  const loading=loadedEndpoint!==endpoint;
  const config=useMemo(()=>customer&&token?{headers:{"X-Order-Access-Token":token}}:undefined,[customer,token]);
  useEffect(()=>{mountedRef.current=true;return()=>{mountedRef.current=false;};},[]);
  const markMessagesRead=useCallback(async()=>{
    const throughMessageId=latestMessageIdRef.current;
    if(!chatVisibleRef.current||!throughMessageId||throughMessageId===lastMarkedMessageIdRef.current||readRequestInFlight.current)return;
    readRequestInFlight.current=true;
    try{
      const {data}=await api.post(`${endpoint}/read`,{throughMessageId},config);
      if(data.markedRead){
        lastMarkedMessageIdRef.current=throughMessageId;
        window.dispatchEvent(new CustomEvent("xyron:order-chat-read",{detail:{customer,slug,orderNumber}}));
      }
    }catch(error){
      if(mountedRef.current)setError(getApiError(error));
    }finally{
      readRequestInFlight.current=false;
    }
  },[endpoint,config,customer,slug,orderNumber]);
  const loadMessages=useCallback(()=>{
    if(requestInFlight.current)return Promise.resolve();
    requestInFlight.current=true;
    return api.get(endpoint,config).then(({data})=>{
      if(mountedRef.current){
        const nextMessages=data.messages||[];
        latestMessageIdRef.current=nextMessages[nextMessages.length-1]?._id||"";
        setMessages(nextMessages);
        setError("");
        if(chatVisibleRef.current)return markMessagesRead();
      }
    }).catch(error=>{
      if(mountedRef.current)setError(getApiError(error));
    }).finally(()=>{
      requestInFlight.current=false;
      if(mountedRef.current)setLoadedEndpoint(endpoint);
    });
  },[endpoint,config,markMessagesRead]);
  useEffect(()=>{
    loadMessages();
    const timer=window.setInterval(loadMessages,5000);
    return ()=>window.clearInterval(timer);
  },[loadMessages]);
  useEffect(()=>{
    if(listRef.current)listRef.current.scrollTop=listRef.current.scrollHeight;
  },[messages]);
  useEffect(()=>{
    const messageList=listRef.current;
    if(!messageList)return undefined;
    if(typeof IntersectionObserver==="undefined"){
      const bounds=messageList.getBoundingClientRect();
      chatVisibleRef.current=bounds.bottom>0&&bounds.top<window.innerHeight;
      if(chatVisibleRef.current)markMessagesRead();
      return undefined;
    }
    const observer=new IntersectionObserver(([entry])=>{
      chatVisibleRef.current=entry.isIntersecting&&entry.intersectionRatio>=0.5;
      if(chatVisibleRef.current)markMessagesRead();
    },{threshold:[0,0.5]});
    observer.observe(messageList);
    return ()=>{chatVisibleRef.current=false;observer.disconnect();};
  },[markMessagesRead]);
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
    <header><MessageCircle size={17}/><div><b>Order chat</b><small>Messages sync automatically</small></div></header>
    <div className="order-chat-messages" ref={listRef} aria-live="polite">
      {loading?<p className="chat-state">Loading messages…</p>:messages.length?messages.map(message=><article className={`chat-message ${customer?message.senderRole==="CUSTOMER"?"mine":"":message.senderRole==="BUSINESS_OWNER"?"mine":""}`} key={message._id}><span>{message.senderRole==="CUSTOMER"?"Customer":"Store"} · {message.senderName}</span><p>{message.body}</p><time>{new Date(message.createdAt).toLocaleString()}</time></article>):<p className="chat-state">No messages yet. {customer?"Start a conversation with the store.":"Send a message to this customer."}</p>}
    </div>
    {error&&<div className="chat-error-row" role="alert"><p className="chat-error">{error}</p><button type="button" onClick={()=>{setLoadedEndpoint("");loadMessages();}}><RefreshCw size={13}/> Retry</button></div>}
    {quickReplies&&!customer&&<div className="chat-quick-replies" aria-label="Quick reply suggestions">{["Thanks, we received your message.","Your order is being prepared.","Please contact us if you need more help."].map(reply=><button type="button" key={reply} onClick={()=>setBody(reply)}>{reply}</button>)}</div>}
    <form onSubmit={sendMessage}><input aria-label="Message" value={body} onChange={event=>setBody(event.target.value)} maxLength={2000} placeholder="Write a message…"/><button aria-label="Send message" type="submit" disabled={sending||!body.trim()}><Send size={16}/></button></form>
  </section>;
}
