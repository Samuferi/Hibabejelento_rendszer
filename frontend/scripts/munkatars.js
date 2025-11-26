async function loadNewProblems() {
        try {
            const token = localStorage.getItem("token"); 
            if (!token) {
                alert("⚠️ Nem vagy bejelentkezve!");
                return;
            }
            const res = await fetch("/api/munkatars/allproblems", {
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
            /*

            const res = await fetch("/frontend/scripts/test_jsons/problems.json"); 
            const problems = await res.json();
            */

            const container = document.getElementById("new-problems-container");
            container.innerHTML = ""; 
            console.log(problems); 
            problems.forEach(problem => {
            const div = document.createElement("div");
            div.classList.add("wrapper-inner-2");
            const date = new Date(problem.idopont);
            const formattedDate = date.toLocaleString("hu-HU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
            });
            div.innerHTML = `
                <h2>${problem.user}</h2>
                <p><strong>Helyszín:</strong> ${problem.helyszin}</p>
                <p><strong>Dátum:</strong> ${formattedDate}</p>
                <img src="${problem.kep_url}" alt="Hiba képe" style="max-width: 200px; max-height: 200px;">
                <p><strong>Részletek:</strong> ${problem.leiras}</p>
                <p><strong>Állapot:</strong> ${problem.status}</p>
                <form id="worker-form-${problem.problem_id}">
                    
                    <div class="input-box"><label for="status-${problem.problem_id}">Állapot frissítése:</label><select id="status-${problem.problem_id}" name="status">
                        <option value="Folyamatban" disabled selected }>Folyamatban</option>
                        <option value="Kész"}>Kész</option>
                        <option value="Elutasítva"}>Elutasítva</option>
                    </select></div>
                    <div class="input-box"><textarea id="comment-${problem.problem_id}" name="comment" rows="3" placeholder="Megjegyzés..."></textarea></div>
                    <button type="submit" data-id="${problem.problem_id}" class="btn">Frissít</button>
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
                //e.preventDefault(); 
                const problemId = e.target.querySelector('button').getAttribute('data-id');
                const statusSelect = e.target.querySelector(`#status-${problemId}`);
                const commentTextarea = e.target.querySelector(`#comment-${problemId}`);
                const selectedStatus = statusSelect.value;
                const comment = commentTextarea.value;

                if(selectedStatus == "kiosztva" || !selectedStatus) {
                    alert("Kérlek, válassz státuszt!");
                    return;
                }

                const token = localStorage.getItem("token"); 
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
                    const res = await fetch("/api/munkatars/assignproblems", { 
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
                    alert("✅ Probléma elküldve/frissítve!");
                } catch (error) {
                    console.error("Hiba:", error);
                }
            });
        });
    }
async function loadPrevProblems() {
    try {
        const token = localStorage.getItem("token"); 
        if (!token) {
            alert("⚠️ Nem vagy bejelentkezve!");
            return;
        }
        const res = await fetch("/api/munkatars/resolvedproblems", {
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
        /*
        const res = await fetch("/frontend/scripts/test_jsons/problems.json"); 
        const problems = await res.json();
        */
        const container = document.getElementById("prev-problems-container");
        container.innerHTML = ""; 

        problems.forEach(problem => {
        const div = document.createElement("div");
        div.classList.add("wrapper-inner-2");
        const date = new Date(problem.idopont);
        const formattedDate = date.toLocaleString("hu-HU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
        div.innerHTML = `
            <h2>${problem.user}</h2>
            <p><strong>Helyszín:</strong> ${problem.helyszin}</p>
            <p><strong>Dátum:</strong> ${formattedDate}</p>
            <img src="${problem.kep_url}" alt="Hiba képe" style="max-width: 200px; max-height: 200px;">
            <p><strong>Leírás:</strong> ${problem.leiras}</p>
            <p><strong>Állapot:</strong> ${problem.status}</p>
            <p><strong>Ügyfélszolgálat válasza:</strong> ${problem.ugyfelszolg_megjegy}</p>
            

            
        `;

        {/* <button data-id="${problem.id}">Üzenetek</button> */}

        container.appendChild(div);
        });
    } catch (err) {
        console.error("Hiba a betöltésnél:", err);
    }
}

loadNewProblems();
loadPrevProblems();