import {AnimatedShaderMaterial} from './AnimatedShaderMaterial';
import React,{useMemo} from 'react';
import * as THREE from 'three';

// An authored virtual camera impulse, not an acoustic wave travelling through space.
export const burstShake=(age:number,at:number,strength:number)=>{
 const d=age-at;if(d<0)return [0,0,0] as const;
 const e=(1-Math.exp(-d*2))*Math.exp(-d/23)*strength;
 return [e*(Math.sin(d*2.13)+.35*Math.sin(d*.57)),e*.7*Math.sin(d*1.71),e*.055*Math.sin(d*1.13)] as const;
};

const vertex=`attribute float seed;varying float heat;uniform float elapsed;uniform float nova;
void main(){float t=max(0.,elapsed);vec3 dir=normalize(position);float speed=.8+seed*2.4;
 // Cosmic expansion stretches the field coherently. Stellar ejecta has varied velocities and jets.
 float radius=nova>.5?.22+speed*pow(t,.72):.08+5.3*(1.-exp(-t*.7));
 float jet=pow(abs(dir.y),8.);if(nova>.5)radius*=.7+jet*.9;
 vec3 p=dir*radius; p+=sin(dir.zxy*12.+t*1.8+seed*20.)*.08*t;
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 heat=seed;gl_PointSize=clamp((1.3+seed*2.)*180./max(1.,-mv.z),1.,5.);
}`;
const fragment=`varying float heat;uniform float elapsed;uniform float nova;
void main(){vec2 uv=gl_PointCoord-.5;float a=exp(-dot(uv,uv)*24.)*smoothstep(0.,.08,elapsed)*exp(-elapsed*.22);
 vec3 cool=mix(vec3(.15,.4,1.4),vec3(.9,1.7,2.6),heat);
 vec3 hot=mix(vec3(.7,.035,.008),vec3(3.,.8,.12),heat);
 gl_FragColor=vec4(nova>.5?hot:cool,a*.7);}`;
export const CosmicBurst:React.FC<{age:number;at:number;nova?:boolean}>=({age,at,nova=false})=>{
 const geometry=useMemo(()=>{const p=[],s=[];for(let i=0;i<3600;i++){
  const y=1-2*(i+.5)/3600,theta=i*2.39996323,r=Math.sqrt(1-y*y);
  p.push(r*Math.cos(theta),y,r*Math.sin(theta));const h=Math.sin(i*78.233)*43758.5453;s.push(h-Math.floor(h));
 }const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('seed',new THREE.Float32BufferAttribute(s,1));return g;},[]);
 const t=(age-at)/30,flash=t<0?0:Math.exp(-t*t*12),collapse=Math.max(.045,.63*(1-Math.min(1,age/at)*.85));
 const radius=t<0?collapse:.045+flash*.7;
 return <>
  {t<1.2&&<mesh scale={radius}><sphereGeometry args={[1,48,32]}/><meshBasicMaterial color={new THREE.Color(nova?5:7,nova?2.6:6,nova?1.2:5)} toneMapped={false}/></mesh>}

  {t>=0&&<points geometry={geometry} frustumCulled={false} rotation={nova?[.38,.1,-.7]:[0,0,0]}><AnimatedShaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={{elapsed:{value:t},nova:{value:nova?1:0}}} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/></points>}
 </>;
};
