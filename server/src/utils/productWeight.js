const MAX_WEIGHT_GRAMS=100000000;
export const MIN_ORDER_WEIGHT_GRAMS=1000;
const roundWeight=grams=>Number(grams.toFixed(6));

export function getProductWeightConfiguration(product){
  const method=product.weightCalculationMethod||"BUNDLE";
  if(method==="PIECE"){
    const piecesPerKg=Number(product.piecesPerKg);
    if(!Number.isSafeInteger(piecesPerKg)||piecesPerKg<1)throw new Error("A product has an invalid pieces-per-kilogram configuration.");
    return {method,piecesPerKg,piecesPerUnitGrams:1000/piecesPerKg,piecesPerUnit:1,unitLabel:"piece"};
  }
  if(method!=="BUNDLE")throw new Error("A product has an unsupported weight calculation method.");
  const piecesPerBundle=Number(product.piecesPerBundle??product.piecesPerPacket);
  const bundleWeightGrams=Number(product.bundleWeightGrams??product.packetWeightGrams);
  if(!Number.isSafeInteger(piecesPerBundle)||piecesPerBundle<1||!Number.isFinite(bundleWeightGrams)||bundleWeightGrams<=0||bundleWeightGrams>MAX_WEIGHT_GRAMS)throw new Error("A product has an invalid bundle weight configuration.");
  return {method,piecesPerBundle,bundleWeightGrams,piecesPerUnitGrams:bundleWeightGrams,piecesPerUnit:piecesPerBundle,unitLabel:"bundle"};
}

export function calculateProductWeight(product,quantity){
  const configuration=getProductWeightConfiguration(product);
  const units=Number(quantity);
  if(!Number.isSafeInteger(units)||units<1)throw new Error("Product quantity must be a positive whole number.");
  const weightGrams=roundWeight(configuration.piecesPerUnitGrams*units);
  if(!Number.isFinite(weightGrams)||weightGrams<=0||weightGrams>MAX_WEIGHT_GRAMS)throw new Error("Product weight exceeds the supported calculation range.");
  return {...configuration,quantity:units,weightGrams};
}

export function calculateProductPieces(product,quantity){
  const configuration=getProductWeightConfiguration(product);
  const units=Number(quantity);
  if(!Number.isSafeInteger(units)||units<1)throw new Error("Product quantity must be a positive whole number.");
  return configuration.piecesPerUnit*units;
}
