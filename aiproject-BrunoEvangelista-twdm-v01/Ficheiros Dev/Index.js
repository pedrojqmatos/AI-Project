// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBisWry9zJcHgIJqMRbHThgqbE96yey5VU",
  authDomain: "nebulai-7aa4b.firebaseapp.com",
  projectId: "nebulai-7aa4b",
  storageBucket: "nebulai-7aa4b.firebasestorage.app",
  messagingSenderId: "916864728578",
  appId: "1:916864728578:web:36989f77b8be431442f11b",
  measurementId: "G-THXE4Y0HGF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let user = null;
let conversas = [];
let conversaAtiva = null;
const conversationsEl = document.getElementById("conversations");

firebase.auth().onAuthStateChanged(async (u) => {
  if (!u) {
    window.location.href = "Login.html";
    return;
  }

  user = u;
  document.getElementById("user-email").textContent = user.email;

  const perfilImg = document.getElementById("profile-image");
  const doc = await db.collection("utilizadores").doc(user.uid).get();
  const data = doc.exists ? doc.data() : {};
  perfilImg.src = data.photoURL || "imagens/perfil-default.png";

  await carregarConversasFirestore();
  atualizarSidebar();
  atualizarMensagemBoasVindas();
});

async function carregarConversasFirestore() {
  const doc = await db.collection("conversas").doc(user.uid).get();
  conversas = doc.exists ? doc.data().conversas || [] : [];
}

async function guardarConversasFirestore() {
  await db.collection("conversas").doc(user.uid).set({ conversas });
}

function atualizarSidebar() {
  conversationsEl.innerHTML = "";
  conversas.forEach((c, i) => {
    const isActive = conversaAtiva === i;

    const wrapper = document.createElement("div");
    wrapper.className = `group relative flex justify-between items-center rounded px-3 py-2 ${
      isActive ? "bg-blue-600" : "bg-white bg-opacity-10 hover:bg-opacity-20"
    }`;

    const btn = document.createElement("button");
    btn.textContent = c.nome;
    btn.className = "text-left flex-1";
    btn.onclick = () => carregarConversa(i);

    const menuBtn = document.createElement("button");
    menuBtn.innerHTML = "⋮";
    menuBtn.className = "text-white ml-2";
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      document.querySelectorAll(".menu-opcoes").forEach(m => m.classList.add("hidden"));
      const menu = wrapper.querySelector(".menu-opcoes");
      menu.classList.toggle("hidden");
    };

    const menu = document.createElement("div");
    menu.className = "menu-opcoes hidden absolute right-0 top-full mt-1 w-36 bg-white text-black rounded shadow z-10";
    menu.innerHTML = `
      <button class="w-full text-left px-4 py-2 hover:bg-gray-200 duplicar flex items-center gap-2">
        <img src="imagens/duplicar.png" alt="Duplicar" class="w-4 h-4"> Duplicar
      </button>
      <button class="w-full text-left px-4 py-2 hover:bg-gray-200 editar flex items-center gap-2">
        <img src="imagens/editar.png" alt="Editar" class="w-4 h-4"> Editar
      </button>
      <button class="w-full text-left px-4 py-2 hover:bg-gray-200 apagar flex items-center gap-2">
        <img src="imagens/apagar.png" alt="Apagar" class="w-4 h-4"> Apagar
      </button>
    `;

    menu.querySelector(".editar").onclick = (e) => {
      e.stopPropagation();
      const input = prompt("Novo nome:", c.nome);
      if (input?.trim()) {
        conversas[i].nome = input.trim();
        guardarConversasFirestore();
        atualizarSidebar();
      }
    };

    menu.querySelector(".apagar").onclick = (e) => {
      e.stopPropagation();
      if (confirm("Tens a certeza que queres apagar esta conversa?")) {
        conversas.splice(i, 1);
        if (conversaAtiva === i) {
          conversaAtiva = null;
          document.getElementById("mensagens").innerHTML = "";
        } else if (conversaAtiva > i) {
          conversaAtiva--;
        }
        guardarConversasFirestore();
        atualizarSidebar();
        atualizarMensagemBoasVindas();
      }
    };

    menu.querySelector(".duplicar").onclick = (e) => {
      e.stopPropagation();
      const copia = {
        nome: c.nome + " (Cópia)",
        mensagens: [...c.mensagens],
      };
      conversas.splice(i + 1, 0, copia);
      guardarConversasFirestore();
      atualizarSidebar();
    };

    wrapper.appendChild(btn);
    wrapper.appendChild(menuBtn);
    wrapper.appendChild(menu);
    conversationsEl.appendChild(wrapper);
  });
}

function carregarConversa(index) {
  conversaAtiva = index;
  const mensagensDiv = document.getElementById("mensagens");
  mensagensDiv.innerHTML = "";
  conversas[index].mensagens.forEach(msg => addMessage(msg.texto, msg.tipo));
  atualizarSidebar();
  atualizarMensagemBoasVindas();
}

