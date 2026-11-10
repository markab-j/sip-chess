import {base} from '$app/paths';
import {parseScore,type Evaluation} from './move-feedback';
export class Engine {
 worker:Worker;ready=false;cancelled=false;private failed=false;
 private resolve?: (s:string)=>void;private evaluation:Evaluation|null=null;private whiteTurn=true;
 private timer:ReturnType<typeof setTimeout>;
 constructor(private fail:(s:string)=>void){
  this.worker=new Worker(base+'/engine/stockfish-17.1-lite-single-03e3232.js');
  this.timer=setTimeout(()=>{if(!this.ready&&!this.cancelled)this.error('engineTimeout')},20000);
  this.worker.onerror=()=>this.error('engineLoad');
  this.worker.onmessage=e=>{if(this.cancelled)return;const s=String(e.data);if(s==='uciok')this.worker.postMessage('isready');if(s==='readyok'){this.ready=true;clearTimeout(this.timer)}const score=parseScore(s,this.whiteTurn);if(score)this.evaluation=score;if(s.startsWith('bestmove')){this.resolve?.(s.split(' ')[1]);this.resolve=undefined}};
  this.worker.postMessage('uci');
 }
 private error(message:string){if(this.cancelled)return;this.failed=true;clearTimeout(this.timer);this.resolve?.('');this.resolve=undefined;this.fail(message)}
 private async search(fen:string,skill:number,time:number){while(!this.ready&&!this.cancelled&&!this.failed)await new Promise(r=>setTimeout(r,50));if(this.cancelled||this.failed)return '';this.evaluation=null;this.whiteTurn=fen.split(' ')[1]==='w';this.worker.postMessage(`setoption name Skill Level value ${skill}`);this.worker.postMessage('position fen '+fen);return new Promise<string>(r=>{this.resolve=r;this.worker.postMessage(`go movetime ${time}`)})}
 async analyze(fen:string){await this.search(fen,20,300);return this.cancelled||this.failed?null:this.evaluation}
 async move(fen:string,level:string){return this.search(fen,level==='Easy'?0:level==='Normal'?8:18,level==='Easy'?250:level==='Normal'?650:1500)}
 destroy(){this.cancelled=true;clearTimeout(this.timer);this.worker.terminate();this.resolve?.('');this.resolve=undefined}
}
