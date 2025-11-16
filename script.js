const LEVELS = [
  {level:1, pairs:4},
  {level:2, pairs:6},
  {level:3, pairs:8}
];
const IMAGES = Array.from({length:8},(_,i)=>images/card.png);
let currentLevel=0, first=null, second=null, lock=false, moves=0, matched=0, seconds=0, timerId=null, countdownId=null;
const board=document.getElementById('board'), movesEl=document.getElementById('moves'), timeEl=document.getElementById('time'), levelEl=document.getElementById('level');
const restartBtn=document.getElementById('restart'), finishOverlay=document.getElementById('finish'), finishTitle=document.getElementById('finishTitle');
const finalLevel=document.getElementById('finalLevel'), finalMoves=document.getElementById('finalMoves'), finalTime=document.getElementById('finalTime'), finalScore=document.getElementById('finalScore');
const nextLevelBtn=document.getElementById('nextLevel'), submitScoreBtn=document.getElementById('submitScore'), topScoresList=document.getElementById('topScores');

function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function startTimer(){clearInterval(timerId);seconds=0;timeEl.textContent=seconds;timerId=setInterval(()=>{seconds++;timeEl.textContent=seconds},1000)}
function startCountdown(){let remaining=120;clearInterval(countdownId);countdownId=setInterval(()=>{if(remaining<=0){clearInterval(countdownId);finishTitle.textContent='Time\\'s up!';showFinish()}else remaining--},1000)}

function buildBoard(){board.innerHTML='';const count=LEVELS[currentLevel].pairs;let cards=shuffle(IMAGES.slice(0,count).flatMap(e=>[e,e]));let gridCols=Math.ceil(Math.sqrt(count*2));board.style.gridTemplateColumns='repeat('+gridCols+',1fr)';cards.forEach(img=>{const card=document.createElement('div');card.className='card';card.dataset.img=img;card.innerHTML=<div class='face front'></div><div class='face back'><img src='' width='64' height='64'/></div>;card.addEventListener('click',()=>onCardClick(card));board.appendChild(card)});moves=0;movesEl.textContent=moves;matched=0;first=second=null;lock=false;startTimer();startCountdown();levelEl.textContent=currentLevel+1}
function onCardClick(card){if(lock||card.classList.contains('flipped'))return;if(!first){first=card;card.classList.add('flipped');return}second=card;card.classList.add('flipped');lock=true;moves++;movesEl.textContent=moves;if(first.dataset.img===second.dataset.img){matched+=2;setTimeout(()=>{first.style.pointerEvents='none';second.style.pointerEvents='none';resetTurn();checkWin()},500)}else{setTimeout(()=>{first.classList.remove('flipped');second.classList.remove('flipped');resetTurn()},700)}}
function resetTurn(){first=second=null;lock=false}
function checkWin(){if(matched===LEVELS[currentLevel].pairs*2){clearInterval(timerId);clearInterval(countdownId);showFinish()}}
function showFinish(){finalLevel.textContent=currentLevel+1;finalMoves.textContent=moves;finalTime.textContent=seconds;finalScore.textContent=(moves+seconds);finishOverlay.classList.remove('hidden');loadLeaderboard()}
restartBtn.addEventListener('click',()=>{buildBoard();finishOverlay.classList.add('hidden')});
nextLevelBtn.addEventListener('click',()=>{if(currentLevel<LEVELS.length-1){currentLevel++;buildBoard();finishOverlay.classList.add('hidden')}});
submitScoreBtn.addEventListener('click',async()=>{const score=moves+seconds;try{if(window.sdk){await sdk.actions.mintNFT({ownerAddress:'0x393d4edc3cc905b2db282d2d0a6ef47d8ae5a10a',name:'MemoryMiniNFT',description:Memory Mini App score:  (Level ),imageUrl:'https://Robetot.github.io/MemoryMiniApp/'+IMAGES[0],attributes:[{trait_type:'Score',value:score},{trait_type:'Level',value:currentLevel+1}]});alert('NFT minted successfully!')}else{await navigator.clipboard.writeText(Memory Mini App score: );alert('Score copied to clipboard!')}}catch(e){alert('Score: '+score)}});
async function loadLeaderboard(){if(!window.sdk)return;try{const scores=await sdk.actions.getLeaderboard({limit:5});topScoresList.innerHTML='';scores.forEach(s=>{let li=document.createElement('li');li.textContent=${s.username}: ;topScoresList.appendChild(li)})}catch(e){console.log('Leaderboard error:',e)}}
buildBoard();
