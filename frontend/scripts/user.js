async function loadUsers() {
    try {
        // ⚠️ Backend API – ezt cseréld a saját végpontodra
        const res = await fetch("/api/admin/users");

        // Teszt JSON (ugyanúgy mint az employees.js-ben)
        /*
        const res = await fetch("/frontend/scripts/test_jsons/users.json");
        const users = await res.json();
        */



        const container = document.getElementById("usersTable");

        container.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Vezetéknév</th>
                <th>Keresztnév</th>
                <th>Email</th>
                <th>Irányítószám</th>
                <th>Település</th>
                <th>Cím</th>
                <th>Telefon</th>
                <th>Törlés</th>
            </tr>
        `;

        users.forEach(user => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.lastname}</td>
                <td>${user.firstname}</td>
                <td>${user.email}</td>
                <td>${user.postcode}</td>
                <td>${user.city}</td>
                <td>${user.address}</td>
                <td>${user.phone}</td>
                <td>
                    <button class="deleteUserBtn" data-id="${user.id}" style="
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

            container.appendChild(tr);
        });

        // Törlés gomb esemény
        document.querySelectorAll(".deleteUserBtn").forEach(btn => {
            btn.addEventListener("click", deleteUser);
        });

    } catch (err) {
        console.error("Hiba a felhasználók betöltésekor:", err);
    }
}


// 🔥 Felhasználó törlése
async function deleteUser(e) {
    const id = e.target.dataset.id;

    if (!confirm("Biztos törlöd ezt a felhasználót?")) return;

    const res = await fetch(`/api/users/${id}`, {
        method: "DELETE"
    });

    if (res.ok) {
        loadUsers();
    } else {
        alert("Hiba történt a törléskor!");
    }
}

loadUsers();
