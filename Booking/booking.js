const rooms = [
  {
    name: 'Double Room',
    rate: 1050,
    description: 'Avanti went Solar, no more load shedding!!!! All Avanti Guest Lodge rooms offer en-suite bathrooms. Each room is individually decorated and has coffee/tea facilities, Bar fridge, microwave, Smart TV and selected DSTV channels with Free Wi-Fi',
    images: [
      '../Images/Rooms/Double/bedroom.jpg',
      '../Images/Rooms/Double/bathroom.jpg',
      '../Images/Rooms/Double/bedroom2.jpg',
      '../Images/Rooms/Double/kitchen.jpg'
    ],
    amenities: [
      'Wi-Fi', 'Non-smoking', 'TV', 'DSTV / Satellite TV', 'Sitting area', 'Desk',
      'Cleaning service', 'Heater', 'Bathroom amenities', 'Shower only',
      'Coffee / tea facilities', 'Refrigerator', 'Microwave', 'Bar fridge', 'Terrace'
    ]
  },
  {
    name: 'Self Catering 1 (Flat 1)',
    rate: 1150,
    description: 'Self Catering Flatlet 1 offers en-suite bathroom. It also comes with a dining area and a Full Kitchenette. Each room is individually decorated and has coffee/tea facilities, Smart TV and selected DSTV channels with Free Wi-Fi.',
    images: [
      '../Images/Rooms/Flat 1/bedroom.jpg',
      '../Images/Rooms/Flat 1/bathroom.jpg',
      '../Images/Rooms/Flat 1/chairs.jpg',
      '../Images/Rooms/Flat 1/kitchen.jpg'
    ],
    amenities: [
      'Wi-Fi', 'Non-smoking', 'TV', 'DSTV / Satellite TV', 'Sitting area', 'Desk',
      'Cleaning service', 'Bathroom amenities', 'Shower only', 'Coffee / tea facilities',
      'Refrigerator', 'Microwave', 'Full kitchen', 'Kitchenette', 'Toaster',
      'Terrace', 'Plunge pool'
    ]
  },
  {
    name: 'Self Catering 2 (Flat 2)',
    rate: 1375,
    description: 'Self Catering Flatlet 2 offers en-suite bathroom. It also comes with a dining area and a Full Kitchenette. Each room is individually decorated and has coffee/tea facilities, Smart TV and selected DSTV channels with Free Wi-Fi.',
    images: [
      '../Images/Rooms/Flat 2/bedroom.jpg',
      '../Images/Rooms/Flat 2/bathroom.jpg',
      '../Images/Rooms/Flat 2/kitchen.jpg'
    ],
    amenities: [
      'Wi-Fi', 'TV', 'DSTV / Satellite TV', 'Sitting area', 'Desk',
      'Cleaning service', 'Bathroom amenities', 'Shower only', 'Coffee / tea facilities',
      'Refrigerator', 'Microwave', 'Full kitchen', 'Terrace', 'Plunge pool'
    ]
  },
  {
    name: 'Self Catering 3 (Flat 3)',
    rate: 1485,
    description: 'Self Catering Flatlet 3 offers en-suite bathroom, dining area and Kitchenette with build in oven, Smeg gas hob, Fridge, microwave, Each room is individually decorated and has coffee/tea facilities, Smart TV and selected DSTV channels with Free Wi-Fi.',
    images: [
      '../Images/Rooms/Flat 3/bedroom.jpg',
      '../Images/Rooms/Flat 3/bathroom.jpg',
      '../Images/Rooms/Flat 3/chairs.jpg',
      '../Images/Rooms/Flat 3/whyjustthetoilet.jpg'
    ],
    amenities: [
      'Wi-Fi', 'Non-smoking', 'TV', 'DSTV / Satellite TV', 'Sitting area', 'Desk',
      'Cleaning service', 'Turn down service', 'Heater', 'Fan', 'Bathroom amenities',
      'Shower only', 'Hairdryer', 'Iron', 'Ironing board', 'Coffee / tea facilities',
      'Refrigerator', 'Microwave', 'Full kitchen', 'Kitchenette', 'Toaster',
      'Oven', 'Terrace', 'Plunge pool'
    ]
  },
  {
    name: 'Self Catering 4 (Flat 4)',
    rate: 1485,
    description: 'Self Catering Flatlet 4 offers en-suite bathroom. It also comes with a dining area and a Kitchenette with build in oven and Fridge. Each room is individually decorated and has coffee/tea facilities, Smart TV and selected DSTV channels with Free Wi-Fi.',
    images: [
      '../Images/Rooms/Flat 4/bedroom.jpg',
      '../Images/Rooms/Flat 4/bathroom.jpg',
      '../Images/Rooms/Flat 4/chairs.jpg',
      '../Images/Rooms/Flat 4/whyjustthetoilet.jpg'
    ],
    amenities: [
      'Wi-Fi', 'Non-smoking', 'TV', 'DSTV / Satellite TV', 'Sitting area', 'Desk',
      'Cleaning service', 'Turn down service', 'Heater', 'Fan', 'Bathroom amenities',
      'Shower only', 'Hairdryer', 'Iron', 'Ironing board', 'Coffee / tea facilities',
      'Refrigerator', 'Microwave', 'Full kitchen', 'Kitchenette', 'Toaster',
      'Oven', 'Terrace', 'Plunge pool'
    ]
  }
];

const roomsContainer = document.getElementById('rooms');

rooms.forEach((room, index) => {
  const container = document.createElement('div');
  container.className = 'room-container';

  const left = document.createElement('div');
  left.className = 'room-left';

  const title = document.createElement('h2');
  title.textContent = room.name;

  let currentImageIndex = 0;

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'image-slider';

  const img = document.createElement('img');
  img.src = room.images[currentImageIndex];
  img.alt = `${room.name} image`;
  img.className = 'room-image';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '←';
  prevBtn.className = 'image-arrow';
  prevBtn.onclick = () => {
    currentImageIndex = (currentImageIndex - 1 + room.images.length) % room.images.length;
    img.src = room.images[currentImageIndex];
  };

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '→';
  nextBtn.className = 'image-arrow';
  nextBtn.onclick = () => {
    currentImageIndex = (currentImageIndex + 1) % room.images.length;
    img.src = room.images[currentImageIndex];
  };

  imageWrapper.appendChild(img);

  const arrowContainer = document.createElement('div');
  arrowContainer.className = 'arrow-container';

  arrowContainer.appendChild(prevBtn);
  arrowContainer.appendChild(nextBtn);

  imageWrapper.appendChild(arrowContainer);

  left.appendChild(title);
  left.appendChild(imageWrapper);

  const right = document.createElement('div');
  right.className = 'room-right';

  const descHeading = document.createElement('h3');
  descHeading.textContent = 'Room Description';

  const description = document.createElement('p');
  description.textContent = room.description;

  const amenitiesHeading = document.createElement('h3');
  amenitiesHeading.textContent = 'Amenities';

  const amenitiesTable = document.createElement('table');
  amenitiesTable.className = 'amenities-table';

  let row;
  room.amenities.forEach((item, idx) => {
    if (idx % 4 === 0) {
      row = document.createElement('tr');
      amenitiesTable.appendChild(row);
    }
    const cell = document.createElement('td');
    cell.textContent = item;
    row.appendChild(cell);
  });

  const checkBtn = document.createElement('button');
  checkBtn.textContent = 'Check Availability';
  checkBtn.onclick = () => checkAvailability(room.name);

  const bookBtn = document.createElement('button');
  bookBtn.textContent = 'Book Now';
  bookBtn.onclick = () => bookRoom(room.name);

  const result = document.createElement('p');
  result.id = `result-${index}`;

  right.appendChild(descHeading);
  right.appendChild(description);
  right.appendChild(amenitiesHeading);
  right.appendChild(amenitiesTable);

  const rateHeading = document.createElement('h3');
  rateHeading.textContent = `Rate: R${room.rate} per night`;
  right.appendChild(rateHeading);

  right.appendChild(checkBtn);
  right.appendChild(bookBtn);
  right.appendChild(result);

  container.appendChild(left);
  container.appendChild(right);
  roomsContainer.appendChild(container);
});

function checkAvailability(roomName) {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;

  if (!startDate || !endDate) {
    alert('Please select both a start and end date.');
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date cannot be after end date.');
    return;
  }

  alert(`Checking availability for ${roomName} from ${startDate} to ${endDate}...`);
  const index = rooms.findIndex(r => r.name === roomName);
  document.getElementById(`result-${index}`).textContent =
    `Availability checked for ${roomName} from ${startDate} to ${endDate}.`;
}

function bookRoom(roomName) {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;

  if (!startDate || !endDate) {
    alert('Please select both a start and end date.');
    return;
  }

  const nights = calculateNights(startDate, endDate);
  if (nights <= 0) {
    alert('End date must be after start date.');
    return;
  }

  const room = rooms.find(r => r.name === roomName);
  if (!room) {
    alert('Room not found.');
    return;
  }

  const totalCost = nights * room.rate;

  document.getElementById('modal-title').textContent = `Booking: ${roomName}`;
  document.getElementById('modal-dates').textContent = `From ${startDate} to ${endDate}`;
  document.getElementById('modal-nights').textContent = `Number of nights: ${nights}`;
  document.getElementById('modal-total').textContent = `Total cost: R${totalCost}`;

  // Show the modal
  document.getElementById('booking-modal').style.display = 'flex';

  // Proceed to Payment
  document.getElementById('proceed-payment').onclick = () => {
  const params = new URLSearchParams({
    room: room.name,
    start: startDate,
    end: endDate,
    nights: nights,
    rate: room.rate,
    total: totalCost
  });

  window.location.href = `../Payment/payment.html?${params.toString()}`;
};
}

function calculateNights(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Close modal
function closeModal() {
  document.getElementById('booking-modal').style.display = 'none';
}
