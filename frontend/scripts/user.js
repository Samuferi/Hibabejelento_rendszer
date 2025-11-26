async function loadUsers() {
    try {
        
        const token = localStorage.getItem("token"); 
        if (!token) {
            alert("⚠️ Nem vagy bejelentkezve!");
            return;
        }
        const res = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,  
            "Content-Type": "application/json"
        }
        }); 
        if (!res.ok) {
            throw new Error("Hiba a problémák lekérésében!");
        } 
        const users = await res.json();


        
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
                <td>${user.vezeteknev}</td>
                <td>${user.keresztnev}</td>
                <td>${user.email}</td>
                <td>${user.irsz}</td>
                <td>${user.telepules}</td>
                <td>${user.cim}</td>
                <td>${user.telefon}</td>
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

        
        document.querySelectorAll(".deleteUserBtn").forEach(btn => {
            btn.addEventListener("click", deleteUser);
        });

    } catch (err) {
        console.error("Hiba a felhasználók betöltésekor:", err);
    }
}



async function deleteUser(e) {
    const id = e.target.dataset.id;

    if (!confirm("Biztos törlöd ezt a felhasználót?")) return;

    const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        } 
    });

    if (res.ok) {
        loadUsers();
    } else {
        alert("Hiba történt a törléskor!");
    }
}

loadUsers();
