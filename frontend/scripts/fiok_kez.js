/*const  { use } = require("react"); */

async function loadUserProps() {
    try {
        

        const user = JSON.parse(localStorage.getItem("user"));
        console.log("Felhasználói adatok betöltve:", user);

        const form = document.getElementById("userForm");
        const userFNameInput = document.getElementById("fname");
        const userLNameInput = document.getElementById("lname");
        const emailInput = document.getElementById("email");
        const phoneInput = document.getElementById("phone");
        const postCode = document.getElementById("postcode");
        const city = document.getElementById("city");
        const address = document.getElementById("address");
        userFNameInput.placeholder = user["keresztnev"];
        userLNameInput.placeholder = user["vezeteknev"];
        emailInput.placeholder = user["email"];
        phoneInput.placeholder = user["telefon"];
        postCode.placeholder = user["irsz"];
        city.placeholder = user["telepules"];
        address.placeholder = user["cim"];

    } catch (err) {
        console.error("Hiba a betöltésnél:", err);
    }
}
/* 
document.getElementById("profileDataForm").addEventListener("submit", function(e) {
    */
window.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("userForm") || document.getElementById("form"); 
const userFName = document.getElementById("fname");         
const userLName = document.getElementById("lname");        
const postCode = document.getElementById("postcode");     
const city = document.getElementById("city");            
const address = document.getElementById("address");       
const phone = document.getElementById("phone");
const email = document.getElementById("email");                 
const currentPassword = document.getElementById("current-password");          
const newPassword = document.getElementById("new-password"); 
const errorMessage = document.getElementById("error-message");


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

        const token = localStorage.getItem("token"); 
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

            
            const user =  JSON.parse(localStorage.getItem("user"));
            userFName?.value?.trim() && (user["keresztnev"] = userFName?.value) && console.log("keresztnev");
            userLName?.value?.trim() && (user["vezeteknev"] = userLName?.value);
            postCode?.value?.trim() && (user["irsz"] = postCode?.value);
            city?.value?.trim() && (user["telepules"] = city?.value);
            address?.value?.trim() && (user["cim"] = address?.value);
            phone?.value?.trim() && (user["telefon"] = phone?.value);
            email?.value?.trim() && (user["email"] = email?.value);

            localStorage.setItem("user", JSON.stringify(user));
            form.reset();
            loadUserProps(); 

        } else {
            alert("❌ Hiba: " + data.message);
        }
        } catch (err) {
        console.error(err);
        alert("⚠️ Hálózati hiba!");
        }
        
    });
}


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


loadUserProps();