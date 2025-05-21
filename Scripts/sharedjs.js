  window.addEventListener('scroll', function () {
    const nav = document.querySelector('nav');
    if (window.scrollY > 10) {
      nav.classList.add('scroll-active');
    } else {
      nav.classList.remove('scroll-active');
    }
  });

 
  const burgerButton = document.querySelector('.burger-button');
  const burgerDropdown = document.querySelector('.burger-dropdown');

  burgerButton.addEventListener('click', () => {
    burgerDropdown.style.display = burgerDropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Optional: click outside to close
  window.addEventListener('click', (e) => {
    if (!e.target.matches('.burger-button')) {
      burgerDropdown.style.display = 'none';
    }
  });
