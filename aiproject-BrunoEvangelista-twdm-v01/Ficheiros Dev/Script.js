document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("message-input");
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  const prompt = `<s>[INST] ${message} [/INST]`;







  
    const data = await response.json();
    const fullText = data?.[0]?.generated_text || "";

    // Remove a parte do prompt da resposta (caso venha repetida)
    const reply = fullText.replace(prompt, "").trim() || "Desculpa, não consegui responder.";

    addMessage(reply, "bot");

  } catch (error) {
    console.error("Erro ao comunicar com o modelo:", error);
    addMessage("Erro ao obter resposta do modelo.", "bot");
  }
});

function addMessage(text, role) {
  const container = document.getElementById("chat-container");
  const bubble = document.createElement("div");
  bubble.textContent = text;
  bubble.className = `mb-2 p-2 rounded max-w-[75%] ${role === "user" ? "bg-blue-500 self-end" : "bg-gray-700 self-start"}`;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}
