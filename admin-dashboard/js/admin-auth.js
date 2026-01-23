document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

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

      // 🔐 ONLY ADMINS ALLOWED
      if (data.role !== "admin") {
        throw new Error("Only admins can access this panel");
      }

      // ✅ STORE ADMIN AUTH DATA
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("role", data.role);

      // 🚀 REDIRECT TO ADMIN DASHBOARD
      window.location.href = "dashboard.html";

    } catch (err) {
      alert(err.message);
    }
  });
});
