export function getStorePhoneHref(value){
  const phone=String(value||"").trim();
  const digits=phone.replace(/\D/g,"");
  if(digits.length===10)return `tel:+91${digits}`;
  if(digits.length===11&&digits.startsWith("0"))return `tel:+91${digits.slice(1)}`;
  if(digits.length===12&&digits.startsWith("91"))return `tel:+${digits}`;
  if(phone.startsWith("+"))return `tel:+${digits}`;
  return `tel:${phone.replace(/[^\d+]/g,"")}`;
}

export function getStoreWhatsAppNumber(value){
  const digits=String(value||"").replace(/\D/g,"");
  if(digits.length===10)return `91${digits}`;
  if(digits.length===11&&digits.startsWith("0"))return `91${digits.slice(1)}`;
  return digits;
}
