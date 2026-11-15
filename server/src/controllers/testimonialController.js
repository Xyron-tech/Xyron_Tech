import mongoose from "mongoose";
import {z} from "zod";
import Testimonial from "../models/Testimonial.js";
import {deletePublicAsset,uploadPublicTestimonialFile} from "../services/cloudinary.js";

const optionalUrl=z.union([z.string().trim().url().max(300),z.literal("")]).optional().default("");
const testimonialFields=z.object({
  name:z.string().trim().min(2).max(100),
  company:z.string().trim().max(120).optional().default(""),
  role:z.string().trim().max(100).optional().default(""),
  location:z.string().trim().max(120).optional().default(""),
  service:z.string().trim().max(80).optional().default(""),
  duration:z.string().trim().max(80).optional().default(""),
  website:optionalUrl,
  instagram:optionalUrl,
  message:z.string().trim().min(5).max(2000),
  consent:z.union([z.literal("true"),z.literal(true)]).transform(()=>true)
});
const moderationFields=z.object({
  status:z.enum(["PENDING","PUBLISHED","REJECTED"]).optional(),
  verified:z.boolean().optional()
}).refine(value=>value.status!==undefined||value.verified!==undefined);

function validationMessage(error){
  return error.issues?.[0]?.message||"Please check the testimonial details.";
}

function publicFields(testimonial){
  return {
    id:testimonial._id,
    name:testimonial.name,
    company:testimonial.company,
    role:testimonial.role,
    location:testimonial.location,
    service:testimonial.service,
    duration:testimonial.duration,
    website:testimonial.website,
    instagram:testimonial.instagram,
    message:testimonial.message,
    photo:testimonial.photo,
    voice:testimonial.voice,
    verified:testimonial.verified,
    createdAt:testimonial.createdAt
  };
}

export async function listTestimonials(req,res){
  const testimonials=await Testimonial.find({status:"PUBLISHED"}).sort({createdAt:-1}).limit(50).lean();
  testimonials.reverse();
  res.json({testimonials:testimonials.map(publicFields)});
}

export async function listSuperAdminTestimonials(req,res){
  const testimonials=await Testimonial.find().sort({createdAt:-1}).limit(300).lean();
  res.json({testimonials:testimonials.map(testimonial=>({...publicFields(testimonial),status:testimonial.status}))});
}

export async function updateTestimonialModeration(req,res){
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid testimonial ID."});
  const parsed=moderationFields.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:"Choose a valid testimonial status or verification setting."});
  const testimonial=await Testimonial.findByIdAndUpdate(req.params.id,{$set:parsed.data},{new:true,runValidators:true});
  if(!testimonial)return res.status(404).json({message:"Testimonial not found."});
  res.json({testimonial:{...publicFields(testimonial),status:testimonial.status},message:"Testimonial settings updated."});
}

export async function createTestimonial(req,res){
  const parsed=testimonialFields.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:validationMessage(parsed.error)});
  const photoFile=req.files?.photo?.[0];
  const voiceFile=req.files?.voice?.[0];
  const uploadedAssets=[];
  try{
    const photo=photoFile?await uploadPublicTestimonialFile(photoFile,"photo"):null;
    if(photo)uploadedAssets.push({publicId:photo.publicId,resourceType:"image"});
    const voice=voiceFile?await uploadPublicTestimonialFile(voiceFile,"voice"):null;
    if(voice)uploadedAssets.push({publicId:voice.publicId,resourceType:"video"});
    const testimonial=await Testimonial.create({
      ...parsed.data,
      photo:photo?.imageUrl||"",
      voice:voice?.imageUrl||""
    });
    res.status(201).json({testimonial:publicFields(testimonial),message:"Thank you. Your experience was sent to Xyron Admin for review and will appear after approval."});
  }catch(error){
    for(const asset of uploadedAssets){
      try{await deletePublicAsset(asset.publicId,asset.resourceType);}
      catch(cleanupError){console.error("Could not remove an unused testimonial upload.",cleanupError);}
    }
    throw error;
  }
}
