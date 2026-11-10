<script lang="ts">
import {base} from '$app/paths';import {text} from './i18n';
</script>
<div class="logo" aria-label={$text.title}><div class="emblem"><img src={base+'/art/emblem.png'} alt="" draggable="false"/></div><h1>{$text.title}</h1></div>
<style>
.logo{display:flex;flex-direction:column;align-items:center;position:relative}.emblem{width:clamp(160px,25vw,285px);aspect-ratio:1;filter:drop-shadow(0 10px 35px #0008);animation:emblem-in 950ms cubic-bezier(.16,1,.3,1) both}.emblem img{width:100%;height:100%;object-fit:contain}.logo h1{font-family:Georgia,'Noto Serif KR','Noto Serif JP',serif;font-size:clamp(48px,6vw,78px);font-weight:800;letter-spacing:.14em;text-indent:.14em;line-height:1.25;margin:8px 0 0;background:linear-gradient(#fff7e8 15%,#dbb587 65%,#8d6645);background-clip:text;color:transparent;filter:drop-shadow(0 3px 0 #080b11);animation:title-in 700ms 220ms both}@keyframes emblem-in{from{opacity:0;transform:translateY(24px) scale(.86) rotate(-5deg)}to{opacity:1;transform:translateY(0) scale(1) rotate(0)}}@keyframes title-in{from{opacity:0;transform:translateY(10px);letter-spacing:.32em}to{opacity:1;transform:translateY(0);letter-spacing:.14em}}@media(prefers-reduced-motion:reduce){.emblem,.logo h1{animation:none}}
</style>
