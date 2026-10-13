import {AnimatedShaderMaterial} from './AnimatedShaderMaterial';
import React,{useLayoutEffect} from 'react';
import {FilmCanvas as ThreeCanvas} from './FilmCanvas';
import {useVideoConfig,interpolate} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {CosmicBurst,burstShake} from './CosmicBurst';
import {SpacePost,Starfield} from './SpaceWorld';
const vertex=`varying vec3 world;void main(){vec4 p=modelMatrix*vec4(position,1.);world=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`;
const fragment=`precision highp float;varying vec3 world;uniform float age;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=noise(p)*a;p=p*2.03+4.7;a*=.5;}return s;}
void main(){vec3 ro=cameraPosition,rd=normalize(world-ro);float b=dot(ro,rd),c=dot(ro,ro)-25.,d=b*b-c;if(d<0.)discard;float enter=max(0.,-b-sqrt(d)),exit=-b+sqrt(d),dt=(exit-enter)/64.;float trans=1.;vec3 color=vec3(0.);
 float t=age/30.;float blast=smoothstep(1.25,1.42,t),radius=.58+3.0*(1.-exp(-max(0.,t-1.34)*.36));float flash=exp(-pow((t-1.34)*5.,2.));
 for(int i=0;i<64;i++){vec3 p=ro+rd*(enter+(float(i)+.5)*dt);float r=length(p),radial=r/max(radius,.2);vec3 dir=p/max(r,.001);
  float folds=fbm(dir*4.7+vec3(.06*t,0.,0.));float edge=radius*(.69+folds*.62);float shell=exp(-pow((r-edge)/(.06+radius*.045),2.));
  vec3 q=p/max(radius,.3);float detail=fbm(q*11.-dir*t*.055);float filaments=pow(max(0.,1.-abs(detail*2.-1.)),18.);float clumps=smoothstep(.37,.65,fbm(dir*8.+q*2.));
  float cavities=smoothstep(.35,.56,fbm(q*3.6));
  float ejecta=shell*(.04+filaments*3.)*clumps*blast;float inner=exp(-r*r/(radius*radius*.42))*filaments*.34*cavities*blast;
  float stellarRadius=.58*(1.-smoothstep(.4,1.34,t)*.8);float core=exp(-pow(r/max(.07,stellarRadius),4.))*(3.+flash*45.)*(1.-smoothstep(1.8,2.5,t));
  float density=ejecta+inner+core;float alpha=1.-exp(-density*dt*1.9);
  vec3 warm=mix(vec3(.25,.018,.004),vec3(3.,.4,.028),filaments);vec3 ionized=mix(warm,vec3(.12,.53,1.05),smoothstep(.43,.66,folds));
  float front=exp(-pow((r-radius*1.12)/(.04+radius*.02),2.))*blast*(1.-smoothstep(3.,7.,t));
  vec3 emission=ionized*ejecta+vec3(.1,.48,.86)*inner+vec3(.35,.55,.8)*front*.4+vec3(3.5,2.8,1.9)*core;
  color+=trans*emission*dt;trans*=1.-alpha*.65;if(trans<.015)break;
 }
 float alpha=1.-trans;if(alpha<.003)discard;gl_FragColor=vec4(color/max(alpha,.02),alpha);
}`;
const NovaCamera:React.FC<{age:number}>=({age})=>{const {camera}=useThree();useLayoutEffect(()=>{
 const t=age/30,d=Math.max(0,t-1.34),s=burstShake(age,40,.4);
 camera.position.set(Math.sin(t*.075)*.65+s[0],.25+s[1],10.6+2.2*(1-Math.exp(-d*1.1)));camera.lookAt(0,0,0);camera.rotateZ(s[2]);camera.updateProjectionMatrix();
 },[camera,age]);return null;};
const Content:React.FC<{age:number}>=({age})=>{
 return <><color attach="background" args={['#03060c']}/><Starfield/><NovaCamera age={age}/><CosmicBurst age={age} at={40} nova/><mesh rotation={[.2,.17,-.12]}><boxGeometry args={[10,10,10]}/><AnimatedShaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={{age:{value:age}}} transparent depthWrite={false} side={THREE.BackSide}/></mesh><SpacePost/></>;
};
export const SupernovaWorld:React.FC<{age:number}>=({age})=>{const {width,height}=useVideoConfig();return <ThreeCanvas width={width} height={height} camera={{position:[0,.25,11.8],fov:46,near:.1,far:100}} style={{position:'absolute',inset:0}} gl={{antialias:true,toneMapping:THREE.NoToneMapping}}><Content age={age}/></ThreeCanvas>;};
