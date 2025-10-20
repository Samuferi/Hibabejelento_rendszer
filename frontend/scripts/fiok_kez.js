/*const  { use } = require("react"); */

async function loadUserProps() {
    try {
        /*const token = localStorage.getItem("token"); // 🔸 Token lekérése
        if (!token) {
            alert("⚠️ Nem vagy bejelentkezve!");
            return;
        }
            const res = await fetch("/api/problems", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,  // 🔸 Token küldése
            "Content-Type": "application/json"
        }
        }); 
        if (!res.ok) {
            throw new Error("Hiba a problémák lekérésében!");
        }
        const problems = await res.json();*/
        
        /* const res = await fetch("/frontend/scripts/test_jsons/user.json"); // Node.js backend endpoint
        const user = await res.json(); */
        const user = localStorage.getItem("user");

        const form = document.getElementById("userForm");
        const userFNameInput = document.getElementById("fname");
        const userLNameInput = document.getElementById("lname");
        const emailInput = document.getElementById("email");
        const phoneInput = document.getElementById("phone");
        userFNameInput.placeholder = user.keresztnev;
        userLNameInput.placeholder = user.vezeteknev;
        emailInput.placeholder = user.email;
        phoneInput.placeholder = user.phone;

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
const userFName = document.getElementById("fname");         // csak signup
const userLName = document.getElementById("lname");         // csak signup
const postCode = document.getElementById("postcode");     // csak signup
const city = document.getElementById("city");             // csak signup
const address = document.getElementById("address");       // csak signup
const phone = document.getElementById("phone");
const email = document.getElementById("email");                 // mindkettő
const currentPassword = document.getElementById("current-password");           // mindkettő
const newPassword = document.getElementById("new-password"); // csak signup
const errorMessage = document.getElementById("error-message");

// 🔹 Hibakereső függvények
function getUserFormErrors(userfnameVal,usersnameVal,postcodeVal, cityVal,addressVal, phoneVal, emailVal, currentPasswordVal, newPasswordVal){
    let errors = [];
    /* kibővíteni a jelenlegi adatok ellenőrzésével */
    /* if(!usernameVal) { errors.push("Szükséges a keresztnév megadása!"); firstname.parentElement.classList.add("incorrect"); }
    if(!phoneVal)     { errors.push("Szükséges a telefonszám megadása!"); phone.parentElement.classList.add("incorrect"); }
    if(!emailVal)     { errors.push("Szükséges az email-cím megadása!"); email.parentElement.classList.add("incorrect"); } */
    if(!userfnameVal && !usersnameVal && !postcodeVal && !cityVal && !addressVal && !phoneVal && !emailVal && !currentPasswordVal && !newPasswordVal) { errors.push("Nem adott meg új adatot!");  }
    if(!currentPasswordVal && newPasswordVal)  { errors.push("Szükséges a jelenlegi jelszó megadása!"); currentPassword.parentElement.classList.add("incorrect"); }
    if(currentPasswordVal && newPasswordVal.length < 8) { errors.push("A jelszónak legalább 8 karakter hosszúnak kell lennie!"); newPassword.parentElement.classList.add("incorrect"); }
    if(currentPasswordVal && !newPasswordVal)  { errors.push("Csak a jelenlegi jelszót adtad meg!"); newPassword.parentElement.classList.add("incorrect"); }

    return errors;
}
// 🔹 Submit listener
if(form){
    form.addEventListener('submit', async (e) => {
        let errors = [];

        getUserFormErrors(userFName?.value,postCode?.value,city?.value,address?.value, userLName?.value, phone?.value, email?.value, currentPassword?.value, newPassword?.value).forEach(err => errors.push(err));

        if(errors.length > 0){
            e.preventDefault();
            errorMessage.innerText = errors.join(" ");
            return;
        } 

        e.preventDefault();

        const token = localStorage.getItem("token"); // 🔹 Token lekérése
        if (!token) {
            alert("⚠️ Nem vagy bejelentkezve. Jelentkezz be újra!");
            return;
        }

        const formData = {
        userf: userFName?.value,
        userl: userLName?.value,
        postcode: postCode?.value,
        city: city?.value,
        address: address?.value,
        email: email?.value,
        phone: phone?.value,
        currentPassword: currentPassword?.value, 
        newPassword: newPassword?.value,
        };

        try {
        const res = await fetch("/api/profile", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
             },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
            alert("✅ Sikeres változtatás!");
            document.getElementById("userForm").reset();
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
const allInputs = [userFName,userLName,postCode,city, address, phone, email, currentPassword, newPassword].filter(input => input != null);
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