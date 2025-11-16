const EMOJIS=['??','??','??','??','??','??','??','??'];
let board=document.getElementById('board');
let movesEl=document.getElementById('moves');
let timeEl=document.getElementById('time');
let restartBtn=document.getElementById('restart');
let finishOverlay=document.getElementById('finish');
let finalMoves=document.getElementById('finalMoves');
let finalTime=document.getElementById('finalTime');
let finalScore=document.getElementById('finalScore');
let playAgain=document.getElementById('playAgain');
let submitScore=document.getElementById('submitScore');

let first=null, second=null, lock=false, moves=0, matched=0, seconds=0, timerId=null;

function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function startTimer(){clearInterval(timerId);seconds=0;timeEl.textContent=seconds;timerId=setInterval(()=>{seconds++;timeEl.textContent=seconds},1000)}

function buildBoard(){
  board.innerHTML='';
  const cards=shuffle([...EMOJIS,...EMOJIS]);
  cards.forEach(emoji=>{
    const card=document.createElement('div');
    card.className='card';
    card.dataset.emoji=emoji;
    card.innerHTML=<div class="face front"></div><div class="face back"></div>;
    card.addEventListener('click',()=>onCardClick(card));
    board.appendChild(card);
  });
  moves=0;movesEl.textContent=moves;matched=0;first=second=null;lock=false;
  startTimer();
}

function onCardClick(card){
  if(lock||card.classList.contains('flipped')) return;
  card.classList.add('flipped');
  if(!first){first=card;return}
  if(card===first) return;
  second=card;lock=true;moves++;movesEl.textContent=moves;
  if(first.dataset.emoji===second.dataset.emoji){
    matched+=2;setTimeout(()=>{first.style.pointerEvents='none';second.style.pointerEvents='none';resetTurn();checkWin()},500);
  }else{setTimeout(()=>{first.classList.remove('flipped');second.classList.remove('flipped');resetTurn()},700)}
}

function resetTurn(){first=second=null;lock=false}

function checkWin(){
  if(matched===EMOJIS.length*2){clearInterval(timerId);showFinish()}
}

function showFinish(){
  finalMoves.textContent=moves;
  finalTime.textContent=seconds;
  finalScore.textContent=(moves+seconds);
  finishOverlay.classList.remove('hidden');
}

restartBtn.addEventListener('click',()=>{buildBoard();finishOverlay.classList.add('hidden')});
playAgain.addEventListener('click',()=>{buildBoard();finishOverlay.classList.add('hidden')});
submitScore.addEventListener('click',async ()=>{
  const score=moves+seconds;
  try{await navigator.clipboard.writeText(Memory Match score: );alert('Score copied to clipboard!');}catch(e){alert('Score: '+score);}
});

buildBoard();
