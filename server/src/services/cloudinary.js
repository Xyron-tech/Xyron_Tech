import {v2 as cloudinary} from "cloudinary";
import {fileTypeFromBuffer} from "file-type";
import {env} from "../config/env.js";

const hasCloudinaryUrl=Boolean(env.CLOUDINARY_URL);
const hasSplitConfig=Boolean(env.CLOUDINARY_CLOUD_NAME&&env.CLOUDINARY_API_KEY&&env.CLOUDINARY_API_SECRET);
const isConfigured=hasCloudinaryUrl||hasSplitConfig;
if(hasCloudinaryUrl){
  cloudinary.config();
}else if(hasSplitConfig){
  cloudinary.config({cloud_name:env.CLOUDINARY_CLOUD_NAME,api_key:env.CLOUDINARY_API_KEY,api_secret:env.CLOUDINARY_API_SECRET,secure:true});
}

function storageFailure(error){
  const status=Number(error?.http_code||error?.status);
  console.error("Cloudinary media operation failed.",Number.isFinite(status)?{providerStatus:status}:{});
  let guidance="Check the Cloudinary configuration and account usage, then try again.";
  if(status===401||status===403)guidance="Verify the Cloudinary cloud name, API credentials, and upload permissions.";
  else if(status===400)guidance="Cloudinary rejected the image request. Verify the image format and upload settings.";
  else if(status===413)guidance="Cloudinary rejected this image as too large. Choose a smaller image.";
  else if(status===420||status===429)guidance="The Cloudinary rate or usage limit may have been reached. Check account usage and retry later.";
  else if(status>=500)guidance="Cloudinary may be temporarily unavailable. Retry shortly.";
  const statusText=Number.isFinite(status)&&status>0?` (Cloudinary HTTP ${status})`:"";
  const failure=new Error(`Media storage failed${statusText}. ${guidance}`);
  failure.status=502;
  return failure;
}

export async function uploadStoreImage(file,businessId,assetType="storefront"){
  if(!isConfigured){
    const error=new Error("Image uploads are not configured. Add Cloudinary credentials to the server environment.");
    error.status=503;
    throw error;
  }
  const detected=await fileTypeFromBuffer(file.buffer);
  if(!detected||!["image/jpeg","image/png","image/webp"].includes(detected.mime)){
    const error=new Error("Upload a valid JPG, PNG, or WebP image.");
    error.status=400;
    throw error;
  }
  return new Promise((resolve,reject)=>{
    const stream=cloudinary.uploader.upload_stream({
      folder:`xyron-wholesale/${businessId}/${assetType}`,
      resource_type:"image",
      allowed_formats:["jpg","png","webp"],
      transformation:[{width:1800,height:800,crop:"limit",quality:"auto",fetch_format:"auto"}]
    },(error,result)=>{
      if(error)return reject(storageFailure(error));
      if(!result?.secure_url||!result?.public_id)return reject(storageFailure(new Error("Missing image reference.")));
      resolve({imageUrl:result.secure_url,publicId:result.public_id});
    });
    stream.end(file.buffer);
  });
}

export async function uploadPublicTestimonialFile(file,assetType){
  if(!isConfigured){
    const error=new Error("Image and voice uploads are not configured. Add Cloudinary credentials to the server environment.");
    error.status=503;
    throw error;
  }
  const detected=await fileTypeFromBuffer(file.buffer);
  const resourceType=assetType==="photo"?"image":"video";
  const supportedTypes=assetType==="photo"
    ?["image/jpeg","image/png","image/webp"]
    :["audio/mpeg","audio/mp4","audio/ogg","audio/wav","audio/webm","video/webm","video/mp4"];
  if(!detected||!supportedTypes.includes(detected.mime)){
    const error=new Error(assetType==="photo"?"Upload a valid JPG, PNG, or WebP profile photo.":"Upload a supported MP3, MP4, OGG, WAV, or WebM voice recording.");
    error.status=400;
    throw error;
  }
  return new Promise((resolve,reject)=>{
    const stream=cloudinary.uploader.upload_stream({
      folder:"xyron-webtech/testimonials",
      resource_type:resourceType,
      allowed_formats:assetType==="photo"?["jpg","png","webp"]:["mp3","mp4","ogg","wav","webm"]
    },(error,result)=>{
      if(error)return reject(storageFailure(error));
      if(!result?.secure_url||!result?.public_id)return reject(storageFailure(new Error("Missing testimonial media reference.")));
      resolve({imageUrl:result.secure_url,publicId:result.public_id});
    });
    stream.end(file.buffer);
  });
}

