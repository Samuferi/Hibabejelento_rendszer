async function loadEmployees() {
        try {
            /* const token = localStorage.getItem("token"); // 🔸 Token lekérése
            if (!token) {
                alert("⚠️ Nem vagy bejelentkezve!");
                return;
            }
             const res = await fetch("/api/admin/allemployees", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,  // 🔸 Token küldése
                "Content-Type": "application/json"
            }
            }); 
            if (!res.ok) {
                throw new Error("Hiba a problémák lekérésében!");
            } 
            const employees = await res.json(); */
           
            const res = await fetch("/frontend/scripts/test_jsons/employees.json"); // Node.js backend endpoint
            const employees = await res.json();

            const container = document.getElementById("employeesTable");
            container.innerHTML = `
                <tr>
                    <th>ID</th>
                    <th>Vezetéknév</th>
                    <th>Keresztnév</th>
                    <th>Email-cím</th>
                    <th>Munkakör</th>
                </tr>
            `;
            employees.forEach(employee => {
                const tr = document.createElement("tr");
                if (employee.status === "admin") {
                    employee.status = "Admin";
                } else if (employee.status === "fonok") {
                    employee.status = "Vezető";
                } else if (employee.status === "ugyintezo") {
                    employee.status = "Ügyintéző";
                }

                tr.innerHTML = `
                    <td>${employee.id}</td>
                    <td>${employee.lastname}</td>
                    <td>${employee.firstname}</td>
                    <td>${employee.email}</td>
                    <td>${employee.status}</td> 
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