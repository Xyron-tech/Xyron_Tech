import assert from "node:assert/strict";
import {mock,test} from "node:test";
import Business from "../models/Business.js";
import Order from "../models/Order.js";
import SupportConversation from "../models/SupportConversation.js";
import {getBusinessInboxCounts,getCustomerInboxCounts} from "./supportController.js";

function response(){
  return {statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};
}

test("business inbox counts include unread order chat messages",async t=>{
  t.mock.method(Order,"countDocuments",async filter=>filter.status==="PLACED"?2:0);
  t.mock.method(SupportConversation,"countDocuments",async()=>3);
  t.mock.method(Order,"find",()=>({select(){return this;},async lean(){return [{unreadBusinessMessages:2},{unreadBusinessMessages:4}];}}));
  const res=response();

  await getBusinessInboxCounts({tenantId:"business-id"},res);

  assert.deepEqual(res.body,{pendingOrders:2,unreadConversations:3,unreadOrderMessages:6});
});

test("customer inbox counts are scoped to the signed-in customer and store",async t=>{
  const businessQuery={select:async()=>({_id:"business-id"})};
  t.mock.method(Business,"findOne",filter=>{
    assert.deepEqual(filter,{slug:"test-store",status:"ACTIVE"});
    return businessQuery;
  });
  t.mock.method(Order,"find",filter=>{
    assert.deepEqual(filter,{businessId:"business-id",customerId:"customer-id",customerArchivedAt:null,unreadCustomerMessages:{$gt:0}});
    return {select(){return this;},async lean(){return [{unreadCustomerMessages:1},{unreadCustomerMessages:3}];}};
  });
  const res=response();

  await getCustomerInboxCounts({params:{slug:"test-store"},customer:{_id:"customer-id"}},res);

  assert.deepEqual(res.body,{unreadOrderMessages:4});
});
