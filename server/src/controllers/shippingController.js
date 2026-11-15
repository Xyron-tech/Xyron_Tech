import {findPincodeDetails,listPincodeRegions} from "../services/pincodeDirectory.js";

export async function getPincodeDetails(req,res){
  let details;
  try{details=findPincodeDetails(req.params.pincode);}
  catch(error){return res.status(error.status||400).json({message:error.message});}
  if(!details)return res.status(404).json({message:"This PIN code is not present in the supplied PIN directory."});
  res.json({details});
}

export function getPincodeRegions(req,res){
  try{return res.json({regions:listPincodeRegions()});}
  catch(error){return res.status(error.status||500).json({message:error.message});}
}
