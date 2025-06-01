let currentAuthState = false;

export const updateAuthUI = (isLoggedIn) => {
  currentAuthState = isLoggedIn;
  const logoutLi = document.getElementById('logout-li');
  if (logoutLi) {
    logoutLi.style.display = isLoggedIn ? 'block' : 'none';
  }
};

export const Header = () => {
  const header = document.createElement("header");
  header.innerHTML = `
    <nav>
      <ul>
        <li><a href="#/stories" data-navigo>Stories</a></li>
        <li><a href="#/add-story" data-navigo>Add Story</a></li>
        <li id="logout-li" style="display: ${currentAuthState ? 'block' : 'none'}">
          <button id="logout-button">Logout</button>
        </li>
      </ul>
    </nav>
  `;

  // Add click handler for logout
  header.querySelector('#logout-button')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('logout'));
  });

  // Add navigation handlers for all links
  const navLinks = header.querySelectorAll('a[data-navigo]');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('header-navigation'));
    });
  });

  return header;
};