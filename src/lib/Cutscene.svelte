<script lang="ts">
import {onDestroy,tick} from 'svelte';import FaceArt from './FaceArt.svelte';
import {characters,lineFor} from './characters';import {locale,text} from './i18n';import {sound} from './audio';import {Timeline} from './timeline';
let active=false,who=0,root:HTMLDivElement,phase='slash';let timeline:Timeline|undefined,generation=0;let previousFocus:HTMLElement|null=null;
export function skip(){generation++;timeline?.cancel();timeline=undefined;active=false;previousFocus?.focus({preventScroll:true})}
onDestroy(skip);
export async function play(type:string,char:number,speed=1){
 if(active||type!=='Checkmate')return;const token=++generation;who=char;phase='slash';active=true;previousFocus=document.activeElement as HTMLElement;await tick();if(token!==generation)return;
 root.querySelector<HTMLButtonElement>('.skip')?.focus({preventScroll:true});const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const t=new Timeline(root,speed);timeline=t;
 if(reduced){phase='finish';t.animate('.shade',[{opacity:0},{opacity:1}],0,100);t.animate('.closed-face',[{opacity:0},{opacity:0}],0,1);t.animate('.open-face',[{opacity:1},{opacity:1}],0,1);t.animate('.face-stage',[{opacity:1},{opacity:1}],0,1);t.animate('.finish-copy',[{opacity:1},{opacity:1}],0,1);t.animate('.quote',[{opacity:1},{opacity:1}],0,1);await t.wait(650);if(token===generation)skip();return}
 t.audio(sound.sequence([{kind:'slash',at:0},{kind:'sweep',at:220},{kind:'eye',at:1260},{kind:'rumble',at:1370},{kind:'impact',at:2250},{kind:'victory',at:2700},{kind:'sweep',at:3420}],speed));
 t.cue(240,()=>phase='face');t.cue(1260,()=>phase='eyes');t.cue(1460,()=>phase='rumble');t.cue(2250,()=>phase='impact');t.cue(2480,()=>phase='finish');t.cue(3420,()=>phase='exit');
 // The very first visible beat is the cut across the center of the live board.
 t.animate('.first-slash',[{transform:'scaleX(0) rotate(-12deg)',opacity:1},{transform:'scaleX(1) rotate(-12deg)',opacity:1,offset:.4},{transform:'scaleX(1.1) rotate(-12deg)',opacity:0}],0,230);
 t.animate('.shade',[{opacity:0},{opacity:.98}],110,150);
 t.animate('.panel-top',[{transform:'translateX(-120%) skewY(-10deg)'},{transform:'translateX(0) skewY(-10deg)'}],180,250);
 t.animate('.panel-bottom',[{transform:'translateX(120%) skewY(-10deg)'},{transform:'translateX(0) skewY(-10deg)'}],210,230);
 t.animate('.rake',[{transform:'translateX(100%)',opacity:0},{transform:'translateX(-10%)',opacity:1}],220,260);
 t.animate('.face-stage',[{transform:'translateX(-85%) scale(.72)',opacity:0},{transform:'translateX(3%) scale(1.025)',opacity:1,offset:.7},{transform:'translateX(0) scale(1)',opacity:1}],280,430);
 t.animate('.face-zoom',[{transform:'scale(.94)'},{transform:'scale(1.025)'}],600,1650,{easing:'cubic-bezier(.7,0,.9,.4)'});
 // Swap registered raster frames through a widening eye slit, not a painted lid.
 t.animate('.open-face',[{clipPath:'inset(54% 0 46% 0)',opacity:1},{clipPath:'inset(0% 0 0% 0)',opacity:1}],1260,180,{easing:'cubic-bezier(.1,.8,.2,1)'});
 t.animate('.closed-face',[{opacity:1},{opacity:0}],1260,150);
 t.animate('.eye-streak',[{transform:'scaleX(0)',opacity:0},{transform:'scaleX(1)',opacity:1,offset:.35},{transform:'scaleX(1.3)',opacity:0}],1300,260);
 t.animate('.rumble',[{transform:'translate(0,0)'},{transform:'translate(-2px,1px)'},{transform:'translate(3px,-2px)'},{transform:'translate(-4px,1px)'},{transform:'translate(5px,-2px)'},{transform:'translate(-6px,2px)'},{transform:'translate(0,0)'}],1450,780,{easing:'steps(2,end)',iterations:1});
 t.animate('.pressure',[{transform:'scale(1.3)',opacity:0},{transform:'scale(.85)',opacity:.9}],1400,850);
 t.animate('.hit-flash',[{opacity:0},{opacity:.8,offset:.18},{opacity:0,offset:.55},{opacity:.15,offset:.7},{opacity:0}],2250,180,{easing:'linear'});
 t.animate('.impact-ring',[{transform:'translate(-50%,-50%) scale(.02)',opacity:1},{transform:'translate(-50%,-50%) scale(5)',opacity:0}],2250,500);
 t.animate('.scene',[{transform:'translate(0)'},{transform:'translate(-18px,9px)'},{transform:'translate(12px,-6px)'},{transform:'translate(-6px,3px)'},{transform:'translate(0)'}],2360,320,{easing:'steps(1,end)'});
 t.animate('.finish-copy',[{transform:'translateX(12%) scale(1.45)',opacity:0},{transform:'translateX(-1%) scale(.98)',opacity:1,offset:.65},{transform:'translateX(0) scale(1)',opacity:1}],2360,300);
 t.animate('.type-rule',[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],2420,240);
 root.querySelectorAll('.words span').forEach((_,i)=>t.animate(`.words span:nth-child(${i+1})`,[{transform:'translateY(-25px) scale(1.3)'},{transform:'translateY(3px) scale(.97)',offset:.7},{transform:'translateY(0) scale(1)'}],2360+i*22,220));
 t.animate('.quote',[{transform:'translateX(20px)',opacity:0},{transform:'translateX(0)',opacity:1}],2740,250);
 t.animate('.shard',[{transform:'translate(0,0) rotate(0deg)',opacity:0},{opacity:1,offset:.05},{transform:'translate(var(--x),var(--y)) rotate(var(--r))',opacity:0}],2280,780);
 // Hold the final pose, then cut the whole composition offscreen in two directions.
 t.animate('.exit-top',[{transform:'translateX(0)'},{transform:'translateX(130%)'}],3420,300,{easing:'cubic-bezier(.7,0,1,.3)'});
 t.animate('.exit-bottom',[{transform:'translateX(0)'},{transform:'translateX(-130%)'}],3450,300,{easing:'cubic-bezier(.7,0,1,.3)'});
 t.animate('.shade',[{opacity:.98},{opacity:0}],3650,180,{fill:'forwards'});
 await t.wait(3860);if(token===generation)skip();
}
</script>
{#if active}<div class="cinema" bind:this={root} role="dialog" aria-modal="true" aria-label={$text.cinematic} data-phase={phase} style={`--accent:${characters[who].color}`} onkeydown={e=>{if(e.key==='Escape')skip();if(e.key==='Tab'){e.preventDefault();root.querySelector<HTMLButtonElement>('.skip')?.focus()}}} tabindex="-1">
<div class="first-slash"></div><div class="shade"></div>
<div class="scene"><div class="exit-top"><div class="panel-top"></div><div class="panel-bottom"></div><div class="rake"></div><div class="pressure"></div><div class="rumble"><div class="face-stage" data-testid="finish-art"><div class="face-zoom"><div class="closed-face"><FaceArt index={who} closed/></div><div class="open-face"><FaceArt index={who}/></div><div class="eye-streak"></div></div></div></div></div>
<div class="impact-ring"></div>{#each Array(28) as _,i}<i class="shard" style={`--x:${Math.cos(i*2.4)*(350+i*16)}px;--y:${Math.sin(i*2.4)*(280+i*12)}px;--r:${i*57}deg`}></i>{/each}
<div class="exit-bottom"><div class="finish-copy"><div class="type-rule"></div><div class="words" aria-label={$text.checkmate}>{#each Array.from($text.checkmate) as letter}<span aria-hidden="true">{letter}</span>{/each}</div><div class="type-rule lower"></div><p class="quote">{lineFor(who,'victory',0,$locale)}</p></div></div></div><div class="hit-flash"></div><button class="skip" onclick={skip}>{$text.skip} →</button>
</div>{/if}
<style>
.cinema{position:fixed;inset:0;z-index:100;overflow:hidden;pointer-events:auto;--face-size:min(52vw,68svh);outline:none}.shade{position:absolute;inset:0;background:#080a10;opacity:0}.first-slash{position:absolute;left:-15%;top:49%;width:130%;height:7px;background:#fff9e9;box-shadow:0 0 18px #fff,0 0 45px var(--accent);z-index:4;transform-origin:left center}.scene,.exit-top,.exit-bottom,.rumble{position:absolute;inset:0;pointer-events:none}.panel-top{position:absolute;left:-10%;right:-10%;top:14%;height:35%;background:var(--accent);border-top:9px solid #f0eadc;border-bottom:12px solid #080a10;opacity:.65}.panel-bottom{position:absolute;left:-10%;right:-10%;top:48%;height:31%;background:#242937;border-top:6px solid #080a10;border-bottom:4px solid var(--accent)}.rake{position:absolute;inset:0;background:repeating-linear-gradient(-12deg,transparent 0 45px,#f4ead522 46px 48px,transparent 49px 95px);opacity:0}.pressure{position:absolute;inset:-30%;background:repeating-conic-gradient(from 20deg,transparent 0deg 7deg,#f6ead93d 7.1deg 7.4deg);opacity:0}.face-stage{position:absolute;left:7vw;top:7svh;width:var(--face-size);aspect-ratio:1;transform-origin:center top;opacity:0;filter:drop-shadow(14px 9px 0 #090b13)}.face-zoom{position:relative;width:100%;height:100%;transform-origin:center top}.closed-face,.open-face{position:absolute;inset:0}.open-face{opacity:0}.eye-streak{position:absolute;left:5%;right:5%;top:52%;height:2px;background:#fff7d3;box-shadow:0 0 18px 5px var(--accent);opacity:0}.impact-ring{position:absolute;left:50%;top:52%;width:32vw;height:32vw;border:12px solid #fff4db;border-radius:50%;opacity:0}.finish-copy{position:absolute;left:33%;right:3%;top:64%;transform-origin:center;opacity:0}.words{font-size:clamp(38px,7vw,108px);line-height:1.2;font-weight:1000;font-style:italic;letter-spacing:-4px;color:#fff5e3;white-space:nowrap;text-shadow:5px 6px 0 #090b13,8px 9px 0 var(--accent)}.words span{display:inline-block}.type-rule{height:5px;background:var(--accent);width:90%;transform-origin:left}.type-rule.lower{height:2px;margin-top:12px;background:#f7e8c8}.quote{margin:20px 0 0;color:#f1e3ce;font-size:clamp(12px,1.3vw,18px);line-height:1.8;opacity:0}.shard{position:absolute;left:50%;top:50%;width:7px;height:40px;background:var(--accent);clip-path:polygon(0 0,100% 30%,50% 100%);opacity:0}.hit-flash{position:absolute;inset:0;background:#fff6df;opacity:0;pointer-events:none}.skip{position:absolute;right:24px;bottom:24px;background:#111c;color:#fff;border:1px solid #ab9875;padding:10px 20px;font-size:12px;z-index:5}
@media(max-width:800px){.cinema{--face-size:min(92vw,58svh)}.face-stage{left:50%;margin-left:calc(var(--face-size)/-2);top:9svh}.finish-copy{left:5%;right:5%;top:70%;text-align:center}.words{font-size:clamp(28px,8vw,54px);letter-spacing:-1px;text-shadow:3px 4px #090b13,5px 6px var(--accent)}.type-rule{width:100%;height:3px}.quote{font-size:12px;margin:16px auto 0;max-width:320px}.panel-top{top:24%;height:32%}.panel-bottom{top:53%;height:30%}}
@media(prefers-reduced-motion:reduce){.first-slash,.hit-flash,.pressure,.rake,.impact-ring,.shard,.panel-top,.panel-bottom{display:none}.closed-face{display:none}.open-face,.face-stage,.finish-copy,.quote{opacity:1}.face-stage{filter:none}}
</style>
