import test from "node:test";
import assert from "node:assert/strict";
import {findPincodeDetails} from "./pincodeDirectory.js";

test("reads location details from the supplied PIN database",t=>{
  let details;
  try{details=findPincodeDetails("110001");}
  catch(error){if(error.status===503){t.skip(error.message);return;}throw error;}
  assert.deepEqual(details,{pincode:"110001",district:"NEW DELHI",state:"DELHI",circle:"DELHI CIRCLE",lat:28.619861,lng:77.212917,centroidGrade:"B"});
});
test("rejects invalid PIN formats without accessing the directory",()=>{
  assert.throws(()=>findPincodeDetails("000001"),/valid 6-digit/);
});
test("does not invent details for a missing PIN",t=>{
  let details;
  try{details=findPincodeDetails("999998");}
  catch(error){if(error.status===503){t.skip(error.message);return;}throw error;}
  assert.equal(details,null);
});
