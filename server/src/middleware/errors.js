export function notFound(req,res){res.status(404).json({message:"Route not found."});}
export function errorHandler(err,req,res,next){
 if(err?.code===11000)return res.status(409).json({message:err.keyPattern?.name?"A product with this name already exists in your store.":"A record with these details already exists."});
 if(err?.name==="ValidationError")return res.status(400).json({message:"Please check the submitted details."});
 if(err?.name==="CastError")return res.status(400).json({message:"Invalid resource identifier."});
 if(err?.name==="MulterError"&&err.code==="LIMIT_FILE_SIZE")return res.status(413).json({message:"Each uploaded file must be 5 MB or smaller."});
 if(err?.name==="MulterError")return res.status(400).json({message:"The file upload could not be processed. Check the selected file and try again."});
 if(typeof err?.message==="string"&&err.message.startsWith("Multipart:"))return res.status(400).json({message:"The file upload was incomplete. Please choose the file again and retry."});
 if(err?.status&&err.status>=400&&err.status<600)return res.status(err.status).json({message:err.message});
 if(process.env.NODE_ENV!=="production")console.error(err);
 res.status(500).json({message:"An unexpected server error occurred. Please try again; contact support if it continues."});
}
