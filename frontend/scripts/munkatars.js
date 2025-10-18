async function loadNewProblems() {
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

            const container = document.getElementById("new-problems-container");
            container.innerHTML = ""; // töröljük a régit

            problems.forEach(problem => {
            const div = document.createElement("div");
            div.classList.add("wrapper-inner-2");

            div.innerHTML = `
                <h2>${problem.user}</h2>
                <p><strong>Helyszín:</strong> ${problem.location}</p>
                <p><strong>Dátum:</strong> ${problem.date}</p>
                <img src="${problem.image}" alt="Hiba képe" style="max-width: 200px; max-height: 200px;">
                <p><strong>Részletek:</strong> ${problem.details}</p>
                <p><strong>Állapot:</strong> ${problem.status}</p>
                <form id="worker-form-${problem.id}">
                    
                    <div class="input-box"><label for="status-${problem.id}">Állapot frissítése:</label><select id="status-${problem.id}" name="status">
                        <option value="kiosztva" disabled selected }>Kiosztva</option>
                        <option value="megoldva"}>Megoldva</option>
                        <option value="elutasítva"}>Elutasítva</option>
                    </select></div>
                    <div class="input-box"><textarea id="comment-${problem.id}" name="comment" rows="3" placeholder="Megjegyzés..."></textarea></div>
                    <button type="submit" data-id="${problem.id}" class="btn">Frissít</button>
                </form>

                
            `;

            {/* <button data-id="${problem.id}">Üzenetek</button> */}

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
                const statusSelect = e.target.querySelector(`#status-${problemId}`);
                const commentTextarea = e.target.querySelector(`#comment-${problemId}`);
                const selectedStatus = statusSelect.value;
                const comment = commentTextarea.value;

                if(selectedStatus == "kiosztva" || !selectedStatus) {
                    alert("Kérlek, válassz státuszt!");
                    return;
                }

                const token = localStorage.getItem("token"); //
                if (!token) {
                    alert("⚠️ Nem vagy bejelentkezve. Jelentkezz be újra!");
                    return;
                }
                const formData = {
                    problemId: problemId,
                    status: selectedStatus,
                    comment: comment
                };
                try {
                    const res = await fetch("/api/assignProblemStatus", { // Node.js backend endpoint
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
async function loadPrevProblems() {
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

        const container = document.getElementById("prev-problems-container");
        container.innerHTML = ""; // töröljük a régit

        problems.forEach(problem => {
        const div = document.createElement("div");
        div.classList.add("wrapper-inner-2");

        div.innerHTML = `
            <h2>${problem.user}</h2>
            <p><strong>Helyszín:</strong> ${problem.location}</p>
            <p><strong>Dátum:</strong> ${problem.date}</p>
            <img src="${problem.image}" alt="Hiba képe" style="max-width: 200px; max-height: 200px;">
            <p><strong>Részletek:</strong> ${problem.details}</p>
            <p><strong>Állapot:</strong> ${problem.status}</p>
            

            
        `;

        {/* <button data-id="${problem.id}">Üzenetek</button> */}

        container.appendChild(div);
        });
    } catch (err) {
        console.error("Hiba a betöltésnél:", err);
    }
}
// betöltés oldal induláskor
loadNewProblems();
loadPrevProblems();