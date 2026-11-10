<script lang="ts">
import {base} from '$app/paths';
export let compact=false;
</script>
<div class="logo" class:compact><img src={base+'/art/sip-chess-logo.png'} alt="sip-chess" draggable="false"/></div>
<style>
.logo{width:min(720px,78vw);max-height:38dvh;aspect-ratio:3/1;filter:drop-shadow(0 12px 25px #05091d66);animation:logo-in 800ms cubic-bezier(.16,1,.3,1) both}.logo img{width:100%;height:100%;object-fit:contain}.logo.compact{width:150px;max-height:42px;filter:none;animation:none}@keyframes logo-in{from{opacity:0;transform:translateX(-30px) scale(.94)}to{opacity:1;transform:translateX(0) scale(1)}}@media(max-width:700px){.logo{width:92vw}.logo.compact{width:120px;max-height:34px}}@media(prefers-reduced-motion:reduce){.logo{animation:none}}
</style>
