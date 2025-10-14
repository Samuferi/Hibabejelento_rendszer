window.addEventListener("DOMContentLoaded", () => {
// 🔹 Változók a form elemeihez
const form = document.getElementById("problemForm"); // signup vagy login form
const user=document.getElementById("user");
const location=document.getElementById("location");
const datetime=document.getElementById("datetime");
const images=document.getElementById("images");
const description=document.getElementById("details");
const errorMessage = document.getElementById("error-message");

// 🔹 Hibakereső függvények
function getProblemFormErrors(locationVal, dateTimeVal, descriptionVal){
    let errors = [];

    if(!locationVal) { errors.push("Szükséges a hely megadása!"); location.parentElement.classList.add("incorrect"); }
    if(!dateTimeVal)  { errors.push("Szükséges az időpont megadása!"); datetime.parentElement.classList.add("incorrect"); }
    if(!descriptionVal)   { errors.push("Szükséges leírást megadni!"); description.parentElement.classList.add("incorrect"); }
    return errors;
}

// 🔹 Submit listener
if(form){
    form.addEventListener('submit', async (e) => {
        let errors = [];
        errors = getProblemFormErrors(location.value, datetime.value, description.value);

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
        user: user.value,
        location: location.value,
        datetime: datetime.value,
        images: images.value,
        details: description.value,
        };

        try {
        const res = await fetch("/api/newproblems", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
             },
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

// 🔹 Inputok figyelése hibajelzés eltávolítására:
const allInputs = [location, datetime, description].filter(input => input != null);
allInputs.forEach(input => {
    input.addEventListener("input", () => {
        if(input.parentElement.classList.contains("incorrect")){
            input.parentElement.classList.remove("incorrect");
            errorMessage.innerText = "";
        }
    });
})
});
