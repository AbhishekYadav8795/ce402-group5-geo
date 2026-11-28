// Review fixtures: dimensions and reference values from Group 5 report §§4–7.
// Computed values always come from the unchanged engine. Fixtures are not user-input constraints.
const e=require('./engine.cjs'), p=require('./project.cjs'), d=require('./design.cjs');
const cases=[
 ['west-corner','BH-2','Corner',1.5,1.5,682.5,0,320.5,25.5],
 ['west-edge','BH-2','Edge',1.9,1.9,1050,0,325.6,28.6],
 ['west-interior','BH-2','Interior',2.2,2.2,1522.5,0,331.4,35.1],
 ['centre-edge','BH-1','Edge',2.2,2.2,1050,0,238.8,32.4],
 ['centre-interior','BH-1','Interior',2.5,2.5,1522.5,0,244.7,47.2],
 ['centre-c4','BH-1','C4 eccentric',2.5,3.1,1522.5,231,227.1,43.4],
 ['east-corner','BH-3','Corner',3.4,3.4,682.5,0,62.0,68.7],
 ['east-edge','BH-3','Edge',4.1,4.1,1050,0,65.9,91.4],
 ['east-interior','BH-3','Interior',4.5,4.5,1522.5,0,68.1,120.0],
 ['custom-sand','Custom','Independent sample',1.7,2.4,390,0,null,null]
].map(([id,bh,kind,B,L,P,Mx,expectedSafe,expectedTotal])=>({id,bh,kind,B,L,P,Mx,expectedSafe,expectedTotal}));
const modules=['overview','review','p1','p2','p3','p4','p5','visual','analytics','projects','workshop','refs'];
function example(id){const c=cases.find(x=>x.id===id);if(!c)throw Error('Unknown review example');const v=c.bh==='Custom'?{layers:[{bottom:20,type:'sand',moist:17,sat:19,phi:25,c:0,E:22,e:0,Cc:0,Cr:0,OCR:1,cv:1}],measured:4,water:4}:e.presets[c.bh];const layers=JSON.parse(JSON.stringify(v.layers));const f={B:c.B,L:c.L,D:c.bh==='Custom'?1:1.5,P:c.P,Mx:c.Mx,My:0,H:0,extra:0,fs:3,shape:c.B===c.L?'square':'rectangle',mode:c.bh==='BH-3'?'local':'general',compact:true};const b=e.bearing(layers,v.water,f);const n=c.bh==='BH-2'?17:c.bh==='BH-3'?14:c.bh==='Custom'?12:16;
 return p.createProject({preset:c.bh,layers,measured:v.measured,water:v.water,f,sp:{z:3,N:n,type:'Fine sand / silt'},pairs:'50,29.8\n100,58.9\n150,87.5',stress:{B:b.b,L:b.l,q:b.net,depth:15},years:10,drain:'Double drainage',limit:60,dark:true});}
function compare(){return cases.map(c=>{const a=example(c.id).inputs,b=e.bearing(a.layers,a.water,a.f),s=e.settlement(a.layers,a.water,a.f,a.years,2);return {...c,safe:b.qs,net:b.net,fos:b.FOS,total:s.total,kern:b.kern,bearingPass:b.FOS>=a.f.fs&&b.kern,settlementPass:s.total<=a.limit,match:c.expectedSafe===null?null:Math.abs(b.qs-c.expectedSafe)<=.051&&Math.abs(s.total-c.expectedTotal)<=.051};});}
// Explicit screening outcomes: a failed criterion is a completed result, not a missing calculation.
function outcome(bearingPass,settlementPass){return bearingPass?(settlementPass?'Screening pass':'Settlement fails'):(settlementPass?'Bearing / kern fails':'Bearing and settlement fail');}
function eastAlternative(){return compare().filter(c=>c.bh==='BH-3').map(c=>{const pile=d.pile('BH-3',c.kind);return {...c,outcome:outcome(c.bearingPass,c.settlementPass),settlementExcess:c.total-60,capacityMargin:c.safe-c.net,pileCount:pile.count,pileLength:pile.length,pileTip:pile.tip,pileSafe:pile.safe,pileLoad:pile.max,pileGroupCapacity:pile.groupCapacity,minEfficiency:pile.P/pile.groupCapacity,pileMargin:pile.safe-pile.max,axialPass:pile.pass};});}
function benchmarks(){const a=example('centre-interior').inputs,site=d.site(a);const checks=[
 ['Effective surcharge','kPa',22.195,e.stress(a.layers,1.5,1),.0001,'0.6×16.5 + 0.4×18 + 0.5×(20−9.81)'],
 ['Direct shear intercept','kPa',1.03333333,e.fit([[50,29.8],[100,58.9],[150,87.5]]).c,.0001,'Mean shear minus fitted slope × mean normal stress'],
 ['Boussinesq centre near surface','kPa',100,e.rect(2,2,.00001,100),.001,'Uniform load limit at interior point'],
 ['Boussinesq corner near surface','kPa',25,100*e.corner(2,2,.00001),.001,'One quarter of uniform pressure at corner'],
 ['2:1 stress at 2 m','kPa',25,e.spread(2,2,2,100),.0001,'100×2×2 / (2+2)²'],
 ['Degree of consolidation at Tv=0.848','%',90,100*e.degree(.848),.1,'Terzaghi time factor for approximately 90% consolidation'],
 ['BH-1 interior net safe capacity','kPa',244.71,e.bearing(a.layers,a.water,a.f).qs,.01,'Report §4.1 worked example'],
 ['C4 effective area','m²',2.5*(3.1-2*231/1522.5),e.bearing(a.layers,a.water,example('centre-c4').inputs.f).area,.0001,'B(L−2M/P)'],
 ['Site maximum settlement','mm',239.1,site.max,.15,'Report §6, rounded reference'],
 ['Site maximum adjacent differential','mm',115.4,site.worst.delta,.15,'Report §6, rounded reference'],
 ['C4 maximum pile reaction','kN',457.625,d.pile('BH-1','C4').max,.0001,'P/4 + M×0.75/[4×0.75²]']];
 return checks.map(([name,unit,expected,actual,tolerance,reference])=>({name,unit,expected,actual,tolerance,reference,pass:Number.isFinite(actual)&&Math.abs(actual-expected)<=tolerance}));}
function route(hash){const h=String(hash||'').replace(/^#/,'');if(modules.includes(h))return {page:h};const m=/^case\/([a-z0-9-]+)$/.exec(h);if(m&&cases.some(c=>c.id===m[1]))return {page:'p3',caseId:m[1]};return {page:'overview'};}
module.exports={cases,example,compare,benchmarks,route,modules,outcome,eastAlternative};
