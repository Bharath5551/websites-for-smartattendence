document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);

  const sessionId = params.get("sessionId");
  const subject = params.get("subject");
  const expiresAt = Number(params.get("expiresAt"));

  // 🔒 VALIDATION
  if (!sessionId || !subject || isNaN(expiresAt)) {
    alert("Invalid or expired session");
    window.location.href = "dashboard.html";
    return;
  }

  const subjectNameEl = document.getElementById("subjectName");
  const qrImg = document.getElementById("qrImage");
  const timerText = document.getElementById("timerText");
  const liveList = document.getElementById("liveList");

  if (!subjectNameEl || !qrImg || !timerText || !liveList) {
    console.error("❌ Session page DOM elements missing");
    return;
  }

  /* ---------- UI SETUP ---------- */

  subjectNameEl.innerText = subject;

  qrImg.src =
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${sessionId}`;

  const token = localStorage.getItem("token");

  /* ---------- BACKEND-DRIVEN TIMER ---------- */

  function updateTimer() {
    const now = Date.now();
    const remainingMs = expiresAt - now;
    const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));

    if (remainingSec <= 0) {
      timerText.innerText = "Session expired";
      qrImg.style.opacity = "0.35";
      clearInterval(timerInterval);
      clearInterval(attendanceInterval);
      return;
    }

    timerText.innerText = `Expires in ${remainingSec}s`;
  }

  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);

  /* ---------- LIVE ATTENDANCE ---------- */

  function fetchLiveAttendance() {
    fetch(
      `https://smart-attendance-api1.onrender.com/api/attendance/session/${sessionId}`,
      {
        headers: { Authorization: "Bearer " + token }
      }
    )
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch attendance");
        return res.json();
      })
      .then(students => {
        console.log("LIVE ATTENDANCE DATA:", students);

        liveList.innerHTML = "";

        if (!Array.isArray(students) || students.length === 0) {
          liveList.innerHTML = "<li>No attendance yet</li>";
          return;
        }

        students.forEach(s => {
          const li = document.createElement("li");
          li.textContent = `${s.name} (${s.usn})`;
          liveList.appendChild(li);
        });
      })
      .catch(err => {
        console.error("LIVE ATTENDANCE ERROR:", err);
      });
  }

  fetchLiveAttendance();
  const attendanceInterval = setInterval(fetchLiveAttendance, 5000);

  /* ---------- EXIT SESSION ---------- */

  window.logout = function () {
    clearInterval(timerInterval);
    clearInterval(attendanceInterval);
    window.location.href = "dashboard.html";
  };

});