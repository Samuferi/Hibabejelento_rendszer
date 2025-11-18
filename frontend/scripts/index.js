/* document.addEventListener("DOMContentLoaded", async () => {
  // 1️⃣ Token beolvasása a localStorage-ból
  const token = localStorage.getItem("token");

  if (!token) {
    // Nincs token → vissza a login oldalra
    alert("Kérlek, jelentkezz be!");
    window.location.href = "/login";
    return;
  }

  try {
    // 2️⃣ Token elküldése a backendnek ellenőrzésre
    const response = await fetch("/index/user", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    // 3️⃣ Hibaellenőrzés
    if (response.status === 401) {
      alert("Nincs jogosultság (nincs token). Jelentkezz be újra!");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    if (response.status === 403) {
      alert("A token érvénytelen vagy lejárt. Jelentkezz be újra!");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    // 4️⃣ Ha minden rendben, lekérjük a felhasználó adatait
    const data = await response.json();
    console.log("Felhasználói adatok:", data);
    const userRole = data.role;

    
    const adminEl = document.getElementById("admin");
    const fonokEl = document.getElementById("fonok");
    const munkatarsEl = document.getElementById("munkatars");
    const ujhirEl = document.getElementById("uj_hir");

    if (userRole === "admin") {
      adminEl?.style && (adminEl.style.display = "block");
      fonokEl?.style && (fonokEl.style.display = "block");
      munkatarsEl?.style && (munkatarsEl.style.display = "block");
      ujhirEl?.style && (ujhirEl.style.display = "block");
    } else if (userRole === "fonok") {
      adminEl?.style && (adminEl.style.display = "none");
      munkatarsEl?.style && (munkatarsEl.style.display = "none");
      fonokEl?.style && (fonokEl.style.display = "block");
      ujhirEl?.style && (ujhirEl.style.display = "block");
    } else if (userRole === "ugyintezo") {
      adminEl?.style && (adminEl.style.display = "none");
      fonokEl?.style && (fonokEl.style.display = "none");
      munkatarsEl?.style && (munkatarsEl.style.display = "block");
      ujhirEl?.style && (ujhirEl.style.display = "none");
    } else {
      adminEl?.style && (adminEl.style.display = "none");
      fonokEl?.style && (fonokEl.style.display = "none");
      munkatarsEl?.style && (munkatarsEl.style.display = "none");
      ujhirEl?.style && (ujhirEl.style.display = "none");
    }


  } catch (err) {
    console.error("Hiba az authentikáció során:", err);
    alert("Hálózati hiba vagy szerverhiba történt.");
  }
});



document.getElementById("admin-link").addEventListener("click", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const response = await fetch("/index/admin", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });

  if (response.ok) {
    window.location.href = "/pages/admin.html";
  } else if (response.status === 403) {
    alert("Nincs jogosultság a vezetői felülethez!");
  } else if (response.status === 401) {
    alert("Nem vagy bejelentkezve!");
  } else {
    alert("Ismeretlen hiba történt a betöltésnél!");
  }
});

document.getElementById("fonok-link").addEventListener("click", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const response = await fetch("/index/fonok", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });

  if (response.ok) {
    window.location.href = "/pages/fonok.html";
  } else if (response.status === 403) {
    alert("Nincs jogosultság a vezetői felülethez!");
  } else if (response.status === 401) {
    alert("Nem vagy bejelentkezve!");
  } else {
    alert("Ismeretlen hiba történt a betöltésnél!");
  }
});

document.getElementById("munkatars-link").addEventListener("click", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const response = await fetch("/index/munkatars", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });

  if (response.ok) {
    window.location.href = "/pages/munkatars.html";
  } else if (response.status === 403) {
    alert("Nincs jogosultság az ügyintézői felülethez!");
  } else if (response.status === 401) {
    alert("Nem vagy bejelentkezve!");
  } else {
    alert("Ismeretlen hiba történt a betöltésnél!");
  }
});

document.getElementById("uj_hir-link").addEventListener("click", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const response = await fetch("/index/uj_hir", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });

  if (response.ok) {
    window.location.href = "/pages/hirfelvetel.html";
  } else if (response.status === 403) {
    alert("Nincs jogosultság az új hír felvételéhez!");
  } else if (response.status === 401) {
    alert("Nem vagy bejelentkezve!");
  } else {
    alert("Ismeretlen hiba történt a betöltésnél!");
  }
});
*/
