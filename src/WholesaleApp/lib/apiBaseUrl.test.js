import assert from "node:assert/strict";
import {test} from "node:test";
import {resolveApiBaseUrl} from "./apiBaseUrl.js";

test("adds the API path when configured with a backend origin",()=>{
  assert.equal(resolveApiBaseUrl("https://xyron-wholesale.onrender.com",false,"/api"),"https://xyron-wholesale.onrender.com/api");
});

test("preserves an API path and removes trailing slashes",()=>{
  assert.equal(resolveApiBaseUrl("https://xyron-wholesale.onrender.com/api///",false,"/api"),"https://xyron-wholesale.onrender.com/api");
});

test("uses the same-origin API path in production",()=>{
  assert.equal(resolveApiBaseUrl("https://api.example.test",true,"https://shop.example.test/api"),"https://shop.example.test/api");
});

test("uses the fallback when no API URL is configured",()=>{
  assert.equal(resolveApiBaseUrl("",false,"/api"),"/api");
});
