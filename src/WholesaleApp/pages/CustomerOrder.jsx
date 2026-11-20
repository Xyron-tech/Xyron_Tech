import {useEffect,useRef,useState} from "react";
import {Link,useOutletContext,useParams} from "react-router-dom";
import {ArrowLeft,CheckCircle2,CreditCard,Download,FileText,PackageCheck,Phone,X} from "lucide-react";
import {FaWhatsapp} from "react-icons/fa";
import CustomerStorePage from "../components/CustomerStoreChrome";
import BrandLoader from "../../Components/BrandLoader";
import {api,getApiError} from "../lib/api";
import {getStorePhoneHref,getStoreWhatsAppNumber} from "../lib/storeContactLinks";
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
  const {slug,orderNumber}=useParams(),[order,setOrder]=useState(null),[error,setError]=useState(""),[notificationError,setNotificationError]=useState(""),[billPopupState,setBillPopupState]=useState({sentAt:"",open:false}),[billDownloadBusy,setBillDownloadBusy]=useState(false),[deliveryContactDismissedFor,setDeliveryContactDismissedFor]=useState(""),[loading,setLoading]=useState(true);
  const notificationReadForOrder=useRef("");
  const billSentAt=order?.billSnapshot?.sentAt||"";
  const billPopupOpen=billPopupState.sentAt===billSentAt&&billPopupState.open;
  function setBillPopupOpen(open){setBillPopupState({sentAt:billSentAt,open});}
  useEffect(()=>{
    const accessToken=localStorage.getItem(`xyron-order-${orderNumber}`)||"";
    let active=true;
    async function load(){
      try{
        const config=accessToken?{headers:{"X-Order-Access-Token":accessToken}}:undefined;
        const {data}=await api.get(`/stores/${encodeURIComponent(slug)}/orders/${encodeURIComponent(orderNumber)}`,config);
        if(active){
          setOrder(data.order);setError("");
          const orderKey=`${slug}:${orderNumber}`;
          if(notificationReadForOrder.current!==orderKey){
            notificationReadForOrder.current=orderKey;
            api.post(`/stores/${encodeURIComponent(slug)}/orders/${encodeURIComponent(orderNumber)}/notifications/read`,{},config)
              .then(()=>{if(active){setNotificationError("");window.dispatchEvent(new CustomEvent("xyron:customer-order-notification-read",{detail:{slug,orderNumber}}));}})
              .catch(error=>{if(active)setNotificationError(getApiError(error));});
          }
        }
      }catch(error){if(active)setError(getApiError(error));}
      finally{if(active)setLoading(false);}
    }
    load();
    const timer=window.setInterval(load,5000);
    return ()=>{active=false;window.clearInterval(timer);};
  },[orderNumber,slug]);
  async function downloadBill(){
    const snapshot=order?.billSnapshot;
    if(!snapshot)return;
    const paymentInfo=order.paymentInfoSnapshot||snapshot;
    setBillDownloadBusy(true);
    try{
      const [{jsPDF},qrImage]=await Promise.all([
        import("jspdf"),
        paymentInfo.paymentQrSnapshot?loadQrAsPng(paymentInfo.paymentQrSnapshot):Promise.resolve(null),
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
      const customerAddress=[order.deliveryAddress,order.deliveryDistrict,order.deliveryState,order.deliveryPincode&&`PIN ${order.deliveryPincode}`].filter(Boolean).join(", ");
      pdf.setFont("helvetica","bold");
      pdf.setFontSize(8);
      pdf.setTextColor(92,109,132);
      pdf.text("BILL TO",margin,y);
      y+=5;
      pdf.setFont("helvetica","normal");
      pdf.setFontSize(9);
      pdf.setTextColor(42,57,79);
      pdf.text(order.customerName||"Customer",margin,y);
      y+=4.5;
      const customerLines=pdf.splitTextToSize([customerAddress,order.customerPhone].filter(Boolean).join(" · "),pageWidth-margin*2);
      pdf.setFontSize(8);
      pdf.setTextColor(92,109,132);
      pdf.text(customerLines,margin,y);
      y+=Math.max(6,customerLines.length*4)+5;
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

      if(qrImage||paymentInfo.upiIdSnapshot||paymentInfo.paymentInstructionsSnapshot||snapshot.billDescriptionSnapshot){
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
          if(paymentInfo.upiIdSnapshot){
            pdf.setFont("helvetica","normal");
            pdf.setFontSize(9);
            pdf.setTextColor(42,57,79);
            pdf.text(pdf.splitTextToSize(`UPI ID: ${paymentInfo.upiIdSnapshot}`,pageWidth-margin*2-46),margin+46,y+6);
          }
          if(paymentInfo.paymentInstructionsSnapshot){
            pdf.setFont("helvetica","normal");
            pdf.setFontSize(8);
            pdf.setTextColor(92,109,132);
            pdf.text(pdf.splitTextToSize(paymentInfo.paymentInstructionsSnapshot,pageWidth-margin*2-46),margin+46,y+13);
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
          pdf.text(pdf.splitTextToSize([paymentInfo.upiIdSnapshot&&`GPay number / UPI ID: ${paymentInfo.upiIdSnapshot}`,paymentInfo.paymentInstructionsSnapshot,snapshot.billDescriptionSnapshot&&`Description: ${snapshot.billDescriptionSnapshot}`].filter(Boolean).join("\n"),pageWidth-margin*2),margin,y);
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
  const paymentInfo=order.paymentInfoSnapshot||bill;
  const deliveryContactRequired=Boolean(order.deliveryFeePending&&!bill&&decision!=="REJECTED");
  const deliveryContactOpen=deliveryContactRequired&&deliveryContactDismissedFor!==order.orderNumber;
  const hasPaymentDetails=!deliveryContactRequired&&Boolean(paymentInfo?.paymentQrSnapshot||paymentInfo?.upiIdSnapshot);
  const billItems=bill?.items||order.items;
  const productSubtotal=bill?bill.productSubtotalPaisa/100:order.subtotalInr;
  const storePhone=String(bill?.business.contactPhone||storeBusiness?.contactPhone||storeBusiness?.whatsappNumber||"").trim();
  const storeCallHref=storePhone?getStorePhoneHref(storePhone):"";
  const whatsappNumber=getStoreWhatsAppNumber(storeBusiness?.whatsappNumber||bill?.business.contactPhone||storeBusiness?.contactPhone);
  const contactMessage=encodeURIComponent(`Hello ${storeBusiness?.name||"store"}, my order ${order.orderNumber} is waiting for a delivery charge. Please confirm the delivery amount and total payment before I pay.`);
  const storeWhatsAppHref=whatsappNumber?`https://wa.me/${whatsappNumber}?text=${contactMessage}`:"";
  return <CustomerStorePage business={storeBusiness} slug={slug}><main className="customer-order">
    <header className="customer-order-success"><div className="order-confirmed"><CheckCircle2 size={23}/><div><h1>Order placed</h1><p>Your order has been received.</p></div></div><p className="customer-order-number">Order number · {order.orderNumber}</p></header>
    {notificationError&&<div className="store-inline-error" role="alert">{notificationError}</div>}
    <div className="customer-order-layout">
      <div className="order-details-column">
        <section className="panel order-summary">
          <h2><FileText size={17}/> Bill</h2>
          {billItems.map((item,index)=><article className="order-line" key={`${item.productId||item.name}-${index}`}><div><b>{item.name}</b><small>{item.packetQuantity} {item.unitLabel||"bundle"}{item.packetQuantity===1?"":"s"} · {money.format(item.packetPrice)} / {item.unitLabel||"unit"}</small></div><b>{money.format(item.lineTotal)}</b></article>)}
          <div className="order-totals"><span>Products subtotal <b>{money.format(productSubtotal)}</b></span>{bill?<><span>Delivery · {bill.region.name} <b>{money.format(bill.deliveryChargePaisa/100)}</b></span><strong>Order total <b>{money.format(bill.totalPaisa/100)}</b></strong></>:order.deliveryFeePending?<div className="delivery-charge-pending"><b>Delivery charge needs confirmation</b><span>The store will confirm a rate for this location.</span><div className="delivery-pending-contact-links">{storeCallHref&&<a href={storeCallHref}><Phone size={14}/> Call store admin</a>}{storeWhatsAppHref&&<a href={storeWhatsAppHref} target="_blank" rel="noreferrer"><FaWhatsapp size={15}/> WhatsApp admin</a>}</div></div>:<p className="payment-awaiting-acceptance">The delivery amount will appear here when the store confirms it.</p>}</div>
          {bill?.billDescriptionSnapshot&&<p className="customer-order-bill-description">{bill.billDescriptionSnapshot}</p>}
          {bill&&<button type="button" className="secondary-button customer-view-bill" onClick={()=>setBillPopupOpen(true)}><FileText size={15}/> View final bill</button>}
        </section>
        <aside className="order-payment panel">
          <h2><CreditCard size={18}/> Payment details</h2>
          {order.paymentInfoSnapshot?.notifiedAt&&<div className="customer-payment-info-alert"><b>Payment details updated</b><span>View the latest payment option from this store below.</span></div>}
          {decision==="REJECTED"?<p className="payment-awaiting-acceptance">This order was rejected. Do not send a payment for it.</p>:deliveryContactRequired?<p className="payment-awaiting-acceptance">Confirm the delivery charge and final total with the store before making a payment.</p>:hasPaymentDetails?<>
            <div className="order-payment-business">{bill?.business.logoUrl&&<img src={bill.business.logoUrl} alt={`${bill.business.name} logo`}/>}<div><b>{bill?.business.name||storeBusiness?.name||"Store"}</b><small>{[bill?.business.address,bill?.business.city,bill?.business.state].filter(Boolean).join(", ")}</small></div></div>
            {paymentInfo.paymentQrSnapshot&&<img src={paymentInfo.paymentQrSnapshot} alt={`${bill?.business.name||storeBusiness?.name||"Store"} payment QR code`} />}
            {paymentInfo.upiIdSnapshot&&<p>GPay number / UPI ID: <b>{paymentInfo.upiIdSnapshot}</b></p>}
            {bill&&<p className="order-payment-amount">Amount to pay <b>{money.format(bill.totalPaisa/100)}</b></p>}
          </>:paymentInfo?.paymentMethodSnapshot==="OFF"?<p className="payment-awaiting-acceptance">Online payment is turned off. Contact the store to arrange payment.</p>:decision==="PLACED"&&!bill?<p className="payment-awaiting-acceptance">Payment details will appear here when the store sends a final bill.</p>:<p className="payment-awaiting-acceptance">No online payment details are available for this order. Contact the store to arrange payment.</p>}
          {!deliveryContactRequired&&paymentInfo?.paymentInstructionsSnapshot&&<p>{paymentInfo.paymentInstructionsSnapshot}</p>}
          <span className={`payment-state ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus.replaceAll("_"," ")}</span>
        </aside>
      </div>
    </div>
  </main>
  {deliveryContactOpen&&<div className="delivery-contact-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setDeliveryContactDismissedFor(order.orderNumber);}}>
    <section className="delivery-contact-dialog" role="dialog" aria-modal="true" aria-labelledby="delivery-contact-title">
      <header><span className="delivery-contact-icon"><Phone size={20}/></span><button type="button" aria-label="Close delivery contact prompt" onClick={()=>setDeliveryContactDismissedFor(order.orderNumber)}><X size={18}/></button></header>
      <span className="store-eyebrow">ORDER {order.orderNumber}</span>
      <h2 id="delivery-contact-title">Confirm delivery and payment</h2>
      <p>Your order is placed, but this location has no saved delivery rate. Contact the store to confirm the delivery charge and final amount before paying.</p>
      <div className="delivery-contact-actions">
        {storeCallHref&&<a className="delivery-contact-call" href={storeCallHref}><Phone size={17}/> Call store admin</a>}
        {storeWhatsAppHref&&<a className="delivery-contact-whatsapp" href={storeWhatsAppHref} target="_blank" rel="noreferrer"><FaWhatsapp size={19}/> WhatsApp admin</a>}
      </div>
      {!storeCallHref&&!storeWhatsAppHref&&<p className="delivery-contact-unavailable">The store has not provided a phone or WhatsApp contact. Check your order details again after the store adds a delivery rate.</p>}
      <button className="delivery-contact-continue" type="button" onClick={()=>setDeliveryContactDismissedFor(order.orderNumber)}>View order details</button>
    </section>
  </div>}
  {billPopupOpen&&order.billSnapshot&&<div className="customer-bill-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setBillPopupOpen(false);}}>
    <section className="customer-bill-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-bill-title">
      <header className="customer-bill-heading"><div className="customer-bill-brand">{order.billSnapshot.business.logoUrl&&<img src={order.billSnapshot.business.logoUrl} alt=""/>}<div><small>FINAL ORDER BILL</small><h2 id="customer-bill-title">{order.billSnapshot.business.name}</h2></div></div><button type="button" aria-label="Close bill" onClick={()=>setBillPopupOpen(false)}><X size={19}/></button></header>
      <p className="customer-bill-order-number">{order.orderNumber} · Sent {new Date(order.billSnapshot.sentAt).toLocaleString()}</p>
      <div className="customer-bill-customer-details"><b>{order.customerName||"Customer"}</b><span>{[order.deliveryAddress,order.deliveryDistrict,order.deliveryState,order.deliveryPincode&&`PIN ${order.deliveryPincode}`].filter(Boolean).join(", ")}</span>{order.customerPhone&&<span>{order.customerPhone}</span>}</div>
      <div className="customer-bill-business-details"><span>{[order.billSnapshot.business.address,order.billSnapshot.business.city,order.billSnapshot.business.state,order.billSnapshot.business.pincode].filter(Boolean).join(", ")}</span>{order.billSnapshot.business.contactPhone&&<a href={`tel:${order.billSnapshot.business.contactPhone}`}>{order.billSnapshot.business.contactPhone}</a>}</div>
      <div className="customer-bill-lines">{order.billSnapshot.items.map((item,index)=><div key={`${item.name}-${index}`}><span>{item.name}<small>{item.packetQuantity} {item.unitLabel}{item.packetQuantity===1?"":"s"} × {money.format(item.packetPrice)}</small></span><b>{money.format(item.lineTotal)}</b></div>)}</div>
      <div className="customer-bill-totals"><div><span>Products subtotal</span><b>{money.format(order.billSnapshot.productSubtotalPaisa/100)}</b></div><div><span>Delivery · {order.billSnapshot.region.name}</span><b>{money.format(order.billSnapshot.deliveryChargePaisa/100)}</b></div><strong><span>Total to pay</span><b>{money.format(order.billSnapshot.totalPaisa/100)}</b></strong></div>
      <section className="customer-bill-payment">{paymentInfo?.paymentQrSnapshot?<><div><b>Pay this amount</b><span>Scan the business payment QR below.</span></div><img src={paymentInfo.paymentQrSnapshot} alt={`${bill.business.name} payment QR code`}/>{paymentInfo.upiIdSnapshot&&<p>GPay number / UPI ID: <b>{paymentInfo.upiIdSnapshot}</b></p>}</>:paymentInfo?.upiIdSnapshot?<div><b>Pay using GPay</b><span>Send the total amount to this number or UPI ID.</span><strong className="customer-bill-upi-id">{paymentInfo.upiIdSnapshot}</strong></div>:<div><b>Payment details</b><span>{paymentInfo?.paymentMethodSnapshot==="OFF"?"Online payment is turned off. Contact the store to arrange payment.":"This bill was sent without online payment. Contact the store to arrange payment."}</span></div>}{paymentInfo?.paymentInstructionsSnapshot&&<p>{paymentInfo.paymentInstructionsSnapshot}</p>}{bill.billDescriptionSnapshot&&<p><b>Bill description:</b> {bill.billDescriptionSnapshot}</p>}</section>
      <div className="customer-bill-actions"><button className="secondary-button" type="button" onClick={downloadBill} disabled={billDownloadBusy}><Download size={15}/>{billDownloadBusy?"Preparing bill…":"Download bill (PDF)"}</button><button className="primary" type="button" onClick={()=>setBillPopupOpen(false)}>Okay, got it</button></div>
    </section>
  </div>}
  </CustomerStorePage>;
}
