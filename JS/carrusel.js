// Obtener elementos del carrusel
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');

let currentIndex = 0;

// Mover carrusel a una posición específica
const moveToSlide = (index) => {
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
};

// Botón siguiente
nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    moveToSlide(currentIndex);
});

// Botón anterior
prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    moveToSlide(currentIndex);
});