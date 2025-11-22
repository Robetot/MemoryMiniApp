// SIMPLE MEMORY GAME – WORKS IN BROWSER

const LEVELS = [
  { level: 1, pairs: 4 },
  { level: 2, pairs: 6 },
  { level: 3, pairs: 8 },
];

const IMAGES = Array.from({ length: 8 }, (_, i) => `images/card${i + 1}.svg`);

let currentLevel = 0;
let first = null;
let second = null;
let lock = false;
let moves = 0;
let matched = 0;
let seconds = 0;
let timerId = null;
let scoreMultiplier = 10;

// DOM elements
const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const levelEl = document.getElementById("level");
const restartBtn = document.getElementById("restart");
const finishOverlay = document.getElementById("finish");
const finishTitle = document.getElementById("finishTitle");
const finalLevel = document.getElementById("finalLevel");
const finalMoves = document.getElementById("finalMoves");
const finalTime = document.getElementById("finalTime");
const finalScore = document.getElementById("finalScore");
const nextLevelBtn = document.getElementById("nextLevel");
const submitScoreBtn = document.getElementById("submitScore");
const topScoresList = document.getElementById("topScores");

// basic sounds (optional; ignore if they fail)
const sounds = {
  flip: new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
  ),
  match: new Audio(
    "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
  ),
  fanfare: new Audio(
    "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
  ),
};

function safePlay(sound) {
  try {
    sound.currentTime = 0;
    sound.play();
  } catch (e) {
    // ignore autoplay errors
  }
}

// Fisher–Yates shuffle
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startTimer() {
  clearInterval(timerId);
  seconds = 0;
  timeEl.textContent = seconds;
  timerId = setInterval(() => {
    seconds++;
    timeEl.textContent = seconds;
  }, 1000);
}

function buildBoard() {
  board.innerHTML = "";
  matched = 0;
  moves = 0;
  movesEl.textContent = moves;
  first = null;
  second = null;
  lock = false;

  const count = LEVELS[currentLevel].pairs;
  const cards = shuffle(IMAGES.slice(0, count).flatMap((img) => [img, img]));
  const gridCols = Math.ceil(Math.sqrt(count * 2));
  board.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;

  cards.forEach((img) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.img = img;
    card.innerHTML = `
      <div class="face front"></div>
      <div class="face back">
        <img src="${img}" width="64" height="64" />
      </div>
    `;
    card.addEventListener("click", () => onCardClick(card));
    board.appendChild(card);
  });

  levelEl.textContent = currentLevel + 1;
  startTimer();
}

function onCardClick(card) {
  if (lock || card.classList.contains("flipped")) return;

  safePlay(sounds.flip);

  if (!first) {
    first = card;
    card.classList.add("flipped");
    return;
  }

  second = card;
  card.classList.add("flipped");
  lock = true;
  moves++;
  movesEl.textContent = moves;

  if (first.dataset.img === second.dataset.img) {
    matched += 2;
    safePlay(sounds.match);
    setTimeout(() => {
      first.style.pointerEvents = "none";
      second.style.pointerEvents = "none";
      resetTurn();
      checkWin();
    }, 400);
  } else {
    setTimeout(() => {
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      resetTurn();
    }, 600);
  }
}

function resetTurn() {
  first = null;
  second = null;
  lock = false;
}

function checkWin() {
  if (matched === LEVELS[currentLevel].pairs * 2) {
    clearInterval(timerId);
    safePlay(sounds.fanfare);
    showFinish();
  }
}

function showFinish(msg = "Level Complete!") {
  const score = Math.max(1, Math.round((moves + seconds) * scoreMultiplier));

  finishTitle.textContent = msg;
  finalLevel.textContent = currentLevel + 1;
  finalMoves.textContent = moves;
  finalTime.textContent = seconds;
  finalScore.textContent = score;

  saveHighScore(score);
  loadLeaderboard();

  finishOverlay.classList.remove("hidden");
}

// local high scores (browser only)
function saveHighScore(score) {
  let scores = JSON.parse(localStorage.getItem("highScores") || "[]");
  scores.push({ level: currentLevel + 1, score });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem("highScores", JSON.stringify(scores));
}

function loadLeaderboard() {
  topScoresList.innerHTML = "";
  const scores = JSON.parse(localStorage.getItem("highScores") || "[]");
  scores.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = `Level ${s.level}: ${s.score}`;
    topScoresList.appendChild(li);
  });

  // keep Farcaster integration guarded so it doesn't break browser
  if (window.sdk && sdk.actions && sdk.actions.getLeaderboard) {
    sdk.actions
      .getLeaderboard({ limit: 5 })
      .then((remote) => {
        remote.forEach((s) => {
          const li = document.createElement("li");
          li.textContent = `${s.username}: ${s.score}`;
          topScoresList.appendChild(li);
        });
      })
      .catch((e) => console.log("Remote leaderboard error:", e));
  }
}

// buttons
restartBtn.addEventListener("click", () => {
  finishOverlay.classList.add("hidden");
  buildBoard();
});

nextLevelBtn.addEventListener("click", () => {
  finishOverlay.classList.add("hidden");
  if (currentLevel < LEVELS.length - 1) {
    currentLevel++;
  } else {
    currentLevel = 0;
  }
  buildBoard();
});

submitScoreBtn.addEventListener("click", async () => {
  const score = Math.max(1, Math.round((moves + seconds) * scoreMultiplier));

  try {
    if (window.sdk && sdk.actions && sdk.actions.mintNFT) {
      await sdk.actions.mintNFT({
        ownerAddress: "0x393d4edc3cc905b2db282d2d0a6ef47d8ae5a10a",
        name: "MemoryMiniNFT",
        description: `Memory Mini App score: ${score} (Level ${currentLevel + 1})`,
        imageUrl: "https://robetot.github.io/MemoryMiniApp/images/card1.svg",
        attributes: [
          { trait_type: "Score", value: score },
          { trait_type: "Level", value: currentLevel + 1 },
        ],
      });
      alert("NFT minted successfully!");
    } else {
      await navigator.clipboard.writeText(
        `Memory Mini App score: ${score} (Level ${currentLevel + 1})`
      );
      alert("Score copied to clipboard!");
    }
  } catch (e) {
    console.log(e);
    alert("Score: " + score);
  }
});

// start game
buildBoard();
