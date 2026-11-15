import assert from "node:assert/strict";
import test from "node:test";
import {paymentReferenceSchema} from "./paymentReference.js";

test("payment reference is optional when submitting proof",()=>{
  assert.equal(paymentReferenceSchema.safeParse(undefined).success,true);
  assert.equal(paymentReferenceSchema.safeParse("").success,true);
  assert.equal(paymentReferenceSchema.safeParse(" ABC123 ").data,"ABC123");
});

test("provided payment references must match the supported format and length",()=>{
  for(const reference of ["abc", "ABC 123", "A".repeat(41), "ABC_123"]){
    assert.equal(paymentReferenceSchema.safeParse(reference).success,false);
  }
});
