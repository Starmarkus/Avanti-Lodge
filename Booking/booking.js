async function fetchRoomsFromSupabase() {
  const { data, error } = await supabaseClient
    .from('RoomTable')
    .select('RoomName, RoomDescription, amenities, ratepernight, imagePaths');

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }

  const rooms = [];

  for (const room of data) {
    const images = await getRoomImages(room.imagePaths || []);
    rooms.push({
      name: room.RoomName,
      description: room.RoomDescription,
      amenities: room.amenities,
      rate: room.ratepernight,
      images: images
    });
  }

  return rooms.sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

}

async function getRoomImages(imagePaths) {
  const bucket = 'room-images';
  const publicURLs = [];

  for (const path of imagePaths) {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .getPublicUrl(path.trim());

    if (error) {
      console.warn(`Error fetching URL for ${path}:`, error.message);
      continue;
    }

    publicURLs.push(data.publicUrl);
  }

  return publicURLs;
}

let rooms = [];

document.addEventListener('DOMContentLoaded', async () => {
  rooms = await fetchRoomsFromSupabase();
  displayRooms();
});

function displayRooms() {
  const roomsContainer = document.getElementById('rooms');
  roomsContainer.innerHTML = '';

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
    bookBtn.style.marginLeft = '1rem';
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
}

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

  document.getElementById('booking-modal').style.display = 'flex';

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

function closeModal() {
  document.getElementById('booking-modal').style.display = 'none';
}
