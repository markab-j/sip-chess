<script lang="ts">
import CharacterArt from './CharacterArt.svelte';
import {characters,lineFor} from './characters';import {locale,text} from './i18n';import {sound} from './audio';import {tick} from 'svelte';
let active=false,who=0,root:HTMLDivElement;let animations:Animation[]=[];let done:(()=>void)|undefined;let generation=0;
export function skip(){generation++;animations.forEach(a=>a.cancel());animations=[];active=false;done?.();done=undefined}
export async function play(type:string,char:number,speed=1){
 if(active||type!=='Checkmate')return;const token=++generation;who=char;active=true;await tick();if(token!==generation)return;
 sound.play('cutscene');const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const duration=reduced?500:3300/speed;
 const animate=(selector:string,frames:Keyframe[],delay:number,length:number)=>root.querySelectorAll(selector).forEach(el=>animations.push(el.animate(reduced?[{opacity:0},{opacity:1}]:frames,{duration:reduced?120:length/speed,delay:reduced?0:delay/speed,fill:'both',easing:'cubic-bezier(.16,1,.3,1)'})));
 animate('.shade',[{opacity:0},{opacity:1}],0,120);
 // Top-anchored, bounded art: even the tallest silhouette and horns remain inside
 // the viewport. Do not zoom from its center or use negative top offsets.
 animate('.portrait',[{transform:'translateX(-65%)',opacity:0},{transform:'translateX(0)',opacity:1,offset:.35},{transform:'translateX(2%)',opacity:1}],180,2700);
 animate('.slash',[{transform:'translateX(-150%) rotate(-16deg)'},{transform:'translateX(150%) rotate(-16deg)'}],850,280);
 animate('.impact',[{transform:'scale(.05)',opacity:1},{transform:'scale(5)',opacity:0}],1050,700);
 animate('.words',[{transform:'translateX(35px) scale(1.12)',opacity:0},{transform:'translateX(0) scale(1)',opacity:1}],1200,350);
 animate('.quote',[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],1650,500);
 animate('.particle',[{transform:'translate(0,0)',opacity:0},{opacity:1,offset:.2},{transform:'translate(var(--x),var(--y))',opacity:0}],1000,1700);
 if(!reduced)animate('.scene',[{transform:'translate(0)'},{transform:'translate(7px,3px)'},{transform:'translate(-5px,2px)'},{transform:'translate(0)'}],1100,220);
 await new Promise<void>(resolve=>{done=resolve;const a=root.animate([{opacity:1},{opacity:1,offset:.88},{opacity:0}],{duration});animations.push(a);a.onfinish=skip});
}
</script>
{#if active}<div class="cinema" bind:this={root} role="dialog" aria-modal="true" aria-label={$text.cinematic} style={`--accent:${characters[who].color}`}><div class="shade"></div><div class="scene"><div class="speedlines"></div><div class="portrait" data-testid="finish-art"><CharacterArt index={who}/></div><div class="slash"></div><div class="impact"></div>{#each Array(28) as _,i}<i class="particle" style={`--x:${Math.cos(i)*700}px;--y:${Math.sin(i)*500}px`}></i>{/each}<div class="finish-copy"><div class="words">{$text.checkmate}</div><p class="quote">{lineFor(who,'victory',0,$locale)}</p></div></div><button class="skip" onclick={skip}>{$text.skip} →</button></div>{/if}
<style>
.cinema{position:fixed;inset:0;z-index:100;overflow:hidden;pointer-events:auto}.shade{position:absolute;inset:0;background:#090d15f2}.scene{position:absolute;inset:0;overflow:hidden}.portrait{position:absolute;width:min(36vw,30svh);left:12%;top:8svh;transform-origin:top center;filter:drop-shadow(0 0 40px #e7af7820)}.slash{position:absolute;width:160%;height:8px;top:49%;background:#fff1d7;box-shadow:0 0 40px 15px var(--accent)}.impact{position:absolute;left:50%;top:50%;width:180px;height:180px;border:4px solid var(--accent);border-radius:50%}.finish-copy{position:absolute;left:46%;right:5%;top:40%}.words{font-size:clamp(30px,5vw,76px);font-weight:900;letter-spacing:-2px;color:#fff2d9;white-space:nowrap;text-shadow:3px 3px #0006}.quote{margin:25px 0 0;color:#f1e3ce;font-size:clamp(13px,1.5vw,20px);line-height:1.8;max-width:440px}.speedlines{position:absolute;inset:-100%;background:repeating-conic-gradient(from 15deg,transparent 0deg 8deg,#d6b78115 8.1deg 8.3deg);animation:spin 4s linear infinite}.particle{position:absolute;left:50%;top:50%;width:4px;height:4px;background:var(--accent);box-shadow:0 0 8px #fff}.skip{position:absolute;right:24px;bottom:24px;background:#111b;color:#fff;border:1px solid #ab9875;padding:10px 20px;font-size:12px}@keyframes spin{to{transform:rotate(15deg)}}@media(max-width:800px){.portrait{width:min(60vw,26svh);left:50%;margin-left:max(-30vw,-13svh);top:6svh}.finish-copy{left:6%;right:6%;top:73%;text-align:center}.words{font-size:clamp(26px,7vw,46px);letter-spacing:-1px}.quote{font-size:12px;margin:12px auto 0;max-width:300px}}@media(prefers-reduced-motion:reduce){.speedlines{animation:none}}
</style>
