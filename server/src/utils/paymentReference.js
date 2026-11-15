import {z} from "zod";

export const paymentReferenceSchema=z.string().trim().optional().superRefine((utr,ctx)=>{
  if(utr&& !/^[A-Za-z0-9-]{6,40}$/.test(utr)){
    ctx.addIssue({code:"custom",message:"Enter a valid payment UTR (6–40 letters, numbers, or hyphens)."});
  }
});
