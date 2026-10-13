import {AnimatedShaderMaterial} from './AnimatedShaderMaterial';
import React, {useLayoutEffect, useMemo} from 'react';
import {FilmCanvas as ThreeCanvas} from './FilmCanvas';
import {useThree} from '@react-three/fiber';
import {useVideoConfig, interpolate, getInputProps,staticFile} from 'remotion';
import {Environment} from '@react-three/drei';
import * as THREE from 'three';
import {Human} from './HumanAsset';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type V3=[number,number,number];
type Section=[number,number,number,number,number];
const EC={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const rand=(i:number)=>{const n=Math.sin(i*127.1+19.7)*43758.5453;return n-Math.floor(n);};
const field=(x:number,z:number)=>Math.sin(x*.39+Math.cos(z*.3))*.24+Math.cos(z*.51-x*.13)*.18+Math.sin(x*1.7+z*.8)*.055;

// Elliptical sections follow a transported curve frame; silhouette and skin share one surface.
function loft(sections:Section[],steps=72,sides=24){
 const curve=new THREE.CatmullRomCurve3(sections.map(s=>new THREE.Vector3(s[0],s[1],s[2])),false,'centripetal');
 const frames=curve.computeFrenetFrames(steps,false),positions:number[]=[],uv:number[]=[],indices:number[]=[];
 for(let i=0;i<=steps;i++){const t=i/steps,q=t*(sections.length-1),j=Math.min(sections.length-2,Math.floor(q)),f=q-j;
  const ry=THREE.MathUtils.lerp(sections[j][3],sections[j+1][3],f),rz=THREE.MathUtils.lerp(sections[j][4],sections[j+1][4],f),p=curve.getPointAt(t);
  for(let k=0;k<=sides;k++){const a=k/sides*Math.PI*2;const v=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*ry).addScaledVector(frames.binormals[i],Math.sin(a)*rz);positions.push(v.x,v.y,v.z);uv.push(t,k/sides);if(i<steps&&k<sides){const n=i*(sides+1)+k;indices.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g;
}
function texture(seed:number,colors:[string,string],scalePattern=false){
 const a=new THREE.Color(colors[0]),b=new THREE.Color(colors[1]),size=256,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const wave=(Math.sin(x*.063+Math.sin(y*.08)*1.7)+Math.cos(y*.043))* .15+.5;
  const grain=rand(x+y*size+seed)*.13;const cells=scalePattern?Math.pow(Math.abs(Math.sin(x*.26+(Math.floor(y/12)%2)*1.5)*Math.sin(y*.26)),.4)*.25:0;
  const c=a.clone().lerp(b,Math.min(1,wave+grain+cells)).convertLinearToSRGB();const i=(y*size+x)*4;data[i]=c.r*255;data[i+1]=c.g*255;data[i+2]=c.b*255;data[i+3]=255;}
 const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;
}
const skin=texture(71,['#24392e','#98a171'],true),bark=texture(13,['#171e17','#69694d']),soil=texture(23,['#111715','#57604c']),fur=texture(94,['#262426','#8f8070']),rock=texture(60,['#172328','#718082']);
skin.repeat.set(4,2);bark.repeat.set(2,9);soil.repeat.set(12,12);rock.repeat.set(4,4);
const Sculpt:React.FC<{sections:Section[];color?:string;map?:THREE.Texture;roughness?:number}>=({sections,color='#a6aa8a',map=skin,roughness=.76})=>{
 const sectionsKey=JSON.stringify(sections);
 const geometry=useMemo(()=>loft(sections),[sectionsKey]);
 return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.045} roughness={roughness}/></mesh>;
};
const sphere=new THREE.SphereGeometry(1,24,16);
const Orb:React.FC<{position?:V3;scale?:V3;color?:string;map?:THREE.Texture;roughness?:number}>=({position=[0,0,0],scale=[1,1,1],color='#82916d',map,roughness=.8})=><mesh geometry={sphere} position={position} scale={scale} castShadow receiveShadow><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.035} roughness={roughness}/></mesh>;
const Digit:React.FC<{points:V3[];radius:number;color:string}>=({points,radius,color})=>{
 const pointsKey=JSON.stringify(points);
 const g=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),18,radius,8,false),[pointsKey,radius]);
 return <mesh geometry={g} castShadow><meshStandardMaterial color={color} roughness={.7}/></mesh>;
};
const Teeth:React.FC<{count:number;length:number;y:number;z:number;up?:boolean}>=({count,length,y,z,up=false})=><>{Array.from({length:count},(_,i)=><mesh key={i} position={[.1+i*length/(count-1),y,z]} rotation={[up?0:Math.PI,0,0]} castShadow><coneGeometry args={[.034+(i%3)*.004,.16+(i%4)*.025,10]}/><meshStandardMaterial color="#d7cbb0" roughness={.5}/></mesh>)}</>;

