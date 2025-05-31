// chat.js

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

async function consultarLMStudio(prompt) {
  try {
    const resposta = await fetch("http://127.0.0.1:1234/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen3-0.6b",
        messages: [
          {
            role: "system",
            content: [
              "You are a helpful assistant.",
              "Answer only with the final response—no internal thoughts or <think> tags."
            ].join(" ")
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const dados = await resposta.json();
    if (!dados.choices || !dados.choices[0]) {
      throw new Error("Resposta inesperada do LM Studio");
    }

    // Pega o texto bruto
    let content = dados.choices[0].message.content.trim();

    // Remove qualquer bloco <think>…</think> no início
    content = content.replace(/^(?:<think>[\s\S]*?<\/think>\s*)/, "");

    // Remove outros tokens internos, se existirem
    content = content.replace(/<\|begin_thought\|>[\s\S]*?<\|end_thought\|>/gi, "");
    content = content.replace(/<\|.*?\|>/g, "");

    return content.trim();
  } catch (erro) {
    console.error("Erro ao consultar LM Studio:", erro);
    return "[Erro ao consultar o modelo]";
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const uid = user.uid;
  // Primeiro, tentamos ler do localStorage (onde pode haver Base64 salvo pelo profile.js)
  const stored = JSON.parse(localStorage.getItem("userProfile")) || {};
  const name = stored.name || user.displayName || "User";
  const photo = stored.photo || "https://via.placeholder.com/40";

  const profile = {
    name: name,
    photo: photo,
    email: user.email
  };
  // Note: gravamos novamente no localStorage para consolidar
  localStorage.setItem("userProfile", JSON.stringify(profile));

  setupChat(uid);
});

function setupChat(uid) {
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const chatMessages = document.getElementById("chatMessages");
  const newChatBtn = document.getElementById("newChatBtn");
  const conversationsList = document.getElementById("conversationsList");
  const chatTitle = document.getElementById("chatTitle");
  const clearChats = document.getElementById("clearChats");
  const userPhoto = document.getElementById("userPhoto");
  const userName = document.getElementById("userName");

  const profile = JSON.parse(localStorage.getItem("userProfile")) || {};
  userName.textContent = profile.name;
  userPhoto.src = profile.photo;

  let conversations = [];
  let currentChatId = null;

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function createMessageElement(role, content) {
    const container = document.createElement("div");
    container.className = `flex ${role === "user" ? "justify-end" : "justify-start"}`;
    const bubble = document.createElement("div");
    bubble.className = `max-w-[75%] px-4 py-2 rounded-lg text-white ${
      role === "user" ? "bg-blue-600" : "bg-gray-700"
    }`;
    bubble.textContent = content;
    container.appendChild(bubble);
    return container;
  }

  function renderConversation(chat) {
    chatMessages.innerHTML = "";
    chat.messages.forEach(({ role, content }) => {
      chatMessages.appendChild(createMessageElement(role, content));
    });
    scrollToBottom();
  }

  function updateSidebar() {
    conversationsList.innerHTML = "";
    conversations.forEach((conv) => {
      const btn = document.createElement("button");
      btn.className = `w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 ${
        conv.id === currentChatId ? "bg-gray-700" : "bg-gray-800"
      }`;
      btn.textContent = conv.title;
      btn.addEventListener("click", () => {
        currentChatId = conv.id;
        chatTitle.textContent = conv.title;
        renderConversation(conv);
        updateSidebar();
      });
      conversationsList.appendChild(btn);
    });
  }

  async function loadConversations() {
    const snapshot = await getDocs(collection(db, "users", uid, "conversations"));
    conversations = snapshot.docs.map((doc) => ({
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
      messages: initialMessage ? [{ role: "assistant", content: initialMessage }] : []
    };
    const docRef = await addDoc(collection(db, "users", uid, "conversations"), newConv);
    newConv.id = docRef.id;
    conversations.unshift(newConv);
    currentChatId = newConv.id;
    updateSidebar();
    renderConversation(newConv);
  }

  async function updateConversation(chat) {
    await setDoc(doc(db, "users", uid, "conversations", chat.id), {
      title: chat.title,
      messages: chat.messages
    });
  }

  newChatBtn.addEventListener("click", () => {
    createNewConversation("Hi, how can I help you today?");
  });

  clearChats.addEventListener("click", async () => {
    const convRef = collection(db, "users", uid, "conversations");
    const snapshot = await getDocs(convRef);

    const deletePromises = snapshot.docs.map((docItem) =>
      deleteDoc(doc(db, "users", uid, "conversations", docItem.id))
    );
    await Promise.all(deletePromises);

    conversations = [];
    currentChatId = null;
    chatMessages.innerHTML = "";
    chatTitle.textContent = "Select a Conversation";
    await createNewConversation("Hi, how can I help you today?");
  });

  sendBtn.addEventListener("click", async () => {
    const text = userInput.value.trim();
    if (!text) return;

    const chat = conversations.find((c) => c.id === currentChatId);
    if (!chat) return;

    chat.messages.push({ role: "user", content: text });
    renderConversation(chat);
    userInput.value = "";

    try {
      const resposta = await consultarLMStudio(text);
      chat.messages.push({ role: "assistant", content: resposta });
      await updateConversation(chat);
    } catch (err) {
      chat.messages.push({ role: "assistant", content: "[Erro ao consultar o modelo]" });
      console.error(err);
    }

    renderConversation(chat);
  });

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // carrega conversas existentes ao iniciar
  loadConversations();
}
