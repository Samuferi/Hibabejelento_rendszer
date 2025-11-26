window.addEventListener("DOMContentLoaded", () => {
    
    const form = document.getElementById("form") || document.getElementById("form"); 
    const emailInput = document.getElementById("email-input");
    const errorMessage = document.getElementById("error-message");

    

    function getFormErrors(emailVal){
        let errors = [];

        if(!emailVal)    { errors.push("Szükséges az email-cím megadása!"); emailInput.parentElement.classList.add("incorrect"); }
        return errors;
    }

    
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
                const response = await fetch('/api/forgot-password', {
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
                
                
                window.location.href = '/login';
            } catch (err) {
                console.error(err);
                errorMessage.innerText = 'Szerver hiba';
            }
        });
    }

    
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
