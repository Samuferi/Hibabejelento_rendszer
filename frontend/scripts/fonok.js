async function loadProblems() {
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
            
            const res = await fetch("/frontend/scripts/test_jsons/problems.json"); // Node.js backend endpoint
            const problems = await res.json();

            const container = document.getElementById("problems-container");
            container.innerHTML = ""; // töröljük a régit

            problems.forEach(problem => {
            const div = document.createElement("div");
            div.classList.add("wrapper-inner-2");

            div.innerHTML = `
                <h2>${problem.user}</h2>
                <p><strong>Helyszín:</strong> ${problem.location}</p>
                <p><strong>Dátum:</strong> ${problem.date}</p>
                <p><strong>Részletek:</strong> ${problem.details}</p>
                <form id="worker-form-${problem.id}">
                <div class="input-box">
                <select name="worker" id="worker-${problem.id}">
                    <option disabled selected>Válasszon alkalmazottat</option>
                    <option value="Kovács Zalán" >Kovács Zalán</option>
                    <option value="Kovács Tibor" >Kovács Tibor</option>
                </select></div>
                <button type="submit" data-id="${problem.id}" class="btn">Kiküldés</button>
                </form>
                
            `;

            {/* <button data-id="${problem.id}">Üzenetek</button> */}

            container.appendChild(div);
            });
        } catch (err) {
            console.error("Hiba a betöltésnél:", err);
        }
    }
// betöltés oldal induláskor
loadProblems();