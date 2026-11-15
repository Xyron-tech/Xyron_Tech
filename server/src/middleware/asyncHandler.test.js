import assert from "node:assert/strict";
import {test} from "node:test";
import {asyncHandler} from "./asyncHandler.js";

test("forwards rejected async handlers to Express error middleware",async()=>{
  const expected=new Error("controller failed");
  let actual;
  await asyncHandler(async()=>{throw expected;})({}, {}, error=>{actual=error;});
  assert.equal(actual,expected);
});
