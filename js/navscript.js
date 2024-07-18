const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');
const menuToggle = document.querySelector('.menu-toggle');
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});
document.getElementById('mobile-menu').addEventListener('click', function() {
    document.getElementById('nav-links').classList.toggle('active');
});
