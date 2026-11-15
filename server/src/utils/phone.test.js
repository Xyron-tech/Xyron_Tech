import test from "node:test";
import assert from "node:assert/strict";
import {isValidPhone,normalizePhone} from "./phone.js";

test("normalizes common mobile number formatting",()=>{
  assert.equal(normalizePhone("+91 98765-43210"),"919876543210");
  assert.equal(isValidPhone("+91 98765-43210"),true);
});

test("rejects phone numbers outside the supported digit range",()=>{
  assert.equal(isValidPhone("123456789"),false);
  assert.equal(isValidPhone("1234567890123456"),false);
});
