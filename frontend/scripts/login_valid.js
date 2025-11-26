window.addEventListener("DOMContentLoaded", () => {
    
    const form = document.getElementById("form") || document.getElementById("form"); 
    const emailInput = document.getElementById("email-input");                 
    const passwordInput = document.getElementById("password-input");           
    const errorMessage = document.getElementById("error-message");

    

    function getLoginFormErrors(emailVal, passwordVal){
        let errors = [];

        if(!emailVal)    { errors.push("Szükséges az email-cím megadása!"); emailInput.parentElement.classList.add("incorrect"); }
        if(!passwordVal) { errors.push("Szükséges a jelszó megadása!"); passwordInput.parentElement.classList.add("incorrect"); }
        if(passwordVal && passwordVal.length < 8) { errors.push("A jelszónak legalább 8 karakter hosszúnak kell lennie!"); passwordInput.parentElement.classList.add("incorrect"); }

        return errors;
    }

    
    if(form){
        form.addEventListener('submit', async (e) => {
            let errors = [];

            errors = getLoginFormErrors(emailInput.value, passwordInput.value);

            if(errors.length > 0){
                e.preventDefault();
                errorMessage.innerText = errors.join(" ");
                return;
            }

            e.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    errorMessage.innerText = data.message || 'Hiba a bejelentkezésnél';
                    return;
                }

                
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                
                window.location.href = '/index';
            } catch (err) {
                console.error(err);
                errorMessage.innerText = 'Szerver hiba';
            }
        });
    }

    
    const allInputs = [emailInput, passwordInput].filter(input => input != null);
    allInputs.forEach(input => {
        input.addEventListener("input", () => {
            if(input.parentElement.classList.contains("incorrect")){
                input.parentElement.classList.remove("incorrect");
                errorMessage.innerText = "";
            }
        });
    })
});
