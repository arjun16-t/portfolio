/*
========================================
BODY STATES

is-loading         Initial page load (reserved for future ML boot sequence)
is-scrolled        User has scrolled past navbar threshold
theme-e-ink        The E-Ink (light) system mode is active
========================================
*/

/*
========================================
CONSTANTS
========================================
*/

const navbar = document.querySelector("nav");
const themeToggleBtn = document.getElementById("theme-toggle");

const THEME_STORAGE_KEY = "portfolio-theme-preference";
const NAVBAR_SCROLL_OFFSET = 50;

/*
========================================
BODY STATE HELPERS
========================================
*/

function setBodyState(state, active) {
  document.body.classList.toggle(state, active);
}

function hasBodyState(state) {
  return document.body.classList.contains(state);
}

/*
========================================
PAGE HELPERS
========================================
*/
// Reserved for when multiple HTML pages (e.g., /work, /lab) are added
function getCurrentPage() {
  return document.body.dataset.page || "home";
}

function isCurrentPage(page) {
  return getCurrentPage() === page;
}

/*
========================================
INITIALIZATION
========================================
*/

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  console.log(">> SYSTEM_READY: Booting modules...");
  
  initTheme();
  initNavbar();
  
  // Future modules to initialize
  // initMLLab();
  // initScrollAnimations();
}

/*
========================================
NAVBAR SCROLL STATE
========================================
*/

function initNavbar() {
  if (!navbar) return;

  // Run once on load to catch initial state
  updateNavbar();

  // Listen for scroll events
  window.addEventListener("scroll", updateNavbar, {
    passive: true,
  });
}

function updateNavbar() {
  setBodyState(
    "is-scrolled",
    window.scrollY > NAVBAR_SCROLL_OFFSET
  );
}

/*
========================================
SYSTEM THEME TOGGLE
========================================
*/

function initTheme() {
  if (!themeToggleBtn) return;

  // 1. Load preference from storage
  const savedTheme = loadTheme();

  // 2. Apply the initial theme
  applyTheme(savedTheme);

  // 3. Bind the click event
  themeToggleBtn.addEventListener("click", handleThemeToggle);
}

function loadTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) ?? "deep-space";
}

function handleThemeToggle(event) {
  event.preventDefault();
  
  // Determine new theme based on current state
  const isCurrentlyEInk = hasBodyState("theme-e-ink");
  const newTheme = isCurrentlyEInk ? "deep-space" : "e-ink";
  
  applyTheme(newTheme);
}

function applyTheme(theme) {
  const isEInk = theme === "e-ink";
  
  // Update Body State
  setBodyState("theme-e-ink", isEInk);

  // Persist to Storage
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  // Update UI Element (Button Text)
  if (themeToggleBtn) {
    themeToggleBtn.textContent = isEInk 
        ? "System Mode: Deep Space" 
        : "System Mode: E-Ink";
  }
}