import test from "node:test";
import assert from "node:assert/strict";
import {calculateRegionalDeliveryChargePaisa} from "./deliveryPricing.js";

test("prices an order from its actual weight without rounding to whole kilograms",()=>{
  assert.equal(calculateRegionalDeliveryChargePaisa(1500,10000),15000);
  assert.equal(calculateRegionalDeliveryChargePaisa(1250,8500),10625);
});

test("rounds calculated fractional paise to the nearest paisa",()=>{
  assert.equal(calculateRegionalDeliveryChargePaisa(1001,1),1);
});

test("rejects invalid weights and regional rates",()=>{
  assert.throws(()=>calculateRegionalDeliveryChargePaisa(0,1000),/positive number/);
  assert.throws(()=>calculateRegionalDeliveryChargePaisa(1000,-1),/non-negative whole number/);
});
