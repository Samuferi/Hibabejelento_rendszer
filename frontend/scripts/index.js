// Token dekódolás (JWT payload kiolvasás)
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) {
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    //console.log("LocalStorage token:", token);
    if (!token) {
        // ha nincs token → login oldal
        window.location.href = "/login";
        return;
    }

    const payload = parseJwt(token);
    //console.log("Dekódolt payload:", payload); 
    if (!payload) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }

    // Ha NEM admin → elrejtjük az Admin menüpontot
    if (payload.role !== "admin") {
        const adminLink = document.querySelector('a[href="admin.html"]');
        if (adminLink) {
            adminLink.parentElement.style.display = "none";
        }
    }

    // Példa: backendhez lekérés user adatokhoz
    fetch("/index/user", {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => {
            if (!res.ok) throw new Error("Hitelesítés hiba");
            return res.json();
        })
        .then(data => {
            console.log("Felhasználó adatok:", data);
            // ide jöhet pl. a DOM kitöltése usernévvel
        })
        .catch(err => {
            console.error(err);
            window.location.href = "login.html";
        });
});
