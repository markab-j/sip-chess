import {derived,writable} from 'svelte/store';
export type Locale='ko'|'ja';
export const locale=writable<Locale>('ko');
export const ko={
 title:'sip-chess',start:'게임 시작',single:'싱글 플레이',resume:'이어하기',back:'뒤로',home:'메인으로',selectCharacter:'캐릭터 선택',begin:'대국 시작',color:'기물',white:'백',black:'흑',difficulty:'난이도',easy:'쉬움',normal:'보통',hard:'어려움',settings:'설정',sound:'사운드',muted:'음소거',volume:'볼륨',effects:'캐릭터 연출',language:'언어',yourTurn:'내 차례',thinking:'생각 중…',undo:'무르기',newGame:'새 대국',history:'기보',previousMoves:'이전 기보',nextMoves:'다음 기보',end:'대국 종료',again:'다시 두기',drawLine:'무승부네요. 다시 둘까요?',promotionChoice:'승격할 기물',queen:'퀸',rook:'룩',bishop:'비숍',knight:'나이트',lab:'연출 테스트',testCharacter:'테스트 캐릭터',speed:'속도',skip:'건너뛰기',close:'닫기',effectsOff:'설정에서 캐릭터 연출을 켜 주세요.',checkmate:'체크메이트',cinematic:'체크메이트 연출',whiteWins:'백 승리',blackWins:'흑 승리',stalemate:'스테일메이트 · 무승부',repetition:'3회 반복 · 무승부',fiftyMoves:'50수 규칙 · 무승부',insufficient:'기물 부족 · 무승부',draw:'무승부',engineTimeout:'AI 연결 시간이 초과됐습니다.',engineLoad:'AI 엔진을 불러오지 못했습니다.',engineFailure:'AI 계산에 실패했습니다.',restoreError:'저장된 대국을 불러오지 못했습니다.',retry:'다시 연결',you:'나',opponent:'상대',empty:'빈 칸'
};
export type MessageKey=keyof typeof ko;
export const ja:Record<MessageKey,string>={
 title:'sip-chess',start:'ゲーム開始',single:'ひとりで対局',resume:'つづきから',back:'戻る',home:'メインへ',selectCharacter:'キャラクター選択',begin:'対局開始',color:'駒の色',white:'白',black:'黒',difficulty:'難易度',easy:'やさしい',normal:'ふつう',hard:'むずかしい',settings:'設定',sound:'サウンド',muted:'ミュート',volume:'音量',effects:'キャラクター演出',language:'言語',yourTurn:'あなたの番',thinking:'考え中…',undo:'待った',newGame:'新しい対局',history:'棋譜',previousMoves:'前の棋譜',nextMoves:'次の棋譜',end:'対局終了',again:'もう一局',drawLine:'引き分けですね。もう一局どうですか？',promotionChoice:'昇格する駒',queen:'クイーン',rook:'ルーク',bishop:'ビショップ',knight:'ナイト',lab:'演出テスト',testCharacter:'テストキャラクター',speed:'速度',skip:'スキップ',close:'閉じる',effectsOff:'設定でキャラクター演出をオンにしてください。',checkmate:'チェックメイト',cinematic:'チェックメイト演出',whiteWins:'白の勝ち',blackWins:'黒の勝ち',stalemate:'ステイルメイト・引き分け',repetition:'同一局面3回・引き分け',fiftyMoves:'50手ルール・引き分け',insufficient:'戦力不足・引き分け',draw:'引き分け',engineTimeout:'AIへの接続がタイムアウトしました。',engineLoad:'AIエンジンを読み込めませんでした。',engineFailure:'AIの計算に失敗しました。',restoreError:'保存した対局を読み込めませんでした。',retry:'再接続',you:'自分',opponent:'相手',empty:'空きマス'
};
export const messages={ko,ja};
export const text=derived(locale,l=>messages[l]);
export function setLocale(value:Locale){locale.set(value);if(typeof localStorage!=='undefined')localStorage.setItem('anime-chess-locale',value)}
