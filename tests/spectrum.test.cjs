const assert=require('node:assert/strict'),A=require('../lib/analytics.cjs'),E=require('../lib/engine.cjs');
const {execFileSync}=require('node:child_process'),path=require('node:path');const report=JSON.parse(execFileSync(process.execPath,[path.join(__dirname,'report_cases.js')],{encoding:'utf8'}));
const p=E.presets['BH-1'],f={B:2.5,L:2.5,D:1.5,P:1522.5,Mx:0,My:0,H:0,extra:0,fs:3,shape:'square',mode:'general',compact:true},input={layers:p.layers,water:p.water,footing:f,stress:{B:2.5,L:2.5,q:243.6,depth:15},years:10,drain:2,section:2};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
for(const mode of ['safety','strength','overburden','dispersion','loadSettlement','cv','siteSettlement','siteDifferential']){const d=A.data(mode,input);assert.equal(d.points.length,d.x.length*d.z.length);assert.ok(d.points.every(v=>v.value!==null&&Number.isFinite(v.value)&&v.value>=0),mode);const v=d.points[Math.floor(d.z.length/2)*d.x.length+Math.floor(d.x.length/2)];let expected;
if(mode==='safety')expected=E.bearing(p.layers,p.water,{...f,B:v.x,L:v.x,P:v.z}).FOS;
if(mode==='strength')expected=E.bearing(p.layers.map((l,i)=>i===1?{...l,phi:v.x,c:v.z}:l),p.water,f).qs;
if(mode==='overburden')expected=E.stress(p.layers,v.x,v.z);
if(mode==='dispersion')expected=Math.abs(E.rect(v.x,v.x,v.z,243.6)-E.spread(v.x,v.x,v.z,243.6));
if(mode==='loadSettlement')expected=E.settlement(p.layers,v.z,{...f,P:v.x},10,2).atTime;
if(mode==='cv')expected=100*E.degree(v.x*v.z/2.4**2);
if(mode==='siteSettlement'||mode==='siteDifferential'){for(const cell of d.points){const c=report.grid[cell.j*7+cell.i];const want=mode==='siteSettlement'?c.group.total:Math.max(...report.grid.filter(o=>Math.abs(o.x-c.x)+Math.abs(o.y-c.y)===5).map(o=>Math.abs(c.group.total-o.group.total)));near(cell.value,want)}expected=v.value;}
near(v.value,expected);console.log('PASS Spectrum:',mode,d.points.length,'samples');}
assert.throws(()=>A.data('cv',{...input,layers:[]}));assert.throws(()=>A.data('safety',{...input,footing:{...f,P:0}}));console.log('PASS Spectrum input rejection');
