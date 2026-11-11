import type {Reaction} from './characters';
export type DialogueState={lastPly:number,lastAt:number,consideredPly:number};
export const freshDialogue=():DialogueState=>({lastPly:-12,lastAt:0,consideredPly:-1});
// One shared budget for both characters, not one budget per event or speaker.
const chance:Partial<Record<Reaction,number>>={queen:.6,promotion:.6,enpassant:.35,blunder:.12,rook:.08,check:.04};
export function selectDialogue(state:DialogueState,event:Reaction,ply:number,now:number,random=Math.random){
 if(state.consideredPly===ply)return false;
 state.consideredPly=ply;
 const weight=chance[event]??0;
 if(!weight||ply-state.lastPly<12||now-state.lastAt<45000)return false;
 if(random()>=weight)return false;
 state.lastPly=ply;state.lastAt=now;return true;
}
export function restoreDialogue(value:unknown):DialogueState{
 const s=value as DialogueState|undefined;
 return s&&[s.lastPly,s.lastAt,s.consideredPly].every(Number.isFinite)?{...s}:freshDialogue();
}
