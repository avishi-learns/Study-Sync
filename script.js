document.addEventListener("DOMContentLoaded", () => {

  /* ================= THEME ================= */
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

  /* ================= NAV ================= */
  window.showView = id => {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".nav-link").forEach(l =>
      l.classList.toggle("active", l.dataset.section === id)
    );

    if (id === "planner") renderPlanner();
  };

  document.querySelectorAll(".nav-link").forEach(l =>
    l.onclick = () => showView(l.dataset.section)
  );

  /* ================= DASHBOARD ================= */
  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  let selectedSubjectId = JSON.parse(localStorage.getItem("selectedSubject"));

  const saveDashboard = () => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.setItem("selectedSubject", JSON.stringify(selectedSubjectId));
  };

  window.addSubject = () => {
    if (!subjectInput.value.trim()) return;
    subjects.push({ id: Date.now(), name: subjectInput.value, tasks: [] });
    subjectInput.value = "";
    saveDashboard();
    renderSubjects();
  };

  window.selectSubject = id => {
    selectedSubjectId = id;
    saveDashboard();
    renderSubjects();
    renderTasks();
  };

  window.addTask = () => {
    if (!taskInput.value.trim() || !selectedSubjectId) return;
    subjects.find(s => s.id === selectedSubjectId)
      .tasks.push({ text: taskInput.value, done: false });
    taskInput.value = "";
    saveDashboard();
    renderTasks();
    renderSubjects();
  };

  window.toggleTask = i => {
    const s = subjects.find(s => s.id === selectedSubjectId);
    s.tasks[i].done = !s.tasks[i].done;
    saveDashboard();
    renderTasks();
    renderSubjects();
  };

  window.deleteTask = i => {
    const s = subjects.find(s => s.id === selectedSubjectId);
    s.tasks.splice(i, 1);

    if (s.tasks.length === 0) {
      subjects = subjects.filter(x => x.id !== s.id);
      selectedSubjectId = null;
    }

    saveDashboard();
    renderTasks();
    renderSubjects();
  };

  window.deleteSubject = id => {
    if (!confirm("Delete this subject?")) return;
    subjects = subjects.filter(s => s.id !== id);
    if (selectedSubjectId === id) selectedSubjectId = null;
    saveDashboard();
    renderSubjects();
    renderTasks();
  };

  function renderSubjects() {
    subjectsContainer.innerHTML = "";
    subjects.forEach(s => {
      const done = s.tasks.filter(t => t.done).length;
      const total = s.tasks.length || 1;

      subjectsContainer.innerHTML += `
        <div class="card">
          <h3>${s.name}</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${(done/total)*100}%"></div>
          </div>
          <p>${done}/${s.tasks.length}</p>
          <div style="display:flex; gap:10px;">
            <button onclick="selectSubject(${s.id})">Select</button>
            <button class="delete-btn" onclick="deleteSubject(${s.id})">✖</button>
          </div>
        </div>`;
    });
    updateOverall();
  }

  function renderTasks() {
    if (!selectedSubjectId) {
      taskSection.style.display = "none";
      return;
    }

    taskSection.style.display = "block";
    taskList.innerHTML = "";
    const s = subjects.find(s => s.id === selectedSubjectId);

    s.tasks.forEach((t, i) => {
      taskList.innerHTML += `
        <div class="task-row">
          <input type="checkbox" ${t.done ? "checked" : ""}
            onchange="toggleTask(${i})">
          <span class="${t.done ? "task-done" : ""}">${t.text}</span>
          <button class="delete-btn" onclick="deleteTask(${i})">✖</button>
        </div>`;
    });
  }

  function updateOverall() {
    let d = 0, t = 0;
    subjects.forEach(s => {
      d += s.tasks.filter(x => x.done).length;
      t += s.tasks.length;
    });
    const p = t ? Math.round(d / t * 100) : 0;
    overallProgress.style.width = p + "%";
    overallText.textContent = p + "%";
  }

  function renderPlanner() {
    todayTasks.innerHTML = "";
    const grouped = {};

    subjects.forEach(s =>
      s.tasks.filter(t => !t.done).forEach(t => {
        grouped[s.name] = grouped[s.name] || [];
        grouped[s.name].push(t.text);
      })
    );

    Object.keys(grouped).forEach(name => {
      const div = document.createElement("div");
      div.className = "planner-card";
      div.innerHTML =
        `<h3>${name}</h3>` +
        grouped[name].map(t => `<div>☐ ${t}</div>`).join("");
      todayTasks.appendChild(div);
    });
  }

  /* ================= SYLLABUS ================= */
  let syllabus = JSON.parse(localStorage.getItem("syllabus")) || [];

  const saveSyllabus = () => {
    localStorage.setItem("syllabus", JSON.stringify(syllabus));
  };

  const populateSyllabusSelects = () => {
    syllabusSubjectSelect.innerHTML = "";
    syllabusSubjectSelect2.innerHTML = "";
    syllabus.forEach(s => {
      syllabusSubjectSelect.innerHTML += `<option>${s.subject}</option>`;
      syllabusSubjectSelect2.innerHTML += `<option>${s.subject}</option>`;
    });
    populateChapterSelect();
  };

  window.addSyllabusSubject = () => {
    if (!syllabusSubjectInput.value.trim()) return;
    syllabus.push({ subject: syllabusSubjectInput.value, chapters: [] });
    syllabusSubjectInput.value = "";
    saveSyllabus();
    populateSyllabusSelects();
    renderSyllabus();
  };

  window.addChapter = () => {
    const s = syllabus.find(x => x.subject === syllabusSubjectSelect.value);
    if (!s || !chapterInput.value.trim()) return;
    s.chapters.push({ name: chapterInput.value, subtopics: [] });
    chapterInput.value = "";
    saveSyllabus();
    populateSyllabusSelects();
    renderSyllabus();
  };

  window.addSubtopic = () => {
    const s = syllabus.find(x => x.subject === syllabusSubjectSelect2.value);
    if (!s) return;
    const c = s.chapters.find(x => x.name === syllabusChapterSelect.value);
    if (!c || !subtopicInput.value.trim()) return;

    c.subtopics.push({ text: subtopicInput.value, done: false });
    subtopicInput.value = "";
    saveSyllabus();
    renderSyllabus();
  };

  window.populateChapterSelect = () => {
    syllabusChapterSelect.innerHTML = "";
    const s = syllabus.find(x => x.subject === syllabusSubjectSelect2.value);
    if (!s) return;
    s.chapters.forEach(c =>
      syllabusChapterSelect.innerHTML += `<option>${c.name}</option>`
    );
  };

  window.toggleSubtopic = (si, ci, ti) => {
    syllabus[si].chapters[ci].subtopics[ti].done ^= 1;
    saveSyllabus();
    renderSyllabus();
  };

  window.deleteSubtopic = (si, ci, ti) => {
    syllabus[si].chapters[ci].subtopics.splice(ti, 1);

    if (syllabus[si].chapters[ci].subtopics.length === 0) {
      syllabus[si].chapters.splice(ci, 1);
    }
    if (syllabus[si].chapters.length === 0) {
      syllabus.splice(si, 1);
    }

    saveSyllabus();
    populateSyllabusSelects();
    renderSyllabus();
  };

  window.deleteChapter = (si, ci) => {
    syllabus[si].chapters.splice(ci, 1);
    if (syllabus[si].chapters.length === 0) {
      syllabus.splice(si, 1);
    }
    saveSyllabus();
    populateSyllabusSelects();
    renderSyllabus();
  };

  window.deleteSyllabusSubject = si => {
    if (!confirm("Delete this subject?")) return;
    syllabus.splice(si, 1);
    saveSyllabus();
    populateSyllabusSelects();
    renderSyllabus();
  };

  function renderSyllabus() {
    syllabusContainer.innerHTML = "";

    syllabus.forEach((s, si) => {
      syllabusContainer.innerHTML += `
        <div class="syllabus-subject">
          ${s.subject}
          <button class="delete-btn" onclick="deleteSyllabusSubject(${si})">✖</button>
        </div>
      `;

      s.chapters.forEach((c, ci) => {
        syllabusContainer.innerHTML += `
          <div class="syllabus-chapter">
            • ${c.name}
            <button class="delete-btn" onclick="deleteChapter(${si},${ci})">✖</button>
          </div>
        `;

        c.subtopics.forEach((t, ti) => {
          syllabusContainer.innerHTML += `
            <div class="syllabus-subtopic">
              <input type="checkbox" ${t.done ? "checked" : ""}
                onchange="toggleSubtopic(${si},${ci},${ti})">
              ${t.text}
              <button class="delete-btn" onclick="deleteSubtopic(${si},${ci},${ti})">✖</button>
            </div>
          `;
        });
      });
    });
  }

  /* ================= INIT ================= */
  renderSubjects();
  renderTasks();
  renderSyllabus();
  populateSyllabusSelects();
});
