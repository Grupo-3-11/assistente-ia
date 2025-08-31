// 1. Variáveis e Seletores do DOM
const selectors = {
  questionTextarea: document.getElementById("question"),
  submitBtn: document.getElementById("submitBtn"),
  responseDiv: document.getElementById("response"),
  loadingDiv: document.getElementById("loading"),
  errorDiv: document.getElementById("error"),
  modeloSelect: document.getElementById("modelo"),
  copyBtn: document.getElementById("copyBtn"),
  clearBtn: document.getElementById("clearBtn"),
};

// 2. Funções de Feedback Visual
const ui = {
  showLoading: () => {
    selectors.responseDiv.textContent = "";
    selectors.errorDiv.classList.add("hidden");
    selectors.loadingDiv.classList.remove("hidden");
    selectors.submitBtn.disabled = true;
  },
  hideLoading: () => {
    selectors.loadingDiv.classList.add("hidden");
    selectors.submitBtn.disabled = false;
  },
  showError: (message) => {
    selectors.errorDiv.textContent = `🚨 Erro: ${message}`;
    selectors.errorDiv.classList.remove("hidden");
  },
  displayResponse: (text) => {
    selectors.responseDiv.textContent = text;
  },
};

// 3. Função para copiar resposta
function handleCopy() {
  const text = selectors.responseDiv.textContent.trim();
  if (!text) {
    ui.showError("Nada pra copiar, parça! 🤷‍♂️");
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      selectors.errorDiv.textContent = "Copiado com sucesso! 😎";
      selectors.errorDiv.classList.remove("hidden");
      setTimeout(() => selectors.errorDiv.classList.add("hidden"), 2000);
    })
    .catch(() => {
      ui.showError("Não rolou copiar... confere as permissões aí! 🔒");
    });
}

// 4. Função para limpar
function handleClear() {
  if (confirm("Tem certeza que quer apagar tudo, mano? Vai sumir geral!")) {
    selectors.responseDiv.textContent = "";
    selectors.questionTextarea.value = "";
    selectors.errorDiv.classList.add("hidden");
  }
}

// 5. Função Central da API (chama o backend Node)
async function getApiResponse(question, model) {
  ui.showLoading();

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Responda a esta pergunta usando gírias e expressões populares do Brasil de forma informal e descontraída: ${question}`,
        model: model,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    let textResponse;
    if (model === "openai") {
      textResponse = data.choices?.[0]?.message?.content;
    } else if (model.startsWith("gemini")) {
      textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (textResponse) {
      ui.displayResponse(textResponse);
    } else {
      ui.showError("A IA deu uma bugada e não mandou resposta... 🤖💤");
      console.error("Resposta da API sem conteúdo:", data);
    }
  } catch (error) {
    ui.showError(error.message);
    console.error("Erro:", error);
  } finally {
    ui.hideLoading();
  }
}

// 6. Evento do botão principal
function handleButtonClick() {
  const question = selectors.questionTextarea.value.trim();
  const selectedModel = selectors.modeloSelect.value;

  if (!selectedModel) {
    ui.showError("Ô parça, escolhe um modelo de IA aí antes de mandar! 🤔");
    return;
  }

  if (!question) {
    ui.showError("Eita! Esqueceu de digitar a pergunta, né? Manda ver! ✍️");
    return;
  }

  getApiResponse(question, selectedModel);
}

// 7. Listeners
selectors.submitBtn.addEventListener("click", handleButtonClick);
selectors.copyBtn.addEventListener("click", handleCopy);
selectors.clearBtn.addEventListener("click", handleClear);
