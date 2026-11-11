export type Evaluation={cp:number;depth:number;best:string;mate:boolean};
export function parseScore(line:string,whiteTurn:boolean):Evaluation|null{
 if(!line.startsWith('info ')||/upperbound|lowerbound/.test(line))return null;
 const score=line.match(/score (cp|mate) (-?\d+)/),depth=line.match(/depth (\d+)/),pv=line.match(/\bpv (\w+)/);
 if(!score||!depth||!pv)return null;
 const mate=score[1]==='mate',value=Number(score[2]);
 return{cp:(mate?Math.sign(value)*10000:value)*(whiteTurn?1:-1),depth:Number(depth[1]),best:pv[1],mate};
}
export function assessMove(before:Evaluation|null,after:Evaluation|null,side:string,uci:string):'blunder'|'good'|null{
 if(!before||!after||Math.min(before.depth,after.depth)<8)return null;
 const loss=(before.cp-after.cp)*(side==='w'?1:-1);
 if(loss>=180)return 'blunder';
 // A best move in a contested position, not a claim of a brilliant sacrifice.
 if(!before.mate&&!after.mate&&before.best===uci&&loss<=35&&Math.abs(before.cp)<250)return 'good';
 return null;
}
export function thinkingTime(ply:number,quality:'blunder'|'good'|null,random=Math.random){
 const opening=ply<10;return Math.round((opening?450:1100)+random()*(opening?650:1600)+(quality==='good'?1500:0)+(random()<.03?1800:0));
}

// Display thinking only when deliberation actually lasts at least five seconds.
export function shouldThink(elapsedMs:number){return elapsedMs>=5000}
