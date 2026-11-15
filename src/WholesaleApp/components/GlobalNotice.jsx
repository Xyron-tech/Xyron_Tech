import {useEffect,useState} from "react";
import {CheckCircle2,TriangleAlert,X} from "lucide-react";

export default function GlobalNotice(){
  const [notice,setNotice]=useState(null);
  useEffect(()=>{
    let timer;
    const show=event=>{
      window.clearTimeout(timer);
      setNotice(event.detail);
      timer=window.setTimeout(()=>setNotice(null),5000);
    };
    window.addEventListener("xyron:notice",show);
    return ()=>{window.clearTimeout(timer);window.removeEventListener("xyron:notice",show);};
  },[]);
  if(!notice)return null;
  const Icon=notice.type==="error"?TriangleAlert:CheckCircle2;
  return <div className={`global-notice ${notice.type==="error"?"is-error":""}`} role={notice.type==="error"?"alert":"status"} aria-live={notice.type==="error"?"assertive":"polite"}>
    <Icon size={18}/><span>{notice.message}</span><button type="button" aria-label="Dismiss notification" onClick={()=>setNotice(null)}><X size={17}/></button>
  </div>;
}