export async function deleteStoreImage(publicId){
  if(!isConfigured)return false;
  const result=await cloudinary.uploader.destroy(publicId,{resource_type:"image"});
  return result.result==="ok"||result.result==="not found";
}

export async function deletePublicAsset(publicId,resourceType){
  if(!isConfigured)return false;
  const result=await cloudinary.uploader.destroy(publicId,{resource_type:resourceType});
  return result.result==="ok"||result.result==="not found";
}

export async function uploadPrivatePaymentProof(file,orderNumber){
  if(!isConfigured){
    const error=new Error("Image uploads are not configured. Add Cloudinary credentials to the server environment.");
    error.status=503;
    throw error;
  }
  const detected=await fileTypeFromBuffer(file.buffer);
  if(!detected||!["image/jpeg","image/png","image/webp"].includes(detected.mime)){
    const error=new Error("Upload a valid JPG, PNG, or WebP payment proof.");
    error.status=400;
    throw error;
  }
  return new Promise((resolve,reject)=>{
    const stream=cloudinary.uploader.upload_stream({
      folder:`xyron-wholesale/payment-proofs/${orderNumber}`,
      resource_type:"image",
      type:"authenticated",
      allowed_formats:["jpg","png","webp"],
      transformation:[{width:1600,height:1600,crop:"limit",quality:"auto",fetch_format:"auto"}]
    },(error,result)=>{
      if(error)return reject(storageFailure(error));
      if(!result?.public_id)return reject(storageFailure(new Error("Missing payment proof reference.")));
      resolve({publicId:result.public_id});
    });
    stream.end(file.buffer);
  });
}

export function getPrivatePaymentProofUrl(publicId){
  if(!isConfigured)return "";
  return cloudinary.url(publicId,{resource_type:"image",type:"authenticated",secure:true,sign_url:true});
}

export async function deletePrivatePaymentProof(publicId){
  if(!isConfigured)return false;
  const result=await cloudinary.uploader.destroy(publicId,{resource_type:"image",type:"authenticated"});
  return result.result==="ok"||result.result==="not found";
}

export async function uploadPrivateChatVoice(file,businessId,orderNumber){
  if(!isConfigured){
    const error=new Error("Voice messages are not configured. Add Cloudinary credentials to the server environment.");
    error.status=503;
    throw error;
  }
  const detected=await fileTypeFromBuffer(file.buffer);
  const supportedTypes=["audio/mpeg","audio/mp4","audio/ogg","audio/wav","audio/webm","video/webm","video/mp4"];
  if(!detected||!supportedTypes.includes(detected.mime)){
    const error=new Error("Upload a supported MP3, MP4, OGG, WAV, or WebM voice recording.");
    error.status=400;
    throw error;
  }
  return new Promise((resolve,reject)=>{
    const stream=cloudinary.uploader.upload_stream({
      folder:`xyron-wholesale/${businessId}/order-voice/${orderNumber}`,
      resource_type:"video",
      type:"authenticated",
      allowed_formats:["mp3","mp4","ogg","wav","webm"]
    },(error,result)=>{
      if(error)return reject(storageFailure(error));
      if(!result?.public_id||!result?.format)return reject(storageFailure(new Error("Missing voice message reference.")));
      resolve({publicId:result.public_id,format:result.format});
    });
    stream.end(file.buffer);
  });
}

export function getPrivateChatVoiceUrl(publicId,format){
  if(!isConfigured)return "";
  return cloudinary.url(publicId,{resource_type:"video",type:"authenticated",secure:true,sign_url:true,format});
}

export async function deletePrivateChatVoice(publicId){
  if(!isConfigured)return false;
  const result=await cloudinary.uploader.destroy(publicId,{resource_type:"video",type:"authenticated"});
  return result.result==="ok"||result.result==="not found";
}
