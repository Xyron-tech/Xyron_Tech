import test from "node:test";
import assert from "node:assert/strict";
import {canAddProduct,canAddSlide,getPlanFeatureDefaults,hasBusinessFeature} from "./businessPlans.js";

test("Starter and Growth plans enforce their product and slider caps",()=>{
  assert.equal(canAddProduct({subscriptionPlan:"STARTER"},24),true);
  assert.equal(canAddProduct({subscriptionPlan:"STARTER"},25),false);
  assert.equal(canAddProduct({subscriptionPlan:"GROWTH"},49),true);
  assert.equal(canAddProduct({subscriptionPlan:"GROWTH"},50),false);
  assert.equal(canAddSlide({subscriptionPlan:"STARTER"},2),true);
  assert.equal(canAddSlide({subscriptionPlan:"STARTER"},3),false);
  assert.equal(canAddSlide({subscriptionPlan:"GROWTH"},5),true);
  assert.equal(canAddSlide({subscriptionPlan:"GROWTH"},6),false);
});

test("Pro products remain unlimited and feature availability is tenant-specific",()=>{
  assert.equal(canAddProduct({subscriptionPlan:"PRO"},100000),true);
  const features=getPlanFeatureDefaults("PRO");
  assert.equal(features.analytics,true);
  assert.equal(hasBusinessFeature({subscriptionFeatures:{analytics:false}},"analytics"),false);
  assert.equal(hasBusinessFeature({subscriptionFeatures:{analytics:true}},"analytics"),true);
});
