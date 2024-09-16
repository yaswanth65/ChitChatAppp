const socket = io();

let name;
let messageArea = document.querySelector('.message_area');
let textarea = document.querySelector('#textarea');
let usersList = document.querySelector('#users-list'); // Reference to the users list

// Prompt for the user's name and ensure it's not empty
do {
    name = prompt('Enter your name:');
    if (!name) {
        alert('Please enter a valid name.');
    }
} while (!name);

// Send the username to the server
socket.emit('setUsername', name);

textarea.addEventListener('keyup', (evt) => {
    if (evt.key === 'Enter' && evt.target.value.trim() !== '') {
        sendmsg(evt.target.value);
        textarea.value = '';  // Clear the textarea after sending the message
    }
});

function sendmsg(msgs) {
    let msg = {
        sender: name,
        message: msgs.trim()
    };
    
    // Emit the message to the server
    socket.emit('textmessage', msg);
    
    // Append the message to the message area
    appendmsg(msg, 'outgoing');
}

function appendmsg(msg, type) {
    let div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(type);

    // Play notification sound
    notificationsound();
    
    // Sanitize user input to prevent XSS
    div.innerHTML = `<p><strong>${escapeHTML(msg.sender)}:</strong> ${escapeHTML(msg.message)}</p>`;
    messageArea.appendChild(div);
    
    // Scroll to the bottom after adding the message
    scrollBottom();
}

// Listen for incoming messages from the server
socket.on('textmessage', (msg) => {
    console.log(msg);
    appendmsg(msg, 'incoming');
    notificationsound();
});

// Listen for updates to the user list
socket.on('updateUserList', (users) => {
    // Clear the existing list
    usersList.innerHTML = '';

    // Add each user to the list
    users.forEach(user => {
        let li = document.createElement('li');
        li.textContent = user.name;
        usersList.appendChild(li);
    });
});

function scrollBottom() {
    messageArea.scrollTop = messageArea.scrollHeight; // Ensure scrolling to the bottom
}

function notificationsound() {
    // Create a new audio object and set the source to the MP3 file
    const audio = new Audio('/mixkit-message-pop-alert-2354.mp3'); // Path is relative to the server root
    
    // Play the audio
    audio.play().catch(error => {
        // Handle any errors (e.g., user hasn't interacted with the page yet)
        console.error('Audio playback failed:', error);
    });
}

// Utility function to escape HTML and prevent XSS attacks
function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
