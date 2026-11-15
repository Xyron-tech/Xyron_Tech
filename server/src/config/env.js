import {fileURLToPath} from "node:url";import dotenv from "dotenv";import {z} from "zod";
dotenv.config({path:fileURLToPath(new URL("../../../.env",import.meta.url))});
const schema=z.object({
  NODE_ENV:z.enum(["development","test","production"]).default("development"),
  PORT:z.coerce.number().int().positive().default(5000),
  CLIENT_ORIGIN:z.string().url().default("http://localhost:5173"),
  JWT_SECRET:z.string().min(32),
  JWT_EXPIRES_IN:z.string().default("8h"),
  MONGODB_URI:z.string().min(1),
  XYRON_PIN_DATABASE_PATH:z.string().trim().optional(),
  SUPER_ADMIN_NAME:z.string().default("Xyron Super Admin"),
  SUPER_ADMIN_EMAIL:z.string().email().optional(),
  SUPER_ADMIN_PASSWORD:z.string().min(12).optional(),
  CLOUDINARY_URL:z.string().trim().optional(),
  CLOUDINARY_CLOUD_NAME:z.string().optional(),
  CLOUDINARY_API_KEY:z.string().optional(),
  CLOUDINARY_API_SECRET:z.string().optional()
}).superRefine((value,ctx)=>{
  const configured=[value.CLOUDINARY_CLOUD_NAME,value.CLOUDINARY_API_KEY,value.CLOUDINARY_API_SECRET].filter(Boolean).length;
  if(value.CLOUDINARY_URL){
    try{
      const url=new URL(value.CLOUDINARY_URL);
      if(url.protocol!=="cloudinary:"||!url.hostname||!url.username||!url.password||/[<>]/.test(value.CLOUDINARY_URL))throw new Error();
    }catch{
      ctx.addIssue({code:"custom",message:"CLOUDINARY_URL must be cloudinary://<api_key>:<api_secret>@<cloud_name> with real values.",path:["CLOUDINARY_URL"]});
    }
  }else if(configured!==0&&configured!==3){
    ctx.addIssue({code:"custom",message:"Configure all three Cloudinary environment variables or leave all unset.",path:["CLOUDINARY_CLOUD_NAME"]});
  }
});
export const env=schema.parse(process.env);
