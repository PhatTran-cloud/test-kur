// Test infrastructure with synthetic authored states; no media/scene production.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const filename = path.resolve(__dirname, '../../src/v6/runtime.ts');
const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019}});
const compiled = new Module(filename, module);
compiled._compile(result.outputText, filename);
const {sampleTrack, evaluateFrame, executeShot, seededValue} = compiled.exports;
const track = {channel:'position',keyframes:[{frame:0,value:[0,0,0]},{frame:89,value:[1,0,0]}]};
assert.deepEqual(sampleTrack(track,0),[0,0,0]);
assert.deepEqual(sampleTrack(track,89),[1,0,0]);
assert.equal(sampleTrack(track,44.5)[0],0.5);
assert.throws(()=>sampleTrack({...track,keyframes:[{frame:0,value:0},{frame:0,value:1}]},1));
const inst={instance_id:'actor',asset_id:'joint',state_in:'closed',state_out:'open'};
const manifest={film_id:'test',fps:30,shots:[
  {shot_id:'first',scene_id:'scene',time:{start_frame:0,end_frame:90},instances:[inst],actions:[{action_id:'opens',instance_id:'actor',time:{start_frame:0,end_frame:90},from_state:'closed',to_state:'open',tracks:[track]}],transition_in:null,transition_out:'edge'},
  {shot_id:'second',scene_id:'scene',time:{start_frame:90,end_frame:180},instances:[{...inst,state_in:'open'}],actions:[],transition_in:'edge',transition_out:null}
]};
const direct=evaluateFrame(manifest,120);
assert.deepEqual(direct.instances.actor.channels.position,[1,0,0]);
assert.equal(direct.instances.actor.state,'open');
evaluateFrame(manifest,0);evaluateFrame(manifest,170);evaluateFrame(manifest,5);
assert.deepEqual(evaluateFrame(manifest,120),direct);
assert.equal(evaluateFrame(manifest,180),null);
assert.throws(()=>executeShot(manifest,120,{}),/Unimplemented/);
assert.equal(executeShot(manifest,120,{second:ctx=>ctx.localFrame}),30);
assert.equal(seededValue(42,5),seededValue(42,5));
assert.notEqual(seededValue(42,5),seededValue(43,5));
console.log('v6 runtime: absolute seek, state carry, track sampling and binding tests passed');
