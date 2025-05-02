document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".chat-input input");
  const sendBtn = document.querySelector(".send");
  const chatArea = document.querySelector(".chat-area");
  const newConvoBtn = document.querySelector(".new-convo");
  const convoList = document.querySelector(".conversations");

  // Adiciona botão "Carregar mais"
  const loadMoreBtn = document.createElement("button");
  loadMoreBtn.textContent = "Carregar mais";
  loadMoreBtn.classList.add("load-more");
  loadMoreBtn.style.display = "none";
  convoList.parentNode.appendChild(loadMoreBtn);

  const messagesWrapper = document.createElement("div");
  messagesWrapper.classList.add("messages");
  chatArea.insertBefore(messagesWrapper, document.querySelector(".chat-input"));

  const MAX_VISIBLE = 7;
  let conversations = {};
  let currentConvoId = null;
  let convoCount = 0;

  function switchConversation(id) {
    currentConvoId = id;
    updateConversationUI();
    loadMessages();
  }

  function updateConversationUI() {
    document.querySelectorAll(".conversation").forEach(el => {
      el.classList.remove("active");
      if (el.dataset.id === currentConvoId) el.classList.add("active");
    });
  }

  function loadMessages() {
    messagesWrapper.innerHTML = "";
    const msgs = conversations[currentConvoId]?.messages || [];
    msgs.forEach(msg => {
      const el = document.createElement("div");
      el.classList.add("message", msg.sender);
      el.textContent = msg.text;
      messagesWrapper.appendChild(el);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function sendMessage() {
    const message = input.value.trim();
    if (message === "" || currentConvoId === null) return;

    const newMsg = { sender: "user", text: message };
    conversations[currentConvoId].messages.push(newMsg);

    const el = document.createElement("div");
    el.classList.add("message", "user");
    el.textContent = message;
    messagesWrapper.appendChild(el);

    input.value = "";
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function updateVisibleConversations() {
    const all = document.querySelectorAll(".conversation");
    all.forEach((el, i) => {
      el.style.display = i < MAX_VISIBLE ? "block" : "none";
    });

    if (all.length > MAX_VISIBLE) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }
  }

  loadMoreBtn.addEventListener("click", () => {
    document.querySelectorAll(".conversation").forEach(el => {
      el.style.display = "block";
    });
    loadMoreBtn.style.display = "none";
  });

  function createConversation(title) {
    convoCount++;
    const id = `convo-${convoCount}`;
    const convoTitle = title || `Conversa ${convoCount}`;

    const convoEl = document.createElement("div");
    convoEl.classList.add("conversation");
    convoEl.textContent = `🗨 ${convoTitle}`;
    convoEl.dataset.id = id;

    convoEl.addEventListener("click", () => switchConversation(id));

    convoEl.addEventListener("dblclick", () => {
      const currentName = convoEl.textContent.replace("🗨 ", "");
      const input = document.createElement("input");
      input.type = "text";
      input.value = currentName;
      input.classList.add("rename-input");

      convoEl.innerHTML = "";
      convoEl.appendChild(input);
      input.focus();

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") finishRename();
      });

      input.addEventListener("blur", finishRename);

      function finishRename() {
        const newName = input.value.trim() || currentName;
        conversations[id].title = newName;
        convoEl.textContent = `🗨 ${newName}`;
      }
    });

    conversations[id] = {
      title: convoTitle,
      messages: []
    };

    convoList.appendChild(convoEl);
    updateVisibleConversations();
    switchConversation(id);
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  newConvoBtn.addEventListener("click", () => createConversation());

  createConversation();
});
  