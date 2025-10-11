window.addEventListener("DOMContentLoaded", () => {
// 🔹 Változók a form elemeihez
const form = document.getElementById("problemForm"); // signup vagy login form
const username=document.getElementById("username");
const email=document.getElementById("email");
const password=document.getElementById("password");
const status=document.getElementById("status");
const errorMessage = document.getElementById("error-message");

// 🔹 Hibakereső függvények
function getProblemFormErrors(usernameVal, emailVal, passwordVal, statusVal){
    let errors = [];

    if(!usernameVal) { errors.push("Szükséges a felhasználónév megadása!"); username.parentElement.classList.add("incorrect"); }
    if(!emailVal)  { errors.push("Szükséges az email-cím megadása!"); email.parentElement.classList.add("incorrect"); }
    if(!passwordVal)   { errors.push("Szükséges a jelszó megadása!"); password.parentElement.classList.add("incorrect"); }
    if(!statusVal)   { errors.push("Szükséges a státusz megadása!"); status.parentElement.classList.add("incorrect"); }
    return errors;
}

// 🔹 Submit listener
if(form){
    form.addEventListener('submit', async (e) => {
        let errors = [];
        errors = getProblemFormErrors(username.value, email.value, password.value, status.value);

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
        username: username.value,
        email: email.value,
        password: password.value,
        status: status.value,
        };

        try {
        const res = await fetch("/api/team", {
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
const allInputs = [username, email, password, status].filter(input => input != null);
allInputs.forEach(input => {
    input.addEventListener("input", () => {
        if(input.parentElement.classList.contains("incorrect")){
            input.parentElement.classList.remove("incorrect");
            errorMessage.innerText = "";
        }
    });
})
});
