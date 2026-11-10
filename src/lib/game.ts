import {Chess} from 'chess.js';
export function outcome(g:Chess){if(g.isCheckmate())return g.turn()==='w'?'흑 승리':'백 승리';if(g.isStalemate())return '스테일메이트 · 무승부';if(g.isThreefoldRepetition())return '3회 반복 · 무승부';if(g.isDrawByFiftyMoves())return '50수 규칙 · 무승부';if(g.isInsufficientMaterial())return '기물 부족 · 무승부';return g.isDraw()?'무승부':'';}
export const characters=[{name:'ARIA',title:'The Astral Knight',color:'#e9ac79',line:'별빛이 가리키는 다음 한 수.',win:'이 별의 끝에서, 나의 승리야.',art:'/art/aria.svg'},{name:'REINA',title:'The Crimson Strategist',color:'#ee8494',line:'당신의 다음 수, 이미 알고 있어.',win:'아름다운 결말이지?',art:'/art/reina.svg'}];
export type Mood='Idle'|'Happy'|'Surprised'|'Worried'|'Victory'|'Defeat';
export const dialogue:Record<Mood,string>={Idle:'자, 우리의 이야기를 시작해 볼까?',Happy:'흐름이 우리 쪽으로 오고 있어.',Surprised:'그런 수를 준비했구나!',Worried:'침착하게… 아직 길은 있어.',Victory:'이 순간을 기다렸어.',Defeat:'다음에는, 꼭 이길 거야.'};
