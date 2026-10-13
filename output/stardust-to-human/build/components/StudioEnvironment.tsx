import React,{useMemo,useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

// A frozen linear HDR studio light field, used by reflective PBR specimens.
export const StudioEnvironment:React.FC=()=>{
 const {scene}=useThree();const texture=useMemo(()=>{const w=512,h=256,data=new Float32Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/w,v=y/h,top=Math.max(0,Math.cos(v*Math.PI));
  const strip=Math.exp(-Math.pow((u-.23)/.026,8)-Math.pow((v-.39)/.2,8))*8;
  const fill=Math.exp(-Math.pow((u-.72)/.12,8)-Math.pow((v-.36)/.09,8))*3;
  const light=.045+top*.55+strip+fill,i=(y*w+x)*4;data[i]=light;data[i+1]=light*.96;data[i+2]=light*.9;data[i+3]=1;
 }const t=new THREE.DataTexture(data,w,h,THREE.RGBAFormat,THREE.FloatType);t.mapping=THREE.EquirectangularReflectionMapping;t.needsUpdate=true;return t;},[]);
 useLayoutEffect(()=>{const previous=scene.environment;scene.environment=texture;return()=>{scene.environment=previous;};},[scene,texture]);return null;
};
