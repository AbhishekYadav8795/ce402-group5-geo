// Chart sampling only. Engineering equations are delegated to the original traceable engine.
const engine=require('./engine.cjs');
const range=(a,b,n)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));
const safe=fn=>{try{const v=fn();return Number.isFinite(v)?v:null}catch{return null}};
function grid(x,z,fn){return z.flatMap((b,j)=>x.map((a,i)=>({i,j,x:a,z:b,value:safe(()=>fn(a,b))})));}
// Assignment-only building-wide trial footing model, matching tests/report_cases.js.
let siteCache;
function siteResults(){if(siteCache)return siteCache;const keys=['BH-2','BH-1','BH-3'], widths=[[1.5,1.9,2.2],[2.2,2.2,2.5],[3.4,4.1,4.5]],loads=[682.5,1050,1522.5];const cells=[];
for(let j=0;j<4;j++)for(let i=0;i<7;i++){const k=i<2?0:i<5?1:2,kind=(j===0||j===3)&&(i===0||i===6)?0:j===0||j===3||i===0||i===6?1:2,c4=i===3&&j===2,B=widths[k][kind],f={B,L:c4?3.1:B,D:1.5,P:loads[kind],Mx:c4?231:0,shape:c4?'rectangle':'square',mode:k===2?'local':'general',fs:3},p=engine.presets[keys[k]],r=engine.bearing(p.layers,p.water,f);cells.push({i,j,p,f,r});}
for(const c of cells){const other=cells.filter(o=>o!==c).map(o=>({B:o.r.b,L:o.r.l,q:o.r.net,x:5*(o.i-c.i),y:5*(o.j-c.j)}));c.settlement=engine.settlement(c.p.layers,c.p.water,c.f,10,2,other);}
return siteCache=cells;}
function data(mode,{layers,water,footing,stress,years,drain,section,limit=60}){
 const {B,L,q,depth}=stress;
 const validStress=[B,L,q,depth].every(Number.isFinite)&&B>0&&L>0&&q>=0&&depth>0;
 const validFoot=Object.values(footing).every(v=>typeof v!=='number'||Number.isFinite(v))&&footing.B>0&&footing.L>0&&footing.D>=0&&footing.P>0&&footing.fs>0;
 const profile=layers.length>0&&Number.isFinite(water)&&water>=0&&layers.every((l,i)=>Number.isFinite(l.bottom)&&l.bottom>(i?layers[i-1].bottom:0)&&Object.entries(l).every(([k,v])=>k==='type'||Number.isFinite(v))&&l.moist>0&&l.sat>9.81&&l.phi>=0&&l.phi<=50&&l.c>=0);
 const t=Number.isFinite(years)&&years>=.1?years:10;
 let x,z,fn,meta;
 switch(mode){
 case 'stress':
 if(!validStress)throw Error('Complete valid P4 stress inputs first.');
 x=range(-1.5*B,1.5*B,41);z=range(-1.5*L,1.5*L,41);fn=(a,b)=>engine.rect(B,L,Math.max(.000001,section),q,a,b);
 meta={title:'Horizontal stress terrain',xLabel:'Offset X (m)',zLabel:'Offset Y (m)',yLabel:'Stress (kPa)',unit:'kPa',note:`Boussinesq stress on a horizontal plane ${section.toFixed(2)} m below footing base. Height and colour both encode stress.`};break;
 case 'section':
 if(!validStress)throw Error('Complete valid P4 stress inputs first.');
 x=range(-2*B,2*B,41);z=range(Math.min(.05,depth/100),depth,41);fn=(a,b)=>engine.rect(B,L,b,q,a,0);
 meta={title:'Vertical stress surface',xLabel:'Offset X (m)',zLabel:'Depth below base (m)',yLabel:'Stress (kPa)',unit:'kPa',note:'Vertical centreline section (Y = 0). Depth is a horizontal chart axis; elevation represents stress, not physical soil elevation.'};break;
 case 'capacity':
 if(!profile||!validFoot)throw Error('Complete valid P1 and P3 inputs first.');
 x=range(.55*footing.B,1.55*footing.B,25);z=range(0,Math.max(.1,footing.D+2*footing.B,water),25);
 fn=(a,b)=>engine.bearing(layers,b,{...footing,B:a,L:footing.L*a/footing.B}).qs;
 meta={title:'Bearing resistance response',xLabel:'Width / diameter (m)',zLabel:'Water depth (m bgl)',yLabel:'Net safe (kPa)',unit:'kPa',note:'IS 6403 sensitivity: width and water depth vary; original aspect ratio, loads, shear mode and other inputs remain fixed. Missing cells are unsupported geometries.'};break;
 case 'settlement': {
 if(!profile||!validFoot||!Number.isFinite(years)||years<.1)throw Error('Complete valid P1, P3 and P5 inputs first.');
 x=range(.65*footing.B,1.4*footing.B,21);z=range(0,t,31);const results=x.map(a=>{try{return engine.settlement(layers,water,{...footing,B:a,L:footing.L*a/footing.B},t,drain)}catch{return null}});
 fn=(a,b)=>{const r=results[x.indexOf(a)];return r?r.totalAt(b):null};
 meta={title:'Settlement response surface',xLabel:'Width / diameter (m)',zLabel:'Time (yr)',yLabel:'Settlement (mm)',unit:'mm',note:'Schmertmann granular creep and primary clay consolidation both evolve with time. Each width is a separate hypothetical footing, not a spatial deformation field.'};break;}
 case 'degree':
 if(!Number.isFinite(years)||years<.1)throw Error('Set a valid P5 analysis time.');
 x=range(.5,5,31);z=range(0,t,41);const clay=layers.find(l=>l.type==='clay');const cv=clay?.cv??1.99;if(!(cv>0&&Number.isFinite(cv)))throw Error('Positive clay cv required.');
 fn=(a,b)=>100*engine.degree(cv*b/(a*a));meta={title:'Consolidation kinetics',xLabel:'Drainage path (m)',zLabel:'Time (yr)',yLabel:'Consolidation (%)',unit:'%',note:`Terzaghi average degree of consolidation using cv = ${cv.toFixed(3)} m²/yr (${clay?'first clay layer':'illustrative fallback; no clay layer'}). Drainage path is varied directly.`};break;
 case 'safety':
 if(!profile||!validFoot)throw Error('Complete valid P1 and P3 inputs first.');
 x=range(.65*footing.B,1.5*footing.B,25);z=range(.5*footing.P,1.6*footing.P,25);fn=(a,b)=>engine.bearing(layers,water,{...footing,B:a,L:footing.L*a/footing.B,P:b}).FOS;
 meta={title:'Load–width safety envelope',xLabel:'Width / diameter (m)',zLabel:'Service load (kN)',yLabel:'Factor of safety (–)',unit:'–',threshold:footing.fs,note:'IS 6403 screening. Width and load vary at constant aspect ratio, moment, founding depth and other inputs. Threshold is the selected P3 safety factor.'};break;
 case 'strength': {
 if(!profile||!validFoot)throw Error('Complete valid P1 and P3 inputs first.');const k=layers.findIndex(l=>footing.D<l.bottom);if(k<0)throw Error('Founding depth outside profile.');
 x=range(0,Math.min(50,Math.max(40,layers[k].phi)),25);z=range(0,Math.max(50,2*layers[k].c),25);fn=(a,b)=>engine.bearing(layers.map((l,i)=>i===k?{...l,phi:a,c:b}:l),water,footing).qs;
 meta={title:'Shear-strength sensitivity',xLabel:'Input friction angle (°)',zLabel:'Input cohesion (kPa)',yLabel:'Net safe (kPa)',unit:'kPa',note:'Hypothetical founding-layer strength pairs; not a soil classification or probability distribution. All other parameters and the selected shear mode stay fixed.'};break;}
 case 'overburden':
 if(!profile)throw Error('Complete valid P1 inputs first.');x=range(0,layers.at(-1).bottom,41);z=range(0,Math.max(layers.at(-1).bottom,water),25);fn=(a,b)=>engine.stress(layers,a,b);
 meta={title:'Effective overburden stress',xLabel:'Depth (m bgl)',zLabel:'Water depth (m bgl)',yLabel:'Effective stress (kPa)',unit:'kPa',note:'Layer-by-layer effective vertical stress with hypothetical hydrostatic water-table depths. No seepage or excess pore pressure is modeled.'};break;
 case 'dispersion':
 if(!validStress)throw Error('Complete valid P4 inputs first.');x=range(.5*B,2*B,31);z=range(Math.min(.05,depth/100),depth,31);fn=(a,b)=>Math.abs(engine.rect(a,L*a/B,b,q)-engine.spread(a,L*a/B,b,q));
 meta={title:'Stress-method discrepancy',xLabel:'Width (m)',zLabel:'Depth below base (m)',yLabel:'Absolute difference (kPa)',unit:'kPa',note:'Absolute difference between Boussinesq centre and approximate 2:1 stress at constant contact pressure and aspect ratio; neither is a calibrated error measure.'};break;
 case 'loadSettlement':
 if(!profile||!validFoot||!Number.isFinite(years)||years<.1)throw Error('Complete valid P1, P3 and P5 inputs first.');x=range(.5*footing.P,1.5*footing.P,21);z=range(0,Math.max(footing.D+2*footing.B,water),21);fn=(a,b)=>engine.settlement(layers,b,{...footing,P:a},t,drain).atTime;
 meta={title:'Load–groundwater settlement',xLabel:'Service load (kN)',zLabel:'Water depth (m bgl)',yLabel:'Settlement (mm)',unit:'mm',threshold:limit,note:`Predicted settlement at ${t} years, with footing geometry held fixed. The reference plane is the selected settlement limit (${limit} mm), not a universal limit. OCR is retained when water level varies.`};break;
 case 'cv': {
 if(!Number.isFinite(years)||years<.1)throw Error('Set a valid P5 analysis time.');let top=0;const clay=layers.find(l=>{if(l.type==='clay')return true;top=l.bottom;return false});if(!clay||!(clay.cv>0)||!(clay.bottom>top)||!(drain===1||drain===2))throw Error('Valid clay layer and drainage required.');const h=(clay.bottom-top)/drain;
 x=range(.25*clay.cv,3*clay.cv,31);z=range(0,t,41);fn=(a,b)=>100*engine.degree(a*b/(h*h));
 meta={title:'Consolidation coefficient sensitivity',xLabel:'cv (m²/yr)',zLabel:'Time (yr)',yLabel:'Consolidation (%)',unit:'%',note:`First clay layer; fixed drainage path ${h.toFixed(2)} m. Vary cv to examine time-rate uncertainty; Terzaghi 1D solution.`};break;}
 case 'siteSettlement': case 'siteDifferential': {
 const cells=siteResults();x=range(0,6,7);z=range(0,3,4);const diff=mode==='siteDifferential';fn=(a,b)=>{const c=cells[b*7+a],s=c.settlement.total;return diff?Math.max(...cells.filter(o=>Math.abs(o.i-a)+Math.abs(o.j-b)===1).map(o=>Math.abs(s-o.settlement.total))):s};
 meta={title:diff?'Adjacent differential settlement':'Building-wide settlement',xLabel:'Grid line',zLabel:'Grid row',yLabel:diff?'Max adjacent Δs (mm)':'Total settlement (mm)',unit:'mm',xNames:['1','2','3','4','5','6','7'],zNames:['A','B','C','D'],bars:true,threshold:diff?10:60,note:'Assignment trial-footing case only (not custom profile). Clay stress superposition includes all 28 footings; granular term is individual. '+(diff?'Each bar is the largest absolute difference to a directly adjacent column (5 m bay); 10 mm guide.':'Ultimate primary clay plus 10-year granular settlement; 60 mm guide.')};break;}
 case 'zones': {
 x=[0,1,2];z=[0,1,2];const keys=['BH-2','BH-1','BH-3'];const loads=[682.5,1050,1522.5];const widths=[[1.5,1.9,2.2],[2.2,2.2,2.5],[3.4,4.1,4.5]];
 fn=(a,b)=>{const p=engine.presets[keys[a]],B=widths[a][b];return engine.bearing(p.layers,p.water,{B,L:B,D:1.5,P:loads[b],fs:3,shape:'square',mode:a===2?'local':'general',compact:true}).FOS};
 meta={title:'Site bearing safety comparison',xLabel:'Borehole',zLabel:'Column class',yLabel:'Factor of safety (–)',unit:'–',xNames:keys,zNames:['Corner*','Edge','Interior'],bars:true,threshold:3,note:'Assignment preset comparison, independent of custom inputs. *BH-1 corner is a hypothetical comparison at 2.2 m; no actual corner lies in BH-1. Threshold FOS = 3; preliminary homogeneous screening only.'};break;}
 default:throw Error('Unknown analytics mode');
 }
 const points=grid(x,z,fn);return {...meta,x,z,points};
}
module.exports={data};
