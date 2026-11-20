export const planCatalog=[
  {
    id:"STARTER",
    name:"Starter",
    price:199,
    products:"25 products",
    slides:"3 banners",
    features:["Store profile","Products and orders","Order status alerts"],
    featureDefaults:{advancedSeo:false,analytics:false}
  },
  {
    id:"GROWTH",
    name:"Growth",
    price:499,
    products:"50 products",
    slides:"6 banners",
    features:["Advanced SEO","6 banner slides","All Starter features"],
    featureDefaults:{advancedSeo:true,analytics:false}
  },
  {
    id:"PRO",
    name:"Pro",
    price:999,
    products:"Unlimited products",
    slides:"6 banners",
    features:["Daily, weekly & monthly sales analytics","Unlimited products","All Growth features"],
    featureDefaults:{advancedSeo:true,analytics:true}
  }
];

export const planFeatureDefaults=Object.fromEntries(
  planCatalog.map(({id,featureDefaults})=>[id,featureDefaults])
);
