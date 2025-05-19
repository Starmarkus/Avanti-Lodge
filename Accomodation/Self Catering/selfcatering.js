// selfcatering.js

const images = [
  '/Images/Rooms/Flat 1/bathroom.jpg',
  '/Images/Rooms/Flat 1/bedroom.jpg',
  '/Images/Rooms/Flat 1/kitchen.jpg',
  '/Images/Rooms/Flat 3/chairs.jpg',
];

let index = 0;
let showingBg1 = true;

const bg1 = document.getElementById('bg1');
const bg2 = document.getElementById('bg2');

// Initial background
bg1.style.backgroundImage = `url('${images[0]}')`;
bg1.style.opacity = 1;

setInterval(() => {
  index = (index + 1) % images.length;
  const nextImage = images[index];

  if (showingBg1) {
    bg2.style.backgroundImage = `url('${nextImage}')`;
    bg2.style.opacity = 1;
    bg1.style.opacity = 0;
  } else {
    bg1.style.backgroundImage = `url('${nextImage}')`;
    bg1.style.opacity = 1;
    bg2.style.opacity = 0;
  }

  showingBg1 = !showingBg1;
}, 5000); // every 5 seconds

  
