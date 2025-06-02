// Adiciona evento ao botão "Enviar"
document.querySelector('.send-btn').addEventListener('click', sendQuestion);

// Adiciona evento ao pressionar Enter
document.querySelector('.input-send-wrapper input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendQuestion();
  }
});

async function sendQuestion() {
  const input = document.querySelector('.input-send-wrapper input');
  const question = input.value.trim();
  if (!question) return;

  // Limpa o campo
  input.value = '';

  // Prepara o payload
  const payload = {
    model: "qwen3-0.6b",
    messages: [
      {
        role: "system",
        content: "Responde sempre diretamente em português de forma curta e clara. Nunca expliques o raciocínio. Apenas responde diretamente ao que for pedido."
      },
      {
        role: "user",
        content: question
      }
    ],
    temperature: 0.7,
    max_tokens: 200,
    stream: false
  };

  try {
    // Faz a requisição para o servidor local
    const response = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Pega a resposta do modelo
    const answer = data.choices?.[0]?.message?.content || "Erro ao obter resposta.";

    // Adiciona na interface
    addMessageToTop(question, answer);

  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
    addMessageToTop(question, "Erro ao conectar com a API.");
  }
}

function addMessageToTop(question, answer) {
  const chatArea = document.querySelector('.chat-area');
  const chatCard = document.createElement('div');
  chatCard.className = 'chat-card';
  chatCard.innerHTML = `
    <strong>Pergunta:</strong> ${question}<br>
    <strong>Resposta:</strong> ${answer}
  `;
  chatArea.insertBefore(chatCard, chatArea.firstChild);
}
