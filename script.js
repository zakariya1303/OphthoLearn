// ========= YEAR IN FOOTER =========
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// ========= PROGRESS STORAGE =========
const PROGRESS_KEY = "ophthoProgress";
const PASS_MARK = 7; // quiz pass threshold for the 10-mark SBA set

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return {
        modulesViewed: { history: false, exam: false, conditions: false, practise: false },
        quizSubmittedOnce: false,
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
        conditions: !!parsed.modulesViewed?.conditions,
        practise: !!parsed.modulesViewed?.practise
      },
      quizSubmittedOnce: !!parsed.quizSubmittedOnce,
      quizBestScore: Number(parsed.quizBestScore) || 0,
      osceTimedOnce: !!parsed.osceTimedOnce,
      osceChecklistOnce: !!parsed.osceChecklistOnce
    };
  } catch {
    return {
      modulesViewed: { history: false, exam: false, conditions: false, practise: false },
      quizSubmittedOnce: false,
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

// Mark a module as completed when a module page is opened
const progressModuleKey = document.body?.dataset?.progressModule;
if (progressModuleKey && progress.modulesViewed && progressModuleKey in progress.modulesViewed) {
  // Practise completion is handled by MCQ submission (see quiz handler below)
  if (progressModuleKey === "practise") {
    // no-op
  } else
  if (!progress.modulesViewed[progressModuleKey]) {
    progress.modulesViewed[progressModuleKey] = true;
    saveProgress();
  }
}

// "Start modules" button goes to Module 1 page
const startModuleBtn = document.getElementById("startModuleBtn");
if (startModuleBtn) {
  startModuleBtn.addEventListener("click", () => {
    window.location.href = "module1-history.html";
  });
}

/* ========= QUIZ ========= */
const quizQuestions = [
  {
    title: "Question 1 – Acute Angle-Closure Glaucoma",
    stem: "A 68-year-old woman presents to the emergency department with sudden severe pain in her right eye associated with headache, nausea and blurred vision. She reports seeing coloured halos around lights. Examination reveals a red eye, a steamy cornea, a fixed mid-dilated pupil and an intraocular pressure of 58 mmHg. What is the most likely diagnosis?",
    options: [
      "Anterior uveitis",
      "Acute angle-closure glaucoma",
      "Bacterial conjunctivitis",
      "Central retinal artery occlusion",
      "Corneal abrasion"
    ],
    answerIndex: 1,
    explanation: "Acute angle-closure glaucoma is caused by sudden obstruction of aqueous humour drainage, resulting in a rapid rise in intraocular pressure. Classic features include severe painful red eye, headache, nausea and vomiting, halos around lights, a steamy cornea, a fixed mid-dilated pupil and markedly raised intraocular pressure. This is an ophthalmic emergency requiring immediate treatment to lower intraocular pressure, followed by definitive laser peripheral iridotomy."
  },
  {
    title: "Question 2 – Relative Afferent Pupillary Defect (Optic Neuritis)",
    stem: "A 28-year-old woman develops subacute visual loss in her left eye over two days. She reports pain on eye movement and notices that red objects appear faded compared with her right eye. A swinging flashlight test demonstrates a relative afferent pupillary defect (RAPD). The RAPD is most likely caused by pathology affecting which structure?",
    options: [
      "Left optic nerve",
      "Left oculomotor nerve",
      "Left ciliary body",
      "Left sphincter pupillae muscle",
      "Left lateral rectus muscle"
    ],
    answerIndex: 0,
    explanation: "An RAPD indicates reduced afferent input from the retina or optic nerve. In this case, painful visual loss with red desaturation is highly suggestive of optic neuritis. Oculomotor nerve lesions affect the efferent pupillary pathway and do not produce an RAPD."
  },
  {
    title: "Question 3 – Central Retinal Artery Occlusion",
    stem: "A 72-year-old man suddenly loses vision in his left eye while reading the newspaper. The vision loss is painless and complete. Fundoscopy demonstrates a pale retina with a cherry-red spot at the macula. What is the most likely diagnosis?",
    options: [
      "Central retinal vein occlusion",
      "Retinal detachment",
      "Central retinal artery occlusion",
      "Vitreous haemorrhage",
      "Wet age-related macular degeneration"
    ],
    answerIndex: 2,
    explanation: "Central retinal artery occlusion presents with sudden, painless, severe monocular visual loss. The classic fundoscopic appearance is retinal pallor with a cherry-red spot. CRAO is considered the ocular equivalent of an acute ischaemic stroke and requires immediate stroke assessment and urgent ophthalmology review."
  },
  {
    title: "Question 4 – Retinal Detachment",
    stem: "A 59-year-old man with high myopia notices flashing lights followed by numerous floaters in his left eye. Several hours later he develops a dark curtain descending across his vision. What is the most likely diagnosis?",
    options: [
      "Posterior vitreous detachment",
      "Vitreous haemorrhage",
      "Retinal detachment",
      "Optic neuritis",
      "Central retinal artery occlusion"
    ],
    answerIndex: 2,
    explanation: "The classic sequence in retinal detachment is flashes (photopsia), floaters and then a curtain or shadow progressing across the visual field. Retinal detachment is an ophthalmic emergency requiring urgent same-day assessment by an ophthalmologist."
  },
  {
    title: "Question 5 – Papilloedema",
    stem: "A 24-year-old woman presents with headaches that are worse on waking and transient episodes of blurred vision lasting a few seconds when standing up. Fundoscopy demonstrates bilateral swollen optic discs. What is the most likely underlying cause?",
    options: [
      "Optic neuritis",
      "Raised intracranial pressure",
      "Hypertensive retinopathy",
      "Diabetic retinopathy",
      "Acute angle-closure glaucoma"
    ],
    answerIndex: 1,
    explanation: "Papilloedema is optic disc swelling secondary to raised intracranial pressure. Typical features include morning headaches, transient visual obscurations, bilateral optic disc swelling and occasionally sixth nerve palsy. Urgent neuroimaging should be performed before lumbar puncture to exclude a space-occupying lesion."
  },
  {
    title: "Question 6 – Horner Syndrome",
    stem: "A patient presents with mild left-sided ptosis, miosis and facial anhidrosis. Why is the ptosis only partial?",
    options: [
      "The levator palpebrae superioris is partially paralysed",
      "Only Müller’s muscle is denervated while levator palpebrae superioris remains functional",
      "The superior rectus compensates for eyelid elevation",
      "Orbicularis oculi weakness limits eyelid closure",
      "The oculomotor nerve is partially spared"
    ],
    answerIndex: 1,
    explanation: "The mild ptosis of Horner syndrome results from sympathetic denervation of Müller’s muscle. The main eyelid elevator, levator palpebrae superioris, is innervated by the oculomotor nerve and remains intact, so the ptosis is only partial."
  },
  {
    title: "Question 7 – Diabetic Retinopathy",
    stem: "A 54-year-old man with type 2 diabetes attends routine diabetic eye screening. Which retinal finding is the earliest clinically detectable sign of diabetic retinopathy?",
    options: [
      "Cotton wool spots",
      "Hard exudates",
      "Microaneurysms",
      "Neovascularisation",
      "Vitreous haemorrhage"
    ],
    answerIndex: 2,
    explanation: "Microaneurysms are the earliest visible sign of diabetic retinopathy. As disease progresses, patients may develop retinal haemorrhages, cotton wool spots, venous abnormalities and eventually retinal neovascularisation."
  },
  {
    title: "Question 8 – Third Nerve Palsy",
    stem: "A 63-year-old man develops sudden-onset binocular diplopia and a severe headache. Examination reveals complete ptosis, a “down and out” eye and a dilated pupil. What is the most appropriate immediate investigation?",
    options: [
      "Humphrey visual field testing",
      "MRI brain",
      "CT angiography",
      "Optical coherence tomography",
      "Fluorescein angiography"
    ],
    answerIndex: 2,
    explanation: "A painful third nerve palsy involving the pupil should be assumed to be caused by a posterior communicating artery aneurysm until proven otherwise. Urgent CT angiography is required because aneurysm rupture is life-threatening."
  },
  {
    title: "Question 9 – Anterior Uveitis",
    stem: "A 35-year-old man presents with a painful red right eye that has gradually worsened over the past two days. He complains of photophobia and blurred vision. Examination reveals circumcorneal (ciliary) injection and a constricted, irregular pupil. Fluorescein staining is negative. What is the most likely diagnosis?",
    options: [
      "Acute angle-closure glaucoma",
      "Bacterial conjunctivitis",
      "Anterior uveitis",
      "Corneal abrasion",
      "Episcleritis"
    ],
    answerIndex: 2,
    explanation: "Anterior uveitis (iritis) is inflammation of the iris and ciliary body. It typically presents with a painful red eye, photophobia, blurred vision, ciliary injection and a miotic or irregular pupil due to posterior synechiae. Unlike acute angle-closure glaucoma, the pupil is constricted rather than fixed and mid-dilated. Fluorescein staining is usually negative because the corneal epithelium is intact."
  },
  {
    title: "Question 10 – Central Retinal Vein Occlusion",
    stem: "A 74-year-old man with hypertension presents with painless blurred vision in his right eye that developed over several hours. Fundoscopy reveals widespread retinal haemorrhages in all four quadrants, dilated tortuous retinal veins and cotton wool spots. What is the most likely diagnosis?",
    options: [
      "Central retinal artery occlusion",
      "Retinal detachment",
      "Central retinal vein occlusion",
      "Wet age-related macular degeneration",
      "Optic neuritis"
    ],
    answerIndex: 2,
    explanation: "Central retinal vein occlusion classically presents with painless monocular visual loss. Fundoscopy demonstrates the characteristic “blood and thunder” appearance, including widespread retinal haemorrhages, dilated tortuous veins and cotton wool spots. Important risk factors include hypertension, diabetes mellitus and glaucoma. Patients should undergo assessment for underlying vascular risk factors and ophthalmology review for complications such as macular oedema."
  }
];

const quizContainer = document.getElementById("quizContainer");
const quizResult = document.getElementById("quizResult");

function optionLetter(index) {
  return String.fromCharCode(65 + index);
}

function renderQuiz() {
  if (!quizContainer) return;
  quizContainer.innerHTML = "";
  quizQuestions.forEach((q, idx) => {
    const qDiv = document.createElement("div");
    qDiv.className = "quiz-question";
    qDiv.dataset.questionIndex = String(idx);

    const title = document.createElement("h4");
    title.textContent = q.title;

    const stem = document.createElement("p");
    stem.className = "quiz-stem";
    stem.textContent = q.stem;

    const optionsDiv = document.createElement("div");
    optionsDiv.className = "quiz-options";

    q.options.forEach((opt, optIdx) => {
      const id = `q${idx}_opt${optIdx}`;
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${idx}`;
      input.value = optIdx;
      input.id = id;

      const label = document.createElement("label");
      label.className = "quiz-option";
      label.setAttribute("for", id);
      label.appendChild(input);

      const letter = document.createElement("span");
      letter.className = "quiz-option-letter";
      letter.textContent = optionLetter(optIdx);

      const text = document.createElement("span");
      text.className = "quiz-option-text";
      text.textContent = opt;

      label.appendChild(letter);
      label.appendChild(text);
      optionsDiv.appendChild(label);
    });

    const feedback = document.createElement("div");
    feedback.className = "quiz-feedback";
    feedback.hidden = true;

    qDiv.appendChild(title);
    qDiv.appendChild(stem);
    qDiv.appendChild(optionsDiv);
    qDiv.appendChild(feedback);
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
      const questionCard = quizContainer?.querySelector(`[data-question-index="${idx}"]`);
      const feedback = questionCard?.querySelector(".quiz-feedback");

      if (selected && Number(selected.value) === q.answerIndex) {
        score++;
      }

      if (questionCard) {
        questionCard.classList.add("is-reviewed");
        const labels = questionCard.querySelectorAll(".quiz-option");
        labels.forEach((label, optIdx) => {
          label.classList.toggle("is-correct", optIdx === q.answerIndex);
          label.classList.toggle("is-chosen", !!selected && Number(selected.value) === optIdx);
          if (selected && Number(selected.value) === optIdx && optIdx !== q.answerIndex) {
            label.classList.add("is-wrong");
          } else {
            label.classList.remove("is-wrong");
          }
        });

        if (feedback) {
          feedback.hidden = false;
          feedback.innerHTML = `<strong>Correct answer: ${optionLetter(q.answerIndex)}.</strong> ${q.options[q.answerIndex]}<p>${q.explanation}</p>`;
        }
      }
    });

    if (quizResult) {
      quizResult.textContent = `You scored ${score} / ${quizQuestions.length}.`;
      if (score >= PASS_MARK) {
        quizResult.textContent += " Well done – you've reached the pass mark.";
      } else {
        quizResult.textContent += " Review the modules above and try again.";
      }
    }

    // Mark Practise as completed when the user submits MCQ answers
    if (!progress.quizSubmittedOnce) {
      progress.quizSubmittedOnce = true;
    }
    if (progress.modulesViewed && !progress.modulesViewed.practise) {
      progress.modulesViewed.practise = true;
    }

    if (score > progress.quizBestScore) {
      progress.quizBestScore = score;
    }

    saveProgress();
    updateProgressUI();
  });
}

/* ========= PROGRESS UI ========= */
function updateProgressUI() {
  const modulesCountEl = document.getElementById("progressModulesCount");
  const modulesBarEl = document.getElementById("progressModulesBar");
  const modulesHintEl = document.getElementById("progressModulesHint");

  const modulesText = document.getElementById("progressModulesText");
  const quizText = document.getElementById("progressQuizText");
  const osceText = document.getElementById("progressOsceText");
  const checklistText = document.getElementById("progressChecklistText");
  const overallText = document.getElementById("progressOverallText");

  const moduleKeys = Object.keys(progress.modulesViewed || {});
  const totalModules = moduleKeys.length || 4;
  const completedModules = moduleKeys.filter(k => !!progress.modulesViewed[k]).length;
  const percent = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  if (modulesCountEl) {
    modulesCountEl.textContent = `${completedModules} / ${totalModules}`;
  }
  if (modulesBarEl) {
    modulesBarEl.style.width = `${percent}%`;
  }
  if (modulesHintEl) {
    if (completedModules >= totalModules) {
      modulesHintEl.textContent = "All modules marked as completed on this device.";
    } else if (!progress.modulesViewed?.practise) {
      modulesHintEl.textContent = "Practise is marked complete after submitting the MCQs.";
    } else {
      modulesHintEl.textContent = "Progress updates as you open each module page.";
    }
  }

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
    const done = allModules && quizPassed && progress.osceTimedOnce;

    overallText.textContent = done
      ? "Overall: Complete."
      : "Overall: In progress.";
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
      "Offers to dim the lights if needed, and ensures lighting/positioning are appropriate.",
      "Asks about pain, vision problems or concerns before starting."
    ]
  },
  {
    category: "Performing the examination",
    items: [
      "Uses the correct hand and eye when examining each eye.",
      "Sets the ophthalmoscope lens to 0 and begins at arm's length.",
      "Asks the patient to fixate on a distant target throughout fundoscopy.",
      "Approaches from the temporal side at a gentle angle.",
      "Identifies the red reflex before moving closer to the eye.",
      "Finds a retinal vessel and follows it systematically to the disc."
    ]
  },
  {
    category: "Inspection",
    items: [
      "Inspects the lids and notes any ptosis or asymmetry.",
      "Looks for red eye, circumlimbal injection or ciliary flush.",
      "Notes discharge, crusting or lid margin inflammation.",
      "Considers proptosis, periorbital swelling and lid lesions.",
      "Describes whether findings appear acute or chronic."
    ]
  },
  {
    category: "Charts",
    items: [
      "Tests Snellen acuity for each eye separately and documents the result.",
      "States whether habitual correction or pinhole is being used.",
      "Mentions count fingers, hand movement or perception of light when vision is very poor.",
      "Screens colour vision with Ishihara plates when indicated.",
      "Checks near vision with reading glasses if relevant."
    ]
  },
  {
    category: "Blindspot",
    items: [
      "Recognises that formal blindspot testing is optional in most OSCE stations.",
      "Can explain that confrontation fields are usually sufficient."
    ]
  },
  {
    category: "Visual fields & neglect",
    items: [
      "Performs confrontation visual field testing in all quadrants.",
      "Checks for hemianopia, quadrantanopia and central field loss.",
      "Screens for neglect if one side is missed despite apparently intact fields.",
      "Uses a clear comparison method against their own visual field."
    ]
  },
  {
    category: "Accommodations",
    items: [
      "Tests near-point accommodation by moving a target toward the nose.",
      "Looks for pupillary constriction and convergence.",
      "Mentions that reduced accommodation with normal direct response may suggest Adie syndrome or diabetic neuropathy.",
      "Notes that accommodation normally decreases with age."
    ]
  },
  {
    category: "Reflexes",
    items: [
      "Checks pupil size, shape, symmetry and reactivity.",
      "Performs direct and consensual light reflex testing correctly.",
      "Uses the swinging light test to look for a RAPD.",
      "Explains that anisocoria may differ in light versus dark."
    ]
  },
  {
    category: "Fundoscopy",
    items: [
      "Checks the red reflex from arm's length before moving in.",
      "Uses lens 0 to start and adjusts focus as needed.",
      "Identifies the optic disc and comments on margins and colour.",
      "Assesses the cup-to-disc ratio.",
      "Examines the macula and then the four retinal quadrants.",
      "Tracks vessels methodically rather than searching randomly."
    ]
  },
  {
    category: "Fundoscopy interpretation",
    items: [
      "Comments on key optic disc features such as cupping, pallor or swelling.",
      "Recognises retinal haemorrhages, exudates and cotton wool spots.",
      "Mentions papilloedema when the disc is swollen from raised intracranial pressure.",
      "Avoids inventing fundus findings if the view is poor."
    ]
  },
  {
    category: "Closure & summary",
    items: [
      "Summarises findings clearly and concisely at the end.",
      "States likely diagnoses and sensible next steps or referrals.",
      "Checks the patient's comfort and thanks them before finishing.",
      "Maintains calm, professional and structured communication throughout."
    ]
  },
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

/* ========= TABS (MODULE 3 CONDITIONS) ========= */
function initTabs(tabsRoot) {
  const tabs = Array.from(tabsRoot.querySelectorAll('[role="tab"]'));
  const panels = Array.from(tabsRoot.querySelectorAll('[role="tabpanel"]'));
  if (tabs.length === 0 || panels.length === 0) return;

  const tabList = tabsRoot.querySelector('[role="tablist"]');
  const tabByPanelId = new Map();

  tabs.forEach(tab => {
    const panelId = tab.getAttribute('aria-controls');
    if (panelId) {
      tabByPanelId.set(panelId, tab);
    }
  });

  const select = document.createElement('select');
  select.className = 'tab-select';
  select.setAttribute('aria-label', tabList?.getAttribute('aria-label') || 'Select condition');

  tabs.forEach(tab => {
    const option = document.createElement('option');
    option.value = tab.getAttribute('aria-controls') || '';
    option.textContent = tab.textContent.trim();
    select.appendChild(option);
  });

  if (tabList && tabList.parentNode) {
    tabList.parentNode.insertBefore(select, tabList);
    tabList.hidden = true;
  } else {
    tabsRoot.insertBefore(select, tabsRoot.firstChild);
  }

  function activateTab(tab) {
    const panelId = tab.getAttribute('aria-controls');

    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
    });

    panels.forEach(p => {
      p.hidden = p.id !== panelId;
    });

    if (select.value !== panelId) {
      select.value = panelId || '';
    }
  }

  tabs.forEach((tab, index) => {
    tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();

      let nextIndex = index;
      if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (e.key === 'Home') nextIndex = 0;
      if (e.key === 'End') nextIndex = tabs.length - 1;

      const nextTab = tabs[nextIndex];
      nextTab.focus();
      activateTab(nextTab);
    });
  });

  const preselected = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  activateTab(preselected);

  select.addEventListener('change', () => {
    const nextTab = tabByPanelId.get(select.value) || preselected;
    activateTab(nextTab);
  });
}

document.querySelectorAll('[data-tabs]').forEach(initTabs);

function initEmergencyDropdown() {
  const emergencyPanels = Array.from(document.querySelectorAll('.tab-panel[id^="tab-emerg-"]'));
  if (emergencyPanels.length === 0) return;

  const firstPanel = emergencyPanels[0];
  let select = document.querySelector('[data-emergency-dropdown]');
  const createdSelect = !select;
  const shortcutButtons = Array.from(document.querySelectorAll('.emergency-jump-btn'));

  if (!select) {
    select = document.createElement('select');
    select.dataset.emergencyDropdown = 'true';
  }

  select.className = 'tab-select';
  select.setAttribute('aria-label', 'Select emergency condition');
  select.dataset.emergencyDropdown = 'true';

  if (!select.options.length) {
    emergencyPanels.forEach(panel => {
      const option = document.createElement('option');
      option.value = panel.id;
      const heading = panel.querySelector('h3');
      option.textContent = heading ? heading.textContent.replace(/ in 60 Seconds$/i, '') : panel.id;
      select.appendChild(option);
    });
  }

  if (createdSelect && firstPanel.parentNode) {
    firstPanel.parentNode.insertBefore(select, firstPanel);
  }

  function showPanel(panelId) {
    emergencyPanels.forEach(panel => {
      panel.hidden = panel.id !== panelId;
    });
    shortcutButtons.forEach(button => {
      button.setAttribute('aria-current', button.getAttribute('href') === `#${panelId}` ? 'true' : 'false');
    });
  }

  const initiallyVisible = emergencyPanels.find(panel => !panel.hidden) || emergencyPanels[0];
  if (initiallyVisible) {
    select.value = initiallyVisible.id;
    showPanel(initiallyVisible.id);
  }

  select.addEventListener('change', () => showPanel(select.value));

  shortcutButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const targetId = button.getAttribute('href')?.replace('#', '');
      if (!targetId) return;
      event.preventDefault();
      select.value = targetId;
      showPanel(targetId);
    });
  });
}

initEmergencyDropdown();

const spotPage = document.getElementById('module4-spot');

function initSpotDiagnosisPage() {
  if (!spotPage) return;

  const cases = Array.isArray(window.SPOT_DIAGNOSIS_CASES) ? window.SPOT_DIAGNOSIS_CASES : [];

  const elements = {
    ring: spotPage.querySelector('#spotProgressRing'),
    percent: spotPage.querySelector('#spotProgressPercent'),
    progressSummary: spotPage.querySelector('#spotProgressSummary'),
    bookmarkSummary: spotPage.querySelector('#spotBookmarkSummary'),
    filters: Array.from(spotPage.querySelectorAll('[data-spot-filter]')),
    caseLabel: spotPage.querySelector('#spotCaseLabel'),
    caseTitle: spotPage.querySelector('#spotCaseTitle'),
    difficultyBadge: spotPage.querySelector('#spotDifficultyBadge'),
    bookmarkBtn: spotPage.querySelector('#spotBookmarkBtn'),
    categoryBadge: spotPage.querySelector('#spotCategoryBadge'),
    caseImage: spotPage.querySelector('#spotCaseImage'),
    caseQuestion: spotPage.querySelector('#spotCaseQuestion'),
    casePrompt: spotPage.querySelector('#spotCasePrompt'),
    options: spotPage.querySelector('#spotOptions'),
    yourAnswer: spotPage.querySelector('#spotYourAnswer'),
    revealBtn: spotPage.querySelector('#spotRevealBtn'),
    prevBtn: spotPage.querySelector('#spotPrevBtn'),
    answerCard: spotPage.querySelector('#spotAnswerCard'),
    answerCaseLabel: spotPage.querySelector('#spotAnswerCaseLabel'),
    answerTitle: spotPage.querySelector('#spotAnswerTitle'),
    answerImage: spotPage.querySelector('#spotAnswerImage'),
    answerIntro: spotPage.querySelector('#spotAnswerIntro'),
    answerPoints: spotPage.querySelector('#spotAnswerPoints'),
    answerNextBtn: spotPage.querySelector('#spotAnswerNextBtn'),
    nextBtn: spotPage.querySelector('#spotNextBtn'),
    strip: spotPage.querySelector('#spotCaseStrip'),
    viewAllBtn: spotPage.querySelector('#spotViewAllBtn')
  };

  const storageKey = 'ophthoSpotState';
  const optionOrderCache = {};

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return {
        filter: parsed.filter || 'all',
        currentCaseId: parsed.currentCaseId || (cases[0] && cases[0].id),
        viewedIds: Array.isArray(parsed.viewedIds) ? parsed.viewedIds : [],
        bookmarkedIds: Array.isArray(parsed.bookmarkedIds) ? parsed.bookmarkedIds : [],
        selectedOption: typeof parsed.selectedOption === 'string' ? parsed.selectedOption : null,
        revealed: !!parsed.revealed
      };
    } catch {
      return {
        filter: 'all',
        currentCaseId: cases[0] && cases[0].id,
        viewedIds: [],
        bookmarkedIds: [],
        selectedOption: null,
        revealed: false
      };
    }
  }

  const state = loadState();

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function filteredCases() {
    if (state.filter === 'all') return cases;
    return cases.filter(item => item.category === state.filter);
  }

  function currentCase() {
    return cases.find(item => item.id === state.currentCaseId) || cases[0];
  }

  function currentIndexForFilter() {
    const list = filteredCases();
    const index = list.findIndex(item => item.id === state.currentCaseId);
    return index >= 0 ? index : 0;
  }

  function displayCaseLabel(caseData) {
    if (caseData.label) return caseData.label;
    if (typeof caseData.caseNumber === 'number') {
      return `Case ${String(caseData.caseNumber).padStart(2, '0')}`;
    }
    return 'Case';
  }

  function setCurrentCase(caseId) {
    state.currentCaseId = caseId;
    state.revealed = false;
    state.selectedOption = null;
    saveState();
    render();
  }

  function shuffle(array) {
    const copy = array.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function buildOptions(caseData) {
    if (optionOrderCache[caseData.id]) {
      return optionOrderCache[caseData.id];
    }

    const distractors = shuffle(
      cases
        .filter(item => item.id !== caseData.id)
        .map(item => item.answer)
        .filter((answer, index, list) => list.indexOf(answer) === index)
    ).slice(0, 3);

    const options = shuffle([caseData.answer, ...distractors]);
    optionOrderCache[caseData.id] = options;
    return options;
  }

  function toggleBookmark(caseId) {
    const index = state.bookmarkedIds.indexOf(caseId);
    if (index >= 0) {
      state.bookmarkedIds.splice(index, 1);
    } else {
      state.bookmarkedIds.push(caseId);
    }
    saveState();
    renderProgress();
    renderStrip();
  }

  function renderProgress() {
    const viewedCount = state.viewedIds.length;
    const percent = cases.length ? Math.round((viewedCount / cases.length) * 100) : 0;
    if (elements.percent) elements.percent.textContent = `${percent}%`;
    if (elements.progressSummary) elements.progressSummary.textContent = `${viewedCount} / ${cases.length} cases completed`;
    if (elements.bookmarkSummary) elements.bookmarkSummary.textContent = `${state.bookmarkedIds.length} bookmarked`;
    if (elements.ring) elements.ring.style.setProperty('--spot-progress', `${percent}%`);
  }

  function renderFilters() {
    elements.filters.forEach(button => {
      const filterValue = button.dataset.spotFilter;
      button.classList.toggle('active', filterValue === state.filter && filterValue !== 'random');
      button.setAttribute('aria-pressed', filterValue === state.filter ? 'true' : 'false');
      if (filterValue === 'random') {
        button.setAttribute('aria-pressed', state.filter === 'random' ? 'true' : 'false');
      }
    });
  }

  function renderOptions(caseData) {
    elements.options.innerHTML = '';
    buildOptions(caseData).forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'spot-option-btn';
      button.textContent = option;
      button.dataset.option = option;
      button.setAttribute('aria-pressed', state.selectedOption === option ? 'true' : 'false');

      if (state.revealed && option === caseData.answer) {
        button.classList.add('correct');
      }
      if (state.revealed && state.selectedOption === option && option !== caseData.answer) {
        button.classList.add('incorrect');
      }

      button.addEventListener('click', () => {
        state.selectedOption = option;
        state.revealed = true;
        state.viewedIds = Array.from(new Set([...state.viewedIds, caseData.id]));
        saveState();
        render();
      });

      elements.options.appendChild(button);
    });
  }

  function renderStrip() {
    const list = filteredCases();
    elements.strip.innerHTML = '';

    list.forEach((caseData) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'spot-strip-card';
      if (caseData.id === state.currentCaseId) thumb.classList.add('active');
      thumb.innerHTML = `
        <div class="spot-strip-card-head">
          <span>${displayCaseLabel(caseData)}</span>
          <span class="spot-strip-tag ${caseData.difficulty.toLowerCase()}">${caseData.difficulty}</span>
        </div>
        <img src="${caseData.thumbnail || caseData.image}" alt="${displayCaseLabel(caseData)} thumbnail" />
        <div class="spot-strip-card-foot">
          <span>${displayCaseLabel(caseData)}</span>
          <span class="spot-mini-bookmark">${state.bookmarkedIds.includes(caseData.id) ? '★' : '☆'}</span>
        </div>
      `;
      thumb.addEventListener('click', () => setCurrentCase(caseData.id));
      elements.strip.appendChild(thumb);
    });
  }

  function renderAnswer(caseData) {
    if (!elements.answerCard) return;
    if (!state.revealed) {
      elements.answerCard.hidden = true;
      return;
    }

    elements.answerCard.hidden = false;
    if (elements.answerCaseLabel) elements.answerCaseLabel.textContent = displayCaseLabel(caseData);
    if (elements.answerTitle) elements.answerTitle.textContent = `Answer: ${caseData.answer}`;
    if (elements.answerImage) {
      elements.answerImage.src = caseData.image;
      elements.answerImage.alt = `${caseData.answer} image`;
    }
    if (elements.answerIntro) elements.answerIntro.textContent = caseData.explanation[0] || 'Key learning points:';
    if (elements.answerPoints) {
      elements.answerPoints.innerHTML = '';
      caseData.explanation.slice(1).forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        elements.answerPoints.appendChild(li);
      });
    }
  }

  function renderCurrentCase(caseData) {
    if (elements.caseLabel) elements.caseLabel.textContent = displayCaseLabel(caseData);
    if (elements.caseTitle) elements.caseTitle.textContent = displayCaseLabel(caseData);
    if (elements.categoryBadge) {
      elements.categoryBadge.textContent = caseData.category;
    }
    if (elements.difficultyBadge) {
      elements.difficultyBadge.textContent = caseData.difficulty;
      elements.difficultyBadge.className = `spot-difficulty-badge ${caseData.difficulty.toLowerCase()}`;
    }
    if (elements.caseImage) {
      elements.caseImage.src = caseData.image;
      elements.caseImage.alt = `${caseData.answer} image`;
    }
    if (elements.caseQuestion) elements.caseQuestion.textContent = caseData.prompt;
    if (elements.casePrompt) elements.casePrompt.textContent = 'Select the best answer below.';
    if (elements.yourAnswer) {
      elements.yourAnswer.textContent = state.revealed && state.selectedOption
        ? (state.selectedOption === caseData.answer ? 'Correct' : `Selected: ${state.selectedOption}`)
        : 'Choose an answer to reveal the explanation.';
    }
    if (elements.bookmarkBtn) {
      const bookmarked = state.bookmarkedIds.includes(caseData.id);
      elements.bookmarkBtn.textContent = bookmarked ? '★' : '☆';
      elements.bookmarkBtn.setAttribute('aria-label', bookmarked ? 'Remove bookmark' : 'Bookmark current case');
    }
    if (elements.revealBtn) elements.revealBtn.textContent = state.revealed ? 'Reveal Again' : 'Reveal Answer';
  }

  function render() {
    const caseData = currentCase();
    renderFilters();
    renderProgress();
    renderCurrentCase(caseData);
    renderOptions(caseData);
    renderAnswer(caseData);
    renderStrip();
  }

  elements.filters.forEach(button => {
    button.addEventListener('click', () => {
      const filterValue = button.dataset.spotFilter;
      if (filterValue === 'random') {
        const pool = state.filter === 'all' ? cases : cases.filter(item => item.category === state.filter);
        const nextCase = pool[Math.floor(Math.random() * pool.length)];
        if (nextCase) setCurrentCase(nextCase.id);
        state.revealed = false;
        saveState();
        return;
      }

      state.filter = filterValue;
      const pool = filteredCases();
      const fallback = pool[0] || cases[0];
      state.currentCaseId = fallback && fallback.id;
      state.revealed = false;
      saveState();
      render();
    });
  });

  if (elements.revealBtn) {
    elements.revealBtn.addEventListener('click', () => {
      state.revealed = true;
      const caseData = currentCase();
      state.viewedIds = Array.from(new Set([...state.viewedIds, caseData.id]));
      saveState();
      render();
    });
  }

  if (elements.bookmarkBtn) {
    elements.bookmarkBtn.addEventListener('click', () => toggleBookmark(currentCase().id));
  }

  if (elements.prevBtn) {
    elements.prevBtn.addEventListener('click', () => {
      const pool = filteredCases();
      const index = currentIndexForFilter();
      const previous = pool[(index - 1 + pool.length) % pool.length] || cases[0];
      state.currentCaseId = previous.id;
      state.revealed = false;
      saveState();
      render();
    });
  }

  if (elements.answerNextBtn) {
    elements.answerNextBtn.addEventListener('click', () => {
      const pool = filteredCases();
      const index = currentIndexForFilter();
      const next = pool[(index + 1) % pool.length] || cases[0];
      state.currentCaseId = next.id;
      state.revealed = false;
      state.selectedOption = null;
      saveState();
      render();
    });
  }

  if (elements.nextBtn) {
    elements.nextBtn.addEventListener('click', () => {
      const pool = filteredCases();
      const index = currentIndexForFilter();
      const next = pool[(index + 1) % pool.length] || cases[0];
      state.currentCaseId = next.id;
      state.revealed = false;
      state.selectedOption = null;
      saveState();
      render();
    });
  }

  if (elements.viewAllBtn) {
    elements.viewAllBtn.addEventListener('click', () => {
      elements.strip.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  render();
}

initSpotDiagnosisPage();

// Open accordion when anchor hash targets an accordion-item
function openAccordionForHash() {
  const hash = (location.hash || '').replace('#', '');
  if (!hash) return;
  const target = document.getElementById(hash);
  if (!target) return;
  // find parent accordion-item
  const item = target.classList.contains('accordion-item') ? target : target.closest('.accordion-item');
  if (!item) return;
  // close others
  document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
  item.classList.add('open');
  // update icons
  document.querySelectorAll('.accordion-icon').forEach(icon => icon.textContent = '▸');
  const icon = item.querySelector('.accordion-icon');
  if (icon) icon.textContent = '▾';
}

window.addEventListener('hashchange', openAccordionForHash);
window.addEventListener('load', openAccordionForHash);

// Ensure accordion opens when module tabs are clicked
document.querySelectorAll('.module-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    // Intercept the click so we open the accordion first (prevents overscroll
    // that happens when the accordion expands after the browser has already
    // scrolled to the collapsed element). Then update the URL and scroll.
    const href = tab.getAttribute('href') || '';
    if (!href.startsWith('#')) return; // external link — let browser handle it
    e.preventDefault();
    const hash = href.replace('#', '');
    const target = document.getElementById(hash);
    if (!target) return;
    const item = target.classList.contains('accordion-item') ? target : target.closest('.accordion-item');
    if (!item) return;
    // Open target and close others
    document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
    item.classList.add('open');
    // update icons
    document.querySelectorAll('.accordion-icon').forEach(icon => icon.textContent = '▸');
    const icon = item.querySelector('.accordion-icon'); if (icon) icon.textContent = '▾';
    // Update URL hash without jumping
    history.pushState(null, '', '#' + hash);
    // Scroll to the item, offset by header height
    const header = document.querySelector('.top-nav');
    const headerHeight = header ? header.offsetHeight : 100;
    const offset = 12; // small breathing room below header
    const top = item.getBoundingClientRect().top + window.pageYOffset - headerHeight - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ========= CURSOR FOLLOW GLOW =========
(() => {
  const body = document.body || document.documentElement;
  if (!body) return;
  body.classList.add('interactive-hover');

  function updateMouse(e) {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const x = (e.clientX / vw) * 100;
    const y = (e.clientY / vh) * 100;
    body.style.setProperty('--mx', x + '%');
    body.style.setProperty('--my', y + '%');
  }

  window.addEventListener('mousemove', updateMouse);
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) updateMouse(e.touches[0]);
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    body.style.setProperty('--mx', '50%');
    body.style.setProperty('--my', '50%');
  });
})();
