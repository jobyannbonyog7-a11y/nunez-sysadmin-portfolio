const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

$("#year").textContent = new Date().getFullYear();

// Dark / light theme. The default is dark; selection is saved in this browser.
const savedTheme = localStorage.getItem("ja-portfolio-theme");
if (savedTheme === "light") document.body.classList.add("light");
function updateThemeButton() {
  $("#themeToggle").textContent = document.body.classList.contains("light") ? "☾" : "☼";
  $("#themeToggle").title = document.body.classList.contains("light") ? "Switch to dark mode" : "Switch to light mode";
}
updateThemeButton();
$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("ja-portfolio-theme", document.body.classList.contains("light") ? "light" : "dark");
  updateThemeButton();
  showToast(document.body.classList.contains("light") ? "Light mode enabled" : "Dark mode enabled");
});

// English / Tagalog toggle. Texts are supplied through data-en and data-tl attributes.
let currentLanguage = "en";
$("#languageToggle").addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "tl" : "en";
  $$("[data-en][data-tl]").forEach((element) => {
    element.textContent = element.dataset[currentLanguage];
  });
  document.documentElement.lang = currentLanguage === "en" ? "en" : "tl";
  $("#languageToggle").textContent = currentLanguage === "en" ? "EN / TL" : "TL / EN";
  showToast(currentLanguage === "en" ? "English selected" : "Tagalog selected");
});

// Mobile navigation
$("#menuToggle").addEventListener("click", () => {
  const isOpen = $("#navLinks").classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(isOpen));
  $("#menuToggle").textContent = isOpen ? "✕" : "☰";
});
$$(".nav-links a").forEach((link) => link.addEventListener("click", () => {
  $("#navLinks").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
  $("#menuToggle").textContent = "☰";
}));

// Scroll progress and active section highlighting
window.addEventListener("scroll", () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  $("#progressBar").style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
}, { passive: true });
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    $$(".nav-links a").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { rootMargin: "-35% 0px -55% 0px" });
$$("main section[id]").forEach((section) => sectionObserver.observe(section));

// Fade in cards when they enter the screen
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$(".reveal").forEach((item) => revealObserver.observe(item));

// Safe code playground: only evaluates a tiny set of prewritten demo examples.
// User edits are intentionally not executed as arbitrary JavaScript.
const examples = {
  status: `const system = "Online";\nconst uptime = "99.9%";\n\nconsole.log(\`System status: \${system}\`);\nconsole.log(\`Demo uptime: \${uptime}\`);`,
  storage: `const totalGB = 500;\nconst usedGB = 325;\nconst freeGB = totalGB - usedGB;\n\nconsole.log(\`Total storage: \${totalGB} GB\`);\nconsole.log(\`Used storage: \${usedGB} GB\`);\nconsole.log(\`Free storage: \${freeGB} GB\`);`,
  users: `const user = "student01";\nconst access = "standard";\n\nconsole.log(\`User: \${user}\`);\nconsole.log(\`Access level: \${access}\`);\nconsole.log("Reminder: give only needed permissions.");`
};
const codeEditor = $("#codeEditor");
const codeOutput = $("#codeOutput");
const lineNumbers = $("#lineNumbers");
function updateLineNumbers() {
  const count = codeEditor.value.split("\n").length;
  lineNumbers.innerHTML = Array.from({ length: count }, (_, index) => index + 1).join("<br>");
}
$("#exampleSelect").addEventListener("change", (event) => {
  codeEditor.value = examples[event.target.value];
  updateLineNumbers();
  codeOutput.textContent = "Example loaded. Click “Run code” to see its output.";
});
codeEditor.addEventListener("input", updateLineNumbers);
codeEditor.addEventListener("scroll", () => { lineNumbers.scrollTop = codeEditor.scrollTop; });
$("#runCode").addEventListener("click", () => {
  const selected = $("#exampleSelect").value;
  // We run a known demo, not arbitrary editor text, to keep this learning widget safe.
  const outputByExample = {
    status: "System status: Online\nDemo uptime: 99.9%",
    storage: "Total storage: 500 GB\nUsed storage: 325 GB\nFree storage: 175 GB",
    users: "User: student01\nAccess level: standard\nReminder: give only needed permissions."
  };
  if (codeEditor.value.trim() !== examples[selected].trim()) {
    codeOutput.textContent = "This editor is for experimenting with the example text. To run the safe demo, restore the selected example from the dropdown, then click Run code.";
    showToast("Custom code is not executed in this safe demo");
    return;
  }
  codeOutput.textContent = outputByExample[selected];
  showToast("Demo ran successfully");
});
$("#clearOutput").addEventListener("click", () => { codeOutput.textContent = "Output cleared."; });

// Small accessible toast notifications
let toastTimeout;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}
updateLineNumbers();
