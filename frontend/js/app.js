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
    initSocialSidebar();
    initScrambleEffect();

    initAboutTabs();
    initTerminal();
    initTerminalTyping();
    initScrollReveal();
    initClock();

    initLabTerminal();

    initToolkit();
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
    targetDotScale = 1.3; // Target 2x size
    
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
TRANSFORMING SOCIAL SIDEBAR OBSERVER
========================================
*/
function initSocialSidebar() {
    const sidebar = document.getElementById('social-sidebar');
    const hero = document.querySelector('.hero');
    const footer = document.getElementById('footer');
    
    if (!sidebar || !hero || !footer) return;

    let isHeroVisible = true; // Assume true on initial load
    let isFooterVisible = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target === hero) {
                isHeroVisible = entry.isIntersecting;
            }
            if (entry.target === footer) {
                isFooterVisible = entry.isIntersecting;
            }
        });

        // Hide the sidebar if the user is in the Hero OR the Footer
        if (isHeroVisible || isFooterVisible) {
            sidebar.classList.add('is-hidden');
        } else {
            sidebar.classList.remove('is-hidden');
        }
    }, { 
        threshold: 0.05 // Triggers as soon as 5% of the section is visible
    });

    observer.observe(hero);
    observer.observe(footer);
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

/*
========================================
UNIVERSAL TICKER ANIMATION
========================================
*/
function initTicker() {
    // Select both the sticky ticker (work) and the normal scrolling ticker (about)
    const tickers = document.querySelectorAll('.work-ticker, .scroll-ticker');
    
    if (tickers.length === 0) return;

    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const scrolled = window.scrollY;
            
            tickers.forEach((ticker) => {
                // Adjust the multiplier (0.3) to control the horizontal speed
                ticker.style.transform = `translate3d(${-scrolled * 0.3}px, 0, 0)`;
            });
        });
    }, { passive: true });
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

/*
========================================
ABOUT TABS & DATA INJECTION
========================================
*/
function initAboutTabs() {
    const tabBtns = document.querySelectorAll('.about-tab-btn');
    const panes = document.querySelectorAll('.about-pane');
    const timelineContainer = document.getElementById('timeline-container');
    const credentialsContainer = document.getElementById('credentials-container');

    if (!tabBtns.length || !timelineContainer || !credentialsContainer) return;

    // 1. Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');

            // Reset active states
            tabBtns.forEach(b => b.classList.remove('is-active'));
            panes.forEach(p => p.classList.remove('is-active'));

            // Set new active states
            btn.classList.add('is-active');
            document.getElementById(`pane-${target}`).classList.add('is-active');
        });
    });

    // 2. Inject Experience Data
    if (typeof EXPERIENCE_DATA !== 'undefined') {
        EXPERIENCE_DATA.forEach(exp => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const descList = exp.description.map(d => `<li>${d}</li>`).join('');

            item.innerHTML = `
                <span class="timeline-date">${exp.date}</span>
                <h3 class="timeline-role">${exp.role}</h3>
                <p class="timeline-company">${exp.company}</p>
                <ul class="timeline-desc">
                    ${descList}
                </ul>
            `;
            timelineContainer.appendChild(item);
        });
    }

    // 3. Inject Credentials Data
    if (typeof CREDENTIALS_DATA !== 'undefined') {
        CREDENTIALS_DATA.forEach(cred => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            item.innerHTML = `
                <span class="timeline-date">${cred.date}</span>
                <h3 class="timeline-role">${cred.title}</h3>
                <p class="timeline-company">> ISSUER: ${cred.issuer}</p>
                <div style="margin-top: 1rem;">
                    <a href="${cred.link}" target="_blank" class="credential-verify-btn">[↗] VERIFY_CERT</a>
                </div>
            `;
            credentialsContainer.appendChild(item);
        });
    }

    // 4. Center-Focus Intersection Observer
    // Applies to both the Timeline and Credentials containers
    const scrollContainers = [timelineContainer, credentialsContainer];
    
    scrollContainers.forEach(container => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-active');
                } else {
                    entry.target.classList.remove('is-active');
                }
            });
        }, {
            root: container,
            // Triggers specifically when the item hits the middle 10% of the scroll window
            rootMargin: '-45% 0px -45% 0px', 
            threshold: 0
        });

        // Observe every generated item inside the container
        container.querySelectorAll('.timeline-item').forEach(item => {
            observer.observe(item);
        });
    });
}

