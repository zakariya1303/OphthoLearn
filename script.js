// ========= YEAR IN FOOTER =========
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// ========= THEME TOGGLE =========
const THEME_KEY = "ophthoTheme";
const bodyEl = document.body;
const themeToggleBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  const finalTheme = theme === "light" ? "light" : "dark";
  bodyEl.dataset.theme = finalTheme;
  if (themeToggleBtn) {
    themeToggleBtn.textContent = finalTheme === "dark" ? "🌙" : "☀︎";
  }
}

function loadTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  // Default dark, but if user prefers light, honour that
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

const initialTheme = loadTheme();
applyTheme(initialTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const newTheme = bodyEl.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
    saveTheme(newTheme);
  });
}

// ========= PROGRESS STORAGE =========
const PROGRESS_KEY = "ophthoProgress";
const PASS_MARK = 3; // quiz pass threshold

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return {
        modulesViewed: { history: false, exam: false, conditions: false },
        quizBestScore: 0,
        osceTimedOnce: false,
        osceChecklistOnce: false
      };
    }
    const parsed = JSON.parse(raw);
    return {
      modulesViewed: {
        history: !!parsed.modulesViewed?.history,
        exam: !!parsed.modulesViewed?.exam,
        conditions: !!parsed.modulesViewed?.conditions
      },
      quizBestScore: Number(parsed.quizBestScore) || 0,
      osceTimedOnce: !!parsed.osceTimedOnce,
      osceChecklistOnce: !!parsed.osceChecklistOnce
    };
  } catch {
    return {
      modulesViewed: { history: false, exam: false, conditions: false },
      quizBestScore: 0,
      osceTimedOnce: false,
      osceChecklistOnce: false
    };
  }
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

let progress = loadProgress();

/* ========= MODULE VIEWER ========= */
const modules = {
  history: {
    title: "History & Red Flags",
    content: `
      <ul>
        <li><strong>Onset:</strong> Sudden vs gradual, unilateral vs bilateral.</li>
        <li><strong>Pain:</strong> Severe eye pain, headache, nausea & vomiting → think acute angle-closure glaucoma.</li>
        <li><strong>Visual symptoms:</strong> Flashes/floaters, curtain over vision, diplopia.</li>
        <li><strong>Red flags:</strong> Reduced visual acuity, RAPD, severe pain, trauma, contact lens use with red eye.</li>
      </ul>
      <p><em>OSCE tip:</em> Always end by asking about systemic symptoms and past ocular history (previous surgery, glaucoma, diabetes).</p>
    `
  },
  exam: {
    title: "Cranial Nerve & Eye Examination",
    content: `
      <ol>
        <li><strong>General inspection:</strong> Facial symmetry, ptosis, proptosis, obvious redness or discharge.</li>
        <li><strong>Visual acuity:</strong> Snellen chart at 6m (or 3m). Test each eye separately with glasses.</li>
        <li><strong>Visual fields:</strong> Confrontation to finger counting.</li>
        <li><strong>Pupils:</strong> Size, shape, direct & consensual response, swinging light test for RAPD.</li>
        <li><strong>Eye movements:</strong> H-test, ask about diplopia, observe for nystagmus.</li>
        <li><strong>CN V & VII:</strong> Corneal reflex, facial movements (raise eyebrows, close eyes tight, smile).</li>
      </ol>
      <p><em>OSCE tip:</em> Narrate your findings as you go and always comment on how you would complete the exam.</p>
    `
  },
  conditions: {
    title: "Common Ophthalmic Conditions",
    content: `
      <ul>
        <li><strong>Cataract:</strong> Painless, gradual loss of vision, glare, reduced red reflex.</li>
        <li><strong>Open-angle glaucoma:</strong> Peripheral field loss, raised IOP, optic disc cupping.</li>
        <li><strong>AMD:</strong> Central visual distortion, difficulty reading, drusen on fundoscopy.</li>
        <li><strong>Acute angle-closure:</strong> Severe pain, haloes around lights, mid-dilated fixed pupil, rock-hard eye.</li>
      </ul>
      <p><em>OSCE tip:</em> Link symptoms to pathophysiology briefly to impress examiners.</p>
    `
  }
};

const moduleButtons = document.querySelectorAll("[data-module]");
const moduleTitle = document.getElementById("moduleTitle");
const moduleContent = document.getElementById("moduleContent");

