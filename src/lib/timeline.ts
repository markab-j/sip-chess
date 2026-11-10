/** One cancellable WAAPI clock for visuals, state cues and completion. */
export class Timeline {
 private animations:Animation[]=[];private timers:ReturnType<typeof setTimeout>[]=[];private finish?:()=>void;private cancelAudio?:()=>void;cancelled=false;
 constructor(private root:HTMLElement,public speed=1){}
 animate(selector:string,frames:Keyframe[],at:number,duration:number,options:KeyframeAnimationOptions={}){
  this.root.querySelectorAll(selector).forEach(el=>this.animations.push(el.animate(frames,{duration:duration/this.speed,delay:at/this.speed,fill:'both',easing:'cubic-bezier(.16,1,.3,1)',...options})));
 }
 cue(at:number,fn:()=>void){this.timers.push(setTimeout(()=>{if(!this.cancelled)fn()},at/this.speed))}
 audio(cancel:()=>void){this.cancelAudio=cancel}
 wait(duration:number){return new Promise<void>(resolve=>{if(this.cancelled){resolve();return}this.finish=resolve;this.cue(duration,()=>this.cancel())})}
 cancel(){if(this.cancelled)return;this.cancelled=true;this.animations.forEach(a=>a.cancel());this.timers.forEach(clearTimeout);this.cancelAudio?.();this.finish?.();this.finish=undefined}
}
