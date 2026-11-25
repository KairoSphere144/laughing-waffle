import test from "node:test";
import assert from "node:assert/strict";
import { formatHumanOutput, parseObjectInput, processObjectCommand } from "../src/nexus-console.js";
test("registers object with space, ID and unverified identity",()=>{const o=parseObjectInput("Workshop pump",1);assert.equal(o.object_id,"OBJ-1-1");assert.equal(o.space_id,"SPACE-1");assert.equal(o.identity_status,"identified-unverified");assert.equal(o.physical_actuation,false);});
test("rejects blank and oversized descriptions",()=>{assert.throws(()=>parseObjectInput("  "));assert.throws(()=>parseObjectInput("x".repeat(501));});
test("commands produce simulated attributed results",()=>{const o=parseObjectInput("Valve model",2);const r=processObjectCommand(o,"simulate");assert.equal(r.result_status,"simulated");assert.match(r.verification,/not a physical/i);assert.equal(r.object_id,o.object_id);});
test("blocks unsupported commands",()=>{assert.throws(()=>processObjectCommand(parseObjectInput("Valve",1),"open"));});
test("human output includes signal result source and next action",()=>{const out=formatHumanOutput({operation_id:"NEX-1",object_id:"OBJ-1-1",command:"simulate",result_status:"simulated",result:"Simulation done",source:"demo",timestamp:"2026-11-25T12:00Z",verification:"Not physical"});assert.match(out,/STATUS: SIMULATED/);assert.match(out,/RESULT: Simulation done/);assert.match(out,/SOURCE: demo/);assert.match(out,/NEXT:/);});
