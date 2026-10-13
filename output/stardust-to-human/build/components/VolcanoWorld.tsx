import {AnimatedShaderMaterial} from './AnimatedShaderMaterial';
import React, {useMemo, useLayoutEffect} from 'react';
import {FilmCanvas as ThreeCanvas} from './FilmCanvas';
import {useThree} from '@react-three/fiber';
import {useVideoConfig, interpolate} from 'remotion';
import * as THREE from 'three';

const EC={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const fract=(n:number)=>n-Math.floor(n);
const hash=(x:number,z:number)=>fract(Math.sin(x*127.1+z*311.7)*43758.5453);
function noise(x:number,z:number){const i=Math.floor(x),j=Math.floor(z);let a=x-i,b=z-j;a=a*a*(3-2*a);b=b*b*(3-2*b);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(i,j),hash(i+1,j),a),THREE.MathUtils.lerp(hash(i,j+1),hash(i+1,j+1),a),b);}
function fbm(x:number,z:number){let sum=0,a=.5;for(let i=0;i<5;i++){sum+=noise(x,z)*a;x=x*2.03+4.7;z=z*2.03+9.3;a*=.5;}return sum;}
function height(x:number,z:number){
 const dz=z+8,r=Math.hypot(x,dz),theta=Math.atan2(dz,x);
 const ridges=Math.pow(.5+.5*Math.sin(theta*19+fbm(x*.4,dz*.4)*2.7),3)*Math.exp(-r*.16)*.65;
 const cone=8.3*Math.exp(-r*.19),crater=4.6*Math.exp(-r*r/1.9);
 const meso=(fbm(x*.75,z*.75)-.5)*.75*(1-Math.exp(-r*r*.3));
 return cone-crater+ridges+meso+(fbm(x*.2,z*.2)-.5)*.35;
}
const glslNoise=`float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=noise(p)*a;p=p*2.03+4.7;a*=.5;}return s;}`;
const surfaceVertex=`varying vec3 vP,vN;varying vec2 vUv;
void main(){vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vUv=uv;gl_Position=projectionMatrix*viewMatrix*w;}`;
const basaltFragment=`precision highp float;varying vec3 vP,vN;varying vec2 vUv;${glslNoise}
void main(){float strata=fbm(vP*1.2),grit=fbm(vP*12.);vec3 n=normalize(vN+vec3(dFdx(grit)*.7,0.,dFdy(grit)*.7));float lit=max(0.,dot(n,normalize(vec3(-.6,.8,.45))));float terraces=sin(vP.y*5.+strata*5.)*.004;vec3 col=mix(vec3(.012,.015,.015),vec3(.065,.067,.057),strata);col+=terraces;col*=.24+lit*1.05;float hot=exp(-length(vP.xz-vec2(0.,-8.))*.34)*max(0.,dot(n,normalize(vec3(-vP.x,4.-vP.y,-8.-vP.z))));col+=vec3(.12,.021,.002)*hot;gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const lavaFragment=`precision highp float;varying vec3 vP,vN;varying vec2 vUv;uniform float time;${glslNoise}
void main(){vec3 p=vec3(vUv.x*13.,vUv.y*6.-time*.017,0.);float crust=fbm(p*2.3);float seam=1.-smoothstep(.012,.055,abs(crust-.49));float center=1.-pow(abs(vUv.x-.5)*2.,1.8);float hot=seam*center*(.6+.4*fbm(p*.7));vec3 col=mix(vec3(.009,.005,.003),vec3(2.1,.21,.002),hot);col+=vec3(.14,.012,0.)*center;gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
function river(angle:number,length:number){
 const vertices:number[]=[],uv:number[]=[],index:number[]=[],steps=170,across=10;
 for(let i=0;i<=steps;i++){const t=i/steps,r=1.7+t*length,a=angle+Math.sin(t*9+angle)*.09+t*.12;
  const width=.13+t*.85+Math.sin(t*12)*.05;
  for(let j=0;j<=across;j++){const lateral=(j/across-.5)*2*width,x=Math.cos(a)*r-Math.sin(a)*lateral,z=-8+Math.sin(a)*r+Math.cos(a)*lateral;
   vertices.push(x,height(x,z)+.035+Math.sin(t*70+j)*.008,z);uv.push(j/across,t);if(i<steps&&j<across){const n=i*(across+1)+j;index.push(n,n+across+1,n+1,n+1,n+across+1,n+across+2);}}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
}
const mountainGeometry=(()=>{const g=new THREE.PlaneGeometry(70,70,260,260);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,height(p.getX(i),p.getZ(i)));g.computeVertexNormals();return g;})();
const rivers=[river(1.15,23),river(.52,15),river(2.1,18)];
const lakeGeometry=(()=>{const g=new THREE.CircleGeometry(.77,64);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i)-8;p.setXYZ(i,x,3.85+Math.sin(x*12+z*9)*.025,z);}g.computeVertexNormals();return g;})();

