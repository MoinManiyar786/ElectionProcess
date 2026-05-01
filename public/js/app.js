"use strict";

/**
 * Election Education Assistant — Frontend Application
 * Accessible, performant SPA with Google Cloud integrations
 */
(function () {
  /* ========== State ========== */
  const state = {
    currentSection: "timeline",
    chatSessionId: null,
    chatLoading: false,
    quizSessionId: null,
    quizQuestions: [],
    quizCurrentIndex: 0,
    quizAnswered: false,
    selectedDifficulty: "all",
    selectedLanguage: "en",
    phases: [],
    faqs: [],
    glossary: [],
    ttsPlaying: false,
    currentAudio: null,
  };

  /* ========== DOM References ========== */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const announce = (msg) => {
    const el = $("#announcements");
    if (el) {
      el.textContent = "";
      requestAnimationFrame(() => { el.textContent = msg; });
    }
  };

  /* ========== API Helper ========== */
  async function api(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  }

  /* ========== Navigation ========== */
  function initNavigation() {
    $$(".nav__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = btn.dataset.section;
        if (section === state.currentSection) return;
        switchSection(section);
      });
    });
  }

  function switchSection(sectionId) {
    $$(".nav__btn").forEach((btn) => {
      const isActive = btn.dataset.section === sectionId;
      btn.classList.toggle("nav__btn--active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    $$(".section").forEach((sec) => {
      sec.classList.toggle("section--active", sec.id === `section-${sectionId}`);
    });

    state.currentSection = sectionId;
    announce(`Navigated to ${sectionId} section`);

    const target = $(`#section-${sectionId}`);
    if (target) {
      target.focus({ preventScroll: true });
    }
  }

  /* ========== Language / Translation ========== */
  function initLanguageSelector() {
    const select = $("#language-select");
    if (!select) return;

    select.addEventListener("change", (e) => {
      state.selectedLanguage = e.target.value;
      announce(`Language changed to ${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  async function translateMessage(text, targetLang) {
    if (!targetLang || targetLang === "en") return text;

    try {
      const result = await api("/google/translate", {
        method: "POST",
        body: JSON.stringify({ text, targetLanguage: targetLang }),
      });

      if (result.success && result.data) {
        return result.data.translatedText;
      }
      return text;
    } catch (error) {
      console.warn("Translation failed:", error.message);
      return text;
    }
  }

  /* ========== Text-to-Speech ========== */
  async function speakText(text, button) {
    if (state.ttsPlaying && state.currentAudio) {
      state.currentAudio.pause();
      state.currentAudio = null;
      state.ttsPlaying = false;
      if (button) button.classList.remove("chat__action-btn--active");
      return;
    }

    try {
      if (button) button.classList.add("chat__action-btn--active");
      state.ttsPlaying = true;

      const result = await api("/google/tts", {
        method: "POST",
        body: JSON.stringify({
          text: text.slice(0, 2000),
          languageCode: state.selectedLanguage === "en" ? "en-US" : state.selectedLanguage,
          ssmlGender: "FEMALE",
        }),
      });

      if (result.success && result.data) {
        const audio = new Audio(`data:audio/mpeg;base64,${result.data.audioContent}`);
        state.currentAudio = audio;

        audio.addEventListener("ended", () => {
          state.ttsPlaying = false;
          state.currentAudio = null;
          if (button) button.classList.remove("chat__action-btn--active");
        });

        audio.addEventListener("error", () => {
          state.ttsPlaying = false;
          state.currentAudio = null;
          if (button) button.classList.remove("chat__action-btn--active");
        });

        await audio.play();
        announce("Playing audio");
      }
    } catch (error) {
      state.ttsPlaying = false;
      state.currentAudio = null;
      if (button) button.classList.remove("chat__action-btn--active");
      console.warn("TTS failed:", error.message);
      announce("Text-to-speech is unavailable");
    }
  }

  /* ========== Timeline ========== */
  async function loadTimeline() {
    const container = $("#timeline-container");
    try {
      const result = await api("/election/phases");
      state.phases = result.data;
      renderTimeline(container, result.data);
    } catch (error) {
      container.innerHTML = `<p role="alert" class="chat__message--error" style="padding: 1rem;">Failed to load timeline: ${escapeHtml(error.message)}</p>`;
    }
  }

  function renderTimeline(container, phases) {
    const loading = $("#timeline-loading");
    if (loading) loading.remove();

    const fragment = document.createDocumentFragment();

    phases.forEach((phase, index) => {
      const item = document.createElement("div");
      item.className = "timeline__item";
      item.setAttribute("role", "listitem");
      item.innerHTML = `
        <div class="timeline__marker" aria-hidden="true">${index + 1}</div>
        <div class="timeline__card" tabindex="0" role="button"
             aria-expanded="false"
             aria-label="${escapeHtml(phase.title)} — click to expand details">
          <div class="timeline__card-header">
            <span class="timeline__card-icon" aria-hidden="true">${phase.icon}</span>
            <h3 class="timeline__card-title">${escapeHtml(phase.title)}</h3>
          </div>
          <span class="timeline__card-timeline">${escapeHtml(phase.timeline)}</span>
          <p class="timeline__card-description">${escapeHtml(phase.description)}</p>
          <div class="timeline__card-details" id="details-${phase.id}">
            <ul>
              ${phase.details.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
            </ul>
            ${phase.keyDates && phase.keyDates.length > 0 ? `
              <div class="timeline__card-keydates">
                <h4>Key Dates</h4>
                ${phase.keyDates.map((d) => `<p>${escapeHtml(d)}</p>`).join("")}
              </div>
            ` : ""}
          </div>
          <button class="timeline__card-toggle" aria-controls="details-${phase.id}">
            Show Details ▼
          </button>
        </div>
      `;

      const card = item.querySelector(".timeline__card");
      const toggle = item.querySelector(".timeline__card-toggle");
      const details = item.querySelector(".timeline__card-details");

      function toggleDetails() {
        const isOpen = details.classList.contains("timeline__card-details--open");
        details.classList.toggle("timeline__card-details--open");
        card.setAttribute("aria-expanded", String(!isOpen));
        toggle.textContent = isOpen ? "Show Details ▼" : "Hide Details ▲";
        announce(isOpen ? `${phase.title} details collapsed` : `${phase.title} details expanded`);
      }

      card.addEventListener("click", (e) => {
        if (e.target === toggle || toggle.contains(e.target)) return;
        toggleDetails();
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleDetails();
        }
      });

      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDetails();
      });

      fragment.appendChild(item);
    });

    container.appendChild(fragment);
    announce("Election timeline loaded with " + phases.length + " phases");
  }

  /* ========== Chat ========== */
  function initChat() {
    const form = $("#chat-form");
    const input = $("#chat-input");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (message && !state.chatLoading) {
        sendChatMessage(message);
        input.value = "";
      }
    });

    $$(".chat__suggestion").forEach((btn) => {
      btn.addEventListener("click", () => {
        const message = btn.dataset.message;
        if (message && !state.chatLoading) {
          sendChatMessage(message);
        }
      });
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event("submit"));
      }
    });

    initChatActions();
  }

  function initChatActions() {
    const container = $("#chat-messages");
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".chat__action-btn");
      if (!btn) return;

      const message = btn.closest(".chat__message");
      const contentEl = message.querySelector(".chat__message-content");
      const text = contentEl ? contentEl.textContent : message.textContent;
      const action = btn.dataset.action;

      if (action === "tts") {
        speakText(text, btn);
      } else if (action === "translate") {
        handleTranslateAction(text, contentEl, btn);
      }
    });
  }

  async function handleTranslateAction(text, contentEl, btn) {
    if (state.selectedLanguage === "en") {
      announce("Select a language from the dropdown to translate");
      return;
    }

    btn.classList.add("chat__action-btn--active");

    try {
      const translated = await translateMessage(text, state.selectedLanguage);
      if (contentEl && translated !== text) {
        const original = contentEl.innerHTML;
        contentEl.innerHTML = `<div class="translated-text">${escapeHtml(translated)}</div><div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;">Translated from English</div>`;

        setTimeout(() => {
          contentEl.innerHTML = original;
          btn.classList.remove("chat__action-btn--active");
        }, 10000);
      }
    } catch (error) {
      announce("Translation failed");
    } finally {
      btn.classList.remove("chat__action-btn--active");
    }
  }

  function addChatMessage(content, role) {
    const container = $("#chat-messages");
    const msg = document.createElement("div");
    msg.className = `chat__message chat__message--${role}`;

    if (role === "assistant") {
      msg.innerHTML = `
        <div class="chat__message-content">${formatMarkdown(content)}</div>
        <div class="chat__message-actions">
          <button class="chat__action-btn" data-action="tts" aria-label="Listen to this message" title="Listen">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 5h2l4-3v12l-4-3H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/><path d="M11 5s1.5 1 1.5 3-1.5 3-1.5 3M13 3s2.5 2 2.5 5-2.5 5-2.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <button class="chat__action-btn" data-action="translate" aria-label="Translate this message" title="Translate">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 3h7M5.5 1v2M3.5 3s.5 3 3.5 5M7.5 3s-.5 3-3.5 5M8 14l3-7 3 7M9 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      `;
    } else if (role === "user") {
      msg.innerHTML = `<div class="chat__message-content">${escapeHtml(content)}</div>`;
    } else {
      msg.innerHTML = `<div class="chat__message-content">${escapeHtml(content)}</div>`;
    }

    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping(visible) {
    const typing = $("#chat-typing");
    typing.classList.toggle("chat__typing--visible", visible);
    if (visible) {
      const container = $("#chat-messages");
      container.scrollTop = container.scrollHeight;
    }
  }

  async function sendChatMessage(message) {
    state.chatLoading = true;
    const sendBtn = $("#chat-send");
    sendBtn.disabled = true;
    $("#chat-status").textContent = "Thinking...";

    addChatMessage(message, "user");
    showTyping(true);

    try {
      const result = await api("/chat/message", {
        method: "POST",
        body: JSON.stringify({
          message: message,
          sessionId: state.chatSessionId || undefined,
        }),
      });

      showTyping(false);

      if (result.success && result.data) {
        state.chatSessionId = result.data.sessionId;
        addChatMessage(result.data.response, "assistant");
        announce("Assistant responded");
      }
    } catch (error) {
      showTyping(false);
      addChatMessage(`Sorry, I encountered an error: ${normalizeErrorMessage(error.message)}`, "error");
      announce("Error sending message");
    } finally {
      state.chatLoading = false;
      sendBtn.disabled = false;
      $("#chat-status").textContent = "Online";
    }
  }

  /* ========== Quiz ========== */
  function initQuiz() {
    $$(".quiz__difficulty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".quiz__difficulty-btn").forEach((b) => {
          b.classList.remove("quiz__difficulty-btn--selected");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("quiz__difficulty-btn--selected");
        btn.setAttribute("aria-checked", "true");
        state.selectedDifficulty = btn.dataset.difficulty;
      });
    });

    $("#quiz-start-btn").addEventListener("click", startQuiz);
    $("#quiz-next-btn").addEventListener("click", nextQuestion);
    $("#quiz-retry-btn").addEventListener("click", resetQuiz);
  }

  async function startQuiz() {
    try {
      const body = { count: 10 };
      if (state.selectedDifficulty !== "all") {
        body.difficulty = state.selectedDifficulty;
      }

      const result = await api("/quiz/start", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (result.success && result.data) {
        state.quizSessionId = result.data.sessionId;
        state.quizQuestions = result.data.questions;
        state.quizCurrentIndex = 0;
        state.quizAnswered = false;

        $("#quiz-start").style.display = "none";
        const container = $("#quiz-container");
        container.classList.add("quiz__container--active");
        container.style.display = "block";
        $("#quiz-results").classList.remove("quiz__results--visible");
        $("#quiz-results").style.display = "none";

        showQuestion(0);
        announce("Quiz started with " + result.data.totalQuestions + " questions");
      }
    } catch (error) {
      announce("Failed to start quiz: " + error.message);
    }
  }

  function showQuestion(index) {
    const q = state.quizQuestions[index];
    if (!q) return;

    state.quizAnswered = false;
    const total = state.quizQuestions.length;
    const progress = Math.round(((index) / total) * 100);

    $("#quiz-progress-fill").style.width = `${progress}%`;
    $("#quiz-progress-text").textContent = `${index + 1} / ${total}`;

    const progressBar = $(".quiz__progress");
    progressBar.setAttribute("aria-valuenow", String(progress));

    const badge = $("#quiz-difficulty-badge");
    badge.textContent = q.difficulty;
    badge.className = `quiz__question-badge quiz__question-badge--${q.difficulty}`;

    $("#quiz-question-text").textContent = q.question;

    const optionsContainer = $("#quiz-options");
    optionsContainer.innerHTML = "";

    const letters = ["A", "B", "C", "D"];
    q.options.forEach((option, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz__option";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", "false");
      btn.innerHTML = `
        <span class="quiz__option-letter" aria-hidden="true">${letters[i]}</span>
        <span>${escapeHtml(option)}</span>
      `;
      btn.addEventListener("click", () => submitQuizAnswer(q.id, i, btn));
      optionsContainer.appendChild(btn);
    });

    $("#quiz-explanation").classList.remove("quiz__explanation--visible");
    $("#quiz-next-btn").classList.remove("quiz__next-btn--visible");

    announce(`Question ${index + 1} of ${total}: ${q.question}`);
  }

  async function submitQuizAnswer(questionId, selectedIndex, btnElement) {
    if (state.quizAnswered) return;
    state.quizAnswered = true;

    const startTime = Date.now();

    $$(".quiz__option").forEach((btn) => {
      btn.disabled = true;
    });

    btnElement.classList.add("quiz__option--selected");
    btnElement.setAttribute("aria-checked", "true");

    try {
      const result = await api(`/quiz/submit/${state.quizSessionId}`, {
        method: "POST",
        body: JSON.stringify({
          questionId,
          selectedIndex,
          timeTaken: Date.now() - startTime,
        }),
      });

      if (result.success && result.data) {
        const { correct, explanation, correctIndex } = result.data;

        const options = $$(".quiz__option");
        options.forEach((btn, i) => {
          if (i === correctIndex) {
            btn.classList.add("quiz__option--correct");
          }
        });

        if (!correct) {
          btnElement.classList.add("quiz__option--incorrect");
        }

        const expEl = $("#quiz-explanation");
        $("#quiz-explanation-title").textContent = correct ? "✓ Correct!" : "✗ Incorrect";
        $("#quiz-explanation-title").style.color = correct ? "var(--color-success)" : "var(--color-error)";
        $("#quiz-explanation-text").textContent = explanation;
        expEl.classList.add("quiz__explanation--visible");

        const isLast = state.quizCurrentIndex >= state.quizQuestions.length - 1;
        const nextBtn = $("#quiz-next-btn");
        nextBtn.textContent = isLast ? "See Results →" : "Next Question →";
        nextBtn.classList.add("quiz__next-btn--visible");
        nextBtn.focus();

        announce(correct ? "Correct! " + explanation : "Incorrect. " + explanation);
      }
    } catch (error) {
      announce("Error submitting answer: " + error.message);
    }
  }

  async function nextQuestion() {
    state.quizCurrentIndex++;
    if (state.quizCurrentIndex >= state.quizQuestions.length) {
      await showResults();
    } else {
      showQuestion(state.quizCurrentIndex);
    }
  }

  async function showResults() {
    try {
      const result = await api(`/quiz/results/${state.quizSessionId}`);
      if (result.success && result.data) {
        const { percentage, grade, feedback } = result.data;

        $("#quiz-container").classList.remove("quiz__container--active");
        $("#quiz-container").style.display = "none";

        const resultsEl = $("#quiz-results");
        resultsEl.style.display = "block";
        resultsEl.classList.add("quiz__results--visible");

        $("#quiz-results-score").textContent = `${percentage}%`;
        $("#quiz-results-grade").textContent = `Grade: ${grade}`;
        $("#quiz-results-feedback").textContent = feedback;

        announce(`Quiz complete! Score: ${percentage}%. Grade: ${grade}. ${feedback}`);
      }
    } catch (error) {
      announce("Error loading results: " + error.message);
    }
  }

  function resetQuiz() {
    state.quizSessionId = null;
    state.quizQuestions = [];
    state.quizCurrentIndex = 0;
    state.quizAnswered = false;

    $("#quiz-start").style.display = "block";
    $("#quiz-container").classList.remove("quiz__container--active");
    $("#quiz-container").style.display = "none";
    $("#quiz-results").classList.remove("quiz__results--visible");
    $("#quiz-results").style.display = "none";

    announce("Quiz reset. Choose difficulty and start again.");
  }

  /* ========== FAQ ========== */
  async function loadFAQs() {
    const container = $("#faq-list");
    try {
      const result = await api("/election/faqs");
      state.faqs = result.data;
      renderFAQs(container, result.data);
    } catch (error) {
      container.innerHTML = `<p role="alert" class="chat__message--error" style="padding: 1rem;">Failed to load FAQs: ${escapeHtml(error.message)}</p>`;
    }
  }

  function renderFAQs(container, faqs) {
    const loading = $("#faq-loading");
    if (loading) loading.remove();

    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    faqs.forEach((faq, index) => {
      const item = document.createElement("div");
      item.className = "faq__item";
      item.setAttribute("role", "listitem");
      item.innerHTML = `
        <button class="faq__question"
                aria-expanded="false"
                aria-controls="faq-answer-${index}"
                id="faq-btn-${index}">
          <span>${escapeHtml(faq.question)}</span>
          <span class="faq__arrow" aria-hidden="true">▼</span>
        </button>
        <div class="faq__answer" id="faq-answer-${index}" role="region" aria-labelledby="faq-btn-${index}">
          ${escapeHtml(faq.answer)}
        </div>
      `;

      const btn = item.querySelector(".faq__question");
      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("faq__item--open");
        item.classList.toggle("faq__item--open");
        btn.setAttribute("aria-expanded", String(!isOpen));
        announce(isOpen ? "Answer collapsed" : "Answer expanded");
      });

      fragment.appendChild(item);
    });

    container.appendChild(fragment);
  }

  function initFAQSearch() {
    const input = $("#faq-search");
    if (!input) return;

    let debounceTimer = null;

    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim().toLowerCase();
        const container = $("#faq-list");

        if (!query) {
          renderFAQs(container, state.faqs);
          announce(`Showing all ${state.faqs.length} FAQs`);
          return;
        }

        const filtered = state.faqs.filter(
          (f) =>
            f.question.toLowerCase().includes(query) ||
            f.answer.toLowerCase().includes(query)
        );

        renderFAQs(container, filtered);
        announce(`${filtered.length} FAQs match "${query}"`);
      }, 300);
    });
  }

  /* ========== Glossary ========== */
  async function loadGlossary() {
    const container = $("#glossary-grid");
    try {
      const result = await api("/election/glossary");
      state.glossary = result.data;
      renderGlossary(container, result.data);
    } catch (error) {
      container.innerHTML = `<p role="alert" class="chat__message--error" style="padding: 1rem;">Failed to load glossary: ${escapeHtml(error.message)}</p>`;
    }
  }

  function renderGlossary(container, terms) {
    const loading = $("#glossary-loading");
    if (loading) loading.remove();

    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    terms.forEach((term) => {
      const card = document.createElement("div");
      card.className = "glossary__card";
      card.setAttribute("role", "listitem");
      card.innerHTML = `
        <h3 class="glossary__term">${escapeHtml(term.term)}</h3>
        <p class="glossary__definition">${escapeHtml(term.definition)}</p>
        ${term.relatedTerms.length > 0 ? `
          <div class="glossary__related" aria-label="Related terms">
            ${term.relatedTerms.map((t) => `<span class="glossary__tag">${escapeHtml(t)}</span>`).join("")}
          </div>
        ` : ""}
      `;
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  }

  function initGlossarySearch() {
    const input = $("#glossary-search");
    let debounceTimer = null;

    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim().toLowerCase();
        const container = $("#glossary-grid");

        if (!query) {
          renderGlossary(container, state.glossary);
          announce(`Showing all ${state.glossary.length} glossary terms`);
          return;
        }

        const filtered = state.glossary.filter(
          (t) =>
            t.term.toLowerCase().includes(query) ||
            t.definition.toLowerCase().includes(query)
        );

        renderGlossary(container, filtered);
        announce(`${filtered.length} glossary terms match "${query}"`);
      }, 300);
    });
  }

  /* ========== Utilities ========== */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/\n\n/g, "</p><p>");
    html = html.replace(/\n/g, "<br>");
    html = `<p>${html}</p>`;
    return html;
  }

  function normalizeErrorMessage(message) {
    if (!message) {
      return "Something went wrong.";
    }

    let normalized = String(message).trim();
    normalized = normalized.replace(/\s+/g, " ");
    normalized = normalized.replace(/(\.?\s*Please try again\.?)+$/i, "");
    normalized = normalized.replace(/[. ]+$/, "");

    return normalized ? `${normalized}.` : "Something went wrong.";
  }

  /* ========== Keyboard Navigation ========== */
  function initKeyboardNav() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const active = document.activeElement;
        if (active && active.closest(".chat")) {
          $("#chat-input").blur();
        }
        if (state.ttsPlaying && state.currentAudio) {
          state.currentAudio.pause();
          state.currentAudio = null;
          state.ttsPlaying = false;
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key >= "1" && e.key <= "5") {
        e.preventDefault();
        const sections = ["timeline", "chat", "quiz", "faq", "glossary"];
        const idx = parseInt(e.key) - 1;
        if (sections[idx]) {
          switchSection(sections[idx]);
        }
      }
    });
  }

  /* ========== Initialize ========== */
  function init() {
    initNavigation();
    initLanguageSelector();
    initChat();
    initQuiz();
    initFAQSearch();
    initGlossarySearch();
    initKeyboardNav();

    loadTimeline();
    loadFAQs();
    loadGlossary();

    announce("Election Education Assistant loaded. Navigate using the menu above.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
