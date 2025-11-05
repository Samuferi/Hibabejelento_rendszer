async function loadNews() {
        try {
            /* const token = localStorage.getItem("token"); // 🔸 Token lekérése
            if (!token) {
                alert("⚠️ Nem vagy bejelentkezve!");
                return;
            }
             const res = await fetch("/api/news", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,  // 🔸 Token küldése
                "Content-Type": "application/json"
            }
            }); 
            if (!res.ok) {
                throw new Error("Hiba a problémák lekérésében!");
            }
            const problems = await res.json(); */
            
            const res = await fetch("/frontend/scripts/test_jsons/news.json"); // Node.js backend endpoint
            const news = await res.json();

            const container = document.getElementById("news-container");
            container.innerHTML = ""; // töröljük a régit

            news.forEach(article => {
            const div = document.createElement("div");
            div.classList.add("wrapper-inner-2");

            const date = new Date(article.date);
            const formattedDate = date.toLocaleString("hu-HU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            });

             div.innerHTML = `
                
                <h2>${article.title}</h2>
                <p><strong>Dátum:</strong> ${formattedDate}</p>
                <img src="${article.img_url}" alt="Hír képe" style="max-width: 200px; height: auto;">
                <p>${article.content}</p>
                <h5>${article.lastname +" "+article.firstname}</h5>
                
            `;

            container.appendChild(div);
            });
        } catch (err) {
            console.error("Hiba a betöltésnél:", err);
        }
    }
// betöltés oldal induláskor
loadNews();