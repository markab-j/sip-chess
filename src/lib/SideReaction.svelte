<script lang="ts">
import {fly,fade} from 'svelte/transition';import CharacterArt from './CharacterArt.svelte';import {characters,eventName,lineFor,type Reaction} from './characters';import {locale} from './i18n';
export let reaction:{character:number,event:Reaction,seed:number,id:number}|null=null;
export let right=false;export let reduced=false;
</script>
<div class="reaction-slot" aria-live="polite">{#if reaction}{#key reaction.id}<div class="reaction" style={`--accent:${characters[reaction.character].color}`} in:fly={{x:reduced?0:right?35:-35,duration:reduced?0:260}} out:fade={{duration:150}} data-testid="side-reaction"><div class="reaction-art"><CharacterArt index={reaction.character}/></div><div class="speech"><small>{eventName(reaction.event,$locale)}</small><p>{lineFor(reaction.character,reaction.event,reaction.seed,$locale)}</p></div></div>{/key}{/if}</div>
<style>
.reaction-slot{height:490px;position:relative;pointer-events:none;overflow:hidden}.reaction{height:100%;position:relative}.reaction-art{position:absolute;inset:0 0 50px;overflow:hidden;mask-image:linear-gradient(#000 78%,transparent)}.speech{position:absolute;bottom:18px;left:2px;right:2px;background:#20252ef2;border-left:3px solid var(--accent);padding:16px}.speech small{display:block;color:var(--accent);font-size:11px;margin-bottom:8px}.speech p{font-size:13px;line-height:1.7;margin:0;color:#e8e5e0}@media(max-width:800px){.reaction-slot{height:140px}.reaction{height:140px;background:#1c222b;overflow:hidden}.reaction-art{width:80px;inset:0 auto 0 0}.speech{left:72px;bottom:auto;top:0;padding:8px;border:0;background:none}.speech small{font-size:9px;margin-bottom:5px}.speech p{font-size:11px;margin:0}}
</style>
