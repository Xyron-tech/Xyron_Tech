import test from "node:test";
import assert from "node:assert/strict";
import {getPincodeDetails} from "./shippingController.js";

function mockResponse(){return{statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};}

test("PIN lookup returns the address region needed for customer delivery details",async t=>{
  const response=mockResponse();
  await getPincodeDetails({params:{pincode:"600001"}},response);
  if(response.statusCode===503){t.skip(response.body.message);return;}
  assert.equal(response.statusCode,200);
  assert.equal(response.body.details.pincode,"600001");
  assert.ok(response.body.details.district);
  assert.ok(response.body.details.state);
});

test("PIN lookup reports invalid and unknown PINs",async t=>{
  const invalid=mockResponse();
  await getPincodeDetails({params:{pincode:"12345"}},invalid);
  assert.equal(invalid.statusCode,400);
  assert.match(invalid.body.message,/valid 6-digit/);

  const unknown=mockResponse();
  await getPincodeDetails({params:{pincode:"999998"}},unknown);
  if(unknown.statusCode===503){t.skip(unknown.body.message);return;}
  assert.equal(unknown.statusCode,404);
  assert.match(unknown.body.message,/not present/);
});
