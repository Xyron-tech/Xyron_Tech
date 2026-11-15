export function calculateRegionalDeliveryChargePaisa(weightGrams,ratePerKgPaisa){
  const weight=Number(weightGrams),rate=Number(ratePerKgPaisa);
  if(!Number.isFinite(weight)||weight<=0)throw new Error("Order weight must be a positive number of grams.");
  if(!Number.isSafeInteger(rate)||rate<0)throw new Error("Regional price must be a non-negative whole number of paise per kilogram.");
  const charge=Math.round(weight*rate/1000);
  if(!Number.isSafeInteger(charge))throw new Error("Delivery charge exceeds the supported calculation range.");
  return charge;
}