export const Dinosaur:React.FC<{age:number}>=({age})=>{
 const breath=Math.sin(age*.035)*.018,jaw=interpolate(age,[0,60,130,220],[.03,.24,.2,.045],EC),gait=Math.sin(age*.025)*.045;
 const torso:Section[]=[[-5.4,2.05,0,.012,.012],[-4.6,2.1,0,.12,.11],[-3.4,2.13,0,.26,.25],[-2.3,2.08,0,.49,.43],[-1.2,2.17,0,.83,.69],[-.15,2.22,0,.78,.66],[.7,2.29,0,.5,.43],[1.1,2.8,0,.38,.34],[1.65,3.35,0,.38,.36],[2.05,3.45,0,.36,.38]];
 return <group position={[.6,.05,-.1]} rotation={[0,-.22,0]} scale={[1,1+breath,1]}>
  <Sculpt sections={torso} color="#899479"/>
  <group position={[1.85,3.38,0]} rotation={[0,0,Math.sin(age*.016)*.03]}>
   <Sculpt sections={[[-.3,.01,0,.33,.36],[0,.16,0,.45,.43],[.45,.15,0,.39,.42],[1.1,.04,0,.27,.3],[1.32,-.01,0,.18,.27],[1.4,-.03,0,.015,.02]]} color="#91987d"/>
   <Orb position={[.42,-.14,0]} scale={[.63,.17,.34]} color="#1e171b"/>
   <group position={[-.05,-.16,0]} rotation={[0,0,-jaw]}>
    <Sculpt sections={[[0,0,0,.15,.32],[.4,-.05,0,.16,.35],[1,-.06,0,.1,.25],[1.34,-.035,0,.02,.08]]} color="#a0a486"/>
    <Teeth count={11} length={1.12} y={.075} z={.26} up/><Teeth count={11} length={1.12} y={.075} z={-.26} up/>
   </group>
   <Teeth count={12} length={1.15} y={-.1} z={.31}/><Teeth count={12} length={1.15} y={-.1} z={-.31}/>
   {[-1,1].map(side=><group key={side}>
    <Orb position={[.06,.27,side*.415]} scale={[.105,.09,.045]} color="#c4a251" roughness={.3}/>
    <Orb position={[.083,.275,side*.446]} scale={[.027,.054,.014]} color="#060805" roughness={.15}/>
    <Orb position={[1.1,.1,side*.28]} scale={[.054,.03,.02]} color="#172119"/>
    <Digit points={[[-.12,.37,side*.42],[.06,.4,side*.44],[.25,.31,side*.415]]} radius={.055} color="#6e7e61"/>
   </group>)}
  </group>
  {[-1,1].map(side=><group key={side} position={[-1.03,2.02,side*.52]} rotation={[0,0,side*gait]}>
   <Sculpt sections={[[0,.25,0,.26,.28],[.3,-.2,side*.03,.4,.3],[.54,-.74,side*.06,.27,.24],[.5,-.97,side*.09,.16,.16]]} color="#838e73"/>
   <group position={[.5,-.94,side*.09]} rotation={[0,0,-side*gait*.7]}>
    <Sculpt sections={[[0,.1,0,.14,.16],[-.25,-.37,0,.13,.13],[-.35,-.8,0,.115,.115],[-.17,-1.04,0,.08,.09]]} color="#8b957a"/>
    <Orb position={[-.08,-1.06,.04]} scale={[.33,.11,.19]} color="#758164" map={skin}/>
    {[-1,0,1].map(toe=><group key={toe}><Digit points={[[-.2,-1.06,toe*.15],[.18,-1.09,toe*.2],[.45,-1.1,toe*.2]]} radius={.075} color="#788467"/><mesh position={[.49,-1.085,toe*.2]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.068,.17,12]}/><meshStandardMaterial color="#393c2b"/></mesh></group>)}
   </group>
  </group>)}
  {[-1,1].map(side=><group key={side} position={[.65,2.36,side*.38]} rotation={[0,side*.3,-.28]}>
   <Sculpt sections={[[0,0,0,.11,.12],[.1,-.22,side*.08,.095,.095],[.32,-.34,side*.1,.065,.065],[.38,-.34,side*.1,.045,.045]]} color="#919d80"/>
   {[0,1].map(i=><Digit key={i} points={[[.34,-.34,side*(.08+i*.075)],[.51,-.31,side*(.08+i*.075)],[.54,-.4,side*(.08+i*.075)]]} radius={.027} color="#dad0a7"/>)}
  </group>)}
 </group>;
};

