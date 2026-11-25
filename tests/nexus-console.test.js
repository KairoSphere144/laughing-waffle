import test from "node:test";
import assert from "node:assert/strict";
import { parseObjectInput, processObjectCommand } from "../src/nexus-console.js";

test("registers user-described object in space one without claiming verification", () => {
 const obj=parseObjectInput("Workshop pump",1);
 assert.equal(obj.object_id,"OBJ-1-1"); assert.equal(obj.space_id,"SPACE-1");
 assert.equal(obj.identity_status,"identified-unverified"); assert.equal(obj.physical_actuation,false);
});
test("rejects empty or oversized object input", () => {
 assert.throws(()=>parseObjectInput("  "));
 assert.throws(()=>parseObjectInput("x".repeat(501)));
});
test("commands return provenance and simulated status", () => {
 const obj=parseObjectInput("Valve model",2);
 const response=processObjectCommand(obj,"simulate");
 assert.equal(response.result_status,"simulated");
 assert.match(response.verification,/not a physical/i);
 assert.equal(response.object_id,obj.object_id);
});
test("unsupported and actuating commands are blocked", () => {
 const obj=parseObjectInput("Valve",1);
 assert.throws(()=>processObjectCommand(obj,"open"));
});
