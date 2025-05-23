import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// 🔥 Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAuRhmtdebLqLluIEX5kEqE5j_IGvNaWQY",
  authDomain: "emmai-4b26e.firebaseapp.com",
  projectId: "emmai-4b26e",
  storageBucket: "emmai-4b26e.appspot.com",
  messagingSenderId: "1020422953738",
  appId: "1:1020422953738:web:ed10e3868d3b64af7538f3",
  measurementId: "G-FF19TKF6QP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 👤 Espera usuário logar
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  const uid = user.uid;
  const profile = {
    name: user.displayName || 'User',
    photo: user.photoURL || 'https://via.placeholder.com/40',
    email: user.email
  };
  localStorage.setItem('userProfile', JSON.stringify(profile));

  setupChat(uid);
});

// 🚀 Função principal do chat
function setupChat(uid) {
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatMessages = document.getElementById('chatMessages');
  const newChatBtn = document.getElementById('newChatBtn');
  const conversationsList = document.getElementById('conversationsList');
  const chatTitle = document.getElementById('chatTitle');
  const clearChats = document.getElementById('clearChats');
  const userPhoto = document.getElementById('userPhoto');
  const userName = document.getElementById('userName');

  const profile = JSON.parse(localStorage.getItem('userProfile')) || {};
  userName.textContent = profile.name;
  userPhoto.src = profile.photo;

  let conversations = [];
  let currentChatId = null;

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function createMessageElement(role, content) {
    const container = document.createElement('div');
    container.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    const bubble = document.createElement('div');
    bubble.className = `max-w-[75%] px-4 py-2 rounded-lg text-white ${role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`;
    bubble.textContent = content;
    container.appendChild(bubble);
    return container;
  }

  function renderConversation(chat) {
    chatMessages.innerHTML = '';
    chat.messages.forEach(({ role, content }) => {
      chatMessages.appendChild(createMessageElement(role, content));
    });
    scrollToBottom();
  }

  function updateSidebar() {
    conversationsList.innerHTML = '';
    conversations.forEach(conv => {
      const btn = document.createElement('button');
      btn.className = `w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 ${conv.id === currentChatId ? 'bg-gray-700' : 'bg-gray-800'}`;
      btn.textContent = conv.title;
      btn.addEventListener('click', () => {
        currentChatId = conv.id;
        chatTitle.textContent = conv.title;
        renderConversation(conv);
        updateSidebar();
      });
      conversationsList.appendChild(btn);
    });
  }

  async function loadConversations() {
    const snapshot = await getDocs(collection(db, 'users', uid, 'conversations'));
    conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    updateSidebar();
    if (conversations.length > 0) {
      currentChatId = conversations[0].id;
      chatTitle.textContent = conversations[0].title;
      renderConversation(conversations[0]);
    }
  }

  async function createNewConversation(initialMessage = null) {
    const title = `Conversation ${conversations.length + 1}`;
    const newConv = {
      title,
      messages: initialMessage ? [{ role: 'assistant', content: initialMessage }] : []
    };
    const docRef = await addDoc(collection(db, 'users', uid, 'conversations'), newConv);
    newConv.id = docRef.id;
    conversations.unshift(newConv);
    currentChatId = newConv.id;
    updateSidebar();
    renderConversation(newConv);
  }

  async function updateConversation(chat) {
    await setDoc(doc(db, 'users', uid, 'conversations', chat.id), {
      title: chat.title,
      messages: chat.messages
    });
  }

  newChatBtn.addEventListener('click', () => {
    createNewConversation('Hi, how can I help you today?');
  });

  clearChats.addEventListener('click', async () => {
    const convRef = collection(db, 'users', uid, 'conversations');
    const snapshot = await getDocs(convRef);

    const deletePromises = snapshot.docs.map(docItem =>
      deleteDoc(doc(db, 'users', uid, 'conversations', docItem.id))
    );
    await Promise.all(deletePromises);

    conversations = [];
    currentChatId = null;
    chatMessages.innerHTML = '';
    chatTitle.textContent = 'Select a Conversation';
    await createNewConversation('Hi, how can I help you today?');
  });

  sendBtn.addEventListener('click', async () => {
    const text = userInput.value.trim();
    if (!text) return;
    const chat = conversations.find(c => c.id === currentChatId);
    if (!chat) return;

    chat.messages.push({ role: 'user', content: text });
    renderConversation(chat);
    userInput.value = '';

    setTimeout(async () => {
      chat.messages.push({ role: 'assistant', content: `You said: ${text}` });
      renderConversation(chat);
      await updateConversation(chat);
    }, 500);
  });

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  loadConversations();
}
