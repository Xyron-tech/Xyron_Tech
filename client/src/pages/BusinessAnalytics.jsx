import {useEffect,useState} from "react";
import {BarChart3,CalendarDays,MessageCircle,RefreshCw} from "lucide-react";
import {Link} from "react-router-dom";
import {api,getApiError} from "../lib/api";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const initialSummary={totalOrders:0,acceptedOrders:0,unseenOrders:0,rejectedOrders:0,acceptedOrderValueInr:0,verifiedPaymentInr:0};

export default function BusinessAnalytics(){
  const [period,setPeriod]=useState("today"),[summary,setSummary]=useState(initialSummary),[dailyGroups,setDailyGroups]=useState([]),[range,setRange]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
  async function load(nextPeriod=period){
    setLoading(true);setError("");
    try{
      const {data}=await api.get("/business/analytics",{params:{period:nextPeriod}});
      setSummary(data.summary);setDailyGroups(data.dailyGroups||[]);setRange({from:data.from,to:data.to});
    }catch(error){setError(getApiError(error));}
    finally{setLoading(false);}
  }
  useEffect(()=>{load(period);},[period]);
  useEffect(()=>{
    const refresh=()=>load(period);
    window.addEventListener("xyron:business-profile-updated",refresh);
    return ()=>window.removeEventListener("xyron:business-profile-updated",refresh);
  },[period]);
  const maxDailyValue=Math.max(...dailyGroups.map(group=>Number(group.acceptedOrderValueInr)||0),0);
  return <section className="business-analytics">
    <header className="orders-admin-heading"><div><span className="eyebrow"><i/> BUSINESS WORKSPACE</span><h1>Order analytics</h1><p>Daily, weekly, and monthly sales and order totals for this business.</p></div><button type="button" className="refresh-orders" onClick={()=>load()} disabled={loading}><RefreshCw size={15}/> Refresh</button></header>
    <div className="analytics-period" role="group" aria-label="Analytics period"><button type="button" className={period==="today"?"active":""} onClick={()=>setPeriod("today")}><CalendarDays size={15}/> Today</button><button type="button" className={period==="week"?"active":""} onClick={()=>setPeriod("week")}><CalendarDays size={15}/> Weekly</button><button type="button" className={period==="month"?"active":""} onClick={()=>setPeriod("month")}><CalendarDays size={15}/> Monthly</button></div>
    {loading?<div className="panel">Loading report…</div>:error?<div className="analytics-locked panel"><BarChart3 size={28}/><h2>Analytics unavailable</h2><p>{error}</p><p>Ask Xyron Admin to enable analytics for your business plan.</p><Link className="primary" to="/dashboard/support?upgrade=1"><MessageCircle size={15}/> Contact Xyron Admin</Link></div>:<>
      {range&&<p className="analytics-range">Report period: {new Date(range.from).toLocaleDateString()} – {new Date(range.to).toLocaleDateString()}</p>}
      {summary.totalOrders===0&&<p className="analytics-empty">There are no orders in this period yet. New orders will appear here automatically.</p>}
      <div className="analytics-grid">
        <article className="analytics-card"><span>Total orders</span><strong>{summary.totalOrders}</strong></article>
        <article className="analytics-card accepted"><span>Accepted</span><strong>{summary.acceptedOrders}</strong></article>
        <article className="analytics-card unseen"><span>Unseen · awaiting decision</span><strong>{summary.unseenOrders}</strong></article>
        <article className="analytics-card rejected"><span>Rejected</span><strong>{summary.rejectedOrders}</strong></article>
        <article className="analytics-card"><span>Accepted sales value</span><strong>{money.format(summary.acceptedOrderValueInr)}</strong><small>Accepted orders; may include delivery after the final bill is sent</small></article>
        <article className="analytics-card verified"><span>Verified payments</span><strong>{money.format(summary.verifiedPaymentInr)}</strong><small>Based on payment verification status</small></article>
      </div>
      <section className="analytics-daily panel" aria-label="Sales grouped by order date">
        <header><div><span className="admin-section-kicker">DAILY BREAKDOWN</span><h2>Sales by order date</h2></div><small>Accepted order value and verified payments</small></header>
        {dailyGroups.length?<div className="analytics-daily-list">{dailyGroups.map(group=>{
          const width=maxDailyValue?Math.max(3,Number(group.acceptedOrderValueInr)/maxDailyValue*100):0;
          const label=new Intl.DateTimeFormat("en-IN",{weekday:"short",day:"numeric",month:"short",timeZone:"Asia/Kolkata"}).format(new Date(`${group.date}T12:00:00+05:30`));
          return <article className="analytics-day" key={group.date}>
            <div className="analytics-day-heading"><div><b>{label}</b><small>{group.totalOrders} order{group.totalOrders===1?"":"s"} · {group.acceptedOrders} accepted</small></div><strong>{money.format(group.acceptedOrderValueInr)}</strong></div>
            <div className="analytics-day-bar" aria-label={`Accepted sales value ${money.format(group.acceptedOrderValueInr)}`}><span style={{width:`${width}%`}}/></div>
            <p>Verified payments <b>{money.format(group.verifiedPaymentInr)}</b></p>
          </article>;
        })}</div>:<p className="analytics-empty">There are no orders to group in this report period yet.</p>}
      </section>
    </>}
  </section>;
}