/*
========================================
ABOUT TERMINAL EXPANDER
========================================
*/
function initTerminal() {
    const toggleBtn = document.getElementById('terminal-toggle');
    const leftColumn = document.querySelector('.about__left');
    
    if (!toggleBtn || !leftColumn) return;

    toggleBtn.addEventListener('click', () => {
        const isExpanded = leftColumn.classList.contains('is-expanded');
        
        if (isExpanded) {
            leftColumn.classList.remove('is-expanded');
            toggleBtn.innerText = '[+] EXPAND';
        } else {
            leftColumn.classList.add('is-expanded');
            toggleBtn.innerText = '[-] COLLAPSE';
        }
    });
}

/*
========================================
SCROLL-SCRUB TEXT REVEAL
========================================
*/
function initScrollReveal() {
    const bioText = document.getElementById('scroll-bio');
    if (!bioText) return;

    // Split text into words while keeping spaces
    const words = bioText.innerText.split(' ');
    bioText.innerHTML = '';
    
    words.forEach(word => {
        const span = document.createElement('span');
        span.classList.add('reveal-word');
        span.innerText = word + ' '; 
        bioText.appendChild(span);
    });

    const wordSpans = bioText.querySelectorAll('.reveal-word');

    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const rect = bioText.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Map the scroll progress perfectly
            // Starts revealing when text is 85% down the screen
            // Finishes fully revealing when it reaches 30% down the screen
            const startReveal = windowHeight * 0.85;
            const endReveal = windowHeight * 0.30;
            
            let progress = (startReveal - rect.top) / (startReveal - endReveal);
            progress = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1
            
            const wordsToReveal = Math.floor(progress * wordSpans.length);
            
            wordSpans.forEach((span, index) => {
                if (index < wordsToReveal) {
                    span.classList.add('is-active');
                } else {
                    span.classList.remove('is-active');
                }
            });
        });
    }, { passive: true });
}

/*
========================================
LIVE TERMINAL TYPING EFFECT
========================================
*/
function initTerminalTyping() {
    const terminal = document.getElementById('about-terminal');
    if (!terminal) return;
    
    const lines = terminal.querySelectorAll('.log-line:not(.terminal-pulse)');
    if (lines.length === 0) return;

    // 1. Store both the raw text and the HTML (for links)
    lines.forEach(line => {
        line.setAttribute('data-html', line.innerHTML);
        line.setAttribute('data-text', line.textContent);
        line.innerHTML = '';
        line.style.opacity = '1'; 
    });

    // 2. Set up observer to trigger when scrolled into view
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            typeLines(lines);
            observer.disconnect(); // Run only once
        }
    }, { threshold: 0.3 });
    
    observer.observe(terminal);
}

// 3. Type character by character, then snap links into place
async function typeLines(lines) {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const plainText = line.getAttribute('data-text');
        const originalHTML = line.getAttribute('data-html');
        
        // Type the plain text rapidly
        for (let j = 0; j < plainText.length; j++) {
            line.innerHTML += plainText[j];
            await new Promise(r => setTimeout(r, 10)); // 10ms per character
        }
        
        // Once line is typed, swap in the real HTML to activate the clickable links
        line.innerHTML = originalHTML;
        
        // Pause before typing the next line
        await new Promise(r => setTimeout(r, 150)); 
    }
}

/*
========================================
LIVE TELEMETRY CLOCK
========================================
*/
function initClock() {
    const clockElements = document.querySelectorAll('.clock-element, #live-clock');
    if (clockElements.length === 0) return;

    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            timeZone: 'Asia/Kolkata',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        clockElements.forEach(el => {
            el.innerText = `${timeString} IST`;
        });
    }

    updateTime(); // Initial call
    setInterval(updateTime, 1000); // Update every second
}

