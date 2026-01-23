document.addEventListener("DOMContentLoaded", () => {
  console.log("TEACHER DASHBOARD JS LOADED");

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  /* ---------- LOGOUT ---------- */
  window.logout = function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  };

  const subjectContainer = document.getElementById("subjects");
  const emptyState = document.getElementById("emptyState");
  const studentList = document.getElementById("studentList");
  const locationToggle = document.getElementById("locationToggle");

  /* ---------- LOAD SUBJECTS ---------- */
  function loadSubjects() {
    fetch("https://smart-attendance-api1.onrender.com/api/subjects/mine", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load subjects");
        return res.json();
      })
      .then(subjects => {
        subjectContainer.innerHTML = "";
        emptyState.style.display = "none";

        if (!Array.isArray(subjects) || subjects.length === 0) {
          emptyState.style.display = "block";
          return;
        }

        subjects.forEach(s => {
          const card = document.createElement("div");
          card.className = "subject-card";

          card.innerHTML = `
            <h3>${s.name}</h3>
            <div class="meta">${s.code}</div>
          `;

          card.onclick = () => handleStartSession(s.code);
          subjectContainer.appendChild(card);
        });
      })
      .catch(err => {
        console.error("SUBJECT LOAD ERROR:", err);
        emptyState.style.display = "block";
      });
  }

  /* ---------- START SESSION ---------- */
  function handleStartSession(subject) {
    const locationRequired = locationToggle && locationToggle.checked;

    if (locationRequired) {
      if (!navigator.geolocation) {
        alert("Location not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          startSession(
            subject,
            true,
            pos.coords.latitude,
            pos.coords.longitude
          );
        },
        () => alert("Location permission denied")
      );
    } else {
      startSession(subject, false);
    }
  }

  function startSession(subject, locationRequired, lat, lng) {
    const payload = { subject, locationRequired };

    if (locationRequired) {
      payload.lat = lat;
      payload.lng = lng;
    }

    fetch("https://smart-attendance-api1.onrender.com/api/sessions/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to start session");
        return res.json();
      })
      .then(data => {
        if (!data.sessionId || !data.expiresAt) {
          alert("Invalid session data");
          return;
        }

        // ✅ CORRECT REDIRECT WITH expiresAt
        window.location.href =
          `session.html?sessionId=${data.sessionId}` +
          `&subject=${encodeURIComponent(subject)}` +
          `&expiresAt=${new Date(data.expiresAt).getTime()}`;
      })
      .catch(err => {
        console.error("START SESSION ERROR:", err);
        alert("Unable to start session");
      });
  }

  /* ---------- LOAD STUDENTS ---------- */
  function loadStudents() {
    if (!studentList) return;

    fetch("https://smart-attendance-api1.onrender.com/api/teacher/students", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(students => {
        studentList.innerHTML = "";

        if (!Array.isArray(students) || students.length === 0) {
          studentList.innerHTML = "<li>No students found</li>";
          return;
        }

        students.forEach(s => {
          const li = document.createElement("li");
          li.innerHTML = `
            ${s.name} (${s.usn})
            <button onclick="deleteStudent('${s._id}')">Delete</button>
          `;
          studentList.appendChild(li);
        });
      })
      .catch(err => console.error("STUDENT LOAD ERROR:", err));
  }

  /* ---------- ADD STUDENT ---------- */
  window.addStudent = function () {
    const body = {
      name: sname.value.trim(),
      email: semail.value.trim(),
      password: spassword.value.trim(),
      usn: susn.value.trim(),
      branch: sbranch.value.trim(),
      year: syear.value.trim(),
      semester: ssemester.value.trim()
    };

    if (Object.values(body).some(v => !v)) {
      alert("Fill all student details");
      return;
    }

    fetch("https://smart-attendance-api1.onrender.com/api/teacher/student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(body)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to add student");
        return res.json();
      })
      .then(() => {
        sname.value = "";
        semail.value = "";
        spassword.value = "";
        susn.value = "";
        sbranch.value = "";
        syear.value = "";
        ssemester.value = "";
        loadStudents();
      })
      .catch(err => {
        console.error("ADD STUDENT ERROR:", err);
        alert("Failed to add student");
      });
  };

  /* ---------- DELETE STUDENT ---------- */
  window.deleteStudent = function (id) {
    fetch(
      `https://smart-attendance-api1.onrender.com/api/teacher/student/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      }
    ).then(() => loadStudents());
  };

  /* ---------- INIT ---------- */
  loadSubjects();
  loadStudents();
});