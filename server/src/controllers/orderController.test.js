import assert from "node:assert/strict";
import {mock,test} from "node:test";
import Order from "../models/Order.js";
import OrderMessage from "../models/OrderMessage.js";
import {updateBusinessOrderStatus} from "./orderController.js";

test("accepting an order sends a customer chat update and increments its unread count",async t=>{
  const order={_id:"order-id",businessId:"business-id",status:"PLACED",toObject(){return {...this};}};
  let createdMessage;
  let unreadUpdate;
  t.mock.method(Order,"findOne",async()=>order);
  t.mock.method(Order,"findOneAndUpdate",async()=>({...order,status:"ACCEPTED"}));
  t.mock.method(OrderMessage,"exists",async()=>null);
  t.mock.method(OrderMessage,"create",async message=>{createdMessage=message;return message;});
  t.mock.method(Order,"updateOne",async(...args)=>{unreadUpdate=args;return {matchedCount:1};});
  const res={statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};

  await updateBusinessOrderStatus({params:{id:"order-id"},tenantId:"business-id",user:{name:"Store owner"},body:{status:"ACCEPTED"}},res);

  assert.equal(res.statusCode,200);
  assert.equal(createdMessage.senderRole,"BUSINESS_OWNER");
  assert.equal(createdMessage.eventKey,"ORDER_ACCEPTED");
  assert.match(createdMessage.body,/accepted/i);
  assert.deepEqual(unreadUpdate[1],{$inc:{unreadCustomerMessages:1}});
});
