/*const  { use } = require("react"); */

async function loadUserProps() {
    try {
        const res = await fetch("/frontend/scripts/test_jsons/user.json"); // Node.js backend endpoint
        const user = await res.json();

        const form = document.getElementById("userForm");
        const usernameInput = document.getElementById("fname");
        const emailInput = document.getElementById("email");
        const phoneInput = document.getElementById("phone");
        usernameInput.placeholder = user[0].name;
        emailInput.placeholder = user[0].email;
        phoneInput.placeholder = user[0].phone;

    } catch (err) {
        console.error("Hiba a betöltésnél:", err);
    }
}
/* 
document.getElementById("profileDataForm").addEventListener("submit", function(e) {
    */
window.addEventListener("DOMContentLoaded", () => {
// 🔹 Változók a form elemeihez
const form = document.getElementById("userForm") || document.getElementById("form"); // signup vagy login form
const username = document.getElementById("fname");         // csak signup
const phone = document.getElementById("phone");
const email = document.getElementById("email");                 // mindkettő
const currentPassword = document.getElementById("current-password");           // mindkettő
const newPassword = document.getElementById("new-password"); // csak signup
const errorMessage = document.getElementById("error-message");

// 🔹 Hibakereső függvények
function getUserFormErrors(usernameVal, phoneVal, emailVal, currentPasswordVal, newPasswordVal){
    let errors = [];
    /* kibővíteni a jelenlegi adatok ellenőrzésével */
    /* if(!usernameVal) { errors.push("Szükséges a keresztnév megadása!"); firstname.parentElement.classList.add("incorrect"); }
    if(!phoneVal)     { errors.push("Szükséges a telefonszám megadása!"); phone.parentElement.classList.add("incorrect"); }
    if(!emailVal)     { errors.push("Szükséges az email-cím megadása!"); email.parentElement.classList.add("incorrect"); } */
    if(!usernameVal && !phoneVal && !emailVal && !currentPasswordVal && !newPasswordVal) { errors.push("Nem adott meg új adatot!");  }
    if(!currentPasswordVal && newPasswordVal)  { errors.push("Szükséges a jelenlegi jelszó megadása!"); currentPassword.parentElement.classList.add("incorrect"); }
    if(currentPasswordVal && newPasswordVal.length < 8) { errors.push("A jelszónak legalább 8 karakter hosszúnak kell lennie!"); newPassword.parentElement.classList.add("incorrect"); }
    if(currentPasswordVal && !newPasswordVal)  { errors.push("Csak a jelenlegi jelszót adtad meg!"); newPassword.parentElement.classList.add("incorrect"); }

    return errors;
}
// 🔹 Submit listener
if(form){
    form.addEventListener('submit', async (e) => {
        let errors = [];

        getUserFormErrors(username?.value, phone?.value, email?.value, currentPassword?.value, newPassword?.value).forEach(err => errors.push(err));

        if(errors.length > 0){
            e.preventDefault();
            errorMessage.innerText = errors.join(" ");
            return;
        } 

        e.preventDefault();

        const formData = {
        user: username?.value,
        email: email?.value,
        phone: phone?.value,
        currentPassword: currentPassword?.value, 
        newPassword: newPassword?.value,
        };

        try {
        const res = await fetch("/api/newUserData", {
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
}

// 🔹 Inputok figyelése hibajelzés eltávolítására
const allInputs = [username, phone, email, currentPassword, newPassword].filter(input => input != null);
allInputs.forEach(input => {
    input.addEventListener("input", () => {
        if(input.parentElement.classList.contains("incorrect")){
            input.parentElement.classList.remove("incorrect");
            errorMessage.innerText = "";
        }
    });
})
}); 

// betöltés oldal induláskor
loadUserProps();