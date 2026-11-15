import test from "node:test";
import assert from "node:assert/strict";
import Testimonial from "./Testimonial.js";

test("testimonial documents require consent and feedback",async()=>{
  const testimonial=new Testimonial({name:"Client"});
  await assert.rejects(testimonial.validate(),(error)=>{
    assert.equal(error.name,"ValidationError");
    assert.ok(error.errors.message);
    assert.ok(error.errors.consent);
    return true;
  });
});

test("testimonial documents default to pending review and unverified",async()=>{
  const testimonial=new Testimonial({
    name:"  Client Name ",
    message:"  Great service and support. ",
    consent:true
  });
  await testimonial.validate();
  assert.equal(testimonial.name,"Client Name");
  assert.equal(testimonial.message,"Great service and support.");
  assert.equal(testimonial.status,"PENDING");
  assert.equal(testimonial.verified,false);
});
