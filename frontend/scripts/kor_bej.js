async function loadProblems() {
        try {
            const res = await fetch("/frontend/scripts/test_jsons/problems.json"); // Node.js backend endpoint
            const problems = await res.json();

            const container = document.getElementById("problems-container");
            container.innerHTML = ""; // töröljük a régit

            problems.forEach(problem => {
            const div = document.createElement("div");
            div.classList.add("container");

            div.innerHTML = `
                <h2>${problem.user}</h2>
                <p><strong>Helyszín:</strong> ${problem.location}</p>
                <p><strong>Dátum:</strong> ${problem.date}</p>
                <img src="${problem.image}" alt="Probléma képe" style="max-width: 200px; height: auto;">
                <p>${problem.details}</p>
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
loadProblems();