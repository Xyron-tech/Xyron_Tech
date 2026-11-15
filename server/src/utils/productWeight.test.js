import test from "node:test";
import assert from "node:assert/strict";
import {calculateProductPieces,calculateProductWeight} from "./productWeight.js";

test("bundle quantity always weighs complete configured bundles",()=>{
  const bundle={weightCalculationMethod:"BUNDLE",piecesPerBundle:10,bundleWeightGrams:500};
  assert.equal(calculateProductWeight(bundle,1).weightGrams,500);
  assert.equal(calculateProductWeight(bundle,3).weightGrams,1500);
  assert.equal(calculateProductPieces(bundle,3),30);
});

test("piece quantity derives weight from pieces per kilogram, not submitted weights",()=>{
  const piece={weightCalculationMethod:"PIECE",piecesPerKg:10,packetWeightGrams:999999};
  assert.equal(calculateProductWeight(piece,1).weightGrams,100);
  assert.equal(calculateProductWeight(piece,10).weightGrams,1000);
  assert.equal(calculateProductPieces(piece,10),10);
});

test("fractional per-piece gram weights sum accurately at one kilogram",()=>{
  const piece={weightCalculationMethod:"PIECE",piecesPerKg:3};
  assert.equal(calculateProductWeight(piece,3).weightGrams,1000);
});

test("rejects invalid quantities and incomplete method-specific configuration",()=>{
  assert.throws(()=>calculateProductWeight({weightCalculationMethod:"PIECE",piecesPerKg:0},1),/pieces-per-kilogram/);
  assert.throws(()=>calculateProductWeight({weightCalculationMethod:"BUNDLE",piecesPerBundle:10},1),/bundle weight/);
  assert.throws(()=>calculateProductWeight({weightCalculationMethod:"BUNDLE",piecesPerBundle:10,bundleWeightGrams:500},0),/positive whole number/);
});
