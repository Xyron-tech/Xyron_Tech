import assert from "node:assert/strict";
import test from "node:test";
import {groupCatalogProductsBySection} from "./storeSectionCatalog.js";

test("groups catalog products in configured order and retains products outside sections",()=>{
  const products=[{_id:"p1",name:"Tea"},{_id:"p2",name:"Rice"},{_id:"p3",name:"Oil"}];
  const sections=[
    {_id:"s1",title:"Pantry",productIds:["p2","p1","missing","p2"]},
    {_id:"s2",title:"Empty",productIds:["missing"]}
  ];

  const catalog=groupCatalogProductsBySection(products,sections);

  assert.deepEqual(catalog.sections.map(group=>({
    title:group.section.title,
    products:group.products.map(product=>product._id)
  })),[{title:"Pantry",products:["p2","p1"]}]);
  assert.deepEqual(catalog.unassignedProducts.map(product=>product._id),["p3"]);
});

test("returns the full product list as unassigned when no sections are configured",()=>{
  const products=[{_id:"p1"},{_id:"p2"}];

  assert.deepEqual(groupCatalogProductsBySection(products,[]),{
    sections:[],
    unassignedProducts:products
  });
});
