window.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form") || document.getElementById("form"); 
const firstname = document.getElementById("firstname-input");         
const lastname = document.getElementById("lastname-input");           
const postnumber = document.getElementById("post-number-input");          
const town = document.getElementById("town-input");
const address = document.getElementById("address-input");
const phone = document.getElementById("phone-number-input");
const email = document.getElementById("email-input");                 
const password = document.getElementById("password-input");           
const repeatPassword = document.getElementById("repeat-password-input"); 
const errorMessage = document.getElementById("error-message");

const adatvedelmi = document.getElementById("adatvedelmi");
const aszf = document.getElementById("aszf");


function getSignupFormErrors(firstnameVal, lastnameVal, postnumVal, townVal, addressVal, phoneVal, emailVal, passwordVal, repeatPasswordVal){
    let errors = [];

    if(!firstnameVal) { errors.push("Szükséges a keresztnév megadása!"); firstname.parentElement.classList.add("incorrect"); }
    if(!lastnameVal)  { errors.push("Szükséges a vezetéknév megadása!"); lastname.parentElement.classList.add("incorrect"); }
    if(!postnumVal)   { errors.push("Szükséges az irányítószám megadása!"); postnumber.parentElement.classList.add("incorrect"); }
    if(!townVal)      { errors.push("Szükséges a város megadása!"); town.parentElement.classList.add("incorrect"); }
    if(!addressVal)   { errors.push("Szükséges a cím megadása!"); address.parentElement.classList.add("incorrect"); }
    if(!phoneVal)     { errors.push("Szükséges a telefonszám megadása!"); phone.parentElement.classList.add("incorrect"); }
    if(!emailVal)     { errors.push("Szükséges az email-cím megadása!"); email.parentElement.classList.add("incorrect"); }
    if(!passwordVal)  { errors.push("Szükséges a jelszó megadása!"); password.parentElement.classList.add("incorrect"); }
    if(passwordVal && passwordVal.length < 8) { errors.push("A jelszónak legalább 8 karakter hosszúnak kell lennie!"); password.parentElement.classList.add("incorrect"); }
    if(passwordVal !== repeatPasswordVal) { errors.push("A jelszavak nem egyeznek!"); password.parentElement.classList.add("incorrect"); repeatPassword.parentElement.classList.add("incorrect"); }

    return errors;
}

if(form){
    form.addEventListener('submit', async (e) => {
        let errors = [];

        errors = getSignupFormErrors(firstname.value, lastname.value, postnumber.value, town.value, address.value, phone.value, email.value, password.value, repeatPassword.value);

        
        if (adatvedelmi && !adatvedelmi.checked) {
            errors.push("El kell fogadnia az Adatvédelmi tájékoztatót!");
        }
        
        if (aszf && !aszf.checked) {
            errors.push("El kell fogadnia az Általános Szerződési Feltételeket!");
        }

        if(errors.length > 0){
            e.preventDefault();
            errorMessage.innerText = errors.join(" ");
            return;
        }
        e.preventDefault();

        const formData = {
        lastname: lastname.value,
        firstname: firstname.value,
        email: email.value,
        "post-number": postnumber.value,
        town: town.value,
        address: address.value,
        "phone-number": phone.value,
        password: password.value,
        };

        try {
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
            alert("✅ Sikeres regisztráció!");
            window.location.href = "/login";
        } else {
            alert("❌ Hiba: " + data.message);
        }
        } catch (err) {
        console.error(err);
        alert("⚠️ Hálózati hiba!");
        }

    });
}


const allInputs = [firstname, lastname, postnumber, town, address, phone, email, password, repeatPassword].filter(input => input != null);
allInputs.forEach(input => {
    input.addEventListener("input", () => {
        if(input.parentElement.classList.contains("incorrect")){
            input.parentElement.classList.remove("incorrect");
            errorMessage.innerText = "";
        }
    });
})
});
