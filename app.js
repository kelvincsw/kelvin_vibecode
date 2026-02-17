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

const phrasePatterns = [
  ["恭", "喜", "發", "財"],
  ["新", "年", "快", "樂"],
  ["紅", "包", "福", "氣"],
];

const confusableChoices = {
  恭: ["工", "公", "紅"],
  喜: ["嬉", "吉", "新"],
  發: ["友", "髮", "福"],
  財: ["才", "材", "福"],
  新: ["亲", "薪", "年"],
  年: ["午", "舛", "包"],
  快: ["块", "筷", "福"],
  樂: ["藥", "櫟", "發"],
  福: ["幅", "副", "喜"],
  紅: ["江", "工", "恭"],
  包: ["句", "勺", "年"],
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

function sampleWrongHanzi(answerHanzi, count = 3) {
  const pool = vocab.filter((item) => item.hanzi !== answerHanzi).map((item) => item.hanzi);
  return shuffle(pool).slice(0, count);
}

function buildMeaningQuestion(entry) {
  const wrongChoices = sampleWrongHanzi(entry.hanzi, 3);
  const options = shuffle([entry.hanzi, ...wrongChoices]);

  return {
    type: "meaning",
    question: `Which Chinese word below means ${entry.meaning}?`,
    prompt: `(${entry.pinyin})`,
    answer: entry.hanzi,
    options,
    explanation: `${entry.hanzi} means “${entry.meaning}”.`,
  };
}

function buildMissingWordQuestion(entry) {
  const phrase = phrasePatterns.find((pattern) => pattern.includes(entry.hanzi)) || ["恭", "喜", "發", "財"];
  const masked = phrase.filter((char) => char !== entry.hanzi).join("");
  const providedWrong = confusableChoices[entry.hanzi] || sampleWrongHanzi(entry.hanzi, 3);
  const options = shuffle([entry.hanzi, ...providedWrong.slice(0, 3)]);

  return {
    type: "missing",
    question: `${masked}, which word is missing?`,
    prompt: "Choose the best Chinese character to complete the phrase.",
    answer: entry.hanzi,
    options,
    explanation: `${phrase.join("")} is the full phrase.`,
  };
}

function buildRound(entry) {
  if (Math.random() < 0.5) {
    return buildMissingWordQuestion(entry);
  }
  return buildMeaningQuestion(entry);
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
  currentRound = buildRound(current);

  questionEl.textContent = currentRound.question;
  promptEl.textContent = currentRound.prompt;
  choicesEl.innerHTML = "";

  currentRound.options.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.addEventListener("click", () => handleChoice(btn, choice));
    choicesEl.appendChild(btn);
  });
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
    if (btn.textContent === currentRound.answer) {
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
    <p>Great work answering both English-to-Chinese and missing-word phrase questions.</p>
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
