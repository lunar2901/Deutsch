// Simple verb trainer using the cards array from words.js

let mode = "de-en";  // "de-en", "en-de", or "cloze"
let queue = [];
let current = null;

function loadProgress() {
  const json = localStorage.getItem("wsProgress") || "{}";
  return JSON.parse(json);
}

function saveProgress(progress) {
  localStorage.setItem("wsProgress", JSON.stringify(progress));
}

function buildQueue() {
  const progress = loadProgress();
  const now = Date.now();
  queue = cards.filter(c => {
    const p = progress[c.id];
    if (!p) return true;  // new card
    return p.next <= now; // due card
  });
  if (queue.length === 0) queue = cards.slice(0, 20);
}

function showNext() {
  if (queue.length === 0) buildQueue();
  current = queue[Math.floor(Math.random() * queue.length)];
  queue = queue.filter(c => c.id !== current.id);
  
  const promptEl = document.getElementById("prompt");
  const solutionEl = document.getElementById("solution");
  const answerEl = document.getElementById("answer");
  
  solutionEl.style.display = "none";
  answerEl.value = "";

  if (mode === "de-en") {
    promptEl.textContent = current.deExample;
  } else if (mode === "en-de") {
    promptEl.textContent = current.enExample;
  } else if (mode === "cloze") {
    const cloze = current.deExample.replace(new RegExp(current.root, 'i'), "_____");
    promptEl.textContent = cloze;
  }
}

function showSolution() {
  const solutionEl = document.getElementById("solution");
  if (mode === "de-en") {
    solutionEl.innerHTML = `<strong>${current.enExample}</strong><br>(${current.root} – ${current.meaning})`;
  } else if (mode === "en-de" || mode === "cloze") {
    solutionEl.innerHTML = `<strong>${current.deExample}</strong><br>(${current.root} – ${current.meaning})`;
  }
  solutionEl.style.display = "block";
}

function rateCard(grade) {
  const progress = loadProgress();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  let p = progress[current.id] || { interval: day, next: now };

  if (grade === "hard") p.interval = day;
  else if (grade === "ok") p.interval *= 2;
  else if (grade === "easy") p.interval *= 3;
  
  p.next = now + p.interval;
  progress[current.id] = p;
  saveProgress(progress);
  
  showNext();
}

// Initialize when page loads
window.addEventListener("load", function() {
  buildQueue();
  showNext();
});
