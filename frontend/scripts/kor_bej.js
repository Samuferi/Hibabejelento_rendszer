async function loadProblems() {
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

            /*
            const res = await fetch("/frontend/scripts/test_jsons/problems.json"); 
            const problems = await res.json();
            */
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


            div.innerHTML = `
                <h2>${problem.user}</h2>
                <p><strong>Helyszín:</strong> ${problem.helyszin}</p>
                <p><strong>Dátum:</strong> ${formattedDate}</p>
                <img src="${problem.kep_url}" alt="Probléma képe" style="max-width: 200px; height: auto;">
                <p>${problem.leiras}</p>
                <p><strong>Állapot:</strong> ${problem.status}</p>
                <p><strong>Ügyintéző:</strong> ${problem.assigned_name ===null ? "Még nincs ügyintéző." : problem.assigned_name}</p>
                <p><strong>Ügyintézői megjegyzés:</strong> ${problem.ugyfelszolg_megjegy === null ? "Nincs megjegyzés.":problem.ugyfelszolg_megjegy}</p>

                
            `;

            {/* <button data-id="${problem.id}">Üzenetek</button> */}

            container.appendChild(div);
            });
        } catch (err) {
            console.error("Hiba a betöltésnél:", err);
        }
    }

loadProblems();