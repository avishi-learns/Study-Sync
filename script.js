document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     THEME (PERSISTENT)
  ========================== */
  const themeToggle = document.getElementById("themeToggle");

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  };

  /* =========================
     NAVIGATION
  ========================== */
  window.showView = (id) => {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".nav-link").forEach(l =>
      l.classList.toggle("active", l.dataset.section === id)
    );

    if (id === "planner") renderPlanner();
  };

  document.querySelectorAll(".nav-link").forEach(link => {
    link.onclick = () => showView(link.dataset.section);
  });

  /* =========================
     DASHBOARD STATE
  ========================== */
  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  let selectedSubjectId = JSON.parse(localStorage.getItem("selectedSubject"));

  function saveDashboard() {
    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.setItem("selectedSubject", JSON.stringify(selectedSubjectId));
  }

  /* =========================
     DASHBOARD LOGIC
  ========================== */
  window.addSubject = () => {
    const input = document.getElementById("subjectInput");
    if (!input.value.trim()) return;

    subjects.push({
      id: Date.now(),
      name: input.value.trim(),
      tasks: []
    });

    input.value = "";
    saveDashboard();
    renderSubjects();
  };

  window.selectSubject = (id) => {
    selectedSubjectId = id;
    saveDashboard();
    renderSubjects();
    renderTasks();
  };

  window.addTask = () => {
    const input = document.getElementById("taskInput");
    if (!input.value.trim() || !selectedSubjectId) return;

    const subject = subjects.find(s => s.id === selectedSubjectId);
    subject.tasks.push({ text: input.value.trim(), done: false });

    input.value = "";
    saveDashboard();
    renderTasks();
    renderSubjects();
  };

  window.toggleTask = (index) => {
    const subject = subjects.find(s => s.id === selectedSubjectId);
    subject.tasks[index].done = !subject.tasks[index].done;

    saveDashboard();
    renderTasks();
    renderSubjects();
  };

  window.deleteTask = (index) => {
    const subject = subjects.find(s => s.id === selectedSubjectId);
    subject.tasks.splice(index, 1);

    // auto-remove empty subject
    if (subject.tasks.length === 0) {
      subjects = subjects.filter(s => s.id !== subject.id);
      selectedSubjectId = null;
    }

    saveDashboard();
    renderTasks();
    renderSubjects();
  };

  function renderSubjects() {
    const container = document.getElementById("subjectsContainer");
    container.innerHTML = "";

    subjects.forEach(s => {
      const done = s.tasks.filter(t => t.done).length;
      const total = s.tasks.length || 1;

      container.innerHTML += `
        <div class="card">
          <h3>${s.name}</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${(done / total) * 100}%"></div>
          </div>
          <p>${done}/${s.tasks.length}</p>
          <button onclick="selectSubject(${s.id})">Select</button>
        </div>
      `;
    });

    updateOverallProgress();
  }

  function renderTasks() {
    const section = document.getElementById("taskSection");
    const list = document.getElementById("taskList");

    if (!selectedSubjectId) {
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    list.innerHTML = "";

    const subject = subjects.find(s => s.id === selectedSubjectId);

    subject.tasks.forEach((t, i) => {
      list.innerHTML += `
        <div class="task-row">
          <input type="checkbox" ${t.done ? "checked" : ""} onchange="toggleTask(${i})">
          <span class="${t.done ? "task-done" : ""}">${t.text}</span>
          <button class="delete-btn" onclick="deleteTask(${i})">✖</button>
        </div>
      `;
    });
  }

  function updateOverallProgress() {
    let done = 0, total = 0;

    subjects.forEach(s => {
      done += s.tasks.filter(t => t.done).length;
      total += s.tasks.length;
    });

    const percent = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("overallProgress").style.width = percent + "%";
    document.getElementById("overallText").textContent = percent + "%";
  }

  /* =========================
     PLANNER
  ========================== */
  function renderPlanner() {
    const container = document.getElementById("todayTasks");
    container.innerHTML = "";

    subjects.forEach(s => {
      const pending = s.tasks.filter(t => !t.done);
      if (!pending.length) return;

      const card = document.createElement("div");
      card.className = "planner-card";
      card.innerHTML =
        `<h3>${s.name}</h3>` +
        pending.map(t => `<div>☐ ${t.text}</div>`).join("");

      container.appendChild(card);
    });
  }

  /* =========================
     SYLLABUS STATE
  ========================== */
  let syllabus = JSON.parse(localStorage.getItem("syllabus")) || [];

  function saveSyllabus() {
    localStorage.setItem("syllabus", JSON.stringify(syllabus));
  }

  /* =========================
     SYLLABUS LOGIC
  ========================== */
  window.addSyllabusSubject = () => {
    const input = document.getElementById("syllabusSubjectInput");
    if (!input.value.trim()) return;

    syllabus.push({
      subject: input.value.trim(),
      chapters: []
    });

    input.value = "";
    saveSyllabus();
    renderSyllabus();
    populateSyllabusSelects();
  };

  window.addChapter = () => {
    const subjectName = document.getElementById("syllabusSubjectSelect").value;
    const input = document.getElementById("chapterInput");
    if (!subjectName || !input.value.trim()) return;

    const subject = syllabus.find(s => s.subject === subjectName);
    subject.chapters.push({
      name: input.value.trim(),
      subtopics: []
    });

    input.value = "";
    saveSyllabus();
    renderSyllabus();
    populateSyllabusSelects();
  };

  window.addSubtopic = () => {
    const subjectName = document.getElementById("syllabusSubjectSelect2").value;
    const chapterName = document.getElementById("syllabusChapterSelect").value;
    const input = document.getElementById("subtopicInput");

    if (!subjectName || !chapterName || !input.value.trim()) return;

    const subject = syllabus.find(s => s.subject === subjectName);
    const chapter = subject.chapters.find(c => c.name === chapterName);

    chapter.subtopics.push({
      text: input.value.trim(),
      done: false
    });

    input.value = "";
    saveSyllabus();
    renderSyllabus();
  };

  window.toggleSubtopic = (si, ci, ti) => {
    syllabus[si].chapters[ci].subtopics[ti].done ^= 1;
    saveSyllabus();
    renderSyllabus();
  };

  function populateSyllabusSelects() {
    const s1 = document.getElementById("syllabusSubjectSelect");
    const s2 = document.getElementById("syllabusSubjectSelect2");
    const c = document.getElementById("syllabusChapterSelect");

    s1.innerHTML = "";
    s2.innerHTML = "";
    c.innerHTML = "";

    syllabus.forEach(s => {
      s1.innerHTML += `<option>${s.subject}</option>`;
      s2.innerHTML += `<option>${s.subject}</option>`;
    });

    populateChapterSelect();
  }

  window.populateChapterSelect = () => {
    const subjectName = document.getElementById("syllabusSubjectSelect2").value;
    const chapterSelect = document.getElementById("syllabusChapterSelect");
    chapterSelect.innerHTML = "";

    const subject = syllabus.find(s => s.subject === subjectName);
    if (!subject) return;

    subject.chapters.forEach(c => {
      chapterSelect.innerHTML += `<option>${c.name}</option>`;
    });
  };

  function renderSyllabus() {
    const container = document.getElementById("syllabusContainer");
    container.innerHTML = "";

    syllabus = syllabus.filter(s =>
      s.chapters.some(c => c.subtopics.length > 0)
    );

    syllabus.forEach((s, si) => {
      container.innerHTML += `<div class="syllabus-subject">${s.subject}</div>`;

      s.chapters.forEach((c, ci) => {
        if (!c.subtopics.length) return;

        container.innerHTML += `<div class="syllabus-chapter">• ${c.name}</div>`;

        c.subtopics.forEach((t, ti) => {
          container.innerHTML += `
            <div class="syllabus-subtopic">
              <input type="checkbox" ${t.done ? "checked" : ""}
                onchange="toggleSubtopic(${si},${ci},${ti})">
              ${t.text}
            </div>
          `;
        });
      });
    });

    saveSyllabus();
    populateSyllabusSelects();
  }

  /* =========================
     INITIAL RENDER
  ========================== */
  renderSubjects();
  renderTasks();
  renderSyllabus();
  populateSyllabusSelects();
});

