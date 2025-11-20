async function loadEmployees() {
        try {
            const token = localStorage.getItem("token"); // 🔸 Token lekérése
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
            const employees = await res.json();

           /*
            const res = await fetch("/frontend/scripts/test_jsons/employees.json"); // Node.js backend endpoint
            const employees = await res.json();
            */
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
                    <td>
                    <button class="deleteEmployeeBtn" data-id="${employee.id}" style="
                        background-color: #c0392b;
                        color: white;
                        padding: 4px 10px;
                        border-radius: 6px;
                        cursor: pointer;
                        border: none;">
                        ❌
                    </button>
                    </td>
                `;

                {/* <button data-id="${problem.id}">Üzenetek</button> */}

                container.appendChild(tr);
            });
            document.querySelectorAll(".deleteEmployeeBtn").forEach(btn => {
            btn.addEventListener("click", deleteEmployee);
            });
        } catch (err) {
            console.error("Hiba a betöltésnél:", err);
        }
    }

async function deleteEmployee(e) {
    const id = e.target.dataset.id;

    if (!confirm("Biztos törlöd ezt a felhasználót?")) return;

    const res = await fetch(`/api/admin/allemployees/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        } 
    });

    if (res.ok) {
        loadEmployees();
    } else {
        alert("Hiba történt a törléskor!");
    }
}
// betöltés oldal induláskor
loadEmployees();