function fernGeometry(){
 const parts:THREE.BufferGeometry[]=[];
 for(let frond=0;frond<9;frond++){const angle=frond*2.399,curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(Math.cos(angle)*.45,1.3,Math.sin(angle)*.45),new THREE.Vector3(Math.cos(angle)*1.75,1.5,Math.sin(angle)*1.75)]);
  parts.push(new THREE.TubeGeometry(curve,18,.018,5,false));
  for(let k=2;k<17;k++){const t=k/18,p=curve.getPoint(t),size=Math.sin(t*Math.PI)*.4;
   for(const side of [-1,1]){const shape=new THREE.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(size*.4,size*.1,size,0);shape.quadraticCurveTo(size*.35,-size*.12,0,0);const leaf=new THREE.ShapeGeometry(shape,3);leaf.rotateX(-Math.PI/2);leaf.rotateY(-angle+side*.65);leaf.translate(p.x,p.y,p.z);parts.push(leaf);}}
 }
 return mergeGeometries(parts,false)!;
}
const fernMesh=fernGeometry();
const Fern:React.FC<{position?:V3;scale?:number;age:number;seed?:number}>=({position=[0,0,0],scale=1,age,seed=0})=><group position={position} scale={scale} rotation={[Math.sin(age*.015+seed)*.012,seed*2.399,Math.cos(age*.019+seed)*.012]}><mesh geometry={fernMesh} castShadow><meshStandardMaterial color={seed%2?'#7b9850':'#4d7942'} roughness={.8} side={THREE.DoubleSide}/></mesh></group>;
function treeGeometry(seed:number){
 const wood:THREE.BufferGeometry[]=[],leaves:THREE.BufferGeometry[]=[];
 const trunk=new THREE.Vector3(0,0,0);const top=new THREE.Vector3(.25,6+rand(seed)*2,.1);
 wood.push(loft([[0,0,0,.24,.24],[.08,2,0,.17,.17],[.16,4,.05,.105,.105],[top.x,top.y,top.z,.03,.03]],32,9));
 for(let level=0;level<6;level++)for(let arm=0;arm<4;arm++){
  const a=arm*Math.PI*.5+level*.55+seed,base=new THREE.Vector3(.1,2.5+level*.7,0),length=(1-level*.105)*2.5;
  const end=new THREE.Vector3(Math.cos(a)*length,base.y+1,Math.sin(a)*length);
  wood.push(loft([[base.x,base.y,base.z,.09,.09],[(base.x+end.x)*.5,base.y+.35,(base.z+end.z)*.5,.045,.045],[end.x,end.y,end.z,.008,.008]],12,6));
  for(let k=0;k<18;k++){const t=.14+k*.045,pos=base.clone().lerp(end,t);for(const side of [-1,1]){const length=.7*(1-t*.65),verts=[0,0,0,length*.45,.04,.09,length,0,0,length*.45,-.01,-.09];const leaf=new THREE.BufferGeometry();leaf.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));leaf.setIndex([0,1,2,0,2,3]);leaf.computeVertexNormals();leaf.rotateY(-a+side*.8);leaf.rotateZ(.15);leaf.translate(pos.x,pos.y+.03,pos.z);leaves.push(leaf);}}
 }
 return {wood:mergeGeometries(wood,false)!,leaves:mergeGeometries(leaves,false)!};
}
const treePresets=[0,1,2].map(treeGeometry);
const Tree:React.FC<{position:V3;scale:number;seed:number;age:number}>=({position,scale,seed,age})=>{
 const g=treePresets[seed%3];
 return <group position={position} scale={scale} rotation={[0,seed*2.399,Math.sin(age*.008+seed)*.006]}>
  <mesh geometry={g.wood} castShadow receiveShadow><meshStandardMaterial color="#80765d" map={bark} bumpMap={bark} bumpScale={.06} roughness={.95}/></mesh>
  <mesh geometry={g.leaves} castShadow><meshStandardMaterial color={seed%2?'#35563a':'#487044'} roughness={.87} side={THREE.DoubleSide}/></mesh>
 </group>;
};

const Terrain:React.FC<{underwater?:boolean;volcanic?:boolean;cave?:boolean}>=({underwater=false,volcanic=false,cave=false})=>{
 const geometry=useMemo(()=>{const g=new THREE.PlaneGeometry(70,70,140,140);g.rotateX(-Math.PI/2);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);let h=field(x,z);if(volcanic){const d=Math.hypot(x,z+8);h+=Math.max(0,6.6-d*.75)*(1-Math.exp(-d*d*1.3));}p.setY(i,h-.15);}g.computeVertexNormals();return g;},[volcanic]);
 return <mesh geometry={geometry} receiveShadow><meshStandardMaterial color={underwater?'#667472':volcanic?'#787575':cave?'#93765a':'#6d7355'} map={volcanic?rock:soil} bumpMap={volcanic?rock:soil} bumpScale={.09} roughness={volcanic?.73:.96}/></mesh>;
};
const Rocks:React.FC<{count?:number;underwater?:boolean}>=({count=40,underwater=false})=><>{Array.from({length:count},(_,i)=>{const x=(rand(i+77)-.5)*26,z=(rand(i+4)-.5)*22,s=.2+rand(i+52)*.7;return <mesh key={i} position={[x,field(x,z)+s*.35,z]} scale={[s*1.3,s*.7,s]} rotation={[rand(i),rand(i+1)*6,rand(i+2)]} castShadow receiveShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={underwater?'#637f76':'#64705d'} map={rock} roughness={.92}/></mesh>;})}</>;

const waterVertex=`uniform float time;varying vec3 vWorld;varying float crest;
void main(){vec3 p=position;float a=sin(p.x*.7+p.z*.43-time*.045),b=sin(p.x*1.8-p.z*.6+time*.07);p.y+=a*.18+b*.065;crest=a*.18+b*.065;vec4 w=modelMatrix*vec4(p,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const waterFragment=`precision highp float;uniform float time;varying vec3 vWorld;varying float crest;
void main(){float a=vWorld.x*.7+vWorld.z*.43-time*.045,b=vWorld.x*1.8-vWorld.z*.6+time*.07;vec3 n=normalize(vec3(-.126*cos(a)-.117*cos(b),1.,-.0774*cos(a)+.039*cos(b)));vec3 v=normalize(cameraPosition-vWorld);vec3 sun=normalize(vec3(-.3,.65,.6));float fresnel=.02+.98*pow(1.-max(0.,dot(v,n)),5.);float glint=pow(max(0.,dot(reflect(-sun,n),v)),110.);vec3 sky=mix(vec3(.2,.4,.49),vec3(.7,.77,.75),max(0.,reflect(-v,n).y));vec3 col=mix(vec3(.012,.11,.13),sky,fresnel)+vec3(.9,.8,.55)*glint*1.8;float foam=smoothstep(.21,.245,crest);col=mix(col,vec3(.5,.65,.65),foam*.3);gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const Water:React.FC<{age:number}>=({age})=>{
 const geometry=useMemo(()=>{const g=new THREE.PlaneGeometry(100,100,120,120);g.rotateX(-Math.PI/2);return g;},[]);
 return <mesh geometry={geometry} position={[0,.2,0]}><AnimatedShaderMaterial vertexShader={waterVertex} fragmentShader={waterFragment} uniforms={{time:{value:age}}}/></mesh>;
};

const membraneVertex=`varying vec3 vN,vV,vP;uniform float time;
void main(){vec3 p=position;float wobble=sin(position.x*3.+time*.025)*sin(position.y*2.+time*.019)*.035;p+=normal*wobble;vec4 w=modelViewMatrix*vec4(p,1.);vN=normalize(normalMatrix*normal);vV=normalize(-w.xyz);vP=position;gl_Position=projectionMatrix*w;}`;
const membraneFragment=`varying vec3 vN,vV,vP;uniform vec3 tint;
void main(){float edge=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.3);float light=max(0.,dot(normalize(vN),normalize(vec3(-.5,.8,1.))));float granules=pow(abs(sin(vP.x*33.)*sin(vP.y*38.)*sin(vP.z*43.)),8.);vec3 col=tint*(.3+.7*light)+vec3(.7,.95,.68)*edge*.7+granules*.07;gl_FragColor=vec4(col,.17+edge*.7);}`;
export const Cell:React.FC<{age:number;seed:number;position:V3;scale:number;division?:boolean}>=({age,seed,position,scale,division})=>{
 const split=division?interpolate((age+seed*17)%300,[0,100,210,299],[0,.1,.9,0],EC):0;
 return <group position={position} scale={scale} rotation={[age*.003+seed,age*.001,Math.sin(age*.006+seed)*.1]}>
  {[-1,1].map(side=><group key={side} position={[side*split*.8,0,0]} scale={side===1?1-interpolate(split,[0,.25],[0,.22],EC):interpolate(split,[0,.25],[.001,.78],EC)}>
   <mesh scale={[1.5,1,1]}><sphereGeometry args={[1,48,32]}/><AnimatedShaderMaterial vertexShader={membraneVertex} fragmentShader={membraneFragment} uniforms={{time:{value:age},tint:{value:new THREE.Color(seed%2?'#78aa5e':'#479790')}}} transparent depthWrite={false}/></mesh>
   <Digit points={Array.from({length:16},(_,i)=>[-.9+i*.12,Math.sin(i*1.4+seed)*.18,Math.cos(i*1.4+seed)*.22] as V3)} radius={.05} color="#e3ca8b"/>
   {Array.from({length:18},(_,i)=><Orb key={i} position={[(rand(i+seed*7)-.5)*1.8,(rand(i+41)-.5)*1.1,(rand(i+76)-.5)*1.1]} scale={[.055,.055,.055]} color={i%3?'#a1b985':'#d7a693'}/>)}
  </group>)}
  <group position={[-1.3,0,0]} rotation={[Math.sin(age*.06)*.2,Math.cos(age*.06)*.07,0]}><Digit points={Array.from({length:20},(_,i)=>[-i*.09,Math.sin(i*.5)*i*.014,Math.cos(i*.5)*i*.014] as V3)} radius={.014} color="#a4bb7b"/></group>
 </group>;
};
const Motes:React.FC<{age:number;underwater?:boolean;ash?:boolean}>=({age,underwater=false,ash=false})=>{
 const geometry=useMemo(()=>{const positions=new Float32Array(1500*3);for(let i=0;i<1500;i++){positions[i*3]=(rand(i)-.5)*36;positions[i*3+1]=rand(i+20)*14;positions[i*3+2]=(rand(i+38)-.5)*28;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));return g;},[]);
 return <points geometry={geometry} position={[Math.sin(age*.005)*.1,underwater?age*.001%1:-age*.001%1,0]}><pointsMaterial color={ash?'#c8c6c0':underwater?'#88d0c8':'#eadbb6'} size={ash?.035:.018} transparent opacity={.48} depthWrite={false}/></points>;
};
const Vent:React.FC<{age:number;position:V3;seed:number}>=({age,position,seed})=>{
 const body=useMemo(()=>loft([[0,0,0,.75,.7],[.1,.6,0,.65,.58],[-.1,1.3,.05,.5,.4],[.1,2.3,0,.33,.27],[0,2.65,0,.26,.26]],38,18),[]);
 return <group position={position} scale={1+seed*.12}><mesh geometry={body} castShadow><meshStandardMaterial color="#627276" map={rock} bumpMap={rock} bumpScale={.15} roughness={.98}/></mesh>
  <mesh position={[0,2.64,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.26,.07,8,20]}/><meshStandardMaterial color="#787b68" roughness={.9}/></mesh>
  {Array.from({length:22},(_,i)=>{const p=(age*.035+i*.28)%6;return <mesh key={i} position={[Math.sin(p*.7+seed)*p*.1,2.7+p,Math.cos(p+seed)*p*.09]} scale={[.23+p*.17,.4+p*.12,.23+p*.17]}><sphereGeometry args={[1,10,8]}/><meshBasicMaterial color="#061d20" transparent opacity={.23*(1-p/7)} depthWrite={false}/></mesh>;})}
 </group>;
};

