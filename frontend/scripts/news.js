async function loadNews() {
        try {
            const token = localStorage.getItem("token"); 
            if (!token) {
                alert("⚠️ Nem vagy bejelentkezve!");
                return;
            }
             const res = await fetch("/api/news", {
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
            const res = await fetch("/frontend/scripts/test_jsons/news.json"); // Node.js backend endpoint
            const news = await res.json();*/

            const container = document.getElementById("news-container");
            container.innerHTML = ""; 

            problems.forEach(article => {
            const div = document.createElement("div");
            div.classList.add("wrapper-inner-2");

            const date = new Date(article.datum);
            const formattedDate = date.toLocaleString("hu-HU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            });

             div.innerHTML = `
                
                <h2>${article.cim}</h2>
                <p><strong>Dátum:</strong> ${formattedDate}</p>
                <img src="${article.kep_url}" alt="Hír képe" style="max-width: 500px; height: auto;">
                <p>${article.tartalom}</p>
                
            `;

            container.appendChild(div);
            });
        } catch (err) {
            console.error("Hiba a betöltésnél:", err);
        }
    }

loadNews();