/* =========================
   SYLLABUS – GLOBAL FIX
========================= */

let syllabus = JSON.parse(localStorage.getItem("syllabus")) || [];

function saveSyllabus() {
  localStorage.setItem("syllabus", JSON.stringify(syllabus));
}

window.addSyllabusSubject = function () {
  const input = document.getElementById("syllabusSubjectInput");
  if (!input || !input.value.trim()) return;

  syllabus.push({
    subject: input.value.trim(),
    chapters: []
  });

  input.value = "";
  saveSyllabus();
  renderSyllabus();
  populateSubjects();
};

window.addChapter = function () {
  const subjectName = document.getElementById("syllabusSubjectSelect").value;
  const input = document.getElementById("chapterInput");
  if (!subjectName || !input.value.trim()) return;

  const subject = syllabus.find(s => s.subject === subjectName);
  subject.chapters.push({ name: input.value.trim(), subtopics: [] });

  input.value = "";
  saveSyllabus();
  renderSyllabus();
  populateSubjects();
};

window.addSubtopic = function () {
  const subjectName = document.getElementById("syllabusSubjectSelect2").value;
  const chapterName = document.getElementById("syllabusChapterSelect").value;
  const input = document.getElementById("subtopicInput");

  if (!subjectName || !chapterName || !input.value.trim()) return;

  const subject = syllabus.find(s => s.subject === subjectName);
  const chapter = subject.chapters.find(c => c.name === chapterName);

  chapter.subtopics.push({
    text: input.value.trim(),
    done: false
  });

  input.value = "";
  saveSyllabus();
  renderSyllabus();
};

