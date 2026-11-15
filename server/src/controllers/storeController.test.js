import assert from "node:assert/strict";
import {test} from "node:test";
import Business from "../models/Business.js";
import Product from "../models/Product.js";
import {updateStoreSections} from "./storeController.js";

test("saves storefront sections containing active products from the business",async t=>{
  const productId="507f1f77bcf86cd799439011";
  const business={
    _id:"507f1f77bcf86cd799439012",
    ownerId:"507f1f77bcf86cd799439013",
    slug:"test-store",
    status:"ACTIVE",
    subscriptionPlan:"STARTER",
    async save(){}
  };
  t.mock.method(Business,"findOne",async()=>business);
  t.mock.method(Product,"find",()=>({
    select(){return this;},
    async lean(){return [{_id:productId}];}
  }));
  const response={
    statusCode:200,
    status(code){this.statusCode=code;return this;},
    json(payload){this.payload=payload;return this;}
  };

  await updateStoreSections({
    tenantId:business._id,
    user:{_id:business.ownerId},
    body:{sections:[{title:"Best sellers",productIds:[productId]}]}
  },response);

  assert.equal(response.statusCode,200);
  assert.equal(response.payload.message,"Store sections saved.");
  assert.equal(response.payload.business.storeSections[0].title,"Best sellers");
});
