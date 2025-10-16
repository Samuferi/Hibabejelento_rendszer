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
            
            const res = await fetch("/frontend/scripts/test_jsons/problem.json"); // Node.js backend endpoint
            const problems = await res.json();

            const res2 = await fetch("/frontend/scripts/test_jsons/employees.json"); // Node.js backend endpoint
            const employes = await res2.json();

            const container = document.getElementById("problems-container");
            container.innerHTML = ""; // töröljük a régit

            problems.forEach(problem => {
            const div = document.createElement("div");
            div.classList.add("wrapper-inner-2");
            
            let temp = `
                <h2>${problem.user}</h2>
                <p><strong>Helyszín:</strong> ${problem.location}</p>
                <p><strong>Dátum:</strong> ${problem.date}</p>
                <p><strong>Részletek:</strong> ${problem.details}</p>
                <form id="worker-form-${problem.id}">
                <div class="input-box">
                <select name="worker" id="worker-${problem.id}">
                <option value="" disabled selected>Dolgozó kiválasztása</option>
            `;
            employes.forEach(employee => {
                temp += `
                    <option value="${employee.name}">${employee.name}</option>
                `;
            });
            temp += `
                </select></div>
                <button type="submit" data-id="${problem.id}" class="btn">Kiküldés</button>
                </form>
            `;

            div.innerHTML = temp;
            container.appendChild(div);
        });
    } catch (err) {
        console.error("Hiba a betöltésnél:", err);
    }

    const forms = document.querySelectorAll('[id^="worker-form-"]'); 
    forms.forEach(form => { 
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // ne frissüljön az oldal
            const problemId = e.target.querySelector('button').getAttribute('data-id');
            const workerSelect = document.getElementById(`worker-${problemId}`);
            const selectedWorker = workerSelect.value;

            if(selectedWorker=="Dolgozó kiválasztása" || !selectedWorker){
                alert("Kérlek, válassz dolgozót!");
                return;
            }

            const token = localStorage.getItem("token"); //
            if (!token) {
                alert("⚠️ Nem vagy bejelentkezve. Jelentkezz be újra!");
                return;
            }
            const formData = {
                problemId: problemId,
                worker: selectedWorker
            };
            try {
                const res = await fetch("/api/assignWorker", { // Node.js backend endpoint
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });
                if (!res.ok) {
                    throw new Error("Hiba a dolgozó hozzárendelésénél!");
                }
                const result = await res.json();
                alert("✅ Sikeresen hozzárendelted a dolgozót!");
            } catch (error) {
                console.error("Hiba:", error);
            }
        });
    });
}
// betöltés oldal induláskor
loadProblems();

