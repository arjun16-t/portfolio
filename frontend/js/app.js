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
  initCursor();
  initTheme();
  initNavbar();
  initTicker();
  initScrambleEffect();
}

/*
========================================
COMPUTER VISION CURSOR MODULE
========================================
*/
const cursorDot = document.querySelector('.cursor-dot');
const cursorFollower = document.querySelector('.cursor-follower');
const cursorLabel = document.querySelector('.cursor-label');

let mouseX = 0;
let mouseY = 0;
let followerX = 0;
let followerY = 0;

// Variables for smooth dot scaling
let dotScale = 1;
let targetDotScale = 1;

let isFraming = false;
let frameTarget = null;

function initCursor() {
    if (!document.querySelector('.custom-cursor') || !window.matchMedia("(pointer: fine)").matches) return;

    // Track mouse coordinates (DOM updates moved to render loop for performance)
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => startFraming(card, 'EXPLORE'));
        card.addEventListener('mouseleave', stopFraming);
    });

    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            e.stopPropagation(); 
            startFraming(link, 'OPEN');
        });
        link.addEventListener('mouseleave', (e) => {
            e.stopPropagation();
            
            // If leaving a link but still inside a card, revert to card framing
            const parentCard = link.closest('.project-card');
            if (parentCard) {
                startFraming(parentCard, 'EXPLORE');
            } else {
                stopFraming();
            }
        });
    });

    renderCursor();
}

function startFraming(element, labelText) {
    isFraming = true;
    frameTarget = element;
    targetDotScale = 2; // Target 2x size
    
    if (cursorLabel) {
        cursorLabel.innerText = labelText;
        cursorLabel.style.opacity = '1';
    }
    setBodyState('is-cursor-framing', true);
}

function stopFraming() {
    isFraming = false;
    frameTarget = null;
    targetDotScale = 1; // Target normal size
    
    if (cursorLabel) {
        cursorLabel.style.opacity = '0';
    }
    setBodyState('is-cursor-framing', false);
}

function renderCursor() {
    // 1. Smoothly interpolate (lerp) the dot's scale
    dotScale += (targetDotScale - dotScale) * 0.2;

    // 2. Apply exact mouse position + smoothed scale to the dot simultaneously
    if (cursorDot) {
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${dotScale})`;
    }
    
    // 3. Apply exact mouse position to the label
    if (cursorLabel) {
        cursorLabel.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, 25px)`;
    }

    if (isFraming && frameTarget) {
        const rect = frameTarget.getBoundingClientRect();
        const targetCenterX = rect.left + (rect.width / 2);
        const targetCenterY = rect.top + (rect.height / 2);
        
        followerX += (targetCenterX - followerX) * 0.2;
        followerY += (targetCenterY - followerY) * 0.2;
        
        if (cursorFollower) {
            cursorFollower.style.width = `${rect.width + 30}px`;
            cursorFollower.style.height = `${rect.height + 30}px`;
        }
    } else {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        
        if (cursorFollower) {
            cursorFollower.style.width = '40px';
            cursorFollower.style.height = '40px';
        }
    }

    if (cursorFollower) {
        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(renderCursor);
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
  const scrollY = window.scrollY;

  setBodyState(
    "is-scrolled",
    window.scrollY > NAVBAR_SCROLL_OFFSET
  );

  const progressEl = document.getElementById("scroll-progress");
  if (progressEl) {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollY / scrollHeight) * 100;
      progressEl.style.width = `${progress}%`;
  }
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

/*
========================================
SCROLL TICKER (INERTIA)
========================================
*/
const tickerElement = document.getElementById("work-ticker");

let tickerCurrentX = 0;
let tickerTargetX = 0;
const tickerSpeed = 0.8;
const tickerLerp = 0.08;
let isTickerRunning = false;

function initTicker() {
  if (!tickerElement) return;

  // Start the render loop only once
  if (!isTickerRunning) {
    isTickerRunning = true;
    renderTicker();
  }
}

function renderTicker() {
  // 1. Get current scroll position
  const scrollY = window.scrollY;

  // 2. Map scroll down to negative X (moving left)
  tickerTargetX = -scrollY * tickerSpeed;

  // 3. Smooth interpolation (lerp) towards the target
  tickerCurrentX += (tickerTargetX - tickerCurrentX) * tickerLerp;

  // 4. Apply the hardware-accelerated transform
  tickerElement.style.transform = `translate3d(${tickerCurrentX}px, 0, 0)`;

  // 5. Loop seamlessly at 60fps
  requestAnimationFrame(renderTicker);
}

/*
========================================
BINARY TEXT SCRAMBLE EFFECT
========================================
*/
function initScrambleEffect() {
    const scrambleElements = document.querySelectorAll('.scramble-text');
    if (scrambleElements.length === 0) return;

    // The characters to use during the scramble phase
    const chars = "01"; 
    
    // Create an observer to trigger the effect when the card enters the viewport
    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Trigger the scramble
                runScramble(entry.target, chars);
                
                // Unobserve so it only runs once per card reload to avoid visual fatigue
                observerInstance.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2 // Triggers when 20% of the element is visible
    });

    scrambleElements.forEach(el => observer.observe(el));
}

function runScramble(element, chars) {
    const originalText = element.getAttribute('data-text');
    let iteration = 0;
    
    // Clear any existing intervals if triggered rapidly
    clearInterval(element.scrambleInterval);
    
    element.scrambleInterval = setInterval(() => {
        element.innerText = originalText
            .split("")
            .map((letter, index) => {
                // Preserve spaces automatically
                if (letter === " ") return " ";
                
                // If the iteration has passed this index, reveal the true letter
                if (index < iteration) {
                    return originalText[index];
                }
                
                // Otherwise, show a random binary character
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");
        
        // Stop the interval when all letters are revealed
        if (iteration >= originalText.length) {
            clearInterval(element.scrambleInterval);
        }
        
        // Increase iteration (lower number = slower reveal)
        iteration += 0.5; 
    }, 30); // Runs every 30ms
}