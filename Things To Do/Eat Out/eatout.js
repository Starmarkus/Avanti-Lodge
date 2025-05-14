// Unique image sets per carousel
const imagePaths1 = [
  "/Images/IndexGallery/bedroom.jpg",
  "/Images/IndexGallery/fireplace.jpg",
  "/Images/IndexGallery/front-of-house-3.jpg"
];

const imagePaths2 = [
  "/Images/IndexGallery/garden-view.jpg",
  "/Images/IndexGallery/inside-of-house.jpg",
  "/Images/IndexGallery/front-oh-house-2.jpg"
];

const imagePaths3 = [
  "/Images/IndexGallery/patio.jpg",
  "/Images/IndexGallery/putt-putt.jpg",
  "/Images/IndexGallery/sunset-deck.jpg"
];

// Populate Carousel 1
const carouselTrack1 = document.getElementById("carouselTrack1");
[...imagePaths1, ...imagePaths1].forEach(src => {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Gallery Image 1";
  carouselTrack1.appendChild(img);
});

// Populate Carousel 2
const carouselTrack2 = document.getElementById("carouselTrack2");
[...imagePaths2, ...imagePaths2].forEach(src => {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Gallery Image 2";
  carouselTrack2.appendChild(img);
});

// Populate Carousel 3
const carouselTrack3 = document.getElementById("carouselTrack3");
[...imagePaths3, ...imagePaths3].forEach(src => {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Gallery Image 3";
  carouselTrack3.appendChild(img);
});
