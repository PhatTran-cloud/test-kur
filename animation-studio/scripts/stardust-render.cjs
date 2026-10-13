const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');
const preflight=spawnSync('python',[path.join(__dirname,'v6_session.py'),'check','legacy-render','stardust-to-human'],{encoding:'utf8'});
if(preflight.status!==0){
 console.error(preflight.stderr||preflight.error?.message||'V6_PROTOCOL: session preflight failed');
 process.exit(1);
}
const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderStill,renderMedia}=require('@remotion/renderer');

(async()=>{
 const reviewFlags=['--qa','--motion','--probe','--natural-qa','--human-audit','--revisions-qa','--revisions-probe','--opening-qa','--opening-probe','--street-qa','--street-probe','--motion-audit','--continuity-probe','--timeline-qa','--timeline-probe','--events-qa','--chapter1-probe'];
 if(!reviewFlags.some(flag=>process.argv.includes(flag))&&!process.argv.includes('--approved-final')){
  throw new Error('Final export is locked pending user approval. Use --opening-qa for review; --approved-final requires explicit user approval.');
 }
 const studio=path.resolve(__dirname,'..');
 const out=path.resolve(studio,'../output/stardust-to-human');
 const render=path.join(out,'render');
 const qa=path.join(render,'qa');
 fs.mkdirSync(qa,{recursive:true});
 const timeline=JSON.parse(fs.readFileSync(path.join(out,'timeline.json'),'utf8'));
 const serveUrl=await bundle({entryPoint:path.join(studio,'src/stardust-entry.tsx'),rootDir:studio,
  webpackOverride:config=>({...config,resolve:{...config.resolve,modules:[path.join(studio,'node_modules'),...(config.resolve.modules||[])],alias:{...config.resolve.alias,'@remotion/three':path.join(studio,'node_modules/@remotion/three/dist/esm/index.mjs'),'@react-three/fiber':path.join(studio,'node_modules/@react-three/fiber'),'three':path.join(studio,'node_modules/three')}}})});
 const browser=await openBrowser('chrome',{chromiumOptions:{gl:'angle'}});
 try{
  const composition=await selectComposition({serveUrl,id:'StardustToHuman',puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
  console.log(JSON.stringify({id:composition.id,durationInFrames:composition.durationInFrames,width:composition.width,height:composition.height}));
  if(process.argv.includes('--events-qa')){
   const samples=[];
   for(const kind of ['hand','bang','star','supernova']){
    const shot=timeline.shots.find(s=>s.kind===kind),end=timeline.shots[timeline.shots.indexOf(shot)+1].frame;
    for(const offset of (kind==='hand'?[0,30,120]:[18,27,40,48,65,100,180])){
     if(shot.frame+offset>=end)continue;
     const file=path.join(render,`event-${kind}-${offset}.jpg`);
     await renderStill({serveUrl,composition,frame:shot.frame+offset,imageFormat:'jpeg',jpegQuality:94,scale:.5,output:file,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
     samples.push({kind,offset,frame:shot.frame+offset,file});console.log(`Event review: ${kind} +${offset}`);
    }
   }
   fs.writeFileSync(path.join(render,'events-frames.json'),JSON.stringify(samples,null,2));
  } else if(process.argv.includes('--chapter1-probe')){
   await renderMedia({serveUrl,composition,codec:'h264',outputLocation:path.join(render,'preview-chapter1.mp4'),frameRange:[timeline.chapters[1].frame,timeline.chapters[2].frame-1],scale:.5,imageFormat:'jpeg',jpegQuality:92,crf:18,concurrency:2,puppeteerInstance:browser,chromiumOptions:{gl:'angle'},onProgress:p=>{if(p.renderedFrames%120===0)console.log(`Chapter 1 probe: ${p.renderedFrames}`)}});
   console.log('Chapter 1 review clip completed');
  } else if(process.argv.includes('--timeline-qa')){
   const base=timeline.shots.find(s=>s.kind==='calendar').frame;
   const samples=[];
   for(const offset of [45,165,255,330,390,460,590,665,785,965]){
    const file=path.join(render,`timeline-${offset}.jpg`);
    await renderStill({serveUrl,composition,frame:base+offset,imageFormat:'jpeg',jpegQuality:94,scale:.5,output:file,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
    samples.push({frame:base+offset,file});console.log(`Timeline review: ${offset}`);
   }fs.writeFileSync(path.join(render,'timeline-frames.json'),JSON.stringify(samples,null,2));
  } else if(process.argv.includes('--timeline-probe')){
   const shot=timeline.shots.find(s=>s.kind==='calendar'),last=timeline.shots.find(s=>s.frame>shot.frame&&s.kind!=='calendar').frame;
   await renderMedia({serveUrl,composition,codec:'h264',outputLocation:path.join(render,'preview-timeline.mp4'),frameRange:[shot.frame,last-1],scale:.5,imageFormat:'jpeg',jpegQuality:92,crf:18,concurrency:2,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
   console.log('Calendar timeline review clip completed');
  } else if(process.argv.includes('--motion-audit')){
   const samples=[];
   for(let index=0;index<timeline.shots.length;index++){
    const shot=timeline.shots[index],end=timeline.shots[index+1]?.frame||timeline.frames-60;
    const duration=end-shot.frame;
    for(const offset of [Math.floor(duration*.55),Math.floor(duration*.82)]){
     const file=path.join(render,`audit-${String(index).padStart(2,'0')}-${offset}.jpg`);
     await renderStill({serveUrl,composition,frame:shot.frame+offset,imageFormat:'jpeg',jpegQuality:90,scale:.5,output:file,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
     samples.push({index,kind:shot.kind,frame:shot.frame+offset,file});
    }console.log(`Motion audit ${index+1}/${timeline.shots.length}: ${shot.kind}`);
   }fs.writeFileSync(path.join(render,'motion-audit.json'),JSON.stringify(samples,null,2));
  } else if(process.argv.includes('--continuity-probe')){
   const boundary=timeline.shots.find(s=>s.title.includes('2.4 BILLION')).frame;
   await renderMedia({serveUrl,composition,codec:'h264',outputLocation:path.join(render,'preview-oxygen-continuity.mp4'),frameRange:[boundary-45,boundary+75],scale:.5,imageFormat:'jpeg',jpegQuality:92,crf:18,concurrency:2,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
   console.log('Repeated scene continuity probe completed');
  } else if(process.argv.includes('--street-qa')){
   for(const offset of [0,18,90,180,240,258,269,290])await renderStill({serveUrl,composition,frame:timeline.shots[0].frame+offset,imageFormat:'jpeg',jpegQuality:94,scale:.5,output:path.join(render,`street-${offset}.jpg`),puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
   console.log('Street camera and transition preview snapshots completed');
  } else if(process.argv.includes('--street-probe')){
   await renderMedia({serveUrl,composition,codec:'h264',outputLocation:path.join(render,'preview-street-transition.mp4'),frameRange:[timeline.shots[0].frame,timeline.shots[0].frame+330],scale:.5,imageFormat:'jpeg',jpegQuality:92,crf:18,concurrency:2,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
   console.log('Street camera and transition review clip completed');
  } else if(process.argv.includes('--opening-qa')){
   const shots=timeline.shots.filter(s=>s.frame<2980);
   const samples=[];
   for(const shot of shots){
    const index=timeline.shots.indexOf(shot),end=timeline.shots[index+1]?.frame||timeline.frames;
    for(const offset of [18,60,Math.min(180,end-shot.frame-1),end-shot.frame-1]){
     const file=path.join(render,`opening-${shot.kind}-${shot.frame}-${offset}.jpg`);
     await renderStill({serveUrl,composition,frame:shot.frame+offset,imageFormat:'jpeg',jpegQuality:94,scale:.5,output:file,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
     samples.push({kind:shot.kind,frame:shot.frame+offset,file});
    }console.log(`Opening preview QA: ${shot.kind}`);
   }fs.writeFileSync(path.join(render,'opening-frames.json'),JSON.stringify(samples,null,2));
  } else if(process.argv.includes('--opening-probe')){
   const shot=timeline.shots.find(s=>s.kind===(process.argv.includes('--supernova')?'supernova':'bang'));
   const index=timeline.shots.indexOf(shot),end=timeline.shots[index+1].frame-1;
   await renderMedia({serveUrl,composition,codec:'h264',outputLocation:path.join(render,`preview-${shot.kind}.mp4`),frameRange:[shot.frame,process.argv.includes('--quick')?shot.frame+100:end],scale:.5,imageFormat:'jpeg',jpegQuality:92,crf:18,concurrency:3,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
   console.log(`Review clip completed: ${shot.kind}`);
  } else if(process.argv.includes('--revisions-qa')){
   for(const kind of ['elements','supernova','hand','thaw','pangea','asteroid','impact']){
    const shot=timeline.shots.find(s=>s.kind===kind),index=timeline.shots.indexOf(shot),end=timeline.shots[index+1]?.frame||timeline.frames;
    for(const offset of [6,60,Math.min(180,end-shot.frame-1),end-shot.frame-1]){
     await renderStill({serveUrl,composition,frame:shot.frame+offset,imageFormat:'jpeg',jpegQuality:92,scale:.5,output:path.join(render,`revised-${kind}-${offset}.jpg`),puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
    }console.log(`Revised QA: ${kind}`);
   }
  } else if(process.argv.includes('--revisions-probe')){
   await renderMedia({serveUrl,composition,codec:'h264',outputLocation:path.join(render,'asteroid-impact-probe.mp4'),frameRange:[12630,13130],imageFormat:'jpeg',jpegQuality:92,crf:18,concurrency:3,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
   console.log('Asteroid approach and impact probe completed');
  } else if(process.argv.includes('--human-audit')){
   const shot=timeline.shots.find(s=>s.kind==='human');
   for(const [label,view] of [['front',.39],['profile',1.96],['three-quarter',-.32],['back',3.53],['hero',-.32]]){
    await renderStill({serveUrl,composition,frame:shot.frame+60,inputProps:{humanView:view},imageFormat:'jpeg',jpegQuality:92,scale:.5,output:path.join(render,`human-audit-${label}.jpg`),puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
   }console.log('Human anatomy audit: five views');
  } else if(process.argv.includes('--natural-qa')){
   const targets=process.argv.includes('--human-asteroid')?['hand','human','cave','asteroid']:process.argv.includes('--volcano-only')?['volcano']:['asteroid','dinosaur','vents','cells','forest','mammal','human','ocean','volcano','cambrian','hand','rain','zircon','fish','cave','plants'];
   const samples=[];for(const kind of targets){const shot=timeline.shots.find(s=>s.kind===kind);const index=timeline.shots.indexOf(shot);const end=timeline.shots[index+1]?.frame||timeline.frames-60;
    for(const offset of [60,180]){const frame=Math.min(shot.frame+offset,end-1);const file=path.join(render,`natural-${kind}-${offset}.jpg`);await renderStill({serveUrl,composition,frame,imageFormat:'jpeg',jpegQuality:92,scale:.5,output:file,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});samples.push({kind,frame,file});}console.log(`Natural QA: ${kind}`);}
   fs.writeFileSync(path.join(render,'natural-frames.json'),JSON.stringify(samples));
  } else if(process.argv.includes('--probe')){
   await renderMedia({serveUrl,composition,codec:'h264',outputLocation:path.join(render,'transition-probe.mp4'),frameRange:[850,1150],imageFormat:'jpeg',jpegQuality:92,crf:18,concurrency:3,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
   console.log('Continuous transition probe completed');
  } else if(process.argv.includes('--motion')){
   const targets=['meteors','theia','collision','debris','moon','disk','crust','thaw','earth'];
   const samples=[];
   for(const kind of targets){const shot=timeline.shots.find(s=>s.kind===kind);const index=timeline.shots.indexOf(shot);const end=timeline.shots[index+1]?.frame||timeline.frames-60;
    for(const offset of [20,90,180]){const frame=Math.min(shot.frame+offset,end-1);const file=path.join(render,`motion-${kind}-${offset}.jpg`);await renderStill({serveUrl,composition,frame,imageFormat:'jpeg',jpegQuality:92,scale:.5,output:file,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});samples.push({kind,frame,file});}}
   fs.writeFileSync(path.join(render,'motion-frames.json'),JSON.stringify(samples));console.log(`Motion snapshots: ${samples.length}`);
  } else if(process.argv.includes('--qa')){
   const frames=timeline.shots.map((s,i)=>Math.min(s.frame+60,(timeline.shots[i+1]?.frame||timeline.frames-60)-1));
   frames.push(0,30,timeline.frames-30,timeline.frames-1);
   for(let i=0;i<frames.length;i+=4){
    const results=await Promise.allSettled(frames.slice(i,i+4).map((frame,j)=>renderStill({serveUrl,composition,frame,imageFormat:'jpeg',jpegQuality:88,scale:.5,output:path.join(qa,`${String(i+j).padStart(2,'0')}-${frame}.jpg`),puppeteerInstance:browser,chromiumOptions:{gl:'angle'}})));
    for(const r of results)if(r.status==='rejected')throw r.reason;
    console.log(`QA snapshots ${Math.min(i+4,frames.length)}/${frames.length}`);
   }
   fs.writeFileSync(path.join(qa,'frames.json'),JSON.stringify(frames));
  } else {
   let last=-1;
   const pendingFinal=path.join(render,'final-rendering.mp4');
   await renderMedia({serveUrl,composition,codec:'h264',outputLocation:pendingFinal,imageFormat:'jpeg',jpegQuality:92,crf:18,x264Preset:'fast',colorSpace:'bt709',concurrency:3,puppeteerInstance:browser,chromiumOptions:{gl:'angle'},
    onProgress:p=>{const bucket=Math.floor(p.progress*100);if(bucket!==last){last=bucket;console.log(`Render ${bucket}% - ${p.renderedFrames}/${composition.durationInFrames} frames`);}}});
   if(fs.existsSync(path.join(render,'final.mp4')))fs.renameSync(path.join(render,'final.mp4'),path.join(render,`final-before-${Date.now()}.mp4`));
   fs.renameSync(pendingFinal,path.join(render,'final.mp4'));
   console.log(`Completed: ${path.join(render,'final.mp4')}`);
  }
 }finally{await browser.close({silent:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
