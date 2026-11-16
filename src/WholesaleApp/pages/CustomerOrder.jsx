import {useEffect,useState} from "react";
import {Link,useOutletContext,useParams} from "react-router-dom";
import {ArrowLeft,ArrowRight,CheckCircle2,CreditCard,Download,FileText,MessageCircle,PackageCheck,Store,Upload,X} from "lucide-react";
import CustomerStorePage from "../components/CustomerStoreChrome";
import BrandLoader from "../../Components/BrandLoader";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const pdfMoney=value=>`INR ${Number(value||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

function loadQrAsPng(source){
  return new Promise((resolve,reject)=>{
    const image=new Image();
    if(!source.startsWith("data:"))image.crossOrigin="anonymous";
    image.onload=()=>{
      try{
        const canvas=document.createElement("canvas");
        canvas.width=image.naturalWidth;
        canvas.height=image.naturalHeight;
        const context=canvas.getContext("2d");
        if(!context)throw new Error("Could not prepare the payment QR image.");
        context.drawImage(image,0,0);
        resolve(canvas.toDataURL("image/png"));
      }catch(error){reject(error);}
    };
    image.onerror=()=>reject(new Error("Could not load the payment QR image."));
    image.src=source;
  });
}

export default function CustomerOrder(){
  const {storeBusiness}=useOutletContext();
  const {slug,orderNumber}=useParams(),[order,setOrder]=useState(null),[error,setError]=useState(""),[proofError,setProofError]=useState(""),[proofNotice,setProofNotice]=useState(""),[utr,setUtr]=useState(""),[proofFile,setProofFile]=useState(null),[proofBusy,setProofBusy]=useState(false),[billPopupState,setBillPopupState]=useState({sentAt:"",open:false}),[billDownloadBusy,setBillDownloadBusy]=useState(false),[loading,setLoading]=useState(true);
  const token=localStorage.getItem(`xyron-order-${orderNumber}`)||"";
  const billSentAt=order?.billSnapshot?.sentAt||"";
  const billPopupOpen=billPopupState.sentAt===billSentAt?billPopupState.open:Boolean(billSentAt);
  function setBillPopupOpen(open){setBillPopupState({sentAt:billSentAt,open});}
  useEffect(()=>{
    const accessToken=localStorage.getItem(`xyron-order-${orderNumber}`)||"";
    let active=true;
    async function load(){
      try{
        const config=accessToken?{headers:{"X-Order-Access-Token":accessToken}}:undefined;
        const {data}=await api.get(`/stores/${encodeURIComponent(slug)}/orders/${encodeURIComponent(orderNumber)}`,config);
        if(active){setOrder(data.order);setError("");}
      }catch(error){if(active)setError(getApiError(error));}
      finally{if(active)setLoading(false);}
    }
    load();
    const timer=window.setInterval(load,5000);
    return ()=>{active=false;window.clearInterval(timer);};
  },[orderNumber,slug]);
  async function submitPaymentProof(event){
    event.preventDefault();
    setProofError("");setProofNotice("");setProofBusy(true);
    if(order?.status!=="ACCEPTED"||!order.billSnapshot){setProofError("Payment proof is available after the store sends the final bill.");setProofBusy(false);return;}
    if(!proofFile){setProofError("Choose a payment proof image before submitting.");setProofBusy(false);return;}
    try{
      const formData=new FormData();
      formData.append("utr",utr);
      formData.append("proof",proofFile);
      const {data}=await api.post(`/stores/${encodeURIComponent(slug)}/orders/${encodeURIComponent(orderNumber)}/payment-proof`,formData,{headers:{"X-Order-Access-Token":token,"Content-Type":"multipart/form-data"},timeout:60000});
      setOrder(data.order);setProofNotice(data.warning||data.message);notify(data.warning||data.message);setProofFile(null);setUtr("");event.currentTarget.reset();
    }catch(error){
      const message=["ECONNABORTED","ETIMEDOUT"].includes(error?.code)?"The upload timed out. Check this order’s payment status before trying again.":getApiError(error);
      setProofError(message);notify(message,"error");
    }
    finally{setProofBusy(false);}
  }
  function chooseProofFile(event){
    const file=event.target.files?.[0]||null;
    setProofError("");
    if(file&&file.size>5*1024*1024){
      event.target.value="";
      setProofFile(null);
      setProofError("Payment proof images must be 5 MB or smaller.");
      return;
    }
    setProofFile(file);
  }

  async function downloadBill(){
    const snapshot=order?.billSnapshot;
    if(!snapshot)return;
    setBillDownloadBusy(true);
    try{
      const [{jsPDF},qrImage]=await Promise.all([
        import("jspdf"),
        snapshot.paymentQrSnapshot?loadQrAsPng(snapshot.paymentQrSnapshot):Promise.resolve(null),
      ]);
      const pdf=new jsPDF({unit:"mm",format:"a4"});
      const pageWidth=pdf.internal.pageSize.getWidth();
      const pageHeight=pdf.internal.pageSize.getHeight();
      const margin=16;
      const right=pageWidth-margin;
      let y=44;

      pdf.setFillColor(40,103,245);
      pdf.rect(0,0,pageWidth,36,"F");
      pdf.setTextColor(255,255,255);
      pdf.setFont("helvetica","bold");
      pdf.setFontSize(9);
      pdf.text("FINAL ORDER BILL",margin,11);
      pdf.setFontSize(17);
      pdf.text(pdf.splitTextToSize(snapshot.business.name,pageWidth-margin*2-45).slice(0,2),margin,21);
      pdf.setFont("helvetica","normal");
      pdf.setFontSize(9);
      pdf.text(order.orderNumber,right,14,{align:"right"});

      pdf.setTextColor(42,57,79);
      pdf.setFontSize(9);
      const address=[snapshot.business.address,snapshot.business.city,snapshot.business.state,snapshot.business.pincode].filter(Boolean).join(", ");
      const metadata=[new Date(snapshot.sentAt).toLocaleString(),address,snapshot.business.contactPhone].filter(Boolean);
      const metadataLines=pdf.splitTextToSize(metadata.join(" · "),pageWidth-margin*2);
      pdf.text(metadataLines,margin,y);
      y+=Math.max(9,metadataLines.length*4.5)+5;
      pdf.setDrawColor(220,229,240);
      pdf.line(margin,y,right,y);
      y+=8;

      const drawItemsHeader=()=>{
        pdf.setFont("helvetica","bold");
        pdf.setFontSize(8);
        pdf.setTextColor(92,109,132);
        pdf.text("ITEM",margin,y);
        pdf.text("QTY",margin+95,y);
        pdf.text("UNIT PRICE",margin+128,y);
        pdf.text("AMOUNT",right,y,{align:"right"});
        y+=5;
        pdf.setDrawColor(220,229,240);
        pdf.line(margin,y,right,y);
        y+=7;
      };
      drawItemsHeader();

      for(const item of snapshot.items){
        const nameLines=pdf.splitTextToSize(item.name,83);
        const rowHeight=Math.max(12,nameLines.length*4.5+3);
        if(y+rowHeight>pageHeight-48){
          pdf.addPage();
          y=20;
          drawItemsHeader();
        }
        pdf.setFont("helvetica","normal");
        pdf.setFontSize(9);
        pdf.setTextColor(42,57,79);
        pdf.text(nameLines,margin,y);
        pdf.setFontSize(8);
        pdf.setTextColor(92,109,132);
        pdf.text(`${item.packetQuantity} ${item.unitLabel||"unit"}`,margin+95,y);
        pdf.text(pdfMoney(item.packetPrice),margin+128,y);
        pdf.setFont("helvetica","bold");
        pdf.setTextColor(42,57,79);
        pdf.text(pdfMoney(item.lineTotal),right,y,{align:"right"});
        y+=rowHeight;
      }

      if(y+48>pageHeight-16){
        pdf.addPage();
        y=20;
      }
      y+=5;
      pdf.setDrawColor(220,229,240);
      pdf.line(margin,y,right,y);
      y+=9;
      const totals=[
        ["Products subtotal",snapshot.productSubtotalPaisa/100],
        [`Delivery · ${snapshot.region.name}`,snapshot.deliveryChargePaisa/100],
      ];
      pdf.setFont("helvetica","normal");
      pdf.setFontSize(9);
      pdf.setTextColor(92,109,132);
      totals.forEach(([label,amount])=>{
        pdf.text(label,margin,y);
        pdf.text(pdfMoney(amount),right,y,{align:"right"});
        y+=7;
      });
      pdf.setFont("helvetica","bold");
      pdf.setFontSize(12);
      pdf.setTextColor(23,105,210);
      pdf.text("Total to pay",margin,y+1);
      pdf.text(pdfMoney(snapshot.totalPaisa/100),right,y+1,{align:"right"});
      y+=12;

      if(qrImage||snapshot.upiIdSnapshot||snapshot.paymentInstructionsSnapshot||snapshot.billDescriptionSnapshot){
        if(y+58>pageHeight-14){
          pdf.addPage();
          y=20;
        }
        pdf.setDrawColor(220,229,240);
        pdf.line(margin,y,right,y);
        y+=9;
        pdf.setFont("helvetica","bold");
        pdf.setFontSize(10);
        pdf.setTextColor(42,57,79);
        pdf.text("Payment details",margin,y);
        y+=7;
        if(qrImage){
          pdf.addImage(qrImage,"PNG",margin,y,38,38);
          if(snapshot.upiIdSnapshot){
            pdf.setFont("helvetica","normal");
            pdf.setFontSize(9);
            pdf.setTextColor(42,57,79);
            pdf.text(pdf.splitTextToSize(`UPI ID: ${snapshot.upiIdSnapshot}`,pageWidth-margin*2-46),margin+46,y+6);
          }
          if(snapshot.paymentInstructionsSnapshot){
            pdf.setFont("helvetica","normal");
            pdf.setFontSize(8);
            pdf.setTextColor(92,109,132);
            pdf.text(pdf.splitTextToSize(snapshot.paymentInstructionsSnapshot,pageWidth-margin*2-46),margin+46,y+13);
          }
          if(snapshot.billDescriptionSnapshot){
            pdf.setFont("helvetica","normal");
            pdf.setFontSize(8);
            pdf.setTextColor(92,109,132);
            pdf.text(pdf.splitTextToSize(snapshot.billDescriptionSnapshot,pageWidth-margin*2-46),margin+46,y+24);
          }
        }else{
          pdf.setFont("helvetica","normal");
          pdf.setFontSize(8);
          pdf.setTextColor(92,109,132);
          pdf.text(pdf.splitTextToSize([snapshot.upiIdSnapshot&&`GPay number / UPI ID: ${snapshot.upiIdSnapshot}`,snapshot.paymentInstructionsSnapshot,snapshot.billDescriptionSnapshot&&`Description: ${snapshot.billDescriptionSnapshot}`].filter(Boolean).join("\n"),pageWidth-margin*2),margin,y);
        }
      }

      const filename=`${order.orderNumber}-bill.pdf`.replace(/[<>:"/\\|?*]/g,"-");
      pdf.save(filename);
      notify("Bill downloaded.");
    }catch(error){
      notify(error instanceof Error?`Could not download the bill: ${error.message}`:"Could not download the bill. Try again.","error");
    }finally{
      setBillDownloadBusy(false);
    }
  }

  if(loading)return <CustomerStorePage business={storeBusiness} slug={slug}><BrandLoader label="Loading your order"/></CustomerStorePage>;
  if(!order)return <CustomerStorePage business={storeBusiness} slug={slug}><section className="customer-order-error"><PackageCheck size={30}/><h1>Order details unavailable</h1><p>{error}</p>{error.includes("Sign in")&&<Link to={`/store/${encodeURIComponent(slug)}/account`}>Sign in to your customer account</Link>}<Link className="wholesale-back-link" to={`/store/${encodeURIComponent(slug)}`}><ArrowLeft size={15}/> Back to store</Link></section></CustomerStorePage>;
  const decision=order.status==="PLACED"?"PLACED":["REJECTED","CANCELLED"].includes(order.status)?"REJECTED":"ACCEPTED";
  const bill=order.billSnapshot;
  const hasPaymentDetails=Boolean(bill?.paymentQrSnapshot||bill?.upiIdSnapshot);
  return <CustomerStorePage business={storeBusiness} slug={slug}><main className="customer-order">
    <header className="customer-order-heading"><Link className="wholesale-back-link" to={`/store/${encodeURIComponent(slug)}`}><ArrowLeft size={16}/> Back to store</Link><span><Store size={16}/> {order.orderNumber}</span></header>
    <div className="customer-order-layout">
      <div className="order-details-column">
        <section className="panel order-summary">
          <div className="order-confirmed"><CheckCircle2 size={22}/><div><h1>Order placed</h1><p>Keep this order number to check its status and message the store.</p></div></div>
          <div className={`order-approval-status ${decision.toLowerCase()}`}><span>Order decision</span><b>{decision==="PLACED"?"Awaiting store response":decision}</b>{decision==="REJECTED"?<small>The store could not accept this order. Contact the store through Orders & chats if you have questions.</small>:decision==="ACCEPTED"&&!order.billSnapshot?<small>The store accepted your order and is preparing your delivery bill.</small>:null}</div>
          <p className="customer-order-delivery-place">Deliver to: <b>{[order.deliveryDistrict,order.deliveryState].filter(Boolean).join(", ")}</b>{order.deliveryPincode&&<> · PIN {order.deliveryPincode}</>}</p>
          <h2>Items</h2>
          {order.items.map((item,index)=><article className="order-line" key={`${item.productId}-${index}`}><div><b>{item.name}</b><small>{item.packetQuantity} {item.unitLabel||"bundle"}{item.packetQuantity===1?"":"s"} · {money.format(item.packetPrice)} / {item.unitLabel||"unit"}</small></div><b>{money.format(item.lineTotal)}</b></article>)}
          <div className="order-totals"><span>Products subtotal <b>{money.format(order.subtotalInr)}</b></span>{order.billSnapshot?<><span>Delivery · {order.billSnapshot.region.name} <b>{money.format(order.billSnapshot.deliveryChargePaisa/100)}</b></span><strong>Final total <b>{money.format(order.billSnapshot.totalPaisa/100)}</b></strong></>:<p className="payment-awaiting-acceptance">Delivery is not included yet. The store admin will send the final bill after reviewing your order.</p>}</div>
          {order.billSnapshot&&<button type="button" className="secondary-button customer-view-bill" onClick={()=>setBillPopupOpen(true)}><FileText size={15}/> View final bill</button>}
        </section>
        <aside className="order-payment panel">
          <h2><CreditCard size={18}/> Payment instructions</h2>
          {decision==="PLACED"?<p className="payment-awaiting-acceptance">The store is reviewing your order. You’ll receive a final bill after it is accepted.</p>:decision==="REJECTED"?<p className="payment-awaiting-acceptance">This order was rejected. Do not send a payment for it.</p>:!bill?<p className="payment-awaiting-acceptance">Your final bill and payment details will appear here when the store sends them.</p>:<>
            <div className="order-payment-business">{bill.business.logoUrl&&<img src={bill.business.logoUrl} alt={`${bill.business.name} logo`}/>}<div><b>{bill.business.name}</b><small>{[bill.business.address,bill.business.city,bill.business.state].filter(Boolean).join(", ")}</small></div></div>
            {bill.paymentQrSnapshot&&<img src={bill.paymentQrSnapshot} alt={`${bill.business.name} payment QR code`} />}
            {!hasPaymentDetails&&<p className="payment-awaiting-acceptance">This bill has no online payment details. Contact the store to arrange payment.</p>}
            {bill.upiIdSnapshot&&<p>GPay number / UPI ID: <b>{bill.upiIdSnapshot}</b></p>}
            <p className="order-payment-amount">{order.paymentStatus==="VERIFIED"?"Paid amount":"Amount to pay"} <b>{money.format(bill.totalPaisa/100)}</b></p>
          </>}
          {bill?.paymentInstructionsSnapshot&&<p>{bill.paymentInstructionsSnapshot}</p>}
          {bill?.billDescriptionSnapshot&&<p><b>Bill description:</b> {bill.billDescriptionSnapshot}</p>}
          <span className={`payment-state ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus.replaceAll("_"," ")}</span>
          {order.paymentUtr&&<p>Submitted UTR: <b>{order.paymentUtr}</b></p>}
          {decision==="ACCEPTED"&&hasPaymentDetails&&order.paymentStatus!=="VERIFIED"&&<form className="payment-proof-form" onSubmit={submitPaymentProof}><h3>Submit payment proof</h3><label>UTR / transaction reference <small>Optional</small><input value={utr} onChange={event=>setUtr(event.target.value)} minLength="6" maxLength="40" pattern="[A-Za-z0-9-]+" placeholder="Enter if available"/></label><label>Payment screenshot<input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseProofFile} required/><small>JPG, PNG or WebP · maximum 5 MB</small></label>{proofError&&<p className="chat-error" role="alert">{proofError}</p>}{proofNotice&&<p className="proof-notice">{proofNotice}</p>}<button className="primary" type="submit" disabled={proofBusy||!proofFile}><Upload size={15}/>{proofBusy?"Submitting…":"Upload proof"}</button></form>}
        </aside>
      </div>
      <aside className="order-store-card panel">
        <div className="order-store-card-brand"><span>{storeBusiness?.logoUrl?<img src={storeBusiness.logoUrl} alt={`${storeBusiness.name} logo`}/>:<Store size={23}/>}</span><div><small>YOUR STORE</small><h2>{storeBusiness?.name||"Store"}</h2><p>{storeBusiness?.category||"Wholesale"}</p></div></div>
        <p>Browse this store’s products or return to Orders to continue your conversation with the store.</p>
        <Link to={`/store/${encodeURIComponent(slug)}#products`}><Store size={15}/> Shop this store <ArrowRight size={14}/></Link>
        <Link className="order-store-chat-link" to={`/store/${encodeURIComponent(slug)}/orders`}><MessageCircle size={15}/> Orders & chats <ArrowRight size={14}/></Link>
      </aside>
    </div>
  </main>
  {billPopupOpen&&order.billSnapshot&&<div className="customer-bill-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setBillPopupOpen(false);}}>
    <section className="customer-bill-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-bill-title">
      <header className="customer-bill-heading"><div className="customer-bill-brand">{order.billSnapshot.business.logoUrl&&<img src={order.billSnapshot.business.logoUrl} alt=""/>}<div><small>FINAL ORDER BILL</small><h2 id="customer-bill-title">{order.billSnapshot.business.name}</h2></div></div><button type="button" aria-label="Close bill" onClick={()=>setBillPopupOpen(false)}><X size={19}/></button></header>
      <p className="customer-bill-order-number">{order.orderNumber} · Sent {new Date(order.billSnapshot.sentAt).toLocaleString()}</p>
      <div className="customer-bill-business-details"><span>{[order.billSnapshot.business.address,order.billSnapshot.business.city,order.billSnapshot.business.state,order.billSnapshot.business.pincode].filter(Boolean).join(", ")}</span>{order.billSnapshot.business.contactPhone&&<a href={`tel:${order.billSnapshot.business.contactPhone}`}>{order.billSnapshot.business.contactPhone}</a>}</div>
      <div className="customer-bill-lines">{order.billSnapshot.items.map((item,index)=><div key={`${item.name}-${index}`}><span>{item.name}<small>{item.packetQuantity} {item.unitLabel}{item.packetQuantity===1?"":"s"} × {money.format(item.packetPrice)}</small></span><b>{money.format(item.lineTotal)}</b></div>)}</div>
      <div className="customer-bill-totals"><div><span>Products subtotal</span><b>{money.format(order.billSnapshot.productSubtotalPaisa/100)}</b></div><div><span>Delivery · {order.billSnapshot.region.name}</span><b>{money.format(order.billSnapshot.deliveryChargePaisa/100)}</b></div><strong><span>Total to pay</span><b>{money.format(order.billSnapshot.totalPaisa/100)}</b></strong></div>
      <section className="customer-bill-payment">{bill.paymentQrSnapshot?<><div><b>Pay this amount</b><span>Scan the business payment QR below.</span></div><img src={bill.paymentQrSnapshot} alt={`${bill.business.name} payment QR code`}/>{bill.upiIdSnapshot&&<p>GPay number / UPI ID: <b>{bill.upiIdSnapshot}</b></p>}</>:bill.upiIdSnapshot?<div><b>Pay using GPay</b><span>Send the total amount to this number or UPI ID.</span><strong className="customer-bill-upi-id">{bill.upiIdSnapshot}</strong></div>:<div><b>Payment details</b><span>This bill was sent without online payment. Contact the store to arrange payment.</span></div>}{bill.paymentInstructionsSnapshot&&<p>{bill.paymentInstructionsSnapshot}</p>}{bill.billDescriptionSnapshot&&<p><b>Bill description:</b> {bill.billDescriptionSnapshot}</p>}</section>
      <div className="customer-bill-actions"><button className="secondary-button" type="button" onClick={downloadBill} disabled={billDownloadBusy}><Download size={15}/>{billDownloadBusy?"Preparing bill…":"Download bill (PDF)"}</button><button className="primary" type="button" onClick={()=>setBillPopupOpen(false)}>Okay, got it</button></div>
    </section>
  </div>}
  </CustomerStorePage>;
}