function markModuleComplete(key) {
  if (!progress.modulesViewed[key]) {
    progress.modulesViewed[key] = true;
    saveProgress();
    updateProgressUI();
  }
}

moduleButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.module;
    const mod = modules[key];
    if (!mod) return;
    moduleTitle.textContent = mod.title;
    moduleContent.innerHTML = mod.content;
    markModuleComplete(key);
  });
});

// "Start Core Module" button scrolls to modules section
const startModuleBtn = document.getElementById("startModuleBtn");
if (startModuleBtn) {
  startModuleBtn.addEventListener("click", () => {
    const modulesSection = document.getElementById("modules");
    if (modulesSection) {
      modulesSection.scrollIntoView({ behavior: "smooth" });
    }
  });
}

/* ========= QUIZ ========= */
const quizQuestions = [
  {
    question: "Which symptom is a red flag requiring same-day ophthalmology review?",
    options: [
      "Mild gritty sensation in both eyes",
      "Gradual blurring of vision over years",
      "Sudden painless loss of vision in one eye",
      "Occasional floaters for the last 5 years"
    ],
    answerIndex: 2
  },
  {
    question: "A positive swinging light test (RAPD) suggests:",
    options: [
      "Optic nerve pathology in the affected eye",
      "Normal pupillary reflexes",
      "Physiological anisocoria",
      "Complete third nerve palsy"
    ],
    answerIndex: 0
  },
  {
    question: "In an OSCE cranial nerve exam, eye movements primarily assess:",
    options: [
      "CN II only",
      "CN III, IV and VI",
      "CN V and VII",
      "CN IX and X"
    ],
    answerIndex: 1
  }
];

const quizContainer = document.getElementById("quizContainer");

