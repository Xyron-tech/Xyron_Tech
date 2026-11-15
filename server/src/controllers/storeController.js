import mongoose from "mongoose";
import {z} from "zod";
import Business from "../models/Business.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import {deleteStoreImage,uploadStoreImage} from "../services/cloudinary.js";
import {findPincodeDetails} from "../services/pincodeDirectory.js";
import {canAddProduct,canAddSlide,getPlan} from "../utils/businessPlans.js";
import {uniqueBusinessSlug} from "../utils/slug.js";

const optionalNumber=maximum=>z.preprocess(value=>value===""||value==null?undefined:value,z.coerce.number().positive().max(maximum).optional());
const optionalInteger=maximum=>z.preprocess(value=>value===""||value==null?undefined:value,z.coerce.number().int().positive().max(maximum).optional());
const productBaseShape=z.object({
  name:z.string().trim().min(2).max(120),
  description:z.string().trim().max(1200).optional().default(""),
  category:z.string().trim().min(2).max(80),
  weightCalculationMethod:z.enum(["BUNDLE","PIECE"]).default("BUNDLE"),
  piecesPerBundle:optionalInteger(1000000),
  bundleWeightGrams:optionalNumber(100000000),
  piecesPerKg:optionalInteger(1000000),
  piecesPerPacket:optionalInteger(1000000),
  packetWeightGrams:optionalNumber(100000000),
  packetPrice:z.coerce.number().positive().max(10000000),
  stockPackets:z.coerce.number().int().min(0).max(100000000),
  imageUrl:z.string().trim().url().max(500).optional().or(z.literal("")).default(""),
  status:z.enum(["ACTIVE","INACTIVE"]).default("ACTIVE")
});
const validateProductWeight=(value,ctx)=>{
  if(value.weightCalculationMethod==="PIECE"){
    if(!value.piecesPerKg)ctx.addIssue({code:"custom",message:"Enter the number of pieces per kilogram.",path:["piecesPerKg"]});
  }else if(!(value.piecesPerBundle||value.piecesPerPacket)||!(value.bundleWeightGrams||value.packetWeightGrams)){
    ctx.addIssue({code:"custom",message:"Enter the pieces per bundle and weight of one complete bundle.",path:["piecesPerBundle"]});
  }
};
const productShape=productBaseShape.superRefine(validateProductWeight);
const productSchema=productShape;
const productUpdateSchema=productBaseShape.partial().superRefine((value,ctx)=>{
  const weightFields=["weightCalculationMethod","piecesPerBundle","bundleWeightGrams","piecesPerKg","piecesPerPacket","packetWeightGrams"];
  if(weightFields.some(field=>Object.hasOwn(value,field))){validateProductWeight(value,ctx);}
  const packetFields=["piecesPerPacket","packetWeightGrams","packetPrice","stockPackets"];
  if(packetFields.some(field=>Object.hasOwn(value,field))&&!Object.hasOwn(value,"weightCalculationMethod"))packetFields.forEach(field=>{if(value[field]===undefined)ctx.addIssue({code:"custom",message:"Complete all packet details before saving this product.",path:[field]});});
});
const slideFields=z.object({
  title:z.string().trim().min(2).max(90),
  subtitle:z.string().trim().max(180).optional().default(""),
  buttonLabel:z.string().trim().min(2).max(32).optional().default("Explore products"),
  buttonHref:z.string().trim().regex(/^#products$/).optional().default("#products"),
  enabled:z.coerce.boolean().optional().default(true)
});
const businessProfileFields=z.object({
  name:z.string().trim().min(2).max(140),
  category:z.string().trim().min(2).max(80),
  description:z.string().trim().max(1200).optional().default(""),
  announcementTitle:z.string().trim().max(40).optional().default(""),
  announcementText:z.string().trim().max(180).optional().default(""),
  announcements:z.array(z.object({
    title:z.string().trim().max(40).optional().default("Store update"),
    text:z.string().trim().min(2).max(180)
  })).max(20).optional(),
  contactPhone:z.string().trim().max(20).regex(/^\+?[0-9\s()-]{8,20}$/,"Enter a valid contact phone number.").or(z.literal("")).optional().default(""),
  whatsappNumber:z.string().trim().max(20).regex(/^\+?[0-9\s()-]{8,20}$/,"Enter a valid WhatsApp number.").or(z.literal("")).optional().default(""),
  instagramUrl:z.string().trim().max(300).url().refine(value=>/^https?:\/\//i.test(value),"Social links must use http or https.").or(z.literal("")).optional().default(""),
  youtubeUrl:z.string().trim().max(300).url().refine(value=>/^https?:\/\//i.test(value),"Social links must use http or https.").or(z.literal("")).optional().default(""),
  facebookUrl:z.string().trim().max(300).url().refine(value=>/^https?:\/\//i.test(value),"Social links must use http or https.").or(z.literal("")).optional().default(""),
  linkedinUrl:z.string().trim().max(300).url().refine(value=>/^https?:\/\//i.test(value),"Social links must use http or https.").or(z.literal("")).optional().default(""),
  twitterUrl:z.string().trim().max(300).url().refine(value=>/^https?:\/\//i.test(value),"Social links must use http or https.").or(z.literal("")).optional().default(""),
  telegramUrl:z.string().trim().max(300).url().refine(value=>/^https?:\/\//i.test(value),"Social links must use http or https.").or(z.literal("")).optional().default(""),
  seoTitle:z.string().trim().max(70).optional().default(""),
  seoDescription:z.string().trim().max(180).optional().default(""),
  removeLogo:z.boolean().optional().default(false)
});
const paymentSettingsFields=z.object({
  upiId:z.string().trim().max(120).optional().default(""),
  paymentInstructions:z.string().trim().max(500).optional().default(""),
  removePaymentQr:z.boolean().optional().default(false)
});
const storeSectionsSchema=z.object({
  sections:z.array(z.object({
    title:z.string().trim().min(2).max(80),
    subtitle:z.string().trim().max(180).optional().default(""),
    productIds:z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(20)
  })).max(8)
}).superRefine(({sections},ctx)=>{
  sections.forEach((section,sectionIndex)=>{
    if(new Set(section.productIds).size!==section.productIds.length)ctx.addIssue({code:"custom",message:"A product can appear only once in each section.",path:["sections",sectionIndex,"productIds"]});
  });
});
const shippingManagementFields=z.object({
  deliveryRegions:z.array(z.object({
    _id:z.string().regex(/^[a-f\d]{24}$/i).optional(),
    name:z.string().trim().min(2).max(100),
    ratePerKgPaisa:z.coerce.number().int().min(0).max(100000000)
  })).max(100)
}).superRefine(({deliveryRegions},ctx)=>{
  const names=new Set();
  deliveryRegions.forEach((region,index)=>{
    const key=region.name.toLocaleUpperCase("en-IN");
    if(names.has(key))ctx.addIssue({code:"custom",message:"Delivery region names must be unique.",path:["deliveryRegions",index,"name"]});
    names.add(key);
  });
});

function parseJsonField(value){
  if(typeof value!=="string")return value;
  try{return JSON.parse(value);}catch{return {};}
}
function validationError(error){
  return error.issues?.[0]?.message||"Please check the submitted details.";
}
function storeAnnouncements(business){
  if(business.announcements?.length){
    return business.announcements.map((item,index)=>({_id:item._id?.toString()||`announcement-${index}`,title:item.title||"Store update",text:item.text}));
  }
  return business.announcementText?.trim()?[{_id:"legacy-announcement",title:business.announcementTitle||"FROM THE STORE",text:business.announcementText.trim()}]:[];
}
function safeBusiness(business){
  const plan=getPlan(business.subscriptionPlan);
  return {id:business._id,name:business.name,slug:business.slug,category:business.category,description:business.description,announcementTitle:business.announcementTitle||"",announcementText:business.announcementText||"",announcements:storeAnnouncements(business),storeSections:business.storeSections||[],logoUrl:business.logoUrl,contactPhone:business.contactPhone||"",whatsappNumber:business.whatsappNumber||"",instagramUrl:business.instagramUrl||"",youtubeUrl:business.youtubeUrl||"",facebookUrl:business.facebookUrl||"",linkedinUrl:business.linkedinUrl||"",twitterUrl:business.twitterUrl||"",telegramUrl:business.telegramUrl||"",seoTitle:business.seoTitle||"",seoDescription:business.seoDescription||"",upiId:business.upiId,paymentInstructions:business.paymentInstructions,paymentQrUrl:business.paymentQrUrl,address:business.address,city:business.city,state:business.state,pincode:business.pincode,deliveryRegions:business.deliveryRegions||[],status:business.status,subscriptionPlan:plan.id,subscriptionFeatures:business.subscriptionFeatures||{},planLimits:{maxProducts:plan.maxProducts,maxSlides:plan.maxSlides,monthlyPriceInr:plan.monthlyPriceInr},sliderSlides:business.sliderSlides};
}
async function getOwnerBusiness(req){
  const business=await Business.findOne({_id:req.tenantId,ownerId:req.user._id,status:"ACTIVE"});
  if(!business)return null;
  if(!business.slug){
    business.slug=await uniqueBusinessSlug(business.name,business._id);
    await business.save();
  }
  return business;
}
async function removeOldImage(publicId){
  try{
    const removed=await deleteStoreImage(publicId);
    if(!removed)console.error(`Cloudinary did not delete previous storefront image: ${publicId}`);
    return removed;
  }catch(error){
    console.error("Could not remove previous storefront image from Cloudinary.",error);
    return false;
  }
}

export async function getStorefrontSettings(req,res){
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  const productCount=await Product.countDocuments({businessId:business._id});
  res.json({business:safeBusiness(business),productCount});
}

export async function updateStoreProfile(req,res){
  const details=parseJsonField(req.body.details)||req.body;
  const parsed=businessProfileFields.safeParse(details);
  if(!parsed.success)return res.status(400).json({message:validationError(parsed.error)});
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  if(!business.subscriptionFeatures?.advancedSeo&&((parsed.data.seoTitle&&parsed.data.seoTitle!==business.seoTitle)||(parsed.data.seoDescription&&parsed.data.seoDescription!==business.seoDescription)))return res.status(403).json({message:"Advanced SEO fields are not enabled for your current plan. Contact Xyron Admin to request an upgrade."});
  const image=req.file?await uploadStoreImage(req.file,business._id,"brand"):null;
  const oldPublicId=business.logoPublicId;
  const previousAnnouncementTitle=business.announcementTitle;
  const previousAnnouncementText=business.announcementText;
  const {removeLogo,announcements,...profile}=parsed.data;
  Object.assign(business,profile);
  if(announcements){
    business.announcements=announcements;
    business.announcementTitle=announcements[0]?.title||"";
    business.announcementText=announcements[0]?.text||"";
  }else if(profile.announcementTitle!==previousAnnouncementTitle||profile.announcementText!==previousAnnouncementText){
    business.announcements=profile.announcementText?[{title:profile.announcementTitle||"Store update",text:profile.announcementText}]:[];
  }
  if(image)Object.assign(business,{logoUrl:image.imageUrl,logoPublicId:image.publicId});
  else if(removeLogo)Object.assign(business,{logoUrl:"",logoPublicId:""});
  try{
    await business.save();
  }catch(error){
    if(image)await removeOldImage(image.publicId);
    throw error;
  }
  const previousImageRemoved=(image||removeLogo)&&oldPublicId?await removeOldImage(oldPublicId):true;
  res.json({business:safeBusiness(business),message:"Store profile saved.",warning:previousImageRemoved?undefined:"The new logo is saved, but Cloudinary could not remove the previous logo."});
}

export async function updatePaymentSettings(req,res){
  const details=parseJsonField(req.body.details)||req.body;
  const parsed=paymentSettingsFields.safeParse(details);
  if(!parsed.success)return res.status(400).json({message:validationError(parsed.error)});
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  const image=req.file?await uploadStoreImage(req.file,business._id,"payment-qr"):null;
  const oldPublicId=business.paymentQrPublicId,oldQrUrl=business.paymentQrUrl;
  const {removePaymentQr,...settings}=parsed.data;
  Object.assign(business,settings);
  if(image)Object.assign(business,{paymentQrUrl:image.imageUrl,paymentQrPublicId:image.publicId});
  else if(removePaymentQr)Object.assign(business,{paymentQrUrl:"",paymentQrPublicId:""});
  try{
    await business.save();
  }catch(error){
    if(image)await removeOldImage(image.publicId);
    throw error;
  }
  const qrStillUsed=oldPublicId&&await Order.exists({businessId:business._id,$or:[{paymentQrSnapshotPublicId:oldPublicId},{paymentQrSnapshot:oldQrUrl}]});
  const previousImageRemoved=(image||removePaymentQr)&&oldPublicId&&!qrStillUsed?await removeOldImage(oldPublicId):true;
  res.json({business:safeBusiness(business),message:"Payment and delivery settings saved.",warning:previousImageRemoved?undefined:"Settings are saved, but Cloudinary could not remove the previous QR image."});
}

export async function updateShippingSettings(req,res){
  const details=parseJsonField(req.body.details)||req.body;
  const parsed=shippingManagementFields.safeParse(details);
  if(!parsed.success)return res.status(400).json({message:validationError(parsed.error)});
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  business.deliveryRegions=parsed.data.deliveryRegions;
  await business.save();
  res.json({business:safeBusiness(business),message:"Delivery regions saved."});
}

export async function updateStoreSections(req,res){
  const parsed=storeSectionsSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:validationError(parsed.error)});
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  const productIds=[...new Set(parsed.data.sections.flatMap(section=>section.productIds))];
  const activeProducts=await Product.find({businessId:business._id,_id:{$in:productIds},status:"ACTIVE"}).select("_id").lean();
  if(activeProducts.length!==productIds.length)return res.status(400).json({message:"Store sections can include only active products from your own business."});
  business.storeSections=parsed.data.sections;
  await business.save();
  res.json({business:safeBusiness(business),message:"Store sections saved."});
}

export async function createProduct(req,res){
  const details=parseJsonField(req.body.details)||req.body;
  const parsed=productSchema.safeParse(details);
  if(!parsed.success)return res.status(400).json({message:validationError(parsed.error)});
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  const plan=getPlan(business.subscriptionPlan),productCount=await Product.countDocuments({businessId:business._id});
  if(!canAddProduct(business,productCount))return res.status(409).json({message:`Your ${plan.name} plan allows up to ${plan.maxProducts} products. Contact Xyron Admin to request an upgrade.`});
  const productDetails={...parsed.data};
  if(productDetails.weightCalculationMethod==="PIECE"){
    productDetails.piecesPerPacket=1;
    productDetails.packetWeightGrams=1000/productDetails.piecesPerKg;
  }else{
    productDetails.piecesPerBundle=productDetails.piecesPerBundle??productDetails.piecesPerPacket;
    productDetails.bundleWeightGrams=productDetails.bundleWeightGrams??productDetails.packetWeightGrams;
    productDetails.piecesPerPacket=productDetails.piecesPerBundle;
    productDetails.packetWeightGrams=productDetails.bundleWeightGrams;
  }
  const image=req.file?await uploadStoreImage(req.file,business._id,"products"):null;
  let product;
  try{
    product=await Product.create({...productDetails,...(image?{imageUrl:image.imageUrl,imagePublicId:image.publicId}:{}),businessId:business._id});
  }catch(error){
    if(image)await removeOldImage(image.publicId);
    throw error;
  }
  res.status(201).json({product});
}

export async function updateProduct(req,res){
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid product ID."});
  const details=parseJsonField(req.body.details)||req.body;
  const parsed=productUpdateSchema.safeParse(details);
  if(!parsed.success)return res.status(400).json({message:validationError(parsed.error)});
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  const product=await Product.findOne({_id:req.params.id,businessId:business._id});
  if(!product)return res.status(404).json({message:"Product not found in your store."});
  const oldPublicId=product.imagePublicId;
  const oldImageUrl=product.imageUrl;
  const image=req.file?await uploadStoreImage(req.file,business._id,"products"):null;
  const productDetails={...parsed.data};
  const method=productDetails.weightCalculationMethod||product.weightCalculationMethod||"BUNDLE";
  if(method==="PIECE"){
    const piecesPerKg=productDetails.piecesPerKg??product.piecesPerKg;
    productDetails.weightCalculationMethod="PIECE";
    productDetails.piecesPerPacket=1;
    productDetails.packetWeightGrams=1000/piecesPerKg;
  }else{
    const piecesPerBundle=productDetails.piecesPerBundle??productDetails.piecesPerPacket??product.piecesPerBundle??product.piecesPerPacket;
    const bundleWeightGrams=productDetails.bundleWeightGrams??productDetails.packetWeightGrams??product.bundleWeightGrams??product.packetWeightGrams;
    productDetails.weightCalculationMethod="BUNDLE";
    productDetails.piecesPerBundle=piecesPerBundle;
    productDetails.bundleWeightGrams=bundleWeightGrams;
    productDetails.piecesPerPacket=piecesPerBundle;
    productDetails.packetWeightGrams=bundleWeightGrams;
  }
  Object.assign(product,productDetails);
  if(image)Object.assign(product,{imageUrl:image.imageUrl,imagePublicId:image.publicId});
  else if(Object.hasOwn(parsed.data,"imageUrl")&&parsed.data.imageUrl!==oldImageUrl)product.imagePublicId="";
  try{
    await product.save();
  }catch(error){
    if(image)await removeOldImage(image.publicId);
    throw error;
  }
  const imageChanged=Boolean(image)||(Object.hasOwn(parsed.data,"imageUrl")&&parsed.data.imageUrl!==oldImageUrl);
  const previousImageRemoved=imageChanged&&oldPublicId?await removeOldImage(oldPublicId):true;
  res.json({product,message:"Product updated.",warning:previousImageRemoved?undefined:"Product updated, but Cloudinary could not remove the previous image."});
}

export async function deleteProduct(req,res){
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid product ID."});
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  const product=await Product.findOneAndDelete({_id:req.params.id,businessId:business._id});
  if(!product)return res.status(404).json({message:"Product not found in your store."});
  const imageRemoved=product.imagePublicId?await removeOldImage(product.imagePublicId):true;
  res.json({message:"Product removed from your store.",warning:imageRemoved?undefined:"Product removed, but Cloudinary could not remove its image."});
}

export async function createSliderSlide(req,res){
  if(!req.file)return res.status(400).json({message:"Choose a banner image to upload."});
  const parsed=slideFields.safeParse(parseJsonField(req.body.details));
  if(!parsed.success)return res.status(400).json({message:validationError(parsed.error)});
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  const plan=getPlan(business.subscriptionPlan);
  if(!canAddSlide(business,business.sliderSlides.length))return res.status(409).json({message:`Your ${plan.name} plan allows up to ${plan.maxSlides} slider slides.`});
  const image=await uploadStoreImage(req.file,business._id);
  business.sliderSlides.push({...parsed.data,...image,position:business.sliderSlides.length,uploadedBy:req.user._id});
  try{
    await business.save();
  }catch(error){
    await removeOldImage(image.publicId);
    throw error;
  }
  res.status(201).json({business:safeBusiness(business),message:"Slider image added to your store."});
}

export async function updateSliderSlide(req,res){
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid slider ID."});
  const details=parseJsonField(req.body.details);
  const parsed=slideFields.partial().safeParse(details||{});
  if(!parsed.success)return res.status(400).json({message:validationError(parsed.error)});
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  const slide=business.sliderSlides.id(req.params.id);
  if(!slide)return res.status(404).json({message:"Slider slide not found in your store."});
  let newImage=null;
  if(req.file)newImage=await uploadStoreImage(req.file,business._id);
  const oldPublicId=slide.publicId;
  Object.assign(slide,parsed.data);
  if(newImage)Object.assign(slide,newImage,{uploadedBy:req.user._id});
  try{
    await business.save();
  }catch(error){
    if(newImage)await removeOldImage(newImage.publicId);
    throw error;
  }
  const previousImageRemoved=newImage?await removeOldImage(oldPublicId):true;
  res.json({business:safeBusiness(business),message:"Slider slide updated.",warning:previousImageRemoved?undefined:"The new image is saved, but Cloudinary could not remove the old image."});
}

export async function deleteSliderSlide(req,res){
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid slider ID."});
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  const slide=business.sliderSlides.id(req.params.id);
  if(!slide)return res.status(404).json({message:"Slider slide not found in your store."});
  const publicId=slide.publicId;
  slide.deleteOne();
  business.sliderSlides.forEach((item,index)=>{item.position=index;});
  await business.save();
  const imageRemoved=await removeOldImage(publicId);
  res.json({business:safeBusiness(business),message:"Slider slide removed.",warning:imageRemoved?undefined:"The slide is removed, but Cloudinary could not remove its image."});
}

export async function getPublicStore(req,res){
  const business=await Business.findOne({slug:req.params.slug,status:"ACTIVE"}).select("name slug category description announcementTitle announcementText announcements storeSections logoUrl contactPhone whatsappNumber address city state pincode instagramUrl youtubeUrl facebookUrl linkedinUrl twitterUrl telegramUrl sliderSlides seoTitle seoDescription subscriptionFeatures");
  if(!business)return res.status(404).json({message:"This store is not available."});
  const slides=business.sliderSlides.filter(slide=>slide.enabled).sort((a,b)=>a.position-b.position).map(slide=>({_id:slide._id,title:slide.title,subtitle:slide.subtitle,imageUrl:slide.imageUrl,buttonLabel:slide.buttonLabel,buttonHref:slide.buttonHref,position:slide.position}));
  const advancedSeo=Boolean(business.subscriptionFeatures?.advancedSeo);
  let pin=null;
  try{pin=findPincodeDetails(business.pincode);}
  catch(error){if(error.status!==503)throw error;}
  res.json({business:{name:business.name,slug:business.slug,category:business.category,description:business.description,announcementTitle:business.announcementTitle||"",announcementText:business.announcementText||"",announcements:storeAnnouncements(business),storeSections:(business.storeSections||[]).map(section=>({_id:section._id,title:section.title,subtitle:section.subtitle,productIds:section.productIds.map(id=>id.toString())})),logoUrl:business.logoUrl,contactPhone:business.contactPhone||"",whatsappNumber:business.whatsappNumber||"",address:business.address,city:business.city,state:business.state,pincode:business.pincode,location:pin?{lat:pin.lat,lng:pin.lng,centroidGrade:pin.centroidGrade}:null,instagramUrl:business.instagramUrl||"",youtubeUrl:business.youtubeUrl||"",facebookUrl:business.facebookUrl||"",linkedinUrl:business.linkedinUrl||"",twitterUrl:business.twitterUrl||"",telegramUrl:business.telegramUrl||"",seoTitle:advancedSeo?business.seoTitle||"":"",seoDescription:advancedSeo?business.seoDescription||"":"",sliderSlides:slides}});
}

export async function getPublicProducts(req,res){
  const business=await Business.findOne({slug:req.params.slug,status:"ACTIVE"}).select("_id");
  if(!business)return res.status(404).json({message:"This store is not available."});
  const search=String(req.query.search||"").trim().slice(0,80);
  const category=String(req.query.category||"").trim().slice(0,80);
  const filter={businessId:business._id,status:"ACTIVE"};
  if(search){
    const safeSearch=search.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    filter.$or=[{name:{$regex:safeSearch,$options:"i"}},{category:{$regex:safeSearch,$options:"i"}},{description:{$regex:safeSearch,$options:"i"}}];
  }
  if(category)filter.category=category;
  const products=await Product.find(filter).select("name description category weightCalculationMethod piecesPerBundle bundleWeightGrams piecesPerKg piecesPerPacket packetWeightGrams packetPrice stockPackets imageUrl").sort({createdAt:-1}).limit(100).lean();
  const categories=await Product.distinct("category",{businessId:business._id,status:"ACTIVE"});
  res.json({products,categories:categories.sort((a,b)=>a.localeCompare(b)),count:products.length});
}

export async function listOwnerProducts(req,res){
  const business=await getOwnerBusiness(req);
  if(!business)return res.status(404).json({message:"Your approved business workspace was not found."});
  const products=await Product.find({businessId:business._id}).sort({createdAt:-1}).limit(200).lean();
  res.json({products});
}
