import type {Move,Square} from 'chess.js';
import {sound} from './audio';
type Travel={from:Square;to:Square;glyph:string;white:boolean};
export type MoveSnapshot={travel:Travel[];capture?:{square:Square;glyph:string;white:boolean}};
/** Owns only temporary DOM overlays; chess.js remains the sole game state. */
export class BoardMotion {
 private animations:Animation[]=[];private overlays:HTMLElement[]=[];private hidden=new Map<HTMLElement,string>();private soundCancel?:()=>void;private version=0;
 constructor(private board:HTMLElement){}
 private square(s:Square){return this.board.querySelector<HTMLElement>(`[data-square="${s}"]`)}
 snapshot(m:Move):MoveSnapshot{
  const read=(from:Square,to:Square):Travel=>{const p=this.square(from)?.querySelector<HTMLElement>('.piece');return{from,to,glyph:p?.textContent||'',white:p?.classList.contains('white-piece')||false}};
  const travel=[read(m.from,m.to)];
  if(m.isKingsideCastle())travel.push(read(('h'+m.from[1]) as Square,('f'+m.from[1]) as Square));
  if(m.isQueensideCastle())travel.push(read(('a'+m.from[1]) as Square,('d'+m.from[1]) as Square));
  const at=m.isEnPassant()?(m.to[0]+m.from[1]) as Square:m.to;
  const victim=m.captured?read(at,at):undefined;
  return {travel,capture:victim?{square:at,glyph:victim.glyph,white:victim.white}:undefined};
 }
 private animate(el:Element,frames:Keyframe[],options:KeyframeAnimationOptions){const a=el.animate(frames,options);this.animations.push(a);return a.finished.catch(()=>{})}
 private rect(s:Square){const cell=this.square(s)?.getBoundingClientRect(),board=this.board.getBoundingClientRect();return cell?{x:cell.left-board.left,y:cell.top-board.top,w:cell.width,h:cell.height}:null}
 private ghost(square:Square,glyph:string,white:boolean){const r=this.rect(square);if(!r)return;const el=document.createElement('span');el.className='piece motion-piece'+(white?' white-piece':'');el.textContent=glyph;el.setAttribute('aria-hidden','true');Object.assign(el.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});this.board.append(el);this.overlays.push(el);return{el,r}}
 async move(snapshot:MoveSnapshot){
  this.cancel();const version=this.version;if(matchMedia('(prefers-reduced-motion: reduce)').matches){sound.play(snapshot.capture?'capture':'move');return;}
  this.soundCancel=sound.sequence([{kind:snapshot.capture?'capture':'move',at:240}]);
  const jobs:Promise<unknown>[]=[];
  if(snapshot.capture){const c=snapshot.capture,g=this.ghost(c.square,c.glyph,c.white);if(g)jobs.push(this.animate(g.el,[{transform:'scale(1)',opacity:1},{transform:'translateY(-10px) scale(1.2)',opacity:.6,offset:.35},{transform:'translateY(6px) scale(.35)',opacity:0}],{duration:230,delay:100,fill:'both',easing:'ease-out'}))}
  for(const item of snapshot.travel){const g=this.ghost(item.from,item.glyph,item.white),to=this.rect(item.to);if(!g||!to)continue;const real=this.square(item.to)?.querySelector<HTMLElement>('.piece');if(real){this.hidden.set(real,real.style.visibility);real.style.visibility='hidden'}const x=to.x-g.r.x,y=to.y-g.r.y;
   jobs.push(this.animate(g.el,[{transform:'translate(0,0) scale(1)'},{transform:`translate(${x*.45}px,${y*.45-6}px) scale(1.12)`,offset:.45},{transform:`translate(${x}px,${y}px) scale(.92,1.05)`,offset:.85},{transform:`translate(${x}px,${y}px) scale(1)`}],{duration:300,fill:'forwards',easing:'cubic-bezier(.22,.8,.3,1)'}));
   const ring=document.createElement('i');ring.className='landing-ring';ring.setAttribute('aria-hidden','true');Object.assign(ring.style,{left:to.x+'px',top:to.y+'px',width:to.w+'px',height:to.h+'px'});this.board.append(ring);this.overlays.push(ring);jobs.push(this.animate(ring,[{transform:'scale(.35)',opacity:0},{opacity:.9,offset:.2},{transform:'scale(1.1)',opacity:0}],{duration:210,delay:220,fill:'both',easing:'ease-out'}));
  }
  await Promise.all(jobs);if(version===this.version)this.cancel();
 }
 async intro(){
  this.cancel();if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const version=this.version,jobs:Promise<unknown>[]=[];
  this.soundCancel=sound.sequence([{kind:'sweep',at:0},{kind:'place',at:400},{kind:'place',at:650},{kind:'place',at:900},{kind:'place',at:1150},{kind:'start',at:1500}]);
  this.board.querySelectorAll<HTMLElement>('.square').forEach((cell,i)=>{
   jobs.push(this.animate(cell,[{opacity:0,transform:'scale(.82)'},{opacity:1,transform:'scale(1)'}],{duration:550,delay:(i%8+Math.floor(i/8))*40,fill:'both',easing:'cubic-bezier(.16,1,.3,1)'}));
   const piece=cell.querySelector<HTMLElement>('.piece');if(piece?.textContent){const delay=340+(i%8)*75+(i<16?260:0);jobs.push(this.animate(piece,[{transform:'translateY(-26px) scale(.65)',opacity:0},{transform:'translateY(2px) scale(1.08,.92)',opacity:1,offset:.7},{transform:'translateY(0) scale(1)',opacity:1}],{duration:650,delay,fill:'both',easing:'cubic-bezier(.2,.8,.2,1)'}))}
  });
  const banner=this.board.querySelector('.opening-banner');if(banner)jobs.push(this.animate(banner,[{transform:'translateX(-120%) skewX(-10deg)',opacity:0},{transform:'translateX(0) skewX(-10deg)',opacity:1,offset:.25},{transform:'translateX(0) skewX(-10deg)',opacity:1,offset:.7},{transform:'translateX(120%) skewX(-10deg)',opacity:0}],{duration:1750,delay:1050,fill:'both',easing:'cubic-bezier(.2,.8,.2,1)'}));
  await Promise.all(jobs);if(version===this.version)this.cancel();
 }
 cancel(){this.version++;this.animations.forEach(a=>a.cancel());this.animations=[];this.overlays.forEach(el=>el.remove());this.overlays=[];this.hidden.forEach((visibility,el)=>el.style.visibility=visibility);this.hidden.clear();this.soundCancel?.();this.soundCancel=undefined}
}
