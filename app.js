const vocab = [
  { hanzi: "恭", pinyin: "gung1", meaning: "respectful" },
  { hanzi: "喜", pinyin: "hei2", meaning: "joy" },
  { hanzi: "發", pinyin: "faat3", meaning: "to prosper" },
  { hanzi: "財", pinyin: "coi4", meaning: "wealth" },
  { hanzi: "新", pinyin: "san1", meaning: "new" },
  { hanzi: "年", pinyin: "nin4", meaning: "year" },
  { hanzi: "快", pinyin: "faai3", meaning: "fast" },
  { hanzi: "樂", pinyin: "lok6", meaning: "happiness" },
  { hanzi: "福", pinyin: "fuk1", meaning: "blessing" },
  { hanzi: "紅", pinyin: "hung4", meaning: "red" },
  { hanzi: "包", pinyin: "baau1", meaning: "packet" },
];


const confusableChoices = {
  恭: ["工", "公", "紅"],
  喜: ["嬉", "吉", "囍"],
  發: ["友", "髮", "福"],
  財: ["才", "材", "福"],
  新: ["亲", "薪", "斤"],
  年: ["午", "舛", "千"],
  快: ["块", "筷", "决"],
  樂: ["藥", "櫟", "發"],
  福: ["幅", "副", "喜"],
  紅: ["江", "工", "恭"],
  包: ["句", "勺", "已"],
};

const rounds = shuffle([...vocab]);
let roundIndex = 0;
let score = 0;
let streak = 0;
let questionLocked = false;
let currentRound = null;

const questionEl = document.getElementById("question");
const promptEl = document.getElementById("prompt");
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

function buildRound(entry) {
  const distractors = confusableChoices[entry.hanzi] || [];
  const options = shuffle([entry.hanzi, ...distractors]).slice(0, 4);

  return {
    question: `Which one is the correct choice of ${entry.meaning}?`,
    prompt: `(${entry.pinyin})`,
    answer: entry.hanzi,
    options,
    explanation: `${entry.hanzi} means “${entry.meaning}”.`,
  };
}

function updateMeta() {
  scoreLabel.textContent = `Score: ${score}`;
  streakLabel.textContent = `Streak: ${streak}`;
  roundLabel.textContent = `Round ${Math.min(roundIndex + 1, rounds.length)} / ${rounds.length}`;
  progressBar.style.width = `${(roundIndex / rounds.length) * 100}%`;
}

function renderChoices(options) {
  choicesEl.innerHTML = "";
  options.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.dataset.value = choice;
    btn.addEventListener("click", () => handleChoice(btn, choice));
    choicesEl.appendChild(btn);
  });
}

function renderRound() {
  updateMeta();
  resultEl.classList.add("hidden");
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  questionLocked = false;
  nextBtn.disabled = true;

  const current = rounds[roundIndex];
  currentRound = buildRound(current);

  questionEl.textContent = currentRound.question;
  promptEl.textContent = currentRound.prompt;
  renderChoices(currentRound.options);
}

function handleChoice(button, choice) {
  if (questionLocked) {
    return;
  }
  questionLocked = true;

  const isCorrect = choice === currentRound.answer;
  const allButtons = [...document.querySelectorAll(".choice-btn")];

  allButtons.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.value === currentRound.answer) {
      btn.classList.add("correct");
    }
  });

  if (isCorrect) {
    score += 10;
    streak += 1;
    feedbackEl.textContent = `Great! ${currentRound.explanation}`;
    feedbackEl.classList.add("good");
  } else {
    streak = 0;
    button.classList.add("wrong");
    feedbackEl.textContent = `Not yet. ${currentRound.explanation}`;
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
    <p>Great work learning festive Chinese words.</p>
  `;
  questionEl.textContent = "All rounds complete!";
  promptEl.textContent = "Press Restart to practice again.";
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
  rounds.splice(0, rounds.length, ...shuffle(vocab));
  renderRound();
});

renderRound();
