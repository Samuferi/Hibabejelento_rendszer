window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('form');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const errorMessage = document.getElementById('error-message');

  if (!form) {
    console.error("❌ A login form nem található!");
    return;
  }

  form.addEventListener('submit', async (e) => {
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
});
