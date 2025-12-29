// APPLY THEME IMMEDIATELY
(function () {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
})();

const views = document.querySelectorAll(".view");
const navLinks = document.querySelectorAll(".nav-link");
const buttons = document.querySelectorAll("[data-view]");

const themeToggle = document.getElementById("themeToggle");
const subjectInput = document.getElementById("subjectInput");
const subjectsContainer = document.getElementById("subjectsContainer");
const todayTasks = document.getElementById("todayTasks");
const overallProgress = document.getElementById("overallProgress");
const overallText = document.getElementById("overallText");

let data = JSON.parse(localStorage.getItem("studysync")) || { subjects: [] };
let syllabus = JSON.parse(localStorage.getItem("syllabus")) || [];

/* NAV */
function showView(view) {
  views.forEach(v => v.classList.remove("active"));
  document.getElementById(view).classList.add("active");
  navLinks.forEach(l => l.classList.remove("active"));
  document.querySelector(`[data-view="${view}"]`).classList.add("active");
}
buttons.forEach(btn => btn.onclick = () => showView(btn.dataset.view));

/* THEME */
function updateThemeBtn() {
  themeToggle.textContent =
    document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
}
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark") ? "dark" : "light");
  updateThemeBtn();
};
updateThemeBtn();

/* DASHBOARD */
document.getElementById("addSubjectBtn").onclick = () => {
  if (!subjectInput.value) return;
  data.subjects.push({ name: subjectInput.value, tasks: [] });
  subjectInput.value = "";
  save();
  render();
};

function render() {
  subjectsContainer.innerHTML = "";
  todayTasks.innerHTML = "";
  let done = 0, total = 0;

  data.subjects.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${s.name}</h3>`;

    s.tasks.forEach(t => {
      total++;
      if (t.done) done++;

      const row = document.createElement("div");
      row.innerHTML = `
        <input type="checkbox" ${t.done ? "checked" : ""}>
        ${t.name}
      `;
      row.querySelector("input").onchange = () => {
        t.done = !t.done;
        save(); render();
      };
      card.appendChild(row);

      if (!t.done) {
        todayTasks.innerHTML += `<div>${s.name}: ${t.name}</div>`;
      }
    });

    const input = document.createElement("input");
    input.placeholder = "Add task";
    const btn = document.createElement("button");
    btn.textContent = "Add";
    btn.onclick = () => {
      if (!input.value) return;
      s.tasks.push({ name: input.value, done: false });
      save(); render();
    };

    card.appendChild(input);
    card.appendChild(btn);
    subjectsContainer.appendChild(card);
  });

  const percent = total ? Math.round(done / total * 100) : 0;
  overallProgress.style.width = percent + "%";
  overallText.textContent = percent + "%";

  renderSyllabus();
}

function save() {
  localStorage.setItem("studysync", JSON.stringify(data));
}

/* AI SYLLABUS (RULE-BASED) */
function generateSyllabus() {
  const input = document.getElementById("aiInput").value.toLowerCase();
  if (!input) return;

  const map = {
    "physics mechanics": ["Kinematics","Laws of Motion","Work Energy Power","Rotational Motion"],
    "maths calculus": ["Limits","Continuity","Differentiation","Integration"],
    "chemistry organic": ["Hydrocarbons","Alcohols","Aldehydes","Carboxylic Acids"]
  };

  const key = Object.keys(map).find(k => input.includes(k));
  if (!key) {
    alert("AI couldn't recognize this topic yet.");
    return;
  }

  const [subject, chapter] = key.split(" ");
  syllabus.push({
    subject: subject.toUpperCase(),
    chapters: [{
      name: chapter.toUpperCase(),
      subtopics: map[key].map(t => ({ text: t, done: false }))
    }]
  });

  localStorage.setItem("syllabus", JSON.stringify(syllabus));
  renderSyllabus();
}

/* RENDER SYLLABUS */
function renderSyllabus() {
  const container = document.getElementById("syllabusContainer");
  container.innerHTML = "";

  syllabus.forEach(s => {
    container.innerHTML += `<div class="syllabus-subject">${s.subject}</div>`;
    s.chapters.forEach(c => {
      container.innerHTML += `<div class="syllabus-chapter">• ${c.name}</div>`;
      c.subtopics.forEach(t => {
        container.innerHTML += `
          <div class="syllabus-subtopic">
            <input type="checkbox" ${t.done ? "checked" : ""}>
            ${t.text}
          </div>`;
      });
    });
  });
}

render();
