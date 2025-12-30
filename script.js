document.addEventListener("DOMContentLoaded", () => {

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

  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  let selectedSubjectId = JSON.parse(localStorage.getItem("selectedSubject"));

  function saveDashboard() {
    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.setItem("selectedSubject", JSON.stringify(selectedSubjectId));
  }

  window.addSubject = () => {
    const name = subjectInput.value.trim();
    if (!name) return;

    subjects.push({
      id: Date.now(),
      name,
      tasks: []
    });

    subjectInput.value = "";
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
    if (!taskInput.value.trim() || !selectedSubjectId) return;

    const s = subjects.find(s => s.id === selectedSubjectId);
    s.tasks.push({ text: taskInput.value, done: false });

    taskInput.value = "";
    saveDashboard();
    renderTasks();
    renderSubjects();
  };

  window.toggleTask = (i) => {
    const s = subjects.find(s => s.id === selectedSubjectId);
    s.tasks[i].done = !s.tasks[i].done;

    saveDashboard();
    renderTasks();
    renderSubjects();
  };

  window.deleteTask = (i) => {
    const s = subjects.find(s => s.id === selectedSubjectId);
    s.tasks.splice(i, 1);

    // auto remove subject if empty
    if (s.tasks.length === 0) {
      subjects = subjects.filter(x => x.id !== s.id);
      selectedSubjectId = null;
    }

    saveDashboard();
    renderTasks();
    renderSubjects();
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
            <div class="progress-fill" style="width:${(done / total) * 100}%"></div>
          </div>
          <p>${done}/${s.tasks.length}</p>
          <button onclick="selectSubject(${s.id})">Select</button>
        </div>
      `;
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
        </div>
      `;
    });
  }

  function updateOverall() {
    let done = 0, total = 0;

    subjects.forEach(s => {
      done += s.tasks.filter(t => t.done).length;
      total += s.tasks.length;
    });

    const percent = total ? Math.round((done / total) * 100) : 0;
    overallProgress.style.width = percent + "%";
    overallText.textContent = percent + "%";
  }

  function renderPlanner() {
    todayTasks.innerHTML = "";
    const grouped = {};

    subjects.forEach(s => {
      s.tasks.filter(t => !t.done).forEach(t => {
        grouped[s.name] = grouped[s.name] || [];
        grouped[s.name].push(t.text);
      });
    });

    Object.keys(grouped).forEach(subject => {
      const card = document.createElement("div");
      card.className = "planner-card";
      card.innerHTML =
        `<h3>${subject}</h3>` +
        grouped[subject].map(t => `<div>☐ ${t}</div>`).join("");
      todayTasks.appendChild(card);
    });
  }

let syllabus = JSON.parse(localStorage.getItem("syllabus")) || [];

function saveSyllabus() {
  localStorage.setItem("syllabus", JSON.stringify(syllabus));
}

window.addSyllabusSubject = () => {
  const name = syllabusSubjectInput.value.trim();
  if (!name) return;

  // prevent duplicates
  if (syllabus.some(s => s.subject === name)) return;

  syllabus.push({
    subject: name,
    chapters: []
  });

  syllabusSubjectInput.value = "";
  saveSyllabus();
  populateSubjects();
  renderSyllabus();
};

window.addChapter = () => {
  const subjectName = syllabusSubjectSelect.value;
  if (!subjectName || !chapterInput.value.trim()) return;

  const subject = syllabus.find(s => s.subject === subjectName);
  if (!subject) return;

  subject.chapters.push({
    name: chapterInput.value.trim(),
    subtopics: []
  });

  chapterInput.value = "";
  saveSyllabus();
  populateSubjects();
  renderSyllabus();
};

window.addSubtopic = () => {
  const subjectName = syllabusSubjectSelect2.value;
  const chapterName = syllabusChapterSelect.value;
  const text = subtopicInput.value.trim();

  if (!subjectName || !chapterName || !text) return;

  const subject = syllabus.find(s => s.subject === subjectName);
  if (!subject) return;

  const chapter = subject.chapters.find(c => c.name === chapterName);
  if (!chapter) return;

  chapter.subtopics.push({
    text,
    done: false
  });

  subtopicInput.value = "";
  saveSyllabus();
  renderSyllabus();
};
window.toggleSubtopic = (si, ci, ti) => {
  syllabus[si].chapters[ci].subtopics[ti].done =
    !syllabus[si].chapters[ci].subtopics[ti].done;

  saveSyllabus();
  renderSyllabus();
};

function populateSubjects() {
  syllabusSubjectSelect.innerHTML = "";
  syllabusSubjectSelect2.innerHTML = "";

  syllabus.forEach(s => {
    syllabusSubjectSelect.innerHTML += `<option value="${s.subject}">${s.subject}</option>`;
    syllabusSubjectSelect2.innerHTML += `<option value="${s.subject}">${s.subject}</option>`;
  });

  populateChapterSelect();
}

window.populateChapterSelect = () => {
  syllabusChapterSelect.innerHTML = "";

  const subject = syllabus.find(s => s.subject === syllabusSubjectSelect2.value);
  if (!subject) return;

  subject.chapters.forEach(c => {
    syllabusChapterSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
  });
};

function renderSyllabus() {
  syllabusContainer.innerHTML = "";

  syllabus.forEach((s, si) => {
    syllabusContainer.innerHTML += `<div class="syllabus-subject">${s.subject}</div>`;

    s.chapters.forEach((c, ci) => {
      syllabusContainer.innerHTML += `<div class="syllabus-chapter">• ${c.name}</div>`;

      c.subtopics.forEach((t, ti) => {
        syllabusContainer.innerHTML += `
          <div class="syllabus-subtopic">
            <input type="checkbox" ${t.done ? "checked" : ""}
              onchange="toggleSubtopic(${si},${ci},${ti})">
            ${t.text}
          </div>
        `;
      });
    });
  });
}
populateSubjects();
renderSyllabus();
