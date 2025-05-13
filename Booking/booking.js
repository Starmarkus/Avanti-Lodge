const rooms = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5'];
    const roomsContainer = document.getElementById('rooms');

    rooms.forEach((room, index) => {
      const roomDiv = document.createElement('div');
      roomDiv.setAttribute('id', `room-${index}`);
      
      const roomTitle = document.createElement('h2');
      roomTitle.textContent = room;
      
      const checkBtn = document.createElement('button');
      checkBtn.textContent = 'Check Availability';
      checkBtn.onclick = () => checkAvailability(room);

      const result = document.createElement('p');
      result.setAttribute('id', `result-${index}`);

      roomDiv.appendChild(roomTitle);
      roomDiv.appendChild(checkBtn);
      roomDiv.appendChild(result);

      roomsContainer.appendChild(roomDiv);
    });

    function checkAvailability(room) {
      const date = document.getElementById('booking-date').value;
      if (!date) {
        alert('Please select a date first.');
        return;
      }
      // Static placeholder logic for now
      alert(`Checking availability for ${room} on ${date}...`);
      // You can update UI with a message
      const index = rooms.indexOf(room);
      const result = document.getElementById(`result-${index}`);
      result.textContent = `Availability check for ${room} on ${date} complete.`;
    }