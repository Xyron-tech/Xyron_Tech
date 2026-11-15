import Business from "../models/Business.js";

export function slugify(value){
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,55)||"store";
}

export async function uniqueBusinessSlug(name,excludeId){
  const base=slugify(name);
  let slug=base;
  let suffix=1;
  const filter={slug};
  if(excludeId)filter._id={$ne:excludeId};
  while(await Business.exists(filter)){
    suffix+=1;
    slug=`${base}-${suffix}`;
    filter.slug=slug;
  }
  return slug;
}
