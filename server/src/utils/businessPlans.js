export const BUSINESS_PLANS={
  STARTER:{id:"STARTER",name:"Starter",monthlyPriceInr:199,maxProducts:25,maxSlides:3,features:{advancedSeo:false,quickReplies:false,analytics:false}},
  GROWTH:{id:"GROWTH",name:"Growth",monthlyPriceInr:499,maxProducts:50,maxSlides:6,features:{advancedSeo:true,quickReplies:true,analytics:false}},
  PRO:{id:"PRO",name:"Pro",monthlyPriceInr:999,maxProducts:null,maxSlides:6,features:{advancedSeo:true,quickReplies:true,analytics:true}}
};

export const BUSINESS_FEATURES=Object.keys(BUSINESS_PLANS.STARTER.features);

export function getPlan(planId){
  return BUSINESS_PLANS[planId]||BUSINESS_PLANS.STARTER;
}

export function getPlanFeatureDefaults(planId){
  return {...getPlan(planId).features};
}

export function hasBusinessFeature(business,feature){
  return Boolean(business?.subscriptionFeatures?.[feature]);
}

export function canAddProduct(business,productCount){
  const maxProducts=getPlan(business?.subscriptionPlan).maxProducts;
  return maxProducts===null||productCount<maxProducts;
}

export function canAddSlide(business,slideCount){
  return slideCount<getPlan(business?.subscriptionPlan).maxSlides;
}
