import {Chess} from 'chess.js';
export function outcome(g:Chess){if(g.isCheckmate())return g.turn()==='w'?'흑 승리':'백 승리';if(g.isStalemate())return '스테일메이트 · 무승부';if(g.isThreefoldRepetition())return '3회 반복 · 무승부';if(g.isDrawByFiftyMoves())return '50수 규칙 · 무승부';if(g.isInsufficientMaterial())return '기물 부족 · 무승부';return g.isDraw()?'무승부':'';}

export function outcomeKey(g:Chess):'whiteWins'|'blackWins'|'stalemate'|'repetition'|'fiftyMoves'|'insufficient'|'draw'|null {
 if(g.isCheckmate())return g.turn()==='w'?'blackWins':'whiteWins';
 if(g.isStalemate())return 'stalemate';if(g.isThreefoldRepetition())return 'repetition';
 if(g.isDrawByFiftyMoves())return 'fiftyMoves';if(g.isInsufficientMaterial())return 'insufficient';
 return g.isDraw()?'draw':null;
}
