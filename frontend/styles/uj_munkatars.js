window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("problemForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      status: document.getElementById("status").value,
    };

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Sikeres tagfelvétel!");
        document.getElementById("problemForm").reset();
      } else {
        alert("❌ Hiba: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Hálózati hiba!");
    }
  });
});
