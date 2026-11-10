import {test} from 'node:test';import assert from 'node:assert/strict';
import {characters,randomOpponent,lineFor,eventNames,type Reaction} from '../src/lib/characters';
test('opponent never matches chosen character',()=>{for(let player=0;player<characters.length;player++)for(const r of [0,.2,.5,.999]){const opponent=randomOpponent(player,()=>r);assert.notEqual(opponent,player);assert.ok(characters[opponent])}});
test('every character has event-specific dialogue',()=>{for(const c of characters)for(const event of Object.keys(eventNames) as Reaction[]){assert.ok(lineFor(c.index,event));assert.ok(lineFor(c.index,event,99))}assert.equal(new Set(characters.map(c=>lineFor(c.index,'enpassant'))).size,4)});
