<script lang="ts">
import {base} from '$app/paths';import {characterName} from './characters';import {locale} from './i18n';
export let index=0;export let closed=false;
</script>
<div class="face-art" class:closed role="img" aria-label={characterName(index,$locale)} style={`--column:${index}`}><img src={base+'/art/faces.png'} alt="" draggable="false"/></div>
<style>
.face-art{width:100%;aspect-ratio:1;position:relative;overflow:hidden;pointer-events:none}.face-art img{position:absolute;max-width:none;width:400%;height:200%;left:calc(var(--column)*-100%);top:-100%}.face-art.closed img{top:0}
</style>
