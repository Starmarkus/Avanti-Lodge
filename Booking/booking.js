// Fetch rooms and images from Supabase
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

  return rooms.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );
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
  setDateInputMin();
  rooms = await fetchRoomsFromSupabase();
  displayRooms();
});

function setDateInputMin() {
  const now = new Date();
  const hour = now.getHours();

  const minDate = new Date(now);
  if (hour >= 14) {
    minDate.setDate(minDate.getDate() + 1);
  }

  const minDateStr = minDate.toISOString().split('T')[0];

  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');

  if (startInput && endInput) {
    startInput.min = minDateStr;
    endInput.min = minDateStr;
  }
}

function displayRooms() {
  const roomsContainer = document.getElementById('rooms');
  roomsContainer.innerHTML = '';

  rooms.forEach((room, index) => {
    const container = document.createElement('div');
    container.className = 'room-container';

    // Left section: Title and image carousel
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

    // Right section: Description, amenities, rate, buttons
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
    result.className = 'availability-result hidden';

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

async function checkAvailability(roomName) {
  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    alert('Please select both a start and end date.');
    return;
  }

  if (new Date(startDate) < new Date(startInput.min)) {
    alert(`Start date cannot be earlier than ${startInput.min}.`);
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date cannot be after end date.');
    return;
  }

  const index = rooms.findIndex(r => r.name === roomName);
  const resultElement = document.getElementById(`result-${index}`);

  try {
    const { data: roomData, error: roomError } = await supabaseClient
      .from('RoomTable')
      .select('RoomID')
      .eq('RoomName', roomName)
      .single();

    if (roomError || !roomData) {
      console.error('Error fetching RoomID:', roomError);
      resultElement.textContent = 'Error fetching room information.';
      return;
    }

    const roomID = roomData.RoomID;

    const { data: bookings, error: bookingError } = await supabaseClient
      .from('BookingTable')
      .select('BookingStartDate, BookingEndDate')
      .eq('RoomID', roomID)
      .or(`and(BookingStartDate.lte.${endDate},BookingEndDate.gte.${startDate})`);

    if (bookingError) {
      console.error('Error fetching bookings:', bookingError);
      resultElement.textContent = 'Error checking availability.';
      return;
    }

    if (bookings.length > 0) {
      resultElement.textContent = 'This room is NOT available for your selected dates.';
      resultElement.classList.remove('hidden');
      resultElement.style.color = 'red';
    } else {
      resultElement.textContent = 'This room is available!';
      resultElement.classList.remove('hidden');
      resultElement.style.color = 'green';
    }
  } catch (error) {
    console.error(error);
    resultElement.textContent = 'An error occurred during availability check.';
  }
}

async function bookRoom(roomName) {
  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    alert('Please select both start and end dates before booking.');
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date cannot be after end date.');
    return;
  }

  const user = supabaseClient.auth.user();
  if (!user) {
    alert('You must be logged in to book.');
    return;
  }

  // Find room rate
  const room = rooms.find(r => r.name === roomName);
  if (!room) {
    alert('Room not found.');
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  const nights = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // inclusive

  if (nights <= 0) {
    alert('Invalid booking duration.');
    return;
  }

  const total = nights * room.rate;

  try {
    const response = await fetch('https://avantiguest-backend.onrender.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: roomName,
        start: startDate,
        end: endDate,
        nights,
        rate: room.rate,
        total,
        userID: user.id
      }),
    });

    const data = await response.json();

    if (data.url) {
      window.location = data.url;
    } else {
      alert('Error creating checkout session.');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to initiate booking.');
  }
}
