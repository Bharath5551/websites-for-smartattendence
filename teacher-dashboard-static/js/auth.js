document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  const spinner = document.getElementById("spinner");
  const btnText = document.getElementById("btnText");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    loginBtn.disabled = true;
    spinner.style.display = "inline-block";
    btnText.innerText = "Signing in...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(
        "https://smart-attendance-api1.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 🔐 ONLY TEACHERS ALLOWED
      if (data.role !== "teacher") {
        throw new Error("Only teachers can access this dashboard");
      }

      // ✅ STORE AUTH DATA HERE
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // 🚀 REDIRECT
      window.location.href = "dashboard.html";

    } catch (err) {
      alert(err.message);
      loginBtn.disabled = false;
      spinner.style.display = "none";
      btnText.innerText = "Login";
    }
  });
});
