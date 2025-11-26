

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
        
        /* const res = await fetch("/frontend/scripts/test_jsons/user.json"); 
        const user = await res.json(); */
        const user=JSON.parse(localStorage.getItem("user"));
        const form = document.getElementById("articleForm");
        const firstNameInput = document.getElementById("fname");
        const lastNameInput = document.getElementById("lname");
        const userIdInput = document.getElementById("userid");

        userIdInput.value = user.user_id; 
        lastNameInput.value = user.vezeteknev;
        firstNameInput.value = user.keresztnev; 

    } catch (err) {
        console.error("Hiba a betöltésnél:", err);
    }
}
window.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("articleForm"); 
const title = document.getElementById("title");
const images = document.getElementById("img");
const content = document.getElementById("content");
const errorMessage = document.getElementById("error-message");


function getArticleFormErrors(titleVal, contentVal){
    let errors = [];

    if(!titleVal) { errors.push("Szükséges a cím megadása!"); title.parentElement.classList.add("incorrect"); }
    if(!contentVal)   { errors.push("Szükséges leírást megadni!"); content.parentElement.classList.add("incorrect"); }
    return errors;
}


if(form){
    form.addEventListener('submit', async (e) => {
        let errors = [];
        errors = getArticleFormErrors(title.value, content.value);

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
        const date= new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let currentDate = `${year}-${month}-${day}`;

        const formData = new FormData();
        formData.append("userid", document.getElementById("userid").value);
        formData.append("title", title.value);
        formData.append("content", content.value);
        formData.append("date", currentDate);

        if (images.files.length > 0) {
        formData.append("images", images.files[0]); 
        }

        try {
        const res = await fetch("/api/ujhir/felvetel", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`
             },
            body: formData
        });

        const data = await res.json();
        if (res.ok) {
            alert("✅ Sikeres problémafelvétel!");
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


const allInputs = [title, content].filter(input => input != null);
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