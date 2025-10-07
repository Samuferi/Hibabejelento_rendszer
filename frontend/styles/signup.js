window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      lastname: document.getElementById("lastname-input").value,
      firstname: document.getElementById("firstname-input").value,
      email: document.getElementById("email-input").value,
      "post-number": document.getElementById("post-number-input").value,
      town: document.getElementById("town-input").value,
      address: document.getElementById("address-input").value,
      "phone-number": document.getElementById("phone-number-input").value,
      password: document.getElementById("password-input").value,
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Sikeres regisztráció!");
        window.location.href = "/login";
      } else {
        alert("❌ Hiba: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Hálózati hiba!");
    }
  });
});
