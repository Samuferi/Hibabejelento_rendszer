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
const password = document.getElementById("password");  
const status = document.getElementById("status");           // mindkettő
const errorMessage = document.getElementById("error-message");         // csak signup
// 🔹 Hibakereső függvények
function getNewUserFormErrors(userfnameVal,usersnameVal,postcodeVal, cityVal,addressVal, phoneVal, emailVal, passwordVal, statusVal){
    let errors = [];

    if(!userfnameVal) { errors.push("Szükséges a keresztnév megadása!"); userFName.parentElement.classList.add("incorrect"); }
    if(!usersnameVal) { errors.push("Szükséges a vezetéknév megadása!"); userLName.parentElement.classList.add("incorrect"); }
    if(!emailVal)  { errors.push("Szükséges az email-cím megadása!"); email.parentElement.classList.add("incorrect"); }
    if(!passwordVal)   { errors.push("Szükséges a jelszó megadása!"); password.parentElement.classList.add("incorrect"); }
    if(!statusVal)   { errors.push("Szükséges a státusz megadása!"); status.parentElement.classList.add("incorrect"); }
    return errors;
}

// 🔹 Submit listener
if(form){
    form.addEventListener('submit', async (e) => {
        let errors = [];
        errors = getNewUserFormErrors(userFName?.value,postCode?.value,city?.value,address?.value, userLName?.value, phone?.value, email?.value, password?.value, status?.value);

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
        password: password?.value,
        status: status.value,
        };

        try {
        const res = await fetch("/api/admin/newemployee", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
             },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
            alert("✅ Sikeres tagfelvétel!");
            form.reset();
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
const allInputs = [userFName,userLName,postCode,city, address, phone, email, password, status].filter(input => input != null);
allInputs.forEach(input => {
    input.addEventListener("input", () => {
        if(input.parentElement.classList.contains("incorrect")){
            input.parentElement.classList.remove("incorrect");
            errorMessage.innerText = "";
        }
    });
})
});
