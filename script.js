const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', function(event) {
    event.preventDefault();
    let isValid = true;
    const form = event.target;
    
    form.querySelectorAll('input').forEach(input => {
      input.classList.remove('is-invalid');
      
      if (!input.value) {
        input.classList.add('is-invalid');
        isValid = false;
      } else if (input.name === 'email' && !input.value.includes('@')) {
        input.classList.add('is-invalid');
        isValid = false;
      } else if (input.name === 'senha' && input.value.length !== 8) {
        input.classList.add('is-invalid');
        isValid = false;
      }
    });

    if (isValid) {
      const formData = new FormData(form);
      const userData = {
        nome: formData.get('nome'),
        sobrenome: formData.get('sobrenome'),
        username: formData.get('username'),
        email: formData.get('email'),
        dataNascimento: formData.get('dataNascimento')
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      window.location.href = 'index.html';
    } else {
      alert('Por favor, preencha corretamente todos os campos.');
    }
  });
}

function fazerLogin() {
  window.location.href = 'login.html';
}

function toggleSenha() {
  const senhaInput = document.querySelector('input[name="senha"]');
  const eyeIcon = document.getElementById('eyeIcon');
  
  if (senhaInput.type === 'password') {
    senhaInput.type = 'text';
    eyeIcon.classList.remove('fa-eye');
    eyeIcon.classList.add('fa-eye-slash');
  } else {
    senhaInput.type = 'password';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  }
}