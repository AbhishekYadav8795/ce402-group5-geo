'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {gsap} from 'gsap';
import {motion,useReducedMotion} from 'framer-motion';
import {Box,Layers3,Droplets,RotateCcw,Move,Play,Pause} from 'lucide-react';

const palette:Record<string,string>={fill:'#a18b73',sand:'#d7b878',silt:'#a49b90',clay:'#5d9bb5',gravel:'#7b8998',other:'#aab5c4'};
type Layer={bottom:number;type:string};
type Footing={B:number;L:number;D:number;shape:string};
type Props={layers:Layer[];water:number;measured:number;footing:Footing;preset:string;compact?:boolean};
type Controls={explode:(v:boolean)=>void;water:(v:boolean)=>void;spin:(v:boolean)=>void;reset:()=>void;select:(i:number)=>void};
export default function SoilScene({layers,water,measured,footing,preset,compact=false}:Props){
 const host=useRef<HTMLDivElement>(null), api=useRef<Controls|null>(null); const reduce=useReducedMotion();
 const [expanded,setExpanded]=useState(false),[showWater,setShowWater]=useState(true),[spin,setSpin]=useState(false),[failed,setFailed]=useState(false),[selected,setSelected]=useState(-1);
 const flags=useRef({expanded,showWater,spin}); flags.current={expanded,showWater,spin};
 const chosen=layers[selected];
 const valid=layers.length>0&&layers.every((l,i)=>Number.isFinite(l.bottom)&&l.bottom>(i?layers[i-1].bottom:0));
 const depth=valid?layers[layers.length-1].bottom:0;
 const B=footing.B,L=footing.shape==='square'?B:footing.L,D=footing.D,shape=footing.shape;
 const signature=JSON.stringify(layers.map(l=>[l.bottom,l.type]));
 useEffect(()=>{
  const el=host.current;if(!el||!valid)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
  setFailed(false);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Interactive three-dimensional soil profile');renderer.domElement.setAttribute('role','img');
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(38,1,.05,150);const start=new THREE.Vector3(15,12,20);camera.position.copy(start);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,-1.4,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.minDistance=8;controls.maxDistance=40;controls.maxPolarAngle=Math.PI*.82;controls.autoRotateSpeed=.65;
  scene.add(new THREE.HemisphereLight(0xe3f6ff,0x6e6051,2.4));const key=new THREE.DirectionalLight(0xfff1d5,3);key.position.set(-6,12,9);scene.add(key);const rim=new THREE.DirectionalLight(0x7dd3fc,1.6);rim.position.set(8,5,-10);scene.add(rim);
  const accent=new THREE.DirectionalLight(0x9c80ff,.9);accent.position.set(-10,1,-6);scene.add(accent);
  const soil=new THREE.Group();scene.add(soil);const scl=7.8/depth;const half=3.8;const slabs:{group:THREE.Group;base:number;idx:number}[]=[];
  // Procedural mineral grain texture, entirely illustrative (not a measured soil photograph).
  const grainCanvas=document.createElement('canvas');grainCanvas.width=256;grainCanvas.height=256;
  const ctx=grainCanvas.getContext('2d');if(ctx){ctx.fillStyle='#d8d8d8';ctx.fillRect(0,0,256,256);let seed=241;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let i=0;i<11500;i++){const v=Math.floor(115+random()*125);ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(random()*256,random()*256,1+random()*2,1+random());}}
  const grain=new THREE.CanvasTexture(grainCanvas);grain.colorSpace=THREE.SRGBColorSpace;grain.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const pickables:THREE.Mesh<THREE.BoxGeometry,THREE.MeshStandardMaterial>[]= [];
  function box(w:number,h:number,d:number,color:string,opacity=1){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.83,metalness:.02,transparent:opacity<1,opacity,depthWrite:opacity===1}));return m;}
  function edges(m:THREE.Mesh,color=0x172f42,opacity=.44){const line=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color,transparent:true,opacity}));m.add(line);}
  let top=0;layers.forEach((layer,i)=>{const h=(layer.bottom-top)*scl, y=2-(top+layer.bottom)*scl/2;const g=new THREE.Group();g.position.y=y;const color=palette[layer.type]||palette.other;
   // Two blocks create a quarter-section opening, leaving the footing and strata exposed.
   const back=box(half*2,h,half,color);back.position.z=-half/2;edges(back);g.add(back);const side=box(half,h,half,color);side.position.set(-half/2,0,half/2);edges(side);g.add(side);
   for(const m of [back,side]){m.material.map=grain;m.material.needsUpdate=true;m.userData.layer=i;pickables.push(m);}
   soil.add(g);slabs.push({group:g,base:y,idx:i});top=layer.bottom;
  });
  const ground=2; const fd=Number.isFinite(D)&&D>=0&&D<=depth?D:null;const w=Number.isFinite(B)&&B>0?B:0,l=Number.isFinite(L)&&L>0?L:0;
  if(fd!==null&&w&&l){const horizontal=Math.min(.75,5.5/Math.max(w,l)),bw=w*horizontal,bl=l*horizontal,y=ground-fd*scl;
   const foundation=new THREE.Group();foundation.position.set(1.1,y,1.1);const base=shape==='circle'?new THREE.Mesh(new THREE.CylinderGeometry(bw/2,bw/2,.38,64),new THREE.MeshStandardMaterial({color:'#e5e9ee',roughness:.48})):box(bw,.38,bl,'#e5e9ee');base.position.y=.19;edges(base);foundation.add(base);const shaft=box(Math.min(bw*.45,.64),Math.max(.8,ground-y+1),Math.min(bl*.45,.64),'#b9c8d5');shaft.position.y=.38+Math.max(.8,ground-y+1)/2;edges(shaft);foundation.add(shaft);const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,-1,0),new THREE.Vector3(0,shaft.position.y+Math.max(.8,ground-y+1)/2+1.5,0),1.3,0x5eead4,.36,.23);foundation.add(arrow);scene.add(foundation);
  }
  const waterGroup=new THREE.Group();scene.add(waterGroup);const waves:THREE.ShaderMaterial[]=[];for(const [level,color,opacity] of [[water,'#36c9ed',.24],[measured,'#7c9cff',.08]] as [number,string,number][]){if(Number.isFinite(level)&&level>=0&&level<=depth){const plane=box(half*2,.025,half*2,color,opacity);plane.position.y=ground-level*scl;edges(plane,new THREE.Color(color).getHex(),.85);waterGroup.add(plane);if(color==='#36c9ed'){const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uTime:{value:0},uAlpha:{value:.48}},vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uAlpha;void main(){float ripple=sin(vUv.x*43.0+vUv.y*28.0-uTime*1.8)+sin(vUv.y*56.0-vUv.x*17.0+uTime*1.3);float crest=smoothstep(1.1,1.95,ripple);vec3 c=mix(vec3(.08,.53,.73),vec3(.65,1.,1.),crest*.8);gl_FragColor=vec4(c,uAlpha*(.4+.6*crest));}`});waves.push(material);const surface=new THREE.Mesh(new THREE.PlaneGeometry(half*2,half*2),material);surface.rotation.x=-Math.PI/2;surface.position.y=plane.position.y+.025;waterGroup.add(surface);}}}
  const grid=new THREE.GridHelper(18,18,0x52798a,0x294353);grid.position.y=ground-depth*scl-.25;scene.add(grid);
  const dur=reduce?0:.75;const animateLayers=(v:boolean)=>{gsap.killTweensOf(slabs.map(x=>x.group.position));slabs.forEach(x=>gsap.to(x.group.position,{y:x.base+(v?(slabs.length-1-x.idx)*.38:0),duration:dur,ease:'power3.out'}));};
  const selectLayer=(i:number)=>{setSelected(i);pickables.forEach(m=>{gsap.killTweensOf(m.material);m.material.emissive.set(0x64e6d4);gsap.to(m.material,{emissiveIntensity:m.userData.layer===i?.26:0,duration:dur,ease:'power2.out'});});};
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let downX=0,downY=0;
  const down=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY;};
  const pick=(e:PointerEvent)=>{if(Math.hypot(e.clientX-downX,e.clientY-downY)>5)return;const r=renderer.domElement.getBoundingClientRect();if(!r.width||!r.height)return;pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickables,false)[0];selectLayer(hit?hit.object.userData.layer:-1);};
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',pick);setSelected(-1);
  api.current={select:selectLayer,explode:animateLayers,water:v=>{if(v)waterGroup.visible=true;const targets=waves.map(m=>m.uniforms.uAlpha);gsap.killTweensOf(targets);if(!targets.length){waterGroup.visible=v;return;}gsap.to(targets,{value:v ? .48 : 0,duration:dur,ease:'power2.inOut',onComplete:()=>{waterGroup.visible=v;}});},spin:v=>{controls.autoRotate=v&&!reduce;},reset:()=>{gsap.killTweensOf(camera.position);gsap.to(camera.position,{x:start.x,y:start.y,z:start.z,duration:dur,ease:'power3.inOut',onUpdate:()=>controls.update()});controls.target.set(0,-1.4,0);}};
  waterGroup.visible=flags.current.showWater;controls.autoRotate=flags.current.spin&&!reduce;animateLayers(flags.current.expanded);
  if(!reduce){gsap.fromTo(soil.position,{y:-.6},{y:0,duration:1.1,ease:'power3.out'});}
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(el);resize();
  let frame=0,visible=true;const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});observer.observe(el);const startTime=performance.now();function tick(){frame=requestAnimationFrame(tick);if(!visible)return;if(!reduce)waves.forEach(m=>{m.uniforms.uTime.value=(performance.now()-startTime)/1000;});controls.update();renderer.render(scene,camera);}tick();
  const lost=(e:Event)=>{e.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
  return ()=>{api.current=null;cancelAnimationFrame(frame);ro.disconnect();observer.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',pick);gsap.killTweensOf(pickables.map(m=>m.material));grain.dispose();controls.dispose();gsap.killTweensOf([soil.position,camera.position,...slabs.map(x=>x.group.position),...waves.map(m=>m.uniforms.uAlpha)]);scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments||o instanceof THREE.Line){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
 // signature represents the visual inputs only; engineering calculations are not performed here.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[signature,valid,depth,water,measured,B,L,D,shape,reduce]);
 function toggleExplode(){const v=!expanded;setExpanded(v);api.current?.explode(v);}function toggleWater(){const v=!showWater;setShowWater(v);api.current?.water(v);}function toggleSpin(){const v=!spin;setSpin(v);api.current?.spin(v);}
 return <section className={'scene-panel '+(compact?'scene-compact':'')} aria-label="3D engineering visualisation"><div className="scene-top"><div className="scene-tag"><Box size={14}/> LIVE 3D MODEL</div><span>{preset} / {depth?`${depth.toFixed(1)} m`:'—'}</span></div><div className="scene-canvas" ref={host}/>{(!valid||failed)&&<div className="scene-fallback"><Layers3 size={36}/><strong>{valid?'WebGL unavailable':'Incomplete soil profile'}</strong><span>{valid?'Use the 2D profile in P1.':'Enter increasing layer depths to render.'}</span></div>}
 <div className="scene-bottom"><div className="scene-legend">{Array.from(new Set(layers.map(l=>l.type))).map(t=><span key={t}><i style={{background:palette[t]||palette.other}}/>{t}</span>)}</div><div className="scene-tools" aria-label="3D view controls">{[{label:'Explode layers',icon:Layers3,active:expanded,action:toggleExplode},{label:'Water tables',icon:Droplets,active:showWater,action:toggleWater},{label:spin?'Pause rotation':'Rotate model',icon:spin?Pause:Play,active:spin,action:toggleSpin},{label:'Reset camera',icon:RotateCcw,active:false,action:()=>api.current?.reset()}].map(a=><motion.button whileTap={reduce?undefined:{scale:.92}} key={a.label} type="button" title={a.label} aria-label={a.label} aria-pressed={a.label==='Reset camera'?undefined:a.active} className={a.active?'on':''} disabled={failed||!valid||(a.label==='Rotate model'&&!!reduce)} onClick={a.action}><a.icon size={16}/></motion.button>)}</div></div><div className="scene-inspect" aria-live="polite">{chosen?<><i style={{background:palette[chosen.type]||palette.other}}/><span><b>Layer {selected+1} · {chosen.type}</b> / {selected?layers[selected-1].bottom.toFixed(2):'0.00'}–{chosen.bottom.toFixed(2)} m bgl</span><button type="button" onClick={()=>api.current?.select(-1)}>Clear</button></>:<span><b>Strata inspector</b> · Click a soil face to identify its layer and depth interval.</span>}<select aria-label="Inspect soil layer" disabled={!valid||failed} value={selected} onChange={e=>api.current?.select(Number(e.target.value))}><option value={-1}>Select layer</option>{layers.map((l,i)=><option key={i} value={i}>{i+1} · {l.type}</option>)}</select></div><div className="scene-note"><Move size={12}/> Drag to orbit · Scroll to zoom <span>Illustrative cutaway · independent vertical/horizontal scales</span></div></section>;
}
