import assert from "node:assert/strict";
import test from "node:test";
import {getAnalyticsDateRange} from "./analyticsPeriod.js";

test("today analytics starts at midnight in India Standard Time",()=>{
  const now=new Date("2026-03-15T12:34:56.000Z");
  const {start,end}=getAnalyticsDateRange("today",now);
  assert.equal(start.toISOString(),"2026-03-14T18:30:00.000Z");
  assert.equal(end.toISOString(),now.toISOString());
});

test("weekly and monthly analytics use rolling seven- and thirty-day ranges",()=>{
  const now=new Date("2026-03-15T12:34:56.000Z");
  assert.equal(getAnalyticsDateRange("week",now).start.toISOString(),"2026-03-08T12:34:56.000Z");
  assert.equal(getAnalyticsDateRange("month",now).start.toISOString(),"2026-02-13T12:34:56.000Z");
});

test("analytics rejects unsupported periods",()=>{
  assert.throws(()=>getAnalyticsDateRange("year",new Date()),/supported analytics period/);
});
