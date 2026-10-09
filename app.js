(function () {
  const $ = id => document.getElementById(id);
  const input = $("expression");
  const result = $("result");
  const info = $("result-info");
  const history = $("history");
  const fractionMode = $("fractions");
  const copyButton = $("copy-result");
  const copyLabel = $("copy-label");

  // Ans uses the last saved result. Live previews never change it.
  let lastSaved = ExactCalculator.rational(0n);
  let current = null;
  let items = [];

  function resetCopyLabel() {
    copyLabel.textContent = "Copy result";
  }

  function show(value) {
    current = value;
    result.classList.remove("error");
    copyButton.disabled = false;
    resetCopyLabel();

    if (fractionMode.checked) {
      result.textContent = ExactCalculator.fraction(value);
      info.textContent = "Exact reduced fraction · No rounding";
      return;
    }

    const formatted = ExactCalculator.decimalString(value);
    result.textContent = formatted.text;
    if (formatted.fractionFallback) {
      info.textContent = "Repeating expansion exceeds 2,000 digits; exact fraction shown instead.";
    } else if (formatted.repeating) {
      info.textContent = "Repeating digits use the Unicode vinculum (U+0305) · Exact";
    } else {
      info.textContent = "Terminating decimal · Exact";
    }
  }

  function updateLive() {
    const expression = input.value.trim();
    if (!expression) {
      current = null;
      result.classList.remove("error");
      result.textContent = "0";
      info.textContent = "Type an expression to see its exact result.";
      copyButton.disabled = true;
      resetCopyLabel();
      return;
    }

    try {
      show(ExactCalculator.evaluate(expression, lastSaved));
    } catch (error) {
      current = null;
      result.textContent = "—";
      result.classList.add("error");
      info.textContent = error.message;
      copyButton.disabled = true;
      resetCopyLabel();
    }
  }

  function saveToHistory() {
    if (current === null) return;
    const expression = input.value.trim();
    if (!expression) return;
    const answer = ExactCalculator.fraction(current);
    lastSaved = current;
    if (items[0]?.expression !== expression || items[0]?.answer !== answer) {
      items.unshift({ expression, answer });
      items = items.slice(0, 20);
      renderHistory();
    }
  }

  function renderHistory() {
    history.replaceChildren();
    $("history-count").textContent = items.length + " calculation" + (items.length === 1 ? "" : "s");

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "Your calculations will appear here.";
      history.append(empty);
      return;
    }

    for (const item of items) {
      const button = document.createElement("button");
      button.className = "history-item";
      button.type = "button";
      button.title = "Use this expression";
      const expression = document.createElement("span");
      expression.className = "history-expression";
      expression.textContent = item.expression;
      const answer = document.createElement("span");
      answer.className = "history-answer";
      answer.textContent = item.answer;
      button.append(expression, answer);
      button.addEventListener("click", () => {
        input.value = item.expression;
        updateLive();
        input.focus();
      });
      history.append(button);
    }
  }

  input.addEventListener("input", updateLive);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      saveToHistory();
    }
  });
  fractionMode.addEventListener("change", () => {
    if (current !== null) show(current);
  });
  copyButton.addEventListener("click", async () => {
    if (current === null) return;
    // Copy exactly what the user sees, including actual U+0305 characters.
    const text = result.textContent;
    try {
      await navigator.clipboard.writeText(text);
      copyLabel.textContent = "Copied!";
    } catch {
      copyLabel.textContent = "Copy failed";
      info.textContent = "Clipboard unavailable. You can select and copy the result manually.";
    }
  });
  $("clear-history").addEventListener("click", () => {
    items = [];
    renderHistory();
  });

  document.querySelectorAll("[data-key],[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "save") {
        saveToHistory();
        return;
      }
      if (action === "clear") {
        input.value = "";
      } else if (action === "backspace") {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        if (start !== end) input.setRangeText("", start, end, "start");
        else if (start > 0) input.setRangeText("", start - 1, start, "start");
      } else {
        const key = button.dataset.key;
        if (key === "π") {
          info.textContent = "π is irrational and cannot be represented as an exact fraction.";
          return;
        }
        input.setRangeText(key, input.selectionStart, input.selectionEnd, "end");
      }
      updateLive();
      input.focus();
    });
  });

  updateLive();
})();
