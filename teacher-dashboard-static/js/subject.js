const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

// Read subject code from URL
const params = new URLSearchParams(window.location.search);
const subject = params.get("code");

document.getElementById("subjectTitle").innerText = subject;

// ---------------- FETCH ATTENDANCE DATA ----------------

fetch(
  `https://smart-attendance-api1.onrender.com/api/attendance/subject/${encodeURIComponent(subject)}`,
  {
    headers: {
      Authorization: "Bearer " + token,
    },
  }
)
  .then(res => res.json())
  .then(data => {
    console.log("BACKEND RESPONSE:", data);

    // ✅ Store globally for CSV export
    window.attendanceData = data;

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (!data.students || data.students.length === 0) {
      tbody.innerHTML =
        "<tr><td colspan='3'>No attendance data</td></tr>";
      return;
    }

    data.students.forEach(s => {
      const badgeClass =
        parseFloat(s.percentage) >= 75 ? "green" : "red";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.name}</td>
        <td>${s.usn}</td>
        <td><span class="badge ${badgeClass}">${s.percentage}%</span></td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(err => {
    console.error("FETCH ERROR:", err);
  });

// ---------------- CSV EXPORT ----------------

document.getElementById("exportBtn").addEventListener("click", () => {
  if (!window.attendanceData) {
    alert("No data to export");
    return;
  }

  let csv = "Name,USN,Attendance %\n";

  window.attendanceData.students.forEach(s => {
    csv += `${s.name},${s.usn},${s.percentage}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download =
    `${window.attendanceData.subject}_attendance.csv`;
  a.click();
});function addStudent() {
  const name = sname.value;
  const usn = susn.value;
  const email = semail.value;

  fetch("https://smart-attendance-api1.onrender.com/api/teacher/student", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      name,
      usn,
      email,
      subjectId: window.attendanceData.subjectId
    })
  })
  .then(res => res.json())
  .then(() => location.reload());
}

function deleteStudent(studentId) {
  fetch("https://smart-attendance-api1.onrender.com/api/teacher/student", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      studentId,
      subjectId: window.attendanceData.subjectId
    })
  })
  .then(() => location.reload());
}