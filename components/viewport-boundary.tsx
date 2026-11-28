'use client';
import {Component, type ReactNode} from 'react';
import {AlertTriangle,RotateCcw} from 'lucide-react';
export default class ViewportBoundary extends Component<{children:ReactNode},{failed:boolean,attempt:number}>{
 state={failed:false,attempt:0};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="notice error" role="alert"><AlertTriangle size={18}/> The 3D panel could not render. Other engineering modules remain available. <button className="project-action" onClick={()=>this.setState(s=>({failed:false,attempt:s.attempt+1}))}><RotateCcw size={15}/> Retry viewport</button></div>:<div key={this.state.attempt}>{this.props.children}</div>}
}
