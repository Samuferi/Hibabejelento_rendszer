window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("problemForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      user: document.getElementById("user").value,
      location: document.getElementById("location").value,
      datetime: document.getElementById("datetime").value,
      images: document.getElementById("images").value,
      details: document.getElementById("details").value,
    };

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Sikeres problémafelvétel!");
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
