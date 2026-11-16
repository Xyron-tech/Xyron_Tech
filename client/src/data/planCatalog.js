export const planCatalog=[
  {
    id:"STARTER",
    name:"Starter",
    price:199,
    products:"25 products",
    slides:"3 banners",
    features:["Store profile","Products and orders","Customer chat"],
    featureDefaults:{advancedSeo:false,quickReplies:false,analytics:false}
  },
  {
    id:"GROWTH",
    name:"Growth",
    price:499,
    products:"50 products",
    slides:"6 banners",
    features:["Advanced SEO","Chat quick replies","All Starter features"],
    featureDefaults:{advancedSeo:true,quickReplies:true,analytics:false}
  },
  {
    id:"PRO",
    name:"Pro",
    price:999,
    products:"Unlimited products",
    slides:"6 banners",
    features:["Daily, weekly & monthly sales analytics","All Growth features"],
    featureDefaults:{advancedSeo:true,quickReplies:true,analytics:true}
  }
];

export const planFeatureDefaults=Object.fromEntries(
  planCatalog.map(({id,featureDefaults})=>[id,featureDefaults])
);
