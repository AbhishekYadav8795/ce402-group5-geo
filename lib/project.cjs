// Portable project documents contain inputs only; derived results are always recalculated.
const VERSION=1, TYPES=['fill','sand','silt','clay','gravel','other'];
const engine=require('./engine.cjs');
const check=(ok,msg)=>{if(!ok)throw Error(msg)};
const obj=(v)=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const num=(v,key,min,max)=>{check(typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max,`${key} must be between ${min} and ${max}.`);return v};
const enumOf=(v,values,key)=>{check(values.includes(v),`Invalid ${key}.`);return v};
function normalizeProject(input){
 check(obj(input)&&input.schema===VERSION,'Unsupported project file (schema version 1 required).');
 const a=input.inputs;check(obj(a),'Missing project inputs.');check(Array.isArray(a.layers)&&a.layers.length>0&&a.layers.length<=100,'Enter 1–100 soil layers.');
 let top=0;const layers=a.layers.map((l,i)=>{check(obj(l),`Invalid layer ${i+1}.`);const bottom=num(l.bottom,`Layer ${i+1} bottom`,0.001,200);check(bottom>top,'Layer depths must increase strictly.');top=bottom;return {bottom,type:enumOf(l.type,TYPES,'soil type'),moist:num(l.moist,'Moist unit weight',0.001,100),sat:num(l.sat,'Saturated unit weight',9.810001,100),phi:num(l.phi,'Friction angle',0,50),c:num(l.c,'Cohesion',0,100000),E:num(l.E,'Modulus',0,1000000),e:num(l.e,'Void ratio',0,100),Cc:num(l.Cc,'Cc',0,100),Cr:num(l.Cr,'Cr',0,100),OCR:num(l.OCR,'OCR',1,1000),cv:num(l.cv,'cv',0.000001,1000000)}});
 const {f,sp,stress}=a;check(obj(f)&&obj(sp)&&obj(stress),'Missing footing, SPT or stress inputs.');
 const footing={B:num(f.B,'Width',.0001,200),L:num(f.L,'Length',.0001,200),D:num(f.D,'Founding depth',0,200),P:num(f.P,'Vertical load',.0001,1e9),Mx:num(f.Mx,'Mx',-1e9,1e9),My:num(f.My,'My',-1e9,1e9),H:num(f.H,'Horizontal load',-1e9,1e9),extra:num(f.extra,'Additional net load',-1e9,1e9),fs:num(f.fs,'Factor of safety',.0001,100),shape:enumOf(f.shape,['square','rectangle','strip','circle'],'footing shape'),mode:enumOf(f.mode,['general','local'],'shear mode'),compact:f.compact};check(typeof f.compact==='boolean','Invalid compacted-backfill flag.');
 check(typeof a.pairs==='string'&&a.pairs.length<=20000,'Invalid shear-test text.');
 check(typeof a.dark==='boolean','Invalid theme.');
 check(layers.every(l=>l.sat>=l.moist),'Saturated unit weight must not be less than moist unit weight.');if(footing.shape==='square'||footing.shape==='circle')footing.L=footing.B;
 return {schema:VERSION,inputs:{preset:enumOf(a.preset,['BH-1','BH-2','BH-3','Custom'],'preset'),layers,measured:num(a.measured,'Measured groundwater',0,200),water:num(a.water,'Design groundwater',0,200),f:footing,sp:{z:num(sp.z,'SPT depth',0,200),N:num(sp.N,'SPT blows',0,10000),type:enumOf(sp.type,['Fine sand / silt','Other granular','Clay'],'SPT type')},pairs:a.pairs,stress:{B:num(stress.B,'Stress width',.0001,200),L:num(stress.L,'Stress length',.0001,200),q:num(stress.q,'Stress pressure',0,1e9),depth:num(stress.depth,'Stress depth',.0001,200)},years:num(a.years,'Analysis years',.1,100000),limit:num(a.limit,'Settlement limit',.0001,1e6),drain:enumOf(a.drain,['Double drainage','Single drainage'],'drainage'),dark:a.dark}};
}
function createProject(inputs){return normalizeProject({schema:VERSION,inputs});}
function summarize(project){const a=normalizeProject(project).inputs;let bearing=null,settlement=null;try{bearing=engine.bearing(a.layers,a.water,a.f)}catch{}try{settlement=engine.settlement(a.layers,a.water,a.f,a.years,a.drain==='Double drainage'?2:1)}catch{}return {preset:a.preset,width:a.f.B,length:a.f.L,load:a.f.P,water:a.water,years:a.years,limit:a.limit,target:a.f.fs,net:bearing?.net??null,safe:bearing?.qs??null,fos:bearing?.FOS??null,settlement:settlement?.atTime??null,ultimate:settlement?.total??null,kern:bearing?.kern??null};}
module.exports={normalizeProject,createProject,summarize};
