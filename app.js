const vocab = [
  { hanzi: "恭", pinyin: "gōng", meaning: "respectful" },
  { hanzi: "喜", pinyin: "xǐ", meaning: "joy" },
  { hanzi: "發", pinyin: "fā", meaning: "to prosper" },
  { hanzi: "財", pinyin: "cái", meaning: "wealth" },
  { hanzi: "新", pinyin: "xīn", meaning: "new" },
  { hanzi: "年", pinyin: "nián", meaning: "year" },
  { hanzi: "快", pinyin: "kuài", meaning: "fast" },
  { hanzi: "樂", pinyin: "lè", meaning: "happiness" },
  { hanzi: "福", pinyin: "fú", meaning: "blessing" },
  { hanzi: "紅", pinyin: "hóng", meaning: "red" },
  { hanzi: "包", pinyin: "bāo", meaning: "packet" },
];

const rounds = [...vocab];
let roundIndex = 0;
let score = 0;
let streak = 0;
let questionLocked = false;

const characterEl = document.getElementById("character");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const scoreLabel = document.getElementById("score-label");
const streakLabel = document.getElementById("streak-label");
const roundLabel = document.getElementById("round-label");
const progressBar = document.getElementById("progress-bar");
const resultEl = document.getElementById("result");

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildChoices(answerIndex) {
  const wrongPool = vocab.filter((_, idx) => idx !== answerIndex).map((item) => item.meaning);
  const wrongChoices = shuffle(wrongPool).slice(0, 3);
  return shuffle([vocab[answerIndex].meaning, ...wrongChoices]);
}

function updateMeta() {
  scoreLabel.textContent = `Score: ${score}`;
  streakLabel.textContent = `Streak: ${streak}`;
  roundLabel.textContent = `Round ${Math.min(roundIndex + 1, rounds.length)} / ${rounds.length}`;
  progressBar.style.width = `${(roundIndex / rounds.length) * 100}%`;
}

function renderRound() {
  updateMeta();
  resultEl.classList.add("hidden");
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  questionLocked = false;
  nextBtn.disabled = true;

  const current = rounds[roundIndex];
  const answerIndex = vocab.findIndex((item) => item.hanzi === current.hanzi);

  characterEl.textContent = current.hanzi;
  choicesEl.innerHTML = "";

  buildChoices(answerIndex).forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.addEventListener("click", () => handleChoice(btn, choice, current));
    choicesEl.appendChild(btn);
  });
}

function handleChoice(button, choice, current) {
  if (questionLocked) {
    return;
  }
  questionLocked = true;

  const isCorrect = choice === current.meaning;
  const allButtons = [...document.querySelectorAll(".choice-btn")];

  allButtons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === current.meaning) {
      btn.classList.add("correct");
    }
  });

  if (isCorrect) {
    score += 10;
    streak += 1;
    feedbackEl.textContent = `Great! ${current.hanzi} (${current.pinyin}) means “${current.meaning}”.`;
    feedbackEl.classList.add("good");
  } else {
    streak = 0;
    button.classList.add("wrong");
    feedbackEl.textContent = `Not yet. ${current.hanzi} (${current.pinyin}) means “${current.meaning}”.`;
    feedbackEl.classList.add("bad");
  }

  updateMeta();
  nextBtn.disabled = false;
}

function showResult() {
  const percent = Math.round((score / (rounds.length * 10)) * 100);
  progressBar.style.width = "100%";
  resultEl.classList.remove("hidden");
  resultEl.innerHTML = `
    <h2>Lesson complete 🎉</h2>
    <p>You scored <strong>${score}</strong> points (${percent}%).</p>
    <p>Tip: these characters form festive phrases like 恭喜發財 and 新年快樂.</p>
  `;
  characterEl.textContent = "完成";
  choicesEl.innerHTML = "";
  feedbackEl.textContent = "";
  nextBtn.disabled = true;
}

nextBtn.addEventListener("click", () => {
  roundIndex += 1;
  if (roundIndex >= rounds.length) {
    showResult();
    return;
  }
  renderRound();
});

restartBtn.addEventListener("click", () => {
  roundIndex = 0;
  score = 0;
  streak = 0;
  rounds.sort(() => Math.random() - 0.5);
  renderRound();
});

rounds.sort(() => Math.random() - 0.5);
renderRound();
