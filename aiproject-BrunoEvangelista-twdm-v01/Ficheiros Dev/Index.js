
// Toggle dropdown do perfil
function toggleProfile() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.toggle("hidden");
}

// Dados iniciais
let conversas = JSON.parse(localStorage.getItem("conversas")) || [];
let conversaAtiva = null;
const conversationsEl = document.getElementById("conversations");

// Atualiza barra lateral
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
        localStorage.setItem("conversas", JSON.stringify(conversas));
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
        localStorage.setItem("conversas", JSON.stringify(conversas));
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
      localStorage.setItem("conversas", JSON.stringify(conversas));
      atualizarSidebar();
    };

    wrapper.appendChild(btn);
    wrapper.appendChild(menuBtn);
    wrapper.appendChild(menu);
    conversationsEl.appendChild(wrapper);
  });
}

// Carrega conversa selecionada
function carregarConversa(index) {
  conversaAtiva = index;
  const mensagensDiv = document.getElementById("mensagens");
  mensagensDiv.innerHTML = "";
  conversas[index].mensagens.forEach(msg => addMessage(msg.texto, msg.tipo));
  atualizarSidebar();
  atualizarMensagemBoasVindas();
}

// Guarda conversa nova
function guardarConversa(nome, mensagens = []) {
  conversas.push({ nome, mensagens });
  localStorage.setItem("conversas", JSON.stringify(conversas));
  atualizarSidebar();
}

// Nova conversa manual
document.getElementById("nova-conversa").addEventListener("click", () => {
  const nome = "Nova Conversa " + (conversas.length + 1);
  guardarConversa(nome, []);
  conversaAtiva = conversas.length - 1;
  carregarConversa(conversaAtiva);
});

// Submeter mensagem
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

  setTimeout(() => {
    const resposta = "Simulação de resposta da IA a: " + texto;
    conversas[conversaAtiva].mensagens.push({ texto: resposta, tipo: "bot" });
    addMessage(resposta, "bot");
    localStorage.setItem("conversas", JSON.stringify(conversas));
  }, 500);
});

// Adiciona mensagem visualmente
function addMessage(texto, tipo) {
  const mensagensDiv = document.getElementById("mensagens");
  const div = document.createElement("div");
  div.textContent = texto;
  div.className = "mb-2 p-2 rounded max-w-[75%] " + (tipo === "user"
    ? "bg-blue-500 self-end"
    : "bg-gray-700 self-start");
  mensagensDiv.appendChild(div);

  // Scrolla para a nova mensagem suavemente
  div.scrollIntoView({ behavior: "smooth", block: "end" });

  atualizarMensagemBoasVindas();
}


// Controla visibilidade da mensagem de boas-vindas
function atualizarMensagemBoasVindas() {
  const welcome = document.getElementById("boas-vindas");
  if (!welcome) return;
  const mensagens = conversaAtiva !== null ? conversas[conversaAtiva].mensagens : [];
  const mensagensDoUtilizador = mensagens?.some(m => m.tipo === "user");
  welcome.style.display = mensagensDoUtilizador ? "none" : "block";
}

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  window.location.href = "Login.html";
});

// Iniciar
atualizarSidebar();
atualizarMensagemBoasVindas();
