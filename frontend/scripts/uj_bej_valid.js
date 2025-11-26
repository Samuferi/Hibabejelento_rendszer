

async function loadUserName() {
    try {
        const token = localStorage.getItem("token"); 
        if (!token) {
            alert("⚠️ Nem vagy bejelentkezve!");
            return;
        }
            const res = await fetch("/api/problems", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,  
            "Content-Type": "application/json"
        }
        }); 
        if (!res.ok) {
            throw new Error("Hiba a problémák lekérésében!");
        }
        const problems = await res.json();
        
        /* const res = await fetch("/frontend/scripts/test_jsons/user.json"); // Node.js backend endpoint
        const user = await res.json(); */
        const user=JSON.parse(localStorage.getItem("user"));
        const form = document.getElementById("problemForm");
        const userNameInput = document.getElementById("user");
        const userIdInput = document.getElementById("userid");
        userNameInput.value = user.vezeteknev + " " + user.keresztnev;
        userIdInput.value = user.user_id;

    } catch (err) {
        console.error("Hiba a betöltésnél:", err);
    }
}
window.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("problemForm"); 
const user=document.getElementById("user");
const location=document.getElementById("location");
const datetime=document.getElementById("datetime");
const images=document.getElementById("images");
const description=document.getElementById("details");
const errorMessage = document.getElementById("error-message");
const id=document.getElementById("userid").value;

function getProblemFormErrors(locationVal, dateTimeVal, descriptionVal){
    let errors = [];

    if(!locationVal) { errors.push("Szükséges a hely megadása!"); location.parentElement.classList.add("incorrect"); }
    if(!dateTimeVal)  { errors.push("Szükséges az időpont megadása!"); datetime.parentElement.classList.add("incorrect"); }
    if(!descriptionVal)   { errors.push("Szükséges leírást megadni!"); description.parentElement.classList.add("incorrect"); }
    return errors;
}


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

        const token = localStorage.getItem("token"); 
        if (!token) {
            alert("⚠️ Nem vagy bejelentkezve. Jelentkezz be újra!");
            return;
        }

        const formData = new FormData();
        formData.append("location", location.value);
        formData.append("details", description.value);
        formData.append("datetime", datetime.value);

        if (images.files.length > 0) {
        formData.append("images", images.files[0]); 
        }

        try {
        const res = await fetch("/api/newproblems", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`
             },
            body: formData
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
loadUserName();