/*// Token dekódolás (JWT payload kiolvasás)
import { parseJwt } from "./dec_token.js";

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

    const manLink = document.querySelector('a[href="fonok.html"]');
    const munLink = document.querySelector('a[href="munkatars.html"]');
    const adminLink = document.querySelector('a[href="admin.html"]');
    const hirfLink = document.querySelector('a[href="hirfelvetel.html"]');
    // Ha NEM admin → elrejtjük az Admin menüpontot
    switch (payload.role) {
        case "admin":
            
            if (manLink) {
                manLink.parentElement.style.display = "none";
            }
            if (munLink) {
                munLink.parentElement.style.display = "none";
            }
            break;
        case "munkatars":
            if (adminLink) {
                adminLink.parentElement.style.display = "none";
            }
            if (manLink) {
                manLink.parentElement.style.display = "none";
            }
            if (hirfLink) {
                hirfLink.parentElement.style.display = "none";
            }
            break;
        case "fonok":
            if (adminLink) {
                adminLink.parentElement.style.display = "none";
            }
            if (munLink) {
                munLink.parentElement.style.display = "none";
            }
            break;
        case "user":
            if (adminLink) {
                adminLink.parentElement.style.display = "none";
            }
            if (manLink) {
                manLink.parentElement.style.display = "none";
            }
            if (munLink) {
                munLink.parentElement.style.display = "none";
            }
            if (hirfLink) {
                hirfLink.parentElement.style.display = "none";
            }
            break;
        default:
            // ismeretlen szerep → logout
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;

    }

    // Példa: backendhez lekérés user adatokhoz
    /* fetch("/index/user", {
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
        }); */
/*});*/
