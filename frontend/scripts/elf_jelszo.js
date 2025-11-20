window.addEventListener("DOMContentLoaded", () => {
    // 🔹 Változók a form elemeihez
    const form = document.getElementById("form") || document.getElementById("form"); // signup vagy login form
    const emailInput = document.getElementById("email-input");
    const errorMessage = document.getElementById("error-message");

    // 🔹 Hibakereső függvények

    function getFormErrors(emailVal){
        let errors = [];

        if(!emailVal)    { errors.push("Szükséges az email-cím megadása!"); emailInput.parentElement.classList.add("incorrect"); }
        return errors;
    }

    // 🔹 Submit listener
    if(form){
        form.addEventListener('submit', async (e) => {
            let errors = [];

            errors = getFormErrors(emailInput.value);

            if(errors.length > 0){
                e.preventDefault();
                errorMessage.innerText = errors.join(" ");
                return;
            }

            e.preventDefault();

            const email = emailInput.value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({email})
                });

                const data = await response.json();

                if (!response.ok) {
                    errorMessage.innerText = data.message || 'Hiba az email küldésénél';
                    return;
                } else {
                    alert('Email elküldve a jelszó visszaállításhoz!');
                }
                
                // 🔹 Átirányítás az index.html-re
                window.location.href = '/login';
            } catch (err) {
                console.error(err);
                errorMessage.innerText = 'Szerver hiba';
            }
        });
    }

    // 🔹 Inputok figyelése hibajelzés eltávolítására
    const allInputs = [emailInput].filter(input => input != null);
    allInputs.forEach(input => {
        input.addEventListener("input", () => {
            if(input.parentElement.classList.contains("incorrect")){
                input.parentElement.classList.remove("incorrect");
                errorMessage.innerText = "";
            }
        });
    })
});
