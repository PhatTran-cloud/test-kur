import {AnimatedShaderMaterial} from './AnimatedShaderMaterial';
import React,{useMemo,useLayoutEffect} from 'react';
import {FilmCanvas as ThreeCanvas} from './FilmCanvas';
import {useThree} from '@react-three/fiber';
import {EffectComposer,Bloom,ToneMapping} from '@react-three/postprocessing';
import {ToneMappingMode} from 'postprocessing';
import {useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {CosmicBurst,burstShake} from './CosmicBurst';

const vertex=`varying vec3 world;void main(){vec4 p=modelMatrix*vec4(position,1.);world=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`;
const fragment=`precision highp float;varying vec3 world;uniform float time;uniform float mode;
float hash(vec3 p){p=fract(p*.3183099+vec3(.17,.31,.57));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float s=0.,a=.53;for(int i=0;i<5;i++){s+=a*noise(p);p=mat3(.8,0.,.6,0.,1.,0.,-.6,0.,.8)*p*2.07+3.1;a*=.48;}return s;}
void main(){vec3 ro=cameraPosition,rd=normalize(world-ro);float b=dot(ro,rd),c=dot(ro,ro)-49.,d=b*b-c;if(d<0.)discard;float near=max(0.,-b-sqrt(d)),far=-b+sqrt(d),stepSize=(far-near)/72.;vec3 light=vec3(0.);float tr=1.;
 float burst=max(0.,time-.9);float expansion=.18+5.2*(1.-exp(-burst*.58));float flash=exp(-pow((time-.9)*3.,2.));
 for(int i=0;i<72;i++){
  vec3 p=ro+rd*(near+(float(i)+.5)*stepSize);float r=length(p);vec3 dir=p/max(r,.001);float density=0.;vec3 emission=vec3(0.);
  if(mode<.5){
   float radius=.13+time*.025;float core=exp(-r*r/(radius*radius));density=core*2.;emission=vec3(2.8,3.5,4.2)*core;
  }else if(mode<1.5){
   vec3 q=p/max(expansion,.2);float n=fbm(q*5.+vec3(time*.03,-time*.035,0.));float fil=pow(1.-abs(n*2.-1.),14.);
   float rim=exp(-pow((r-expansion*(.79+.34*fbm(dir*5.)))/(.08+expansion*.035),2.));
   float cavities=smoothstep(.48,.64,fbm(q*3.7+vec3(2.,0.,0.)));
   float body=exp(-pow(r/(expansion*.78),4.))*fil*cavities;
   float core=exp(-r*r/(.012+flash*.07))*(1.-smoothstep(1.7,3.2,time));
   density=(rim*(.13+fil)*.9+body*.8)*smoothstep(.9,1.4,time)+core*5.;
   vec3 cool=mix(vec3(.08,.25,.75),vec3(.55,1.1,1.5),n);vec3 hot=mix(vec3(1.2,.08,.012),vec3(4.,1.1,.16),fil);
   emission=mix(hot,cool,smoothstep(2.,7.,time))*(rim*.28*(.04+fil*.15)+body*.3)+vec3(12.,10.,7.)*core*(1.+flash*8.);
  }else if(mode<2.5){
   vec3 q=p; q.x+=sin(p.z*.43+time*.035)*1.5;q.y+=sin(p.x*.52)*.7;
   float n=fbm(q*.52+vec3(time*.025,0.,0.));float streak=pow(max(0.,1.-abs(n*2.-1.)),16.);
   float mask=exp(-dot(p*vec3(.2,.52,.33),p*vec3(.2,.52,.33)));
   density=mask*streak*.58;float fine=fbm(q*3.4);emission=mix(vec3(.035,.09,.13),vec3(1.1,.43,.1),smoothstep(.42,.67,fine))*density*2.;
  }else if(mode<3.5){
   float n=fbm(p*.55+vec3(time*.014,0.,0.));float mask=exp(-dot(p*vec3(.21,.38,.29),p*vec3(.21,.38,.29)));
   density=smoothstep(.42,.74,n)*mask*1.4;emission=mix(vec3(.025,.05,.07),vec3(.21,.17,.12),n)*density;
  }else{
   float n=fbm(p*1.9+vec3(0.,time*.1,0.));float ridge=pow(1.-abs(n*2.-1.),8.);float shell=exp(-pow((r-2.6)/.5,2.));float core=exp(-r*r/.6);
   float clump=smoothstep(.44,.66,fbm(p*1.1));density=shell*(.04+ridge)*clump*.9+core*2.;emission=mix(vec3(.4,.012,.002),vec3(2.8,.45,.04),ridge)*shell*clump*.15+vec3(5.,3.,1.)*core;
  }
  float alpha=1.-exp(-density*stepSize);light+=tr*emission*stepSize;tr*=1.-alpha;if(tr<.02)break;
 }
 float alpha=1.-tr;if(alpha<.001)discard;gl_FragColor=vec4(light/max(alpha,.025),alpha);
}`;

export const SpacePost:React.FC=()=> <EffectComposer multisampling={0}><Bloom intensity={.45} luminanceThreshold={1.1} luminanceSmoothing={.25} mipmapBlur/><ToneMapping mode={ToneMappingMode.ACES_FILMIC}/></EffectComposer>;

export const Starfield:React.FC=()=>{
 const geometry=useMemo(()=>{const p=[],c=[];for(let i=0;i<1800;i++){const h=Math.sin(i*127.1+311.7)*43758.5453,r=h-Math.floor(h);p.push(Math.sin(i*2.399)*35,Math.cos(i*1.773)*22,-12-r*35);const col=new THREE.Color(i%7===0?'#dab79b':'#9ab4ce');c.push(col.r,col.g,col.b);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g;},[]);
 return <points geometry={geometry}><pointsMaterial vertexColors size={.018} transparent opacity={.55} depthWrite={false} toneMapped={false}/></points>;
};
const Grains:React.FC<{age:number}>=({age})=>{
 const geometry=useMemo(()=>{const p=[],c=[];for(let i=0;i<2400;i++){const r=1+((Math.sin(i*71.7)*43758.1)%1+1)%1*5;const angle=i*2.399;const y=Math.sin(i*47.4)*1.8;p.push(Math.cos(angle)*r,y+Math.sin(angle)*.4,Math.sin(angle)*r*.55);const col=new THREE.Color(i%8===0?'#f5d7a3':'#837368');c.push(col.r,col.g,col.b);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g;},[]);
 return <points geometry={geometry} rotation={[.15,age*.0007,-.17]} scale={1+age*.00045}><pointsMaterial vertexColors size={.009} transparent opacity={.6} depthWrite={false} toneMapped={false}/></points>;
};
const Camera:React.FC<{kind:string;age:number}>=({kind,age})=>{const {camera}=useThree();useLayoutEffect(()=>{
 const t=age/30,burst=Math.max(0,t-.9),shake=kind==='bang'?burstShake(age,27,.27):[0,0,0];
 const z=kind==='void'?11.5-t*.55:kind==='bang'?10.8+3.3*(1-Math.exp(-burst*1.4)):kind==='dust'?9.2-t*.15:11.5-t*.16;
 camera.position.set((kind==='dust'?1.3-t*.14:Math.sin(t*.2)*.55)+shake[0],.25+shake[1],z);camera.lookAt(0,0,0);camera.rotateZ(shake[2]);camera.updateProjectionMatrix();
 },[camera,kind,age]);return null;};
export const SpaceWorld:React.FC<{kind:string;age:number}>=({kind,age})=>{
 const {width,height}=useVideoConfig();const mode={void:0,bang:1,dust:2,cloud:3,furnace:4}[kind]??2;
 return <ThreeCanvas width={width} height={height} camera={{fov:48,near:.1,far:100,position:[0,.25,12]}} style={{position:'absolute',inset:0}} gl={{antialias:true,toneMapping:THREE.NoToneMapping}}>
  <color attach="background" args={['#02040a']}/><Camera kind={kind} age={age}/>{kind!=='bang'&&<Starfield/>}
  <mesh><boxGeometry args={[14,14,14]}/><AnimatedShaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={{time:{value:age/30},mode:{value:mode}}} transparent side={THREE.BackSide} depthWrite={false}/></mesh>
  {kind==='bang'&&<CosmicBurst age={age} at={27}/>}
  {kind==='dust'&&<Grains age={age}/>}<SpacePost/>
 </ThreeCanvas>;
};

export const CompactStarCollision:React.FC<{age:number}>=({age})=>{
 const {width,height}=useVideoConfig();const radius=1.65*Math.max(0,1-age/48),angle=age*.115;
 return <ThreeCanvas width={width} height={height} camera={{position:[0,2.7,9],fov:46,near:.1,far:100}} style={{position:'absolute',inset:0}} gl={{antialias:true,toneMapping:THREE.NoToneMapping}}>
  <color attach="background" args={['#02040a']}/><Starfield/>
  {age<50&&[-1,1].map(sign=><mesh key={sign} position={[sign*Math.cos(angle)*radius,sign*Math.sin(angle)*radius*.2,sign*Math.sin(angle)*radius]}><sphereGeometry args={[.19,48,32]}/><meshBasicMaterial color={new THREE.Color(4,5,7)} toneMapped={false}/></mesh>)}
  {age>=44&&<mesh><boxGeometry args={[14,14,14]}/><AnimatedShaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={{time:{value:1+(age-44)/30},mode:{value:1}}} transparent side={THREE.BackSide} depthWrite={false}/></mesh>}
  <SpacePost/>
 </ThreeCanvas>;
};
