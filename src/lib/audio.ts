type Cancel=()=>void;
type Cue={kind:string;at:number};
let ctx:AudioContext|undefined,master:GainNode|undefined;let volume=.35,muted=false;
const noop=()=>{};
function tone(start:number,duration:number,frequency:number,end:number,gain:number,type:OscillatorType='sine',nodes:AudioScheduledSourceNode[]){if(!ctx||!master)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(frequency,start);o.frequency.exponentialRampToValueAtTime(Math.max(12,end),start+duration);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.008);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g).connect(master);o.start(start);o.stop(start+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()};nodes.push(o)}
function noise(start:number,duration:number,gain:number,frequency:number,nodes:AudioScheduledSourceNode[]){if(!ctx||!master)return;const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();source.buffer=b;filter.type='bandpass';filter.frequency.setValueAtTime(frequency,start);filter.frequency.exponentialRampToValueAtTime(160,start+duration);filter.Q.value=.8;g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+Math.min(.06,duration/3));g.gain.exponentialRampToValueAtTime(.0001,start+duration);source.connect(filter).connect(g).connect(master);source.start(start);source.onended=()=>{source.disconnect();filter.disconnect();g.disconnect()};nodes.push(source)}
export const sound={
 get volume(){return volume},set volume(v:number){volume=Math.max(0,Math.min(1,v));if(master&&ctx)master.gain.setTargetAtTime(muted?0:volume,ctx.currentTime,.015)},
 get muted(){return muted},set muted(v:boolean){muted=v;if(master&&ctx)master.gain.setTargetAtTime(muted?0:volume,ctx.currentTime,.015)},
 unlock(){ctx??=new AudioContext();if(!master){master=ctx.createGain();master.gain.value=muted?0:volume;master.connect(ctx.destination)}void ctx.resume()},
 play(kind:string,delay=0):Cancel{
  if(!ctx||!master||muted)return noop;const at=ctx.currentTime+Math.max(0,delay),nodes:AudioScheduledSourceNode[]=[];
  const t=(d:number,len:number,f:number,end:number,g:number,type:OscillatorType='sine')=>tone(at+d,len,f,end,g,type,nodes);
  const n=(d:number,len:number,g:number,f:number)=>noise(at+d,len,g,f,nodes);
  switch(kind){
   case 'select':t(0,.07,780,940,.1);break;
   case 'move':t(0,.09,270,135,.32,'triangle');n(0,.045,.18,1800);break;
   case 'capture':t(0,.18,160,45,.55);n(0,.13,.4,2400);t(.035,.1,530,140,.12,'triangle');break;
   case 'place':t(0,.1,360,180,.16,'triangle');n(0,.035,.1,2000);break;
   case 'start':[220,330,440,660].forEach((f,i)=>t(i*.07,.35,f,f*.99,.11,'triangle'));n(0,.4,.13,2300);break;
   case 'slash':n(0,.23,.65,6200);t(0,.17,1200,160,.15,'sawtooth');break;
   case 'sweep':n(0,.4,.35,3100);break;
   case 'rumble':for(let i=0;i<9;i++){const d=i*.1;t(d,.16,47+i*5,31,.08+i*.022);n(d,.09,.06+i*.012,400+i*90)}break;
   case 'eye':t(0,.24,1500,2700,.13);t(.01,.18,2100,3200,.07);break;
   case 'impact':t(0,.65,135,24,.85);t(0,.16,65,32,.6,'triangle');n(0,.45,.85,2000);n(.06,.15,.25,6500);break;
   case 'victory':[261.63,329.63,392,523.25].forEach((f,i)=>t(i*.06,.65,f,f,.09,'triangle'));break;
   default:t(0,.15,520,280,.15,'triangle');t(.08,.2,780,420,.13);
  }
  return()=>nodes.forEach(node=>{try{node.stop()}catch{/* source already ended */}});
 },
 sequence(cues:Cue[],speed=1):Cancel{const cancels=cues.map(c=>this.play(c.kind,c.at/speed/1000));return()=>cancels.forEach(cancel=>cancel())}
};
