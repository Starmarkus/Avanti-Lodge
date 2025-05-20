  window.addEventListener('scroll', function () {
    const nav = document.querySelector('nav');
    if (window.scrollY > 10) {
      nav.classList.add('scroll-active');
    } else {
      nav.classList.remove('scroll-active');
    }
  });