const Fish:React.FC<{age:number;cambrian?:boolean}>=({age,cambrian=false})=>{
 const color=cambrian?'#ba795a':'#6c8271';
 return <group rotation={[0,-.15,Math.sin(age*.025)*.04]}>
  <Sculpt sections={[[-2,0,0,.02,.02],[-1.25,0,0,.23,.26],[-.3,0,0,.47,.5],[.75,.08,0,.42,.43],[1.25,.08,0,.29,.28],[1.65,.04,0,.1,.15]]} color={color}/>
  {[-1,1].map(side=><group key={side}><Orb position={[1.05,.23,side*.28]} scale={[.16,.16,.1]} color="#baaa65" roughness={.35}/><Orb position={[1.1,.24,side*.36]} scale={[.09,.09,.025]} color="#060c0b" roughness={.2}/>
   {Array.from({length:cambrian?11:2},(_,i)=>{const x=cambrian?-1.25+i*.22:i===0?.55:-.65;
    return <group key={i} position={[x,-.12,side*.29]} rotation={[Math.sin(age*.055-i*.6)*.3,0,side*.4]}><Sculpt sections={[[0,0,0,.09,.07],[-.15,-.07,side*.28,.1,.08],[-.32,-.09,side*.65,.06,.015],[-.55,-.15,side*.82,.005,.005]]} color={cambrian?'#c5a078':'#91a082'} roughness={.6}/></group>;
   })}
   {cambrian&&<Digit points={[[1.5,-.1,side*.18],[1.95,-.25,side*.32],[2.1,-.7,side*.3],[1.75,-.94,side*.23]]} radius={.095} color="#d6b491"/>}
  </group>)}
  {!cambrian&&<group position={[-1.5,0,0]} rotation={[0,Math.sin(age*.05)*.2,0]}><Sculpt sections={[[0,0,0,.2,.065],[-.5,.25,0,.42,.04],[-.75,.05,0,.5,.015]]} color="#8e9c83"/></group>}
 </group>;
};
const Mammal:React.FC<{age:number}>=({age})=><group rotation={[0,-.2,0]}>
 <Sculpt map={fur} color="#b1a497" sections={[[-1.25,.5,0,.035,.035],[-.9,.78,0,.42,.34],[0,.73,0,.45,.36],[.6,.77,0,.3,.28],[1,.8,0,.24,.25],[1.45,.65,0,.04,.05]]}/>
 <group position={[-1.12,.48,0]} rotation={[0,Math.sin(age*.025)*.15,0]}><Digit points={Array.from({length:18},(_,i)=>[-i*.13,Math.sin(i*.2)*.16,Math.sin(i*.28)*.26] as V3)} radius={.055} color="#8b7365"/></group>
 {[-1,1].map(side=><group key={side}>
  <Orb position={[.85,1.04,side*.23]} scale={[.22,.26,.075]} color="#a18d7c" map={fur}/><Orb position={[.85,1.04,side*.288]} scale={[.15,.19,.013]} color="#aa7e74"/>
  <Orb position={[1.11,.83,side*.19]} scale={[.067,.073,.04]} color="#080b09" roughness={.15}/>
  {[-.75,.62].map((x,i)=><group key={i} position={[x,.58,side*.26]} rotation={[0,0,Math.sin(age*.04+side+i)*.04]}><Digit points={[[0,0,0],[i?-.13:.18,-.26,side*.04],[.06,-.46,side*.06]]} radius={i?.07:.12} color="#978977"/><Orb position={[.17,-.48,side*.06]} scale={[.2,.06,.09]} color="#998574"/></group>)}
 </group>)}<Orb position={[1.45,.66,0]} scale={[.08,.07,.08]} color="#393332" roughness={.4}/>
 {[-1,1].map(side=>[0,1,2].map(i=><Digit key={`${side}-${i}`} points={[[1.26,.66,side*.075],[1.46,.72+i*.035,side*.26],[1.59,.75+i*.05,side*.45]]} radius={.005} color="#c9c5b7"/>))}