const smokeVertex=`varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const smokeFragment=`precision highp float;varying vec3 vWorld;uniform float time;${glslNoise}
float density(vec3 p){float h=p.y-5.8;if(h<0.||h>19.)return 0.;float width=.65+h*.18+smoothstep(3.,10.,h)*2.;vec2 center=vec2(h*.2+sin(h*.45)*.28,-8.+h*.035);float radial=length(p.xz-center);float shape=1.-smoothstep(width*.4,width,radial);float profile=smoothstep(0.,.5,h)*(1.-smoothstep(15.,19.,h));vec3 q=p*1.1-vec3(time*.003,time*.02,0.);float erosion=fbm(q*2.2)*.85;float mass=fbm(q*.65);return max(0.,shape*(.5+mass)-erosion*.52)*profile*1.3;}
void main(){vec3 ro=cameraPosition,rd=normalize(vWorld-ro);vec3 low=vec3(-6.,5.8,-14.),high=vec3(10.,25.,-2.);vec3 inv=1./rd;vec3 t0=(low-ro)*inv,t1=(high-ro)*inv;vec3 mn=min(t0,t1),mx=max(t0,t1);float enter=max(max(mn.x,mn.y),mn.z),exit=min(min(mx.x,mx.y),mx.z);enter=max(0.,enter);if(exit<=enter)discard;float stepSize=(exit-enter)/40.;float trans=1.;vec3 col=vec3(0.);vec3 sun=normalize(vec3(-.6,.8,.45));
 for(int i=0;i<40;i++){vec3 p=ro+rd*(enter+(float(i)+.5)*stepSize);float d=density(p);float absorb=1.-exp(-d*stepSize*1.3);float shadow=exp(-density(p+sun*.8)*1.8-density(p+sun*1.8));vec3 scattering=mix(vec3(.022,.025,.026),vec3(.12,.13,.13),shadow);scattering+=vec3(.25,.034,.001)*exp(-(p.y-5.8)*.5);col+=trans*absorb*scattering;trans*=1.-absorb;if(trans<.015)break;}
 float alpha=1.-trans;if(alpha<.005)discard;gl_FragColor=vec4(col/max(alpha,.001),alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const Smoke:React.FC<{age:number}>=({age})=><mesh position={[2,15.4,-8]}><boxGeometry args={[16,19.2,12]}/><AnimatedShaderMaterial vertexShader={smokeVertex} fragmentShader={smokeFragment} uniforms={{time:{value:age}}} transparent depthWrite={false} side={THREE.BackSide}/></mesh>;
const Fountain:React.FC<{age:number}>=({age})=>{
 const positions=useMemo(()=>new THREE.Float32BufferAttribute(new Float32Array(950*3),3),[]);
 for(let i=0;i<950;i++){const life=((age*.015+i*.0073)%1)*2.7,a=i*2.399,v=1+hash(i,1)*1.3,r=life*(.1+hash(i,3)*.3);positions.setXYZ(i,Math.cos(a)*r,3.9+v*life*3.1-1.3*life*life,-8+Math.sin(a)*r);}positions.needsUpdate=true;
 return <points><bufferGeometry><primitive object={positions} attach="attributes-position"/></bufferGeometry><pointsMaterial color="#ffb344" size={.035} sizeAttenuation transparent opacity={.9}/></points>;
};
const Camera:React.FC<{age:number}>=({age})=>{const {camera}=useThree();useLayoutEffect(()=>{const p=interpolate(age,[0,500],[0,1],EC);camera.position.set(16-p*2,13-p,22-p*2);camera.lookAt(0,7,-7);camera.updateProjectionMatrix();},[camera,age]);return null;};
export const VolcanoWorld:React.FC<{age:number}>=({age})=>{
 const {width,height}=useVideoConfig();
 return <ThreeCanvas width={width} height={height} camera={{fov:44,near:.1,far:140}} style={{position:'absolute',inset:0}} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.25}}>
  <Camera age={age}/><color attach="background" args={['#535b5c']}/><fog attach="fog" args={['#535b5c',30,95]}/>
  <mesh geometry={mountainGeometry}><AnimatedShaderMaterial vertexShader={surfaceVertex} fragmentShader={basaltFragment}/></mesh>
  {rivers.map((g,i)=><mesh key={i} geometry={g}><AnimatedShaderMaterial vertexShader={surfaceVertex} fragmentShader={lavaFragment} uniforms={{time:{value:age}}} side={THREE.DoubleSide}/></mesh>)}
  <mesh geometry={lakeGeometry}><AnimatedShaderMaterial vertexShader={surfaceVertex} fragmentShader={lavaFragment} uniforms={{time:{value:age}}} side={THREE.DoubleSide}/></mesh>
  <Fountain age={age}/><Smoke age={age}/>
 </ThreeCanvas>;
};