function renderQuiz() {
  if (!quizContainer) return;
  quizContainer.innerHTML = "";
  quizQuestions.forEach((q, idx) => {
    const qDiv = document.createElement("div");
    qDiv.className = "quiz-question";

    const title = document.createElement("h4");
    title.textContent = `Q${idx + 1}. ${q.question}`;

    const optionsDiv = document.createElement("div");
    optionsDiv.className = "quiz-options";

    q.options.forEach((opt, optIdx) => {
      const id = `q${idx}_opt${optIdx}`;
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${idx}`;
      input.value = optIdx;
      input.id = id;

      label.setAttribute("for", id);
      label.appendChild(input);
      label.append(` ${opt}`);
      optionsDiv.appendChild(label);
    });

    qDiv.appendChild(title);
    qDiv.appendChild(optionsDiv);
    quizContainer.appendChild(qDiv);
  });
}

renderQuiz();

const submitQuizBtn = document.getElementById("submitQuizBtn");

if (submitQuizBtn) {
  submitQuizBtn.addEventListener("click", () => {
    let score = 0;

    quizQuestions.forEach((q, idx) => {
      const selected = document.querySelector(`input[name="q${idx}"]:checked`);
      if (selected && Number(selected.value) === q.answerIndex) {
        score++;
      }
    });

    const result = document.getElementById("quizResult");
    if (result) {
      result.textContent = `You scored ${score} / ${quizQuestions.length}.`;
      if (score >= PASS_MARK) {
        result.textContent += " Well done – you've reached the pass mark.";
      } else {
        result.textContent += " Review the modules above and try again.";
      }
    }

    if (score > progress.quizBestScore) {
      progress.quizBestScore = score;
      saveProgress();
      updateProgressUI();
    }
  });
}

/* ========= PROGRESS UI ========= */
function updateProgressUI() {
  const modulesText = document.getElementById("progressModulesText");
  const quizText = document.getElementById("progressQuizText");
  const osceText = document.getElementById("progressOsceText");
  const checklistText = document.getElementById("progressChecklistText");
  const overallText = document.getElementById("progressOverallText");

  const totalModules = 3;
  const completedModules = Object.values(progress.modulesViewed).filter(Boolean).length;

  if (modulesText) {
    if (completedModules === 0) {
      modulesText.textContent = "Not started";
      modulesText.className = "progress-status";
    } else if (completedModules < totalModules) {
      modulesText.textContent = `${completedModules} of ${totalModules} completed`;
      modulesText.className = "progress-status partial";
    } else {
      modulesText.textContent = "All core modules completed";
      modulesText.className = "progress-status complete";
    }
  }

  if (quizText) {
    if (progress.quizBestScore === 0) {
      quizText.textContent = "Not attempted";
      quizText.className = "progress-status";
    } else {
      const total = quizQuestions.length;
      const passed = progress.quizBestScore >= PASS_MARK;
      quizText.textContent = `Best score: ${progress.quizBestScore}/${total} ${passed ? "(passed)" : "(not yet passed)"}`;
      quizText.className = passed ? "progress-status complete" : "progress-status partial";
    }
  }

  if (osceText) {
    if (progress.osceTimedOnce) {
      osceText.textContent = "Completed at least one full timed OSCE run";
      osceText.className = "progress-status complete";
    } else {
      osceText.textContent = "Not completed yet";
      osceText.className = "progress-status";
    }
  }

  if (checklistText) {
    if (progress.osceChecklistOnce) {
      checklistText.textContent = "Used at least once for self-assessment";
      checklistText.className = "progress-status complete";
    } else {
      checklistText.textContent = "Not used yet";
      checklistText.className = "progress-status";
    }
  }

  if (overallText) {
    const allModules = completedModules === totalModules;
    const quizPassed = progress.quizBestScore >= PASS_MARK;
    const done = allModules && quizPassed && progress.osceTimedOnce && progress.osceChecklistOnce;

    if (done) {
      overallText.textContent =
        "Overall: Core module completed. You can discuss this learning activity and your reflections with your supervisor for portfolio evidence.";
    } else {
      overallText.textContent =
        "Overall: In progress – aim to complete all three modules, pass the quiz, do a timed OSCE run and use the checklist.";
    }
  }
}

/* ========= OSCE ACCORDION ========= */
const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach(header => {
  header.addEventListener("click", () => {
    const item = header.parentElement;
    if (!item) return;
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".accordion-item").forEach(i => i.classList.remove("open"));
    document.querySelectorAll(".accordion-icon").forEach(icon => (icon.textContent = "▸"));

    if (!isOpen) {
      item.classList.add("open");
      const icon = header.querySelector(".accordion-icon");
      if (icon) icon.textContent = "▾";
    }
  });
});

/* ========= IMAGE LIGHTBOX ========= */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.querySelector(".lightbox-close");

if (lightbox && lightboxImg && lightboxCaption && lightboxClose) {
  document.querySelectorAll(".image-card img").forEach(img => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
      lightboxCaption.textContent =
        img.getAttribute("data-caption") || img.alt || "";
      lightbox.classList.add("open");
    });
  });

  lightboxClose.addEventListener("click", () => {
    lightbox.classList.remove("open");
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove("open");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      lightbox.classList.remove("open");
    }
  });
}

/* ========= OSCE TIMER ========= */
const osceTimerDisplay = document.getElementById("osceTimerDisplay");
const startOsceTimerBtn = document.getElementById("startOsceTimerBtn");
const resetOsceTimerBtn = document.getElementById("resetOsceTimerBtn");

let osceTimerSeconds = 7 * 60;
let osceTimerInterval = null;

function updateOsceTimerDisplay() {
  if (!osceTimerDisplay) return;
  const minutes = Math.floor(osceTimerSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (osceTimerSeconds % 60).toString().padStart(2, "0");
  osceTimerDisplay.textContent = `${minutes}:${seconds}`;
}

updateOsceTimerDisplay();

function startOsceTimer() {
  if (osceTimerInterval) return;
  osceTimerInterval = setInterval(() => {
    osceTimerSeconds--;
    if (osceTimerSeconds <= 0) {
      osceTimerSeconds = 0;
      clearInterval(osceTimerInterval);
      osceTimerInterval = null;
      alert("Time up – OSCE station complete.");
      if (!progress.osceTimedOnce) {
        progress.osceTimedOnce = true;
        saveProgress();
        updateProgressUI();
      }
    }
    updateOsceTimerDisplay();
  }, 1000);
}

function resetOsceTimer() {
  if (osceTimerInterval) {
    clearInterval(osceTimerInterval);
    osceTimerInterval = null;
  }
  osceTimerSeconds = 7 * 60;
  updateOsceTimerDisplay();
}

if (startOsceTimerBtn) {
  startOsceTimerBtn.addEventListener("click", startOsceTimer);
}
if (resetOsceTimerBtn) {
  resetOsceTimerBtn.addEventListener("click", resetOsceTimer);
}

/* ========= OSCE CHECKLIST ========= */
/*
Bands:
- Excellent
- Pass
- Borderline
- Needs consolidation
*/

const osceChecklistItems = [
  {
    category: "Introduction & setup",
    items: [
      "Introduces self with name and role, checks patient identity (name & DOB).",
      "Explains the examination clearly in lay terms and gains verbal consent.",
      "Performs or states hand hygiene and checks patient comfort/positioning.",
      "Asks about pain, vision problems or concerns before starting."
    ]
  },
  {
    category: "Visual assessment",
    items: [
      "Assesses visual acuity using an appropriate chart (or states how).",
      "Tests each eye separately (with glasses if worn) and then both together.",
      "Assesses visual fields to confrontation in all quadrants.",
      "Comments on how findings would be recorded accurately."
    ]
  },
  {
    category: "Pupils & optic nerve",
    items: [
      "Inspects pupils for size, shape and symmetry.",
      "Tests direct and consensual light responses correctly.",
      "Performs/mentions the swinging light test for RAPD and interprets it.",
      "Mentions fundoscopy and key optic disc features (e.g. cupping, pallor, swelling)."
    ]
  },
  {
    category: "Eye movements & cranial nerves",
    items: [
      "Asks about diplopia before testing eye movements.",
      "Performs a full H-test without moving the patient’s head.",
      "Comments on nystagmus or movement limitation if present.",
      "Screening of CN V & VII is included or clearly mentioned (sensation and facial movements)."
    ]
  },
  {
    category: "Closure, structure & professionalism",
    items: [
      "Follows a logical, structured sequence without frequent backtracking.",
      "Communicates findings aloud in a calm, confident manner.",
      "Checks patient comfort at the end and offers to answer questions.",
      "Summarises key findings and suggests appropriate next steps/referral.",
      "Maintains professional, empathetic body language and rapport throughout."
    ]
  }
];

const osceChecklistContainer = document.getElementById("osceChecklistContainer");
const osceChecklistScoreEl = document.getElementById("osceChecklistScore");
const osceChecklistBandEl = document.getElementById("osceChecklistBand");
const resetChecklistBtn = document.getElementById("resetChecklistBtn");

function renderOsceChecklist() {
  if (!osceChecklistContainer) return;
  osceChecklistContainer.innerHTML = "";

  osceChecklistItems.forEach((group, groupIndex) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "osce-checklist-group";

    const title = document.createElement("h3");
    title.textContent = group.category;
    groupDiv.appendChild(title);

    const list = document.createElement("ul");

    group.items.forEach((item, itemIndex) => {
      const li = document.createElement("li");
      li.className = "osce-checklist-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `chk_${groupIndex}_${itemIndex}`;

      const label = document.createElement("label");
      label.setAttribute("for", checkbox.id);
      label.textContent = item;

      li.appendChild(checkbox);
      li.appendChild(label);
      list.appendChild(li);

      checkbox.addEventListener("change", () => {
        updateOsceChecklistScore();
        if (!progress.osceChecklistOnce) {
          progress.osceChecklistOnce = true;
          saveProgress();
          updateProgressUI();
        }
      });
    });

    groupDiv.appendChild(list);
    osceChecklistContainer.appendChild(groupDiv);
  });

  updateOsceChecklistScore();
}

function updateOsceChecklistScore() {
  if (!osceChecklistScoreEl || !osceChecklistBandEl) return;

  const checkboxes = osceChecklistContainer
    ? osceChecklistContainer.querySelectorAll("input[type='checkbox']")
    : [];
  const total = checkboxes.length;
  let checked = 0;
  checkboxes.forEach(cb => {
    if (cb.checked) checked++;
  });

  osceChecklistScoreEl.textContent = `Score: ${checked} / ${total}`;

  if (total === 0) {
    osceChecklistBandEl.textContent = "Band: –";
    return;
  }

  const percent = (checked / total) * 100;
  let band = "Needs consolidation";

  if (percent >= 85) {
    band = "Excellent";
  } else if (percent >= 70) {
    band = "Pass";
  } else if (percent >= 50) {
    band = "Borderline";
  } else {
    band = "Needs consolidation";
  }

  osceChecklistBandEl.textContent = `Band: ${band}`;
}

if (resetChecklistBtn && osceChecklistContainer) {
  resetChecklistBtn.addEventListener("click", () => {
    const checkboxes = osceChecklistContainer.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(cb => {
      cb.checked = false;
    });
    updateOsceChecklistScore();
  });
}

// Render checklist on load
renderOsceChecklist();

// ========= INITIALISE PROGRESS UI =========
updateProgressUI();
