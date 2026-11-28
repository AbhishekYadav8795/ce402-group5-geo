declare const engine: {stressFootprint:(r:any)=>{B:number;L:number;q:number}; presets: Record<string,any>; stress: (...args:any[])=>number; spt:(...args:any[])=>any; fit:(...args:any[])=>any; bearing:(...args:any[])=>any; corner:(...args:any[])=>number; rect:(...args:any[])=>number; spread:(...args:any[])=>number; degree:(...args:any[])=>number; settlement:(...args:any[])=>any};
export = engine;