</group>;


const Rain:React.FC<{age:number}>=({age})=>{
 const g=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(650*6),3));return g;},[]);
 const p=g.attributes.position;for(let i=0;i<650;i++){const x=(rand(i)-.5)*30,y=(rand(i+1)*16-age*.32%16+16)%16,z=(rand(i+3)-.5)*24;p.setXYZ(i*2,x,y,z);p.setXYZ(i*2+1,x-.04,y-.55,z);}p.needsUpdate=true;
 return <lineSegments geometry={g}><lineBasicMaterial color="#a1c3c5" transparent opacity={.38}/></lineSegments>;
};
const Lava:React.FC<{age:number;impact?:boolean}>=({age,impact=false})=>{
 const path=useMemo(()=>loft([[0,6,-8,.1,.12],[.4,4,-6,.18,.35],[1.1,2,-4,.14,.65],[1.5,.45,-1,.09,.9],[3,.04,3,.06,1.4]],80,18),[]);
 return <><mesh geometry={path}><meshStandardMaterial color="#f78029" emissive="#e64b05" emissiveIntensity={2} roughness={.35}/></mesh>
  {Array.from({length:90},(_,i)=>{const p=(age*.035+i*.14)%4,a=i*2.399;return <mesh key={i} position={[Math.cos(a)*p*(impact?2:.7),6+p*3-p*p*1.1,-8+Math.sin(a)*p]} scale={.03+rand(i)*.065}><sphereGeometry args={[1,6,4]}/><meshBasicMaterial color="#ffb64e"/></mesh>;})}
  {Array.from({length:18},(_,i)=>{const p=(age*.014+i*.55)%11;return <mesh key={i} position={[p*.18,6+p,-8+Math.sin(p*.6)*.4]} scale={[.7+p*.16,.8+p*.1,.6+p*.15]}><sphereGeometry args={[1,12,8]}/><meshBasicMaterial color="#605c5a" transparent opacity={.13*(1-p/14)} depthWrite={false}/></mesh>;})}
 </>;
};

