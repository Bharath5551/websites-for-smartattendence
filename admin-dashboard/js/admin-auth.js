document.getElementById("adminLoginForm").addEventListener("submit", async e => {
  e.preventDefault();

  const res = await fetch("https://smart-attendance-api1.onrender.com/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();

  if (data.role !== "admin") {
    alert("Not authorized");
    return;
  }

  localStorage.setItem("adminToken", data.token);
  window.location.href = "dashboard.html";
});
