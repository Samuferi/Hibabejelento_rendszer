async function loadEmployees() {
        try {
            const res = await fetch("/frontend/scripts/test_jsons/employees.json"); // Node.js backend endpoint
            const employees = await res.json();

            const container = document.getElementById("employeesTable");
            container.innerHTML = `
                <tr>
                    <th>Felhasználónév</th>
                    <th>Email-cím</th>
                    <th>Státusz</th>
                </tr>
            `;
            employees.forEach(employee => {
                const tr = document.createElement("tr");
                /* tr.classList.add("container"); */

                tr.innerHTML = `
                    <td>${employee.name}</td>
                    <td>${employee.email}</td>
                    <td>${employee.position}</td> 
                `;

                {/* <button data-id="${problem.id}">Üzenetek</button> */}

                container.appendChild(tr);
            });
        } catch (err) {
            console.error("Hiba a betöltésnél:", err);
        }
    }
// betöltés oldal induláskor
loadEmployees();