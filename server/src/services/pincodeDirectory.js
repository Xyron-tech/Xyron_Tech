import {DatabaseSync} from "node:sqlite";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {env} from "../config/env.js";

const defaultDatabasePath=resolve(dirname(fileURLToPath(import.meta.url)),"../../../xyron_data/xyron_data.db");
const databasePath=env.XYRON_PIN_DATABASE_PATH?resolve(env.XYRON_PIN_DATABASE_PATH):defaultDatabasePath;
let pins=null;
let regionsByState=null;
let loggedUnavailable=false;

function loadDirectory(){
  if(pins)return;
  let db;
  try{
    db=new DatabaseSync(databasePath,{readOnly:true});
    db.exec("PRAGMA query_only = ON");
    const rows=db.prepare("SELECT pincode,primary_district,primary_state,primary_circle,centroid_lat,centroid_lng,centroid_grade FROM pincodes").all();
    const loadedPins=new Map(rows.map(row=>[String(row.pincode).padStart(6,"0"),{pincode:String(row.pincode).padStart(6,"0"),district:row.primary_district,state:row.primary_state,circle:row.primary_circle,lat:Number.isFinite(row.centroid_lat)?row.centroid_lat:null,lng:Number.isFinite(row.centroid_lng)?row.centroid_lng:null,centroidGrade:row.centroid_grade||null}]));
    const loadedRegions=new Map();
    for(const entry of loadedPins.values()){
      if(!entry.state||!entry.district)continue;
      if(!loadedRegions.has(entry.state))loadedRegions.set(entry.state,new Set());
      loadedRegions.get(entry.state).add(entry.district);
    }
    db.close();
    pins=loadedPins;
    regionsByState=loadedRegions;
  }catch(error){
    try{db?.close();}
    catch(closeError){console.error("Could not close the PIN directory database after a load error.",closeError);}
    if(!loggedUnavailable){
      console.error(`PIN directory unavailable at ${databasePath}. Set XYRON_PIN_DATABASE_PATH to the supplied database file.`,error);
      loggedUnavailable=true;
    }
    const unavailable=new Error("The PIN directory database is unavailable. Configure XYRON_PIN_DATABASE_PATH with the supplied database file.",{cause:error});
    unavailable.status=503;
    throw unavailable;
  }
}

export function findPincodeDetails(value){
  const pin=String(value??"").trim();
  if(!/^[1-9]\d{5}$/.test(pin))throw new Error("pincode must be a valid 6-digit Indian PIN code.");
  loadDirectory();
  return pins.get(pin)||null;
}

export function listPincodeRegions(){
  loadDirectory();
  return [...regionsByState].map(([state,districts])=>({state,districts:[...districts].sort((a,b)=>a.localeCompare(b))})).sort((a,b)=>a.state.localeCompare(b.state));
}
