import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import SupportConversation from "./SupportConversation.js";

test("support conversations retain tenant, topic, and message ownership",async()=>{
  const businessId=new mongoose.Types.ObjectId();
  const ownerId=new mongoose.Types.ObjectId();
  const conversation=new SupportConversation({
    businessId,
    subject:"  Store payment question ",
    category:"PAYMENT",
    messages:[{senderId:ownerId,senderRole:"BUSINESS_OWNER",body:"  I need help with payment setup.  "}]
  });
  await conversation.validate();
  assert.equal(conversation.businessId.toString(),businessId.toString());
  assert.equal(conversation.subject,"Store payment question");
  assert.equal(conversation.messages[0].body,"I need help with payment setup.");
  assert.equal(conversation.status,"OPEN");
});

test("support messages reject invalid sender roles",async()=>{
  const conversation=new SupportConversation({
    businessId:new mongoose.Types.ObjectId(),
    subject:"Support request",
    category:"OTHER",
    messages:[{senderId:new mongoose.Types.ObjectId(),senderRole:"CUSTOMER",body:"Invalid role"}]
  });
  await assert.rejects(conversation.validate(),error=>{
    assert.equal(error.name,"ValidationError");
    assert.ok(error.errors["messages.0.senderRole"]);
    return true;
  });
});

test("support messages enforce the message length limit",async()=>{
  const conversation=new SupportConversation({
    businessId:new mongoose.Types.ObjectId(),
    subject:"Support request",
    category:"OTHER",
    messages:[{senderId:new mongoose.Types.ObjectId(),senderRole:"BUSINESS_OWNER",body:"x".repeat(2001)}]
  });
  await assert.rejects(conversation.validate(),error=>{
    assert.equal(error.name,"ValidationError");
    assert.ok(error.errors["messages.0.body"]);
    return true;
  });
});
