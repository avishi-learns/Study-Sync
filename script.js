document.addEventListener("DOMContentLoaded", () => {

  let subjects = [];
  let selectedSubjectId = null;

  /* ---------------- NAV ---------------- */
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      showView(link.dataset.section);
    });
  });

  function showView(id) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".nav-link").forEach(l =>
      l.classList.toggle("active", l.dataset.section === id)
    );

    if (id === "planner") renderTodayTasks();
  }

  /* ---------------- SUBJECTS ---------------- */
  window.addSubject = function () {
    const input = document.getElementById("subjectInput");
    if (!input.value.trim()) return;

    subjects.push({
      id: Date.now(),
      name: input.value.trim(),
      tasks: []
    });

    input.value = "";
    renderSubjects();
  };

  window.selectSubject = function (id) {
    selectedSubjectId = id;
    renderSubjects();
    renderTasks();
  };

  function renderSubjects() {
    const c = document.getElementById("subjectsContainer");
    c.innerHTML = "";

    subjects.forEach(s => {
      const done = s.tasks.filter(t => t.done).length;
      const total = s.tasks.length || 1;
      const percent = Math.round((done / total) * 100);

      c.innerHTML += `
        <div class="card ${selectedSubjectId === s.id ? "active-subject" : ""}">
          <h3>${s.name}</h3>
          <p>${done}/${total}</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${percent}%"></div>
          </div>
          <button onclick="selectSubject(${s.id})">Select</button>
        </div>
      `;
    });

    updateOverallProgress();
    renderTodayTasks();
  }

  /* ---------------- TASKS ---------------- */
  window.addTask = function () {
    if (selectedSubjectId === null) return;

    const input = document.getElementById("taskInput");
    if (!input.value.trim()) return;

    const subject = subjects.find(s => s.id === selectedSubjectId);
    subject.tasks.push({ text: input.value.trim(), done: false });

    input.value = "";
    renderTasks();
    renderSubjects();
  };

  function renderTasks() {
    const section = document.getElementById("taskSection");
    const list = document.getElementById("taskList");

    if (selectedSubjectId === null) {
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    list.innerHTML = "";

    const subject = subjects.find(s => s.id === selectedSubjectId);

    subject.tasks.forEach((t, i) => {
      list.innerHTML += `
        <div class="task">
          <input type="checkbox" ${t.done ? "checked" : ""}
            onchange="toggleTask(${i})">
          <span>${t.text}</span>
        </div>
      `;
    });
  }

  window.toggleTask = function (i) {
    const subject = subjects.find(s => s.id === selectedSubjectId);
    subject.tasks[i].done = !subject.tasks[i].done;

    renderTasks();
    renderSubjects();
  };

  /* ---------------- PLANNER ---------------- */
  function renderTodayTasks() {
    const container = document.getElementById("todayTasks");
    container.innerHTML = "";

    let hasTasks = false;

    subjects.forEach(subject => {
      subject.tasks.forEach(task => {
        if (!task.done) {
          hasTasks = true;
          container.innerHTML += `
            <div class="task">
              <input type="checkbox"
                onchange="markFromPlanner(${subject.id}, '${task.text}')">
              <strong>${subject.name}:</strong> ${task.text}
            </div>
          `;
        }
      });
    });

    if (!hasTasks) {
      container.innerHTML = "<p>🎉 No pending tasks for today!</p>";
    }
  }

  window.markFromPlanner = function (subjectId, taskText) {
    const subject = subjects.find(s => s.id === subjectId);
    const task = subject.tasks.find(t => t.text === taskText);
    task.done = true;

    renderSubjects();
    renderTasks();
    renderTodayTasks();
  };

  /* ---------------- PROGRESS ---------------- */
  function updateOverallProgress() {
    let done = 0, total = 0;

    subjects.forEach(s => {
      done += s.tasks.filter(t => t.done).length;
      total += s.tasks.length;
    });

    const p = total === 0 ? 0 : Math.round((done / total) * 100);
    document.getElementById("overallProgress").style.width = p + "%";
    document.getElementById("overallText").textContent = p + "%";
  }

  /* ---------------- DARK MODE ---------------- */
  document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  /* ---------------- INITIAL ---------------- */
  renderTodayTasks();

});