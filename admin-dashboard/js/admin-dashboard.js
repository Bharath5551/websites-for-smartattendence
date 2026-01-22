console.log("ADMIN DASHBOARD JS LOADED");

const token = localStorage.getItem("adminToken");
if (!token) {
  window.location.href = "index.html";
}

/* ---------------- LOGOUT ---------------- */

function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "index.html";
}

/* ---------------- GLOBAL STATE ---------------- */

let selectedTeacherId = null;
let selectedTeacherName = "";

/* ---------------- LOAD TEACHERS ---------------- */

function loadTeachers() {
  fetch("https://smart-attendance-api1.onrender.com/api/admin/teachers", {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("teacherList");
      const select = document.getElementById("teacherSelect");

      list.innerHTML = "";
      select.innerHTML = "";

      if (!data || data.length === 0) {
        list.innerHTML = "<p>No teachers found</p>";
        return;
      }

      data.forEach(t => {
        const card = document.createElement("div");
        card.className = "teacher-card";

        const info = document.createElement("div");
        info.className = "teacher-info";
        info.innerHTML = `
          <strong>${t.name}</strong>
          <span>${t.email}</span>
        `;

        info.onclick = () => {
          console.log("Teacher clicked:", t._id);
          showTeacherSubjects(t._id, t.name);
        };

        const actions = document.createElement("div");
        actions.className = "teacher-actions";

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => deleteTeacher(t._id);

        actions.appendChild(delBtn);
        card.appendChild(info);
        card.appendChild(actions);
        list.appendChild(card);

        const option = document.createElement("option");
        option.value = t._id;
        option.textContent = t.name;
        select.appendChild(option);
      });
    })
    .catch(err => {
      alert("Failed to load teachers");
      console.error(err);
    });
}

/* ---------------- ADD TEACHER ---------------- */

function addTeacher() {
  const name = document.getElementById("tname").value.trim();
  const email = document.getElementById("temail").value.trim();
  const password = document.getElementById("tpassword").value.trim();

  if (!name || !email || !password) {
    alert("Please fill all teacher fields");
    return;
  }

  fetch("https://smart-attendance-api1.onrender.com/api/admin/teacher", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ name, email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (!data || !data.teacher) {
        alert(data.message || "Failed to add teacher");
        return;
      }

      document.getElementById("tname").value = "";
      document.getElementById("temail").value = "";
      document.getElementById("tpassword").value = "";

      loadTeachers();
    })
    .catch(err => {
      alert("Error adding teacher");
      console.error(err);
    });
}

/* ---------------- DELETE TEACHER ---------------- */

function deleteTeacher(id) {
  if (!confirm("Are you sure you want to delete this teacher?")) return;

  fetch(`https://smart-attendance-api1.onrender.com/api/admin/teacher/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  })
    .then(() => {
      loadTeachers();
      document.getElementById("teacherDetails").style.display = "none";
    })
    .catch(err => {
      alert("Error deleting teacher");
      console.error(err);
    });
}

/* ---------------- ASSIGN SUBJECT ---------------- */

function assignSubject() {
  const teacherId = document.getElementById("teacherSelect").value;
  const name = document.getElementById("subjectName").value.trim();
  const code = document.getElementById("subjectCode").value.trim();

  if (!teacherId || !name || !code) {
    alert("Please select teacher and fill subject details");
    return;
  }

  fetch("https://smart-attendance-api1.onrender.com/api/admin/subject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ teacherId, name, code })
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("subjectName").value = "";
      document.getElementById("subjectCode").value = "";

      if (selectedTeacherId === teacherId) {
        showTeacherSubjects(teacherId, selectedTeacherName);
      }
    })
    .catch(err => {
      alert("Error assigning subject");
      console.error(err);
    });
}

/* ---------------- SHOW TEACHER SUBJECTS ---------------- */

function showTeacherSubjects(teacherId, name) {
  selectedTeacherId = teacherId;
  selectedTeacherName = name;

  document.getElementById("teacherDetails").style.display = "block";
  document.getElementById("teacherName").innerText = `Subjects for ${name}`;

  fetch(
    `https://smart-attendance-api1.onrender.com/api/admin/teacher/${teacherId}/subjects`,
    {
      headers: { Authorization: "Bearer " + token }
    }
  )
    .then(res => res.json())
    .then(subjects => {
      console.log("Subjects received from API:", subjects);

      const ul = document.getElementById("subjectList");
      ul.innerHTML = "";

      if (!subjects || subjects.length === 0) {
        ul.innerHTML = "<li>No subjects assigned</li>";
        return;
      }

      subjects.forEach(s => {
        const li = document.createElement("li");
        li.innerHTML = `
          ${s.name} (${s.code})
          <button onclick="deleteSubject('${s._id}')">Delete</button>
        `;
        ul.appendChild(li);
      });
    })
    .catch(err => {
      alert("Error loading subjects");
      console.error(err);
    });
}

/* ---------------- DELETE SUBJECT ---------------- */

function deleteSubject(id) {
  if (!confirm("Delete this subject?")) return;

  fetch(`https://smart-attendance-api1.onrender.com/api/admin/subject/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  })
    .then(() => {
      showTeacherSubjects(selectedTeacherId, selectedTeacherName);
    })
    .catch(err => {
      alert("Error deleting subject");
      console.error(err);
    });
}

/* ---------------- INIT ---------------- */

loadTeachers();