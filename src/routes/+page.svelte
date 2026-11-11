<script lang="ts">
import {onMount,tick} from 'svelte';import {fly,fade} from 'svelte/transition';import {base} from '$app/paths';
import Logo from '$lib/Logo.svelte';import {BoardMotion} from '$lib/board-motion';
import {Chess,type Square,type Move} from 'chess.js';
import {Settings,ArrowLeft,RotateCcw,FlaskConical,ChevronLeft,ChevronRight} from 'lucide-svelte';
import {freshDialogue,restoreDialogue,selectDialogue} from '$lib/dialogue';
import {Engine} from '$lib/engine';import {assessMove,thinkingTime,shouldThink} from '$lib/move-feedback';import {outcomeKey} from '$lib/game';import {locale,text,setLocale,type Locale,type MessageKey} from '$lib/i18n';
import {characters,lineFor,captureReaction,type CapturePiece,randomOpponent,eventName,characterName,type Reaction} from '$lib/characters';
import CharacterArt from '$lib/CharacterArt.svelte';import SideReaction from '$lib/SideReaction.svelte';
import {sound} from '$lib/audio';import Cutscene from '$lib/Cutscene.svelte';import './style.css';
type Screen='home'|'select'|'game';type Burst={character:number,event:Reaction,seed:number,id:number};
let screen:Screen='home',ready=false,hasSave=false,player=0,opponent=1;
let game=new Chess(),fen=game.fen(),moves:Move[]=[],selected:Square|null=null,legal:string[]=[],side='w',level='Normal';
let selectionPlayer=0,selectionSide='w',selectionLevel='Normal';
let delays=new Set<()=>void>();let quality:'blunder'|'good'|null=null;const lineSeeds=new Map<string,number>();
let dialogue=freshDialogue(),longThinking=false;
let historyOffset=0;
$: historyStart=Math.max(0,moves.length-(historyOffset+1)*4);
$: visibleMoves=moves.slice(historyStart,Math.max(0,moves.length-historyOffset*4));
let intro=false;let motion:BoardMotion|undefined;
let busy=false,moving=false,error:MessageKey|null=null,result:ReturnType<typeof outcomeKey>=null,settings=false,lab=false,effects=true,muted=false,volume=.35,labChar=0,speed=1,reduced=false;
let promotion:{from:Square,to:Square}|null=null,cut:Cutscene,engine:Engine|undefined,epoch=0,playing=false;
let leftReaction:Burst|null=null,rightReaction:Burst|null=null,serial=0;let timers:ReturnType<typeof setTimeout>[]=[];
$: if(ready)document.documentElement.lang=$locale;
$: board=new Chess(fen).board();$: last=moves.at(-1);$: squares=side==='w'?board.flat():board.flat().reverse();
const levelLabels={Easy:'easy',Normal:'normal',Hard:'hard'} as const;
const glyph:Record<string,string>={wk:'♔',wq:'♕',wr:'♖',wb:'♗',wn:'♘',wp:'♙',bk:'♚',bq:'♛',br:'♜',bb:'♝',bn:'♞',bp:'♟'};
function persist(){if(!ready)return;localStorage.setItem('anime-chess-v2',JSON.stringify({pgn:game.pgn(),side,level,effects,muted,volume,player,opponent,hasSave,screen,dialogue}))}
function sync(){historyOffset=0;fen=game.fen();moves=game.history({verbose:true});result=outcomeKey(game);selected=null;legal=[];persist()}
function audio(){sound.unlock();sound.muted=muted;sound.volume=volume}
function clearReactions(){timers.forEach(clearTimeout);timers=[];leftReaction=null;rightReaction=null}
function stop(){epoch++;delays.forEach(done=>done());delays.clear();quality=null;longThinking=false;motion?.cancel();intro=false;engine?.destroy();engine=undefined;cut?.skip();clearReactions();busy=false;moving=false;playing=false;promotion=null}
function boot(){engine?.destroy();const id=epoch;engine=new Engine(s=>{if(id===epoch){error=s as MessageKey;busy=false}})}
onMount(()=>{const savedLocale=localStorage.getItem('anime-chess-locale');setLocale(savedLocale==='ja'?'ja':'ko');reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;try{const s=JSON.parse(localStorage.getItem('anime-chess-v2')||'null');if(s&&Number.isInteger(s.player)&&characters[s.player]&&characters[s.opponent]&&s.player!==s.opponent){game.loadPgn(s.pgn);dialogue=restoreDialogue(s.dialogue);player=s.player;opponent=s.opponent;side=s.side==='b'?'b':'w';level=['Easy','Normal','Hard'].includes(s.level)?s.level:'Normal';effects=s.effects!==false;muted=!!s.muted;volume=Number.isFinite(s.volume)?Math.max(0,Math.min(1,s.volume)):.35;hasSave=!!s.hasSave;screen=s.screen==='game'&&hasSave?'game':'home'}}catch{error='restoreError'}ready=true;sync();if(screen==='game'){boot();void ai()}return stop});
function react(event:Reaction,character:number){if(!effects)return;const id=++serial;const key=character+':'+event;const seed=(lineSeeds.get(key)??Math.floor(Math.random()*100))+1;lineSeeds.set(key,seed);const burst={character,event,seed,id};const isLeft=character===player;if(isLeft)leftReaction=burst;else rightReaction=burst;timers.push(setTimeout(()=>{if(isLeft&&leftReaction?.id===id)leftReaction=null;if(!isLeft&&rightReaction?.id===id)rightReaction=null},3400/speed))}
async function cinematic(character:number){if(!effects)return;playing=true;try{await cut.play('Checkmate',character,speed)}finally{playing=false}}
function turnReaction(event:Reaction,character:number){if(!effects)return false;const chosen=selectDialogue(dialogue,event,moves.length,Date.now());persist();if(!chosen)return false;react(event,character);return true}
async function speak(event:Reaction,character:number){if(!turnReaction(event,character))return;await tick();const line=lineFor(character,event,lineSeeds.get(character+':'+event)!, $locale);await pause(Math.max(1800,Math.min(3400,900+Array.from(line).length*65))/speed)}
async function commit(from:Square,to:Square,p='q',feedback:'blunder'|'good'|null=null){
 const id=epoch;const preview=new Chess(game.fen());let planned:Move;try{planned=preview.move({from,to,promotion:p})}catch{return}
 const who=planned.color===side?player:opponent;
 const event:Reaction|null=preview.isGameOver()?null:planned.isEnPassant()?'enpassant':planned.promotion?'promotion':planned.captured?captureReaction[planned.captured as CapturePiece]:preview.isCheck()?'check':planned.isKingsideCastle()||planned.isQueensideCastle()?'castle':null;
 if(event)await speak(event,who);
 else if(feedback)await speak(feedback,opponent);
 if(id!==epoch)return;
 const m=game.move({from,to,promotion:p});const snapshot=motion?.snapshot(m);sync();await tick();if(snapshot)await motion?.move(snapshot);if(id!==epoch)return;
 if(result){if(game.isCheckmate()){clearReactions();await cinematic(who);if(!effects)sound.play('victory')}else sound.play('victory')}
}
function pause(ms:number){return new Promise<void>(resolve=>{const done=()=>{clearTimeout(timer);delays.delete(done);resolve()};const timer=setTimeout(done,ms);delays.add(done)})}
async function ai(){if(screen!=='game'||game.turn()===side||game.isGameOver()||error||!engine)return;const id=epoch;busy=true;longThinking=false;const began=performance.now();const delay=thinkingTime(moves.length,quality);quality=null;const thinking=setTimeout(()=>{if(id===epoch&&busy&&!playing&&shouldThink(performance.now()-began)){longThinking=true}},5000);try{const best=await engine.move(game.fen(),level);clearTimeout(thinking);longThinking=false;if(id!==epoch||!best)return;await pause(Math.max(0,delay-(performance.now()-began)));if(id!==epoch)return;clearTimeout(thinking);if(id!==epoch)return;longThinking=false;await commit(best.slice(0,2) as Square,best.slice(2,4) as Square,best[4]||'q')}catch(e){if(id===epoch)error='engineFailure'}finally{clearTimeout(thinking);if(id===epoch){busy=false;longThinking=false;}}}
async function humanMove(from:Square,to:Square,p='q'){
 const id=epoch;moving=true;const currentEngine=engine;
 try{
  const preview=new Chess(game.fen());const planned=preview.move({from,to,promotion:p});
  quality=null;
  if(!preview.isGameOver()&&currentEngine){const before=await currentEngine.analyze(game.fen());if(id!==epoch)return;const after=await currentEngine.analyze(preview.fen());if(id!==epoch)return;quality=assessMove(before,after,side,from+to+(planned.promotion||''))}
  await commit(from,to,p,quality);if(id!==epoch)return;moving=false;await ai();
 }finally{if(id===epoch){moving=false;}}
}
async function choose(s:Square){audio();if(!ready||intro||busy||moving||playing||result||error||promotion||game.turn()!==side)return;if(selected&&legal.includes(s)){const opts=game.moves({square:selected,verbose:true}).filter(m=>m.to===s);if(opts.some(m=>m.promotion)){promotion={from:selected,to:s};return}await humanMove(selected,s);return}if(game.get(s)?.color===side){selected=s;legal=game.moves({square:s,verbose:true}).map(m=>m.to)}else{selected=null;legal=[]}}
async function start(){audio();stop();player=selectionPlayer;side=selectionSide;level=selectionLevel;const id=epoch;opponent=randomOpponent(player);game=new Chess();dialogue=freshDialogue();error=null;hasSave=true;intro=true;screen='game';sync();boot();await tick();await motion?.intro();if(id!==epoch)return;intro=false;await ai()}
function resume(){audio();stop();error=null;screen='game';sync();boot();void ai()}
function home(){stop();screen='home';persist()}
function undo(){if(playing||moving)return;stop();game.undo();if(game.turn()!==side&&game.history().length)game.undo();error=null;sync();boot();void ai()}
function mountBoard(node:HTMLElement){const instance=new BoardMotion(node);motion=instance;return{destroy(){instance.cancel();if(motion===instance)motion=undefined}}}
function openSelection(){audio();sound.play('select');stop();selectionPlayer=player;selectionSide=side;selectionLevel=level;screen='select';persist()}
function selectCharacter(index:number){selectionPlayer=index;audio();sound.play('select')}
function square(i:number):Square{const n=side==='w'?i:63-i;return ('abcdefgh'[n%8]+(8-Math.floor(n/8))) as Square}
async function preview(event:Reaction|'checkmate'){audio();if(event==='checkmate'){await cinematic(labChar)}else react(event,labChar)}
</script>
<svelte:head><title>{$text.title}</title><link rel="preload" as="image" href={base+'/art/faces.png'}/></svelte:head>
<div class="app" class:in-game={screen==='game'}>
<header>{#if screen==='home'}<span></span>{:else}<button class="brand" onclick={home} aria-label={$text.home}><ArrowLeft size={18}/><Logo compact/></button>{/if}<div class="header-right"><select class="language" aria-label={$text.language} value={$locale} onchange={e=>setLocale(e.currentTarget.value as Locale)}><option value="ko">한국어</option><option value="ja">日本語</option></select><button aria-label={$text.settings} onclick={()=>settings=!settings}><Settings size={18}/></button></div></header>
{#if screen==='home'}
<main class="home" in:fade={{duration:reduced?0:250}}><div class="home-board" aria-hidden="true"></div><div class="home-glow" aria-hidden="true"></div><div class="home-stripe stripe-one" aria-hidden="true"></div><div class="home-stripe stripe-two" aria-hidden="true"></div><section class="home-copy"><Logo/><button class="primary main-play" disabled={!ready} onclick={openSelection}>{$text.start}<span aria-hidden="true">→</span></button>{#if hasSave}<button class="continue" onclick={resume}>{$text.resume}</button>{/if}</section></main>
{:else if screen==='select'}
<main class="selection" in:fly={{y:reduced?0:18,duration:reduced?0:260}}><h1>{$text.selectCharacter}</h1><div class="roster">{#each characters as c,i}<button class="character-choice" class:chosen={selectionPlayer===i} style={`--accent:${c.color}`} onclick={()=>selectCharacter(i)} aria-pressed={selectionPlayer===i} aria-label={characterName(i,$locale)}><div class="choice-art"><CharacterArt index={i}/></div><strong class="choice-name">{characterName(i,$locale)}</strong><b class="choice-check">{selectionPlayer===i?'✓':'+'}</b></button>{/each}</div><div class="selection-bottom"><div class="match-options"><label>{$text.color}<select bind:value={selectionSide}><option value="w">{$text.white}</option><option value="b">{$text.black}</option></select></label><label>{$text.difficulty}<select bind:value={selectionLevel}>{#each ['Easy','Normal','Hard'] as l}<option value={l}>{$text[levelLabels[l as keyof typeof levelLabels]]}</option>{/each}</select></label><button class="primary" onclick={start}>{$text.begin}</button></div></div></main>
{:else}
<main class="match-layout">
<aside class="side left"><SideReaction reaction={leftReaction} {reduced} {speed}/></aside>
<section class="arena">
<div class="profile opponent-profile" class:turn={busy} style={`--profile-accent:${characters[opponent].color}`}><div class="avatar"><CharacterArt index={opponent} portrait/></div><div><h2>{characterName(opponent,$locale,true)}</h2><span>{side==='w'?$text.black:$text.white}</span></div><div class="profile-status">{longThinking?$text.thinking:''}</div><button class="lab-toggle" aria-label={$text.lab} onclick={()=>lab=!lab}><FlaskConical size={18}/></button></div>
<div class="board-frame" class:introducing={intro}><div class="board" data-ply={moves.length} use:mountBoard aria-busy={intro||moving||busy}>{#each squares as piece,i}{@const sq=square(i)}<button class:dark={(Math.floor(i/8)+i%8)%2===1} class:selected={selected===sq} class:last={last?.from===sq||last?.to===sq} class:check={piece?.type==='k'&&piece.color===game.turn()&&game.isCheck()} class="square" data-square={sq} aria-label={`${sq} ${piece?piece.color+piece.type:$text.empty}`} draggable={piece?.color===side&&!intro&&!busy&&!moving&&!playing&&!result&&!promotion} ondragstart={()=>{selected=sq;legal=game.moves({square:sq,verbose:true}).map(m=>m.to)}} ondragover={e=>e.preventDefault()} ondrop={e=>{e.preventDefault();void choose(sq)}} onclick={()=>choose(sq)}><span class:white-piece={piece?.color==='w'} class="piece">{piece?glyph[piece.color+piece.type]:''}</span>{#if legal.includes(sq)}<i class="dot"></i>{/if}{#if i%8===0}<small class="coord rankcoord">{sq[1]}</small>{/if}{#if i>=56}<small class="coord filecoord">{sq[0]}</small>{/if}</button>{/each}{#if intro}<div class="opening-banner" role="status">{$text.begin}</div>{/if}</div></div>
<div class="profile player-profile" class:turn={!busy&&!result} style={`--profile-accent:${characters[player].color}`}><div class="avatar"><CharacterArt index={player} portrait/></div><div><h2>{characterName(player,$locale,true)}</h2><span>{side==='w'?$text.white:$text.black}</span></div><div class="profile-status">{intro?$text.begin:result?$text[result]:!busy?$text.yourTurn:''}</div></div>
{#if error}<div class="error" role="alert">{$text[error]}<button onclick={resume}>{$text.retry}</button></div>{/if}
<div class="board-actions"><button onclick={undo} disabled={!moves.length||playing||moving||intro}><RotateCcw size={15}/>{$text.undo}</button><button onclick={openSelection}>{$text.newGame}</button><select aria-label={$text.difficulty} bind:value={level} onchange={persist}>{#each ['Easy','Normal','Hard'] as l}<option value={l}>{$text[levelLabels[l as keyof typeof levelLabels]]}</option>{/each}</select></div>
{#if result&&!playing&&!moving&&!busy&&!intro}<div class="result"><h2>{$text[result]}</h2><p>{game.isCheckmate()?lineFor(last?.color===side?player:opponent,'victory',0,$locale):$text.drawLine}</p><details class="review"><summary>{$text.history}</summary><div class="history" aria-label={$text.history}><button aria-label={$text.previousMoves} disabled={historyStart===0} onclick={()=>historyOffset++}><ChevronLeft size={14}/></button><div>{#each visibleMoves as m,i}{@const ply=historyStart+i}<span title={`${Math.floor(ply/2)+1}. ${m.san}`}>{ply%2===0?Math.floor(ply/2)+1+'. ':''}{m.san}</span>{/each}</div><button aria-label={$text.nextMoves} disabled={historyOffset===0} onclick={()=>historyOffset--}><ChevronRight size={14}/></button></div></details><button class="primary" onclick={openSelection}>{$text.again}</button><button onclick={home}>{$text.home}</button></div>{/if}

</section>
<aside class="side right"><SideReaction reaction={rightReaction} right {reduced} {speed}/></aside>
</main>
{/if}
</div>
{#if settings}<div class="modal-backdrop"><div class="panel" role="dialog" tabindex="-1" aria-modal="true" aria-label={$text.settings}><button class="close" aria-label={$text.close} onclick={()=>settings=false}>✕</button><h2>{$text.settings}</h2><label><input type="checkbox" bind:checked={effects} onchange={()=>{if(!effects){clearReactions();cut?.skip()}persist()}}/>{$text.effects}</label><label><input type="checkbox" bind:checked={muted} onchange={()=>{sound.muted=muted;persist()}}/>{$text.muted}</label><label>{$text.volume}<input type="range" min="0" max="1" step="0.05" bind:value={volume} onchange={()=>{sound.volume=volume;persist()}}/></label></div></div>{/if}
{#if lab&&screen==='game'}<section class="lab-panel" aria-label={$text.lab}><div class="lab-heading"><strong>{$text.lab}</strong><button aria-label={$text.close} onclick={()=>lab=false}>✕</button></div><div class="lab-options"><select aria-label={$text.testCharacter} bind:value={labChar}>{#each characters as c,i}<option value={i}>{characterName(i,$locale,true)}</option>{/each}</select><label>{$text.speed}<select bind:value={speed}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label></div><div class="lab-buttons">{#each ['check','enpassant','queen','promotion','victory','defeat'] as event}<button disabled={playing||busy||moving||intro||!effects} onclick={()=>preview(event as Reaction)}>{eventName(event as keyof typeof import('$lib/characters').eventNames,$locale)}</button>{/each}<button disabled={playing||busy||moving||intro||!effects} onclick={()=>preview('checkmate')}>{$text.checkmate}</button><button onclick={()=>{cut?.skip();clearReactions()}}>{$text.skip}</button></div>{#if !effects}<p>{$text.effectsOff}</p>{/if}</section>{/if}
{#if promotion}<div class="modal-backdrop"><div class="panel" role="dialog" tabindex="-1" aria-modal="true" aria-label={$text.promotionChoice}><h2>{$text.promotionChoice}</h2><div class="promotions">{#each ['q','r','b','n'] as p}<button aria-label={$text[({q:'queen',r:'rook',b:'bishop',n:'knight'} as const)[p as 'q'|'r'|'b'|'n']]} onclick={async()=>{const m=promotion!;promotion=null;await humanMove(m.from,m.to,p)}}>{glyph[side+p]}</button>{/each}</div></div></div>{/if}
<Cutscene bind:this={cut}/>
