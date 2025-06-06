document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.querySelector(".send-btn");
  const inputField = document.querySelector(".input-send-wrapper input");
  const chatArea = document.querySelector(".chat-area");
  const deleteBtn = document.querySelector(".chat-footer .delete-all"); 
  const newChatBtn = document.querySelector(".sidebar-chat .new-chat");
  const chatList = document.querySelector(".chat-list");
  const sairLink = document.querySelector('.menu a:last-child'); // seleciona o último link do menu ("Sair")

  let conversaCount = 0;
  let conversaAtiva = false;

  // Evento para enviar mensagem ao clicar no botão
  sendBtn.addEventListener("click", handleSendMessage);

  // Evento para enviar mensagem ao pressionar Enter no input
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Evento para apagar todas as mensagens no chat-area
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const messages = chatArea.querySelectorAll(".chat-card");
      messages.forEach(msg => msg.remove());
      // Mantém conversa ativa, pois só apagou mensagens
    });
  }

  // Evento para iniciar nova conversa
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      const messages = chatArea.querySelectorAll(".chat-card");
      messages.forEach(msg => msg.remove());
      inputField.value = "";
      conversaAtiva = false; // Permite criar novo botão na próxima mensagem
    });
  }

  // Evento para o botão sair no menu lateral
  if (sairLink) {
    sairLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "index.html";
    });
  }

  async function handleSendMessage() {
    const userMessage = inputField.value.trim();
    if (!userMessage) return;

    if (!conversaAtiva) {
      conversaCount++;
      addChatButton(conversaCount);
      conversaAtiva = true;
    }

    appendMessage("user", userMessage);
    inputField.value = "";

    try {
      const response = await fetch("http://localhost:1234/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen3-0.6b",
          messages: [
            { role: "system", content: "Responde de forma direta em português, sem explicações ou justificações." },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: -1,
          stream: false
        }),
      });

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content || "Sem resposta.";

      appendMessage("bot", botReply);
    } catch (error) {
      console.error("Erro ao contactar a API:", error);
      appendMessage("bot", "Erro ao contactar o servidor.");
    }
  }

  function appendMessage(sender, text) {
    const msgCard = document.createElement("div");
    msgCard.classList.add("chat-card");
    msgCard.innerHTML = `<p>${text}</p>`;
    chatArea.insertBefore(msgCard, chatArea.querySelector(".chat-footer"));
  }

  function addChatButton(num) {
    const btn = document.createElement("button");
    btn.textContent = `Conversa ${num}`;
    btn.classList.add("chat-history-button"); // classe para estilo dos botões na lista
    btn.addEventListener("click", () => {
      alert(`Abrir Conversa ${num} (funcionalidade futura)`);
    });
    chatList.appendChild(btn);
  }
});
