declare const review:{cases:any[];example:(id:string)=>any;compare:()=>any[];benchmarks:()=>any[];route:(hash:string)=>{page:string;caseId?:string};modules:string[];outcome:(bearingPass:boolean,settlementPass:boolean)=>string;eastAlternative:()=>any[]};
export default review;
