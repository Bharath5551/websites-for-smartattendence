document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  const btnText = document.getElementById("btnText");
  const spinner = document.getElementById("spinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 🔹 Instant visual feedback
    loginBtn.disabled = true;
    btnText.innerText = "Signing in";
    spinner.style.display = "inline-block";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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

      if (data.role !== "teacher") {
        throw new Error("Only teachers allowed");
      }

      // ✅ Success
      localStorage.setItem("token", data.token);

      // 🔥 Small delay for smoothness (UX trick)
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 300);

    } catch (err) {
      alert(err.message);

      // 🔄 Reset button
      loginBtn.disabled = false;
      btnText.innerText = "Login";
      spinner.style.display = "none";
    }
  });
});
