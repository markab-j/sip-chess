import {test} from 'node:test';import assert from 'node:assert/strict';import {Chess} from 'chess.js';import {outcome} from '../src/lib/game';
test('fools mate ends game',()=>{const g=new Chess();['f3','e5','g4','Qh4#'].forEach(m=>g.move(m));assert.equal(outcome(g),'흑 승리')});
test('stalemate',()=>assert.match(outcome(new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')),/스테일/));
test('promotion choice',()=>{const g=new Chess('7k/P7/6K1/8/8/8/8/8 w - - 0 1');g.move({from:'a7',to:'a8',promotion:'n'});assert.equal(g.get('a8')?.type,'n')});
test('castling and en passant',()=>{const g=new Chess();['e4','a6','e5','d5','exd6'].forEach(m=>g.move(m));assert.equal(g.get('d5'),undefined);const c=new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');c.move('O-O');assert.equal(c.get('f1')?.type,'r')});
test('repetition survives PGN restore',()=>{const g=new Chess();['Nf3','Nf6','Ng1','Ng8','Nf3','Nf6','Ng1','Ng8'].forEach(m=>g.move(m));const r=new Chess();r.loadPgn(g.pgn());assert.match(outcome(r),/3회/)});
test('fifty move draw',()=>assert.match(outcome(new Chess('7k/8/6K1/8/8/8/8/R7 w - - 100 60')),/50수/));
