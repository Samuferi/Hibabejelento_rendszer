async function loadProblems() {
        try {

            const token = localStorage.getItem("token"); // 🔸 Token lekérése
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
            const problems = await res.json();

            /* const res = await fetch("/frontend/scripts/test_jsons/problems.json"); // Node.js backend endpoint
            const problems = await res.json(); */

            const container = document.getElementById("problems-container");
            container.innerHTML = ""; // töröljük a régit

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
                <img src="${problem.kep_url}" alt="Probléma képe" style="max-width: 200px; height: auto;">
                <p>${problem.leiras}</p>
                <p><strong>Állapot:</strong> ${problem.status}</p>
                <p><strong>Dolgozó:</strong> ${problem.worker ==="" ? "Még nincs dolgozó." : problem.worker}</p>
                <p><strong>Dolgozói megjegyzés:</strong> ${problem["worker-comment"] === ""? "Nincs megjegyzés.":problem["worker-comment"]}</p>

                
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