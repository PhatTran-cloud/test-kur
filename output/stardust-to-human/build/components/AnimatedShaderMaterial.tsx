import React,{useMemo,useLayoutEffect} from 'react';
import {ThreeElements} from '@react-three/fiber';
import * as THREE from 'three';

// Three.js caches individual uniform objects after linking. Keep those objects alive
// while changing their values; replacing the dictionary leaves linked values stale.
export const AnimatedShaderMaterial:React.FC<ThreeElements['shaderMaterial']>=({uniforms,...props})=>{
 const stable=useMemo<Record<string,THREE.IUniform>>(()=>Object.fromEntries(Object.entries(uniforms||{}).map(([name,u])=>[name,{value:u.value}])),[]);
 useLayoutEffect(()=>{for(const [name,u] of Object.entries(uniforms||{})){
  if(stable[name])stable[name].value=u.value;else stable[name]={value:u.value};
 }},[stable,uniforms]);
 return <shaderMaterial {...props} uniforms={stable}/>;
};
