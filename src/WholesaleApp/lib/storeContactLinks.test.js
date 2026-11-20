import test from "node:test";
import assert from "node:assert/strict";
import {getStorePhoneHref,getStoreWhatsAppNumber} from "./storeContactLinks.js";

test("normalizes Indian store phone numbers for calling",()=>{
  assert.equal(getStorePhoneHref("98765 43210"),"tel:+919876543210");
  assert.equal(getStorePhoneHref("09876543210"),"tel:+919876543210");
  assert.equal(getStorePhoneHref("+91 98765 43210"),"tel:+919876543210");
});

test("formats Indian store numbers for WhatsApp links",()=>{
  assert.equal(getStoreWhatsAppNumber("98765 43210"),"919876543210");
  assert.equal(getStoreWhatsAppNumber("09876543210"),"919876543210");
  assert.equal(getStoreWhatsAppNumber("+91 98765 43210"),"919876543210");
});
