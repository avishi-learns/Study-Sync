document.addEventListener("DOMContentLoaded", () => {

  /* THEME */
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme",
      document.body.classList.contains("dark") ? "dark" : "light");
  };

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

  /* DASHBOARD */
  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  let selectedSubjectId = null;

  function saveDashboard() {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }

  window.addSubject = () => {
    if (!subjectInput.value.trim()) return;
    subjects.push({ id: Date.now(), name: subjectInput.value, tasks: [] });
    subjectInput.value = "";
    saveDashboard();
    renderSubjects();
  };

  window.selectSubject = id => {
    selectedSubjectId = id;
    renderTasks();
  };

  window.addTask = () => {
    if (!taskInput.value.trim()) return;
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
    subjects.find(s => s.id === selectedSubjectId).tasks.splice(i,1);
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
            <div class="progress-fill" style="width:${(done/total)*100}%"></div>
          </div>
          <p>${done}/${s.tasks.length}</p>
          <button onclick="selectSubject(${s.id})">Select</button>
        </div>`;
    });
    updateOverall();
  }

  function renderTasks() {
    if (!selectedSubjectId) return;
    taskSection.style.display = "block";
    taskList.innerHTML = "";
    subjects.find(s => s.id === selectedSubjectId).tasks.forEach((t,i) =>
      taskList.innerHTML += `
        <div class="task-row">
          <input type="checkbox" ${t.done?"checked":""}
            onchange="toggleTask(${i})">
          <span>${t.text}</span>
          <button class="delete-btn" onclick="deleteTask(${i})">✖</button>
        </div>`
    );
  }

  function updateOverall() {
    let d=0,t=0;
    subjects.forEach(s=>{
      d+=s.tasks.filter(x=>x.done).length;
      t+=s.tasks.length;
    });
    const p=t?Math.round(d/t*100):0;
    overallProgress.style.width=p+"%";
    overallText.textContent=p+"%";
  }

  function renderPlanner() {
    todayTasks.innerHTML="";
    subjects.forEach(s =>
      s.tasks.filter(t=>!t.done).forEach(t =>
        todayTasks.innerHTML += `<div>${s.name}: ${t.text}</div>`
      )
    );
  }

  /* SYLLABUS */
  let syllabus = JSON.parse(localStorage.getItem("syllabus")) || [];

  function saveSyllabus() {
    localStorage.setItem("syllabus", JSON.stringify(syllabus));
  }

  function cleanupSyllabus() {
    syllabus = syllabus.filter(s =>
      s.chapters.some(c => c.subtopics.length > 0)
    );
  }

  window.addSyllabusSubject = () => {
    if (!syllabusSubjectInput.value.trim()) return;
    syllabus.push({ subject: syllabusSubjectInput.value, chapters: [] });
    syllabusSubjectInput.value="";
    saveSyllabus();
    renderSyllabus();
  };

  window.addChapter = () => {
    const s = syllabus.find(x=>x.subject===syllabusSubjectSelect.value);
    if (!s || !chapterInput.value.trim()) return;
    s.chapters.push({ name: chapterInput.value, subtopics: [] });
    chapterInput.value="";
    saveSyllabus();
    renderSyllabus();
  };

  window.addSubtopic = () => {
    const s = syllabus.find(x=>x.subject===syllabusSubjectSelect2.value);
    if (!s) return;
    const c = s.chapters.find(x=>x.name===syllabusChapterSelect.value);
    if (!c || !subtopicInput.value.trim()) return;
    c.subtopics.push({ text: subtopicInput.value, done:false });
    subtopicInput.value="";
    saveSyllabus();
    renderSyllabus();
  };

  function renderSyllabus() {
    cleanupSyllabus();
    saveSyllabus();
    syllabusContainer.innerHTML="";
    syllabus.forEach(s=>{
      syllabusContainer.innerHTML+=`<div class="syllabus-subject">${s.subject}</div>`;
      s.chapters.forEach(c=>{
        syllabusContainer.innerHTML+=`<div class="syllabus-chapter">• ${c.name}</div>`;
        c.subtopics.forEach(t=>{
          syllabusContainer.innerHTML+=`<div class="syllabus-subtopic">☐ ${t.text}</div>`;
        });
      });
    });
    populateSubjects();
  }

  function populateSubjects() {
    syllabusSubjectSelect.innerHTML="";
    syllabusSubjectSelect2.innerHTML="";
    syllabusChapterSelect.innerHTML="";
    syllabus.forEach(s=>{
      syllabusSubjectSelect.innerHTML+=`<option>${s.subject}</option>`;
      syllabusSubjectSelect2.innerHTML+=`<option>${s.subject}</option>`;
    });
    populateChapterSelect();
  }

  window.populateChapterSelect = () => {
    syllabusChapterSelect.innerHTML="";
    const s = syllabus.find(x=>x.subject===syllabusSubjectSelect2.value);
    if (!s) return;
    s.chapters.forEach(c=>syllabusChapterSelect.innerHTML+=`<option>${c.name}</option>`);
  };

  renderSubjects();
  renderSyllabus();
});
