export function normalizePhone(value){
  return String(value||"").replace(/\D/g,"");
}

export function isValidPhone(value){
  const phone=normalizePhone(value);
  return phone.length>=10&&phone.length<=15;
}
