document.addEventListener("DOMContentLoaded", async () => {
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

    

    if (userRole === "admin") {
      document.getElementById("admin").style.display = "block";
      document.getElementById("fonok").style.display = "block";
    } else if (userRole === "fonok") {
      document.getElementById("admin").style.display = "none";
      document.getElementById("fonok").style.display = "block";
    } else {
      document.getElementById("admin").style.display = "none";
      document.getElementById("fonok").style.display = "none";
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
    const html = await response.text(); 
    document.open();                     
    document.write(html);                
    document.close();                    
    window.history.pushState({}, "", "/index/admin");
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
    const html = await response.text(); 
    document.open();                     
    document.write(html);                
    document.close();                    
    window.history.pushState({}, "", "/index/fonok");
  } else if (response.status === 403) {
    alert("Nincs jogosultság a vezetői felülethez!");
  } else if (response.status === 401) {
    alert("Nem vagy bejelentkezve!");
  } else {
    alert("Ismeretlen hiba történt a betöltésnél!");
  }
});
