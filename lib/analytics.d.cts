export type Point={i:number;j:number;x:number;z:number;value:number|null};
export type Dataset={title:string;xLabel:string;zLabel:string;yLabel:string;unit:string;note:string;x:number[];z:number[];points:Point[];xNames?:string[];zNames?:string[];bars?:boolean;threshold?:number};
declare const analytics:{data:(mode:string,inputs:any)=>Dataset};export default analytics;
