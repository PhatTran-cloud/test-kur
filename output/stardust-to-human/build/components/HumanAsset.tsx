import React, {useMemo,useLayoutEffect} from 'react';
import {useGLTF} from '@react-three/drei';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {staticFile} from 'remotion';
import * as THREE from 'three';

// CC0 MakeHuman body, 163-bone default rig and authored symmetric skin weights.
// Poses are derived from the frame, with no animation-clock or accumulated transforms.
export const Human:React.FC<{age:number;close?:boolean;view?:number;walking?:boolean;phase?:number;tint?:string;size?:number}>=({age,close=false,view,walking=false,phase=0,tint='#ffffff',size=1.75})=>{
 const source=useGLTF(staticFile(`models/human/${close?'modern-human':'adult-human'}.glb`)+(close?'?v=5':''));
 const actor=useMemo(()=>{
  const scene=clone(source.scene);scene.updateMatrixWorld(true);
  const bone=(name:string)=>scene.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name)) as THREE.Bone;
  const point=(name:string)=>bone(name).getWorldPosition(new THREE.Vector3());
  const poseArm=(side:string,target:THREE.Vector3,pole:THREE.Vector3)=>{
   const upper=bone(`upperarm01.${side}`),lower=bone(`lowerarm01.${side}`);
   const shoulder=point(upper.name),elbow=point(lower.name),wrist=point(`wrist.${side}`);
   const l1=shoulder.distanceTo(elbow),l2=elbow.distanceTo(wrist),axis=target.clone().sub(shoulder),d=Math.min(l1+l2-.001,axis.length());axis.normalize();
   const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));
   const bend=pole.clone().sub(shoulder);bend.addScaledVector(axis,-bend.dot(axis)).normalize();
   const desiredElbow=shoulder.clone().addScaledVector(axis,along).addScaledVector(bend,height);
   const upperQ=new THREE.Quaternion().setFromUnitVectors(elbow.clone().sub(shoulder).normalize(),desiredElbow.clone().sub(shoulder).normalize());
   upper.quaternion.copy(upperQ);scene.updateMatrixWorld(true);
   const parentQ=lower.parent!.getWorldQuaternion(new THREE.Quaternion());
   const currentDirection=point(`wrist.${side}`).sub(point(lower.name)).normalize();
   const desiredDirection=target.clone().sub(point(lower.name)).normalize();
   const correction=new THREE.Quaternion().setFromUnitVectors(currentDirection,desiredDirection);
   lower.quaternion.copy(parentQ.clone().invert().multiply(correction).multiply(parentQ));scene.updateMatrixWorld(true);
  };
  poseArm('L',new THREE.Vector3(.225,.91,.095),new THREE.Vector3(.38,1.2,.05));
  if(close&&!walking)poseArm('R',new THREE.Vector3(.028,1.345,.215),new THREE.Vector3(-.30,1.17,.18));
  else poseArm('R',new THREE.Vector3(-.225,.91,.095),new THREE.Vector3(-.38,1.2,.05));
  for(const side of ['L','R']){
   const eye=bone(`eye.${side}`);
   const white=new THREE.Mesh(new THREE.SphereGeometry(.015,24,16),new THREE.MeshStandardMaterial({color:'#d2c6b1',roughness:.3}));eye.add(white);
   const iris=new THREE.Mesh(new THREE.SphereGeometry(.0068,20,12),new THREE.MeshStandardMaterial({color:'#473120',roughness:.2}));iris.position.z=.013;iris.scale.z=.25;eye.add(iris);
   const pupil=new THREE.Mesh(new THREE.SphereGeometry(.0032,16,12),new THREE.MeshStandardMaterial({color:'#080807',roughness:.1}));pupil.position.z=.0148;pupil.scale.z=.2;eye.add(pupil);
  }
  scene.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;
   if(walking){const array=Array.isArray(o.material);const materials=array?o.material as THREE.Material[]:[o.material as THREE.Material];const copies=materials.map(m=>{const material=m.clone() as THREE.MeshStandardMaterial;if(material.name==='AuthoredCottonAndDenim')material.color.set(tint);return material;});o.material=array?copies:copies[0];}
  }});
  return scene;
 },[source.scene,close,walking,tint]);
 const rest=useMemo(()=>{const rotations=new Map<THREE.Bone,THREE.Quaternion>();actor.traverse(o=>{if(o instanceof THREE.Bone)rotations.set(o,o.quaternion.clone());});return rotations;},[actor]);
 useLayoutEffect(()=>{
  rest.forEach((q,bone)=>bone.quaternion.copy(q));
  if(!walking){const head=actor.getObjectByName('head') as THREE.Bone;head.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(age*.012)*.018,Math.sin(age*.009)*.065,0)));actor.updateMatrixWorld(true);return;}
  const cycle=age/30*6.1+phase;
  const turn=(name:string,angle:number)=>{const bone=actor.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name)) as THREE.Bone;bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),angle));};
  for(const side of ['L','R']){const a=cycle+(side==='L'?0:Math.PI),s=Math.sin(a);
   turn(`upperleg01.${side}`,s*.31);
   turn(`lowerleg01.${side}`,Math.max(0,s)*.56);
   turn(`foot.${side}`,-s*.17-Math.max(0,s)*.22);
   turn(`upperarm01.${side}`,-s*.2);
   turn(`lowerarm01.${side}`,-.15-Math.max(0,-s)*.08);
  }
  actor.updateMatrixWorld(true);
 },[actor,rest,walking,age,phase]);
 const breath=1+Math.sin(age*.027)*.002;
 const garment=useMemo(()=>{
  const g=new THREE.LatheGeometry((close?[[.23,1.0],[.22,1.09],[.205,1.16],[.245,1.3],[.26,1.39],[.11,1.46]]:[[.23,.73],[.245,.9],[.225,1.05],[.19,1.16],[.24,1.3],[.26,1.39],[.11,1.46]]).map(p=>new THREE.Vector2(...p)),64);
  const p=g.attributes.position;for(let i=0;i<p.count;i++){p.setZ(i,p.getZ(i)*.61+.018);const fold=Math.sin(Math.atan2(p.getZ(i),p.getX(i))*24)*.002;p.setX(i,p.getX(i)+fold);}g.computeVertexNormals();return g;
 },[close]);
 return <group position={[0,walking?.025+Math.abs(Math.sin(age/30*6.1+phase))*.012:.265,0]} rotation={[0,view??(close?-.14:-.32+Math.sin(age*.008)*.025),0]} scale={[size,size*breath,size]}><primitive object={actor}/>{!close&&<mesh geometry={garment} castShadow receiveShadow><meshStandardMaterial color="#6b5038" roughness={.95} side={THREE.DoubleSide}/></mesh>}</group>;
};
