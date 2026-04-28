(function () {
  function initAuth() {
    var name = localStorage.getItem('lr_name');
    var list = document.getElementById('navLinks');
    if (!list) return;

    if (name) {
      var greetingLi = document.createElement('li');
      var greeting = document.createElement('span');
      greeting.className = 'nav__greeting';
      greeting.textContent = 'Hi, ' + name;
      greetingLi.appendChild(greeting);

      var logoutLi = document.createElement('li');
      var logoutLink = document.createElement('a');
      logoutLink.href = '#';
      logoutLink.textContent = 'Logout';
      logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('lr_name');
        localStorage.removeItem('lr_email');
        window.location.reload();
      });
      logoutLi.appendChild(logoutLink);

      list.appendChild(greetingLi);
      list.appendChild(logoutLi);
    } else {
      var loginLi = document.createElement('li');
      var loginLink = document.createElement('a');
      loginLink.href = 'login.html';
      loginLink.textContent = 'Login';
      loginLi.appendChild(loginLink);
      list.appendChild(loginLi);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
