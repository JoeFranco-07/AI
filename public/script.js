async function sendMessage() {
  const userInput = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");
  const startButton = document.getElementById("startButton");

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  const userDiv = document.createElement("div");
  userDiv.className = "message user";
  userDiv.textContent = userMessage;
  chatBox.appendChild(userDiv);

  const response = await fetch('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage })
  });

  const result = await response.json();

  if (result.error) {
    if (result.reset) {
      startButton.style.display = 'block';
    }
    return;
  }

  const aiDiv = document.createElement("div");
  aiDiv.className = "message ai";
  aiDiv.textContent = result.response;
  chatBox.appendChild(aiDiv);

  chatBox.scrollTop = chatBox.scrollHeight;

  userInput.value = "";
  resizeInput();
}

function resizeInput() {
  const textarea = document.getElementById('userInput');
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px'; 
}

function resetConversation() {
  const chatBox = document.getElementById("chatBox");
  const startButton = document.getElementById("startButton");

  chatBox.innerHTML = '';
  startButton.style.display = 'none';
  
  fetch('/reset', { method: 'POST' });
}

async function clearSessionOnLoad() {
  await fetch('/reset', { method: 'POST' });
}
function clearChatModal() {
  const modal = document.getElementById("clearChatModal");
  modal.style.display = "flex"; // Show the modal
}

function closeModal() {
  const modal = document.getElementById("clearChatModal");
  modal.style.display = "none"; // Hide the modal
}

async function confirmClearChat() {
  const chatBox = document.getElementById("chatBox");
  const modal = document.getElementById("clearChatModal");

  chatBox.innerHTML = '';

  await fetch('/reset', { method: 'POST' });

  modal.style.display = "none";

  const startButton = document.getElementById("startButton");
  startButton.style.display = 'block';
}

window.onload = clearSessionOnLoad;
