import assert from "node:assert/strict";
import {mock,test} from "node:test";
import Business from "../models/Business.js";
import BusinessApplication from "../models/BusinessApplication.js";
import {updateBusinessPlan} from "./superAdminController.js";

test("Super Admin can enable and disable analytics for an active Pro business",async()=>{
  const business={
    _id:"000000000000000000000001",
    status:"ACTIVE",
    subscriptionPlan:"PRO",
    subscriptionFeatures:{advancedSeo:false,quickReplies:false,analytics:false},
    async save(){},
    markModified(){}
  };
  const findBusiness=mock.method(Business,"findById",async()=>business);
  const updateApplication=mock.method(BusinessApplication,"updateOne",async()=>({}));
  const response={statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};
  try{
    await updateBusinessPlan({params:{id:business._id},body:{plan:"PRO",features:{analytics:true}}},response);
    assert.equal(response.statusCode,200);
    assert.equal(response.body.business.subscriptionFeatures.analytics,true);
    await updateBusinessPlan({params:{id:business._id},body:{plan:"PRO",features:{analytics:false}}},response);
    assert.equal(response.body.business.subscriptionFeatures.analytics,false);
  }finally{
    findBusiness.mock.restore();
    updateApplication.mock.restore();
  }
});