const Camera:React.FC<{kind:string;age:number}>=({kind,age})=>{
 const {camera}=useThree();
 useLayoutEffect(()=>{const t=1.7*(1-Math.exp(-age/210))+Math.sin(age/180)*.12;let p:V3=[4.5-t,3.3,10.5-t*.7],target:V3=[0,1.7,0];
  if(['ocean','rain'].includes(kind)){p=[3-t,4.5,11-t];target=[0,.7,-5];}
  if(kind==='dinosaur'){p=[6-t,3.7,11.8-t];target=[-.15,1.8,0];}
  if(['cells','slime','oxygen'].includes(kind)){p=[.7-t*.5,2.6,9.8-t*.7];target=[0,1.8,0];}
  if(kind==='cambrian'){p=[3.5-t,3.3,11.5-t];target=[0,2,0];}
  if(kind==='mammal'){p=[3.6-t*.3,1.7,6.2-t*.4];target=[0,.65,0];}
  if(kind==='hand'){p=[.38-t*.05,2.50,1.37-t*.03];target=[0,2.40,.1];}
  if(['volcano','impact','ash'].includes(kind)){p=[10-t*2,6,18-t*2];target=[0,3,-7];}
  if(kind==='zircon'){p=[3,2.2,7-t*.5];target=[0,1.4,0];}
  if(kind==='human'||kind==='cave'){p=[2.8-t*.5,2.5,6.9-t*.5];target=[0,1.6,0];}
  camera.position.set(...p);camera.lookAt(...target);camera.updateProjectionMatrix();
 },[camera,kind,age]);return null;
};
const ModernRoom:React.FC=()=>{
 const box=(key:string,p:V3,s:V3,c:string)=><mesh key={key} position={p} scale={s} castShadow receiveShadow><boxGeometry/><meshStandardMaterial color={c} roughness={.8}/></mesh>;
 return <>
  {box('floor',[0,.03,0],[14,.05,12],'#777c7d')}
  {box('wall',[0,2.5,-3.5],[14,5,.1],'#bac2c6')}
  {box('window',[1.8,2.7,-3.42],[3.7,3,.05],'#6f93a0')}
  {[0,1,2,3,4,5,6].map(i=>box(`city${i}`,[-.03+i*.52,1.7+(i%3)*.13,-3.37],[.34,1.1+(i%3)*.25,.06],'#526c7b'))}
  {[0,1,2].map(i=>box(`frame${i}`,[-.1+i*1.8,2.7,-3.25],[.045,3.1,.12],'#e4e6e5'))}
  {box('frame-top',[1.8,4.23,-3.25],[3.9,.055,.12],'#e4e6e5')}
  {box('frame-bottom',[1.8,1.17,-3.25],[3.9,.055,.12],'#e4e6e5')}
  {box('sofa',[-2.7,.55,-2.2],[2.3,.6,1.0],'#4e626d')}
  {box('sofa-back',[-2.7,1.0,-2.6],[2.3,.7,.22],'#5a6d75')}
  {box('phone',[-1.8,1.32,-1.55],[.13,.025,.26],'#172025')}
  {box('side-table',[-1.8,.65,-1.55],[.6,1.3,.6],'#646c70')}
  <pointLight position={[2.8,3.8,-2]} color="#dbe9ef" intensity={18} distance={10}/>
 </>;
};
const NaturalContent:React.FC<{kind:string;age:number}>=({kind,age})=>{
 const sea=['vents','cells','slime','oxygen','cambrian'].includes(kind),micro=['cells','slime','oxygen'].includes(kind),volcanic=['volcano','impact','ash'].includes(kind),wet=['ocean','rain'].includes(kind);
 const night=kind==='mammal'||kind==='cave';const bg=sea?'#06242d':volcanic?'#242527':night?'#112024':'#748a8b';
 return <>
  <Camera kind={kind} age={age}/><color attach="background" args={[bg]}/><fog attach="fog" args={[bg,sea?8:12,sea?28:45]}/>
  <ambientLight intensity={kind==='hand'?.18:sea?.9:night?.48:1.1}/><hemisphereLight args={[sea?'#7dbebd':'#cddac7',sea?'#163a39':'#505a39',kind==='hand'?.6:sea?1.1:1.6]}/>
  <directionalLight position={[-5,9,6]} intensity={kind==='hand'?2.5:sea?2:night?1.1:3} color={sea?'#9cdddd':night?'#a1c4d0':'#f5e2bf'} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-normalBias={.015}/>
  <directionalLight position={[6,4,-6]} intensity={kind==='hand'?.8:sea?1.5:night?1.2:2.2} color={sea?'#35a6a3':'#c5dacd'}/>
  {kind==='hand'?<Environment files={staticFile('models/human/lebombo_2k.hdr')} background backgroundBlurriness={.035} backgroundIntensity={.8} environmentIntensity={.65} backgroundRotation={[0,1.8,0]} environmentRotation={[0,1.8,0]}/>:<><Terrain underwater={sea} volcanic={volcanic} cave={kind==='cave'}/><Rocks underwater={sea}/><Motes age={age} underwater={sea} ash={kind==='ash'}/></>}
  {!sea&&!volcanic&&!wet&&kind!=='hand'&&kind!=='zircon'&&<>
   {Array.from({length:22},(_,i)=>{const x=(i%2?1:-1)*(3+rand(i+12)*12),z=-3-rand(i+5)*20;return <Tree key={i} position={[x,field(x,z),z]} scale={.7+rand(i+39)*.8} seed={i} age={age}/>;})}
   {Array.from({length:24},(_,i)=>{const x=(i%2?1:-1)*(2.5+rand(i+30)*7),z=(rand(i+34)-.5)*16;return <Fern key={i} position={[x,field(x,z),z]} scale={.25+rand(i+6)*.5} seed={i} age={age}/>;})}
  </>}
  {kind==='dinosaur'&&<Dinosaur age={age}/>}
  {kind==='fish'&&<group position={[0,.78,0]} scale={1.3}><Fish age={age}/></group>}
  {kind==='mammal'&&<Mammal age={age}/>}
  {kind==='human'&&<Human age={age} view={(getInputProps() as {humanView?:number}).humanView}/>}
  {kind==='hand'&&<Human age={age} close/>}
  {kind==='plants'&&<Fern position={[0,.1,0]} scale={1.65} age={age}/>}
  {sea&&Array.from({length:12},(_,i)=><mesh key={i} position={[-14+i*2.5,5,-8]} rotation={[0,0,-.35]}><cylinderGeometry args={[.05,1,16,6,1,true]}/><meshBasicMaterial color="#8de8da" transparent opacity={.018} depthWrite={false} side={THREE.DoubleSide}/></mesh>)}
  {kind==='vents'&&[0,1,2,3].map((i)=><Vent key={i} position={[(i-1.5)*2.8,field((i-1.5)*2.8,-i),-i]} seed={i} age={age}/>)}
  {micro&&Array.from({length:kind==='slime'?18:6},(_,i)=><Cell key={i} position={[(i%3-1)*3.2,kind==='slime'?.5:1.8+Math.sin(age*.015+i)*.15,-Math.floor(i/3)*2.5]} scale={kind==='slime'?.75:1} seed={i} age={age} division={kind==='cells'}/>)}
  {kind==='oxygen'&&Array.from({length:32},(_,i)=><mesh key={i} position={[(rand(i+75)-.5)*11,(age*.027+i*.23)%8-.3,(rand(i+19)-.5)*6]}><sphereGeometry args={[.07+rand(i)*.13,16,12]}/><meshPhysicalMaterial color="#adc8c7" metalness={.15} roughness={.08} transparent opacity={.25} clearcoat={1} depthWrite={false}/></mesh>)}
  {kind==='cambrian'&&[0,1,2].map(i=><group key={i} position={[(i-1)*3.7+Math.sin(age*.007+i)*.4,2+i*.6,-i*2]} scale={i===0?1:.65}><Fish age={age+i*40} cambrian/></group>)}
  {wet&&<Water age={age}/>}{kind==='rain'&&<Rain age={age}/>}
  {volcanic&&kind!=='ash'&&<><Lava age={age} impact={kind==='impact'}/><pointLight position={[0,6,-7]} color="#ff6d24" intensity={35} distance={25}/></>}
  {kind==='impact'&&<mesh position={[0,4,-7]} scale={Math.min(12,age*.08+.2)}><sphereGeometry args={[1,32,20]}/><meshBasicMaterial color="#ffddb1" transparent opacity={interpolate(age,[0,30,120],[.9,.4,0],EC)} depthWrite={false}/></mesh>}
  {kind==='cave'&&<><mesh position={[0,3,-2.4]} scale={[6,3.5,1]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#806a51" map={rock} bumpMap={rock} bumpScale={.12} roughness={1}/></mesh><group position={[0,0,.4]}><Human age={age}/></group><pointLight position={[-2,.8,1]} intensity={10+Math.sin(age*.15)*2} color="#ff9f4c" distance={12}/><mesh position={[-2,.4,1]} scale={[.2,.55,.2]}><coneGeometry args={[1,1,12]}/><meshBasicMaterial color="#ffac4f"/></mesh></>}
  {kind==='zircon'&&<group position={[0,1.5,0]} rotation={[.25,age*.006,.12]}><mesh scale={[.8,1.65,.8]}><octahedronGeometry args={[1,0]}/><meshPhysicalMaterial color="#b6d4d0" metalness={.2} roughness={.07} transmission={.45} thickness={1.4} ior={1.92} clearcoat={1}/></mesh></group>}
 </>;
};
export const NATURAL_KINDS=['hand','plants','forest','dinosaur','mammal','fish','human','ocean','vents','cells','slime','oxygen','cambrian','volcano','rain','impact','ash','zircon','cave'];
export const NaturalWorld:React.FC<{kind:string;age:number}>=({kind,age})=>{
 const {width,height}=useVideoConfig();
 return <ThreeCanvas width={width} height={height} shadows camera={{fov:42,near:.1,far:150}} style={{position:'absolute',inset:0}} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1}}><NaturalContent kind={kind} age={age}/></ThreeCanvas>;
};