function guardarConversa(nome, mensagens = []) {
  conversas.push({ nome, mensagens });
  guardarConversasFirestore();
  atualizarSidebar();
}

document.getElementById("nova-conversa").addEventListener("click", () => {
  const nome = "Nova Conversa " + (conversas.length + 1);
  guardarConversa(nome, []);
  conversaAtiva = conversas.length - 1;
  carregarConversa(conversaAtiva);
});

document.getElementById("chat-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const input = document.getElementById("message-input");
  const texto = input.value.trim();
  if (!texto) return;

  if (conversaAtiva === null) {
    const nome = "Conversa " + (conversas.length + 1);
    guardarConversa(nome, []);
    conversaAtiva = conversas.length - 1;
    carregarConversa(conversaAtiva);
  }

  conversas[conversaAtiva].mensagens.push({ texto, tipo: "user" });
  addMessage(texto, "user");
  input.value = "";

  const mensagensDiv = document.getElementById("mensagens");
  const loadingDiv = document.createElement("div");
  loadingDiv.textContent = "A pensar...";
  loadingDiv.className = "mb-2 p-2 rounded max-w-[75%] bg-gray-700 self-start";
  mensagensDiv.appendChild(loadingDiv);
  loadingDiv.scrollIntoView({ behavior: "smooth", block: "end" });

  try {
    const mensagens = construirMensagensParaModelo(texto);
    const resposta = await obterRespostaDoModelo(mensagens);
    conversas[conversaAtiva].mensagens.push({ texto: resposta, tipo: "bot" });
    loadingDiv.textContent = resposta;
    guardarConversasFirestore();
  } catch (err) {
    console.error("Erro ao contactar o modelo:", err);
    const erro = "Erro ao contactar o modelo. Verifica a ligação com o Together.ai.";
    conversas[conversaAtiva].mensagens.push({ texto: erro, tipo: "bot" });
    loadingDiv.textContent = erro;
  }
});

function construirMensagensParaModelo(novaMensagem) {
  const mensagens = conversaAtiva !== null ? conversas[conversaAtiva].mensagens : [];
  const ultimas = mensagens.slice(-5);

  const mensagensAPI = [
    {
      role: "system",
      content: "Tu és a NebulAI, uma assistente virtual simpática e útil, que responde sempre em português europeu. O teu nome é fixo: NebulAI. Nunca uses emojis, nunca te chames Assistente, e responde sempre com clareza e profissionalismo."
    }
  ];

  ultimas.forEach(m => {
    mensagensAPI.push({
      role: m.tipo === "user" ? "user" : "assistant",
      content: m.texto
    });
  });

  const primeiraVez = ultimas.length === 0;
  const userPrompt = primeiraVez
    ? `Chama-te NebulAI. Nunca digas que te chamas Assistente. Agora responde: ${novaMensagem}`
    : novaMensagem;

  mensagensAPI.push({ role: "user", content: userPrompt });
  return mensagensAPI;
}

function addMessage(texto, tipo) {
  const mensagensDiv = document.getElementById("mensagens");
  const div = document.createElement("div");
  div.textContent = texto;
  div.className = "mb-2 p-2 rounded max-w-[75%] " + (tipo === "user"
    ? "bg-blue-500 self-end"
    : "bg-gray-700 self-start");
  mensagensDiv.appendChild(div);
  div.scrollIntoView({ behavior: "smooth", block: "end" });

  atualizarMensagemBoasVindas();
}

async function obterRespostaDoModelo(messages) {
  // Usa exatamente o token que te deram (sem prefixo extra)
  const TOGETHER_TOKEN = "37b9073cf4874823776d6d57ab6035a5036265492883cf006963756887d5daa3";

  console.log("🔎 Enviando para o modelo:", JSON.stringify({
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    messages: messages,
    max_tokens: 300,
    temperature: 0.7
  }, null, 2));

  try {
    const resposta = await fetch("https://api.together.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOGETHER_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.1",
        messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!resposta.ok) throw new Error("Erro HTTP: " + resposta.status);

    const data = await resposta.json();
    return data.choices?.[0]?.message?.content || "❌ Erro: resposta vazia.";
  } catch (err) {
    console.error("Erro ao contactar Together:", err);
    throw err;
  }
}

function toggleProfile() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.toggle("hidden");
}

window.addEventListener("click", (e) => {
  const dropdown = document.getElementById("profileDropdown");
  const btn = document.getElementById("profile-btn");
  if (dropdown && !dropdown.classList.contains("hidden") && !btn.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

function atualizarMensagemBoasVindas() {
  const welcome = document.getElementById("boas-vindas");
  if (!welcome) return;
  const mensagens = conversaAtiva !== null ? conversas[conversaAtiva].mensagens : [];
  const mensagensDoUtilizador = mensagens?.some(m => m.tipo === "user");
  welcome.style.display = mensagensDoUtilizador ? "none" : "block";
}

document.getElementById("logout-btn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "Login.html";
  });
});