window.toggleSubtopic = function (si, ci, ti) {
  syllabus[si].chapters[ci].subtopics[ti].done ^= 1;
  saveSyllabus();
  renderSyllabus();
};

function populateSubjects() {
  const s1 = document.getElementById("syllabusSubjectSelect");
  const s2 = document.getElementById("syllabusSubjectSelect2");
  const c = document.getElementById("syllabusChapterSelect");

  s1.innerHTML = "";
  s2.innerHTML = "";
  c.innerHTML = "";

  syllabus.forEach(s => {
    s1.innerHTML += `<option>${s.subject}</option>`;
    s2.innerHTML += `<option>${s.subject}</option>`;
  });

  populateChapterSelect();
}

window.populateChapterSelect = function () {
  const subjectName = document.getElementById("syllabusSubjectSelect2").value;
  const c = document.getElementById("syllabusChapterSelect");
  c.innerHTML = "";

  const subject = syllabus.find(s => s.subject === subjectName);
  if (!subject) return;

  subject.chapters.forEach(ch =>
    c.innerHTML += `<option>${ch.name}</option>`
  );
};

function renderSyllabus() {
  const container = document.getElementById("syllabusContainer");
  container.innerHTML = "";

  // auto-remove empty subjects
  syllabus = syllabus.filter(s =>
    s.chapters.some(c => c.subtopics.length)
  );

  syllabus.forEach((s, si) => {
    container.innerHTML += `<div class="syllabus-subject">${s.subject}</div>`;

    s.chapters.forEach((c, ci) => {
      if (!c.subtopics.length) return;

      container.innerHTML += `<div class="syllabus-chapter">• ${c.name}</div>`;

      c.subtopics.forEach((t, ti) => {
        container.innerHTML += `
          <div class="syllabus-subtopic">
            <input type="checkbox" ${t.done ? "checked" : ""}
              onchange="toggleSubtopic(${si},${ci},${ti})">
            ${t.text}
          </div>`;
      });
    });
  });

  saveSyllabus();
  populateSubjects();
}
