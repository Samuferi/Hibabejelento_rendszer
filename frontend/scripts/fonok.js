async function loadProblems() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert(" Nem vagy bejelentkezve!");
            return;
        }

        // --- Bejelentések backendről ---
        const res = await fetch("/api/fonok/problems", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) throw new Error("Hiba a problémák lekérésében!");
        const problems = await res.json();

        // --- Dolgozók backendről ---
        const res2 = await fetch("/api/fonok/employees", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!res2.ok) throw new Error("Hiba a dolgozók lekérésében!");
        const employees = await res2.json();

            const res3 = await fetch("/api/fonok/activeProblems", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,  // 🔸 Token küldése
                "Content-Type": "application/json"
            }
            });
            if (!res3.ok) {
                throw new Error("Hiba az aktív problémák lekérésében!");
            }
            const activeProblems = await res3.json();

            const res4 = await fetch("/api/fonok/resolvedProblems", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,  // 🔸 Token küldése
                "Content-Type": "application/json"
            }
            });
            if (!res4.ok) {
                throw new Error("Hiba a megoldott problémák lekérésében!");
            }
            const resolvedProblems = await res4.json();

        const container = document.getElementById("problems-container");
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
            let temp = `
                <h2>Probléma #${problem.problem_id}</h2>
                <p><strong>Helyszín:</strong> ${problem.helyszin}</p>
                <p><strong>Dátum:</strong> ${formattedDate}</p>
                <img src="${problem.kep_url}" alt="Probléma képe" style="max-width: 200px; height: auto;">
                <p><strong>Leírás:</strong> ${problem.leiras}</p>
                <p><strong>Státusz:</strong> ${problem.status}</p>
                <form id="worker-form-${problem.problem_id}">
                    <div class="input-box">
                        <select name="worker" id="worker-${problem.problem_id}">
                            <option value="" disabled selected>Dolgozó kiválasztása</option>
            `;

            employees.forEach(emp => {
                temp += `<option value="${emp.user_id}">${emp.vezeteknev} ${emp.keresztnev}</option>`;
            });

            temp += `
                        </select>
                    </div>
                    <button type="submit" data-id="${problem.problem_id}" class="btn">Kiküldés</button>
                </form>
            `;

            div.innerHTML = temp;
            container.appendChild(div);
                        const container1 = document.getElementById("problems-container-1");
            container1.innerHTML = ""; // töröljük a régit
            activeProblems.forEach(problem => {
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
                    <img src="${problem.kep_url}" alt="Probléma képe" style="max-width: 200px; height: auto;">
                    <p><strong>Leírás:</strong> ${problem.leiras}</p>
                    <p><strong>Kiosztott dolgozó:</strong> ${problem.assigned_name}</p>
                `;
                container1.appendChild(div);
            });

            const container2 = document.getElementById("problems-container-2");
            container2.innerHTML = ""; // töröljük a régit
            resolvedProblems.forEach(problem => {
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
                    <img src="${problem.kep_url}" alt="Probléma képe" style="max-width: 200px; height: auto;">
                    <p><strong>Leírás:</strong> ${problem.leiras}</p>
                    <p><strong>Kiosztott dolgozó:</strong> ${problem.assigned_name}</p>
                    <p><strong>Záró megjegyzés:</strong> ${problem.ugyfelszolg_megjegy}</p>
                `;
                container2.appendChild(div);
            });
        });

        // --- Eseménykezelők ---
        document.querySelectorAll('[id^="worker-form-"]').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const problemId = e.target.querySelector('button').getAttribute('data-id');
                const workerSelect = document.getElementById(`worker-${problemId}`);
                const workerId = workerSelect.value;

                if (!workerId) {
                    alert("⚠️ Kérlek, válassz dolgozót!");
                    return;
                }

                try {
                    const res = await fetch("/api/fonok/assignWorker", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ problemId, workerId })
                    });

                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Hiba a hozzárendelésnél!");

                    alert(data.message || " Sikeresen hozzárendelted a dolgozót!");
                    loadProblems(); // frissítjük a listát
                } catch (error) {
                    console.error("Hiba:", error);
                    alert(" Hiba a dolgozó hozzárendelésénél!");
                }
            });
        });

    } catch (err) {
        console.error("Hiba a betöltésnél:", err);
        alert("Nem sikerült betölteni az adatokat!");
    }
}

document.addEventListener("DOMContentLoaded", loadProblems);


