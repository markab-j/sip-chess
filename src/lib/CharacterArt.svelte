<script lang="ts">
import {base} from '$app/paths';import {characterName} from './characters';import {locale} from './i18n';
export let index=0;export let portrait=false;
// The image generator supplied one alpha-transparent sheet. CSS viewports keep
// the four original raster cutouts intact, without re-drawing or SVG substitutes.
const bounds=[{x:0,w:474},{x:490,w:360},{x:850,w:490},{x:1340,w:434}];
$: b=bounds[index];
</script>
<div class:portrait class="art-window" role="img" aria-label={characterName(index,$locale)} style={`--ratio:${b.w}/887;--sheet-width:${1774/b.w*100}%;--sheet-left:${-b.x/b.w*100}%`}><img src={base+'/art/characters.png'} alt="" draggable="false"/></div>
<style>
.art-window{position:relative;width:100%;aspect-ratio:var(--ratio);overflow:hidden;pointer-events:none}.art-window img{position:absolute;max-width:none;width:var(--sheet-width);height:100%;left:var(--sheet-left);top:0}.portrait{aspect-ratio:1;background:#262a32;border-radius:50%;border:1px solid #ffffff24}.portrait img{height:330%;width:calc(var(--sheet-width)*1.65);left:calc(var(--sheet-left)*1.65 - 32.5%);top:-22%}
</style>