/*
========================================
LAB TERMINAL & DYNAMIC REGISTRY
========================================
*/
function initLabTerminal() {
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const terminalBody = document.getElementById('lab-terminal-body');
    const registryContainer = document.getElementById('experiment-registry');
    
    // Target the entire grid to bring the menu into fullscreen too
    const labGrid = document.querySelector('.lab__grid'); 

    if (!fullscreenToggle || !registryContainer || !labGrid || typeof EXPERIMENTS_DATA === 'undefined') return;

    // 1. Dynamically Generate the HTML List from information.js
    EXPERIMENTS_DATA.forEach((exp, index) => {
        const li = document.createElement('li');
        li.className = 'experiment-item';
        li.setAttribute('data-index', index);
        
        li.innerHTML = `
            <span class="exp-id">${exp.id}</span>
            <h3 class="exp-name">${exp.name}</h3>
            <p class="exp-desc">${exp.description}</p>
        `;
        
        registryContainer.appendChild(li);
    });

    const experimentItems = document.querySelectorAll('.experiment-item');

    // 2. Native Browser Fullscreen API & Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const customCursor = document.querySelector('.cursor'); // Ensure this matches your HTML!

    fullscreenToggle.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            // Push the ENTIRE document body into fullscreen so the cursor isn't left behind
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            labGrid.classList.toggle('sidebar-open');
        });
    }

    // Sync state with the ESC key and API state
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            labGrid.classList.add('is-fullscreen');
            labGrid.classList.add('sidebar-open'); 
            fullscreenToggle.innerText = '[ ✕ ] CLOSE';
            
            // Elevate cursor
            if (customCursor) customCursor.classList.add('is-fullscreen-active');
        } else {
            // Remove fullscreen styles
            labGrid.classList.remove('is-fullscreen');
            labGrid.classList.remove('sidebar-open'); 
            fullscreenToggle.innerText = '[ ↗ ] FULLSCREEN';
            
            // Drop cursor elevation
            if (customCursor) customCursor.classList.remove('is-fullscreen-active');
        }
    });

    // 3. Hover & Terminal Typing Logic
    let activeExecutionId = 0; 

    experimentItems.forEach(item => {
        item.addEventListener('mouseenter', async () => {
            experimentItems.forEach(el => el.classList.remove('is-active'));
            item.classList.add('is-active');

            const dataIndex = item.getAttribute('data-index');
            const logs = EXPERIMENTS_DATA[dataIndex].logs;
            
            const currentExecutionId = ++activeExecutionId;
            terminalBody.innerHTML = ''; 
            
            for (let i = 0; i < logs.length; i++) {
                if (activeExecutionId !== currentExecutionId) return; 
                
                const p = document.createElement('p');
                p.className = 'log-line';
                terminalBody.appendChild(p);
                
                for (let j = 0; j < logs[i].length; j++) {
                    if (activeExecutionId !== currentExecutionId) return; 
                    p.innerHTML += logs[i][j];
                    await new Promise(r => setTimeout(r, 10)); 
                }
                await new Promise(r => setTimeout(r, 150)); 
            }
        });
    });
}

/*
========================================
SYSTEM TOOLKIT LOGIC
========================================
*/
function initToolkit() {
    const tabsContainer = document.getElementById('toolkit-tabs');
    const gridContainer = document.getElementById('toolkit-grid');
    
    if (!tabsContainer || !gridContainer || typeof TOOLKIT_DATA === 'undefined') return;

    // 1. Extract unique categories (Plus an "ALL" tab)
    const categories = ["ALL", ...new Set(TOOLKIT_DATA.map(item => item.category))];
    let currentCategory = "ALL";

    // 2. Render Tabs
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = `toolkit-tab-btn ${category === "ALL" ? "is-active" : ""}`;
        btn.innerText = category;
        
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.toolkit-tab-btn').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            
            // Re-render grid
            currentCategory = category;
            renderGrid();
        });
        
        tabsContainer.appendChild(btn);
    });

    // 3. Render Grid Function
    function renderGrid() {
        gridContainer.innerHTML = '';
        
        const filteredData = currentCategory === "ALL" 
            ? TOOLKIT_DATA 
            : TOOLKIT_DATA.filter(item => item.category === currentCategory);

        filteredData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'toolkit-card';
            
            // Injected the 4 target brackets into the card's HTML
            card.innerHTML = `
                <div class="toolkit-brackets">
                    <span class="bracket bracket-tl"></span>
                    <span class="bracket bracket-tr"></span>
                    <span class="bracket bracket-bl"></span>
                    <span class="bracket bracket-br"></span>
                </div>
                <img src="${item.logo}" alt="${item.name} logo">
                <h4 class="toolkit-card__name">${item.name}</h4>
                <p class="toolkit-card__role">${item.role}</p>
            `;
            gridContainer.appendChild(card);
        });

        // Spotlight Mouse Tracking Logic
        const cards = gridContainer.querySelectorAll('.toolkit-card');
        
        // Attaching it to the grid container allows the light to "bleed" 
        // into adjacent cards slightly, creating a highly realistic glow effect
        gridContainer.addEventListener('mousemove', (e) => {
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // Initial render
    renderGrid();
}