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
ORGANIZATION NOTE

Each feature below lives in its own object
(Theme, Navbar, Cursor, etc.) with an init()
method. initApp() at the bottom just calls
Feature.init() for each one, in order.

Methods refer to their own object by name
(e.g. "Theme.apply(...)") instead of "this",
since each object is a singleton — this keeps
"this" out of the picture entirely, which
matters because passing "obj.method" directly
as a callback (e.g. to addEventListener) would
otherwise silently break "this" binding.
========================================
*/

/*
========================================
GLOBAL UTILITIES
(shared by multiple features, so they stay
as plain top-level functions rather than
living inside any single feature object)
========================================
*/

function setBodyState(state, active) {
  document.body.classList.toggle(state, active);
}

function hasBodyState(state) {
  return document.body.classList.contains(state);
}

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
    FeaturedWork.init();
    Cursor.init();
    Theme.init();
    Navbar.init();
    ScrollSpy.init();
    Ticker.init();
    SocialSidebar.init();
    ScrambleText.init();

    AboutTabs.init();
    AboutTerminalExpander.init();
    TerminalTyping.init();
    ScrollReveal.init();
    Clock.init();

    LabTerminal.init();

    Toolkit.init();
}

/*
========================================
FEATURED WORK GRID INJECTION
========================================
*/
const FeaturedWork = {
    init() {
        const container = document.getElementById('featured-work-container');
        if (!container || typeof FEATURED_WORK === 'undefined') return;

        FEATURED_WORK.forEach(project => {
            // Generate the HTML for the metric tags
            const metricsHTML = project.metrics.map(metric => `<span class="metric-tag">${metric}</span>`).join('');
            
            // Build the card container
            const card = document.createElement('div');
            card.className = 'project-card';
            
            // Inject the HTML structure matching your original markup
            card.innerHTML = `
                <div class="project-card__left">
                    <div class="project-card__meta-group">
                        <span class="project-card__category">${project.category}</span>
                    </div>
                    
                    <h3 class="project-card__title scramble-text" data-text="${project.title}">${project.title}</h3>
                    <p class="project-card__desc">${project.description}</p>
                    
                    <div class="project-card__metrics">
                        ${metricsHTML}
                    </div>

                    <a href="${project.link}" target="_blank" class="github-link">
                        [↗] VIEW_SOURCE
                    </a>
                </div>
                <div class="project-card__right">
                    <div class="project-visual">
                         <img src="${project.image}" alt="${project.title} Architecture">
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    }
};

/*
========================================
COMPUTER VISION CURSOR MODULE
========================================
*/
const Cursor = {
    dot: document.querySelector('.cursor-dot'),
    follower: document.querySelector('.cursor-follower'),
    label: document.querySelector('.cursor-label'),

    mouseX: 0,
    mouseY: 0,
    followerX: 0,
    followerY: 0,

    // Smooth dot scaling
    dotScale: 1,
    targetDotScale: 1,

    isFraming: false,
    frameTarget: null,

    init() {
        if (!document.querySelector('.custom-cursor') || !window.matchMedia("(pointer: fine)").matches) return;

        // Track mouse coordinates (DOM updates moved to render loop for performance)
        document.addEventListener('mousemove', (e) => {
            Cursor.mouseX = e.clientX;
            Cursor.mouseY = e.clientY;
        });

        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => Cursor.startFraming(card, 'EXPLORE'));
            card.addEventListener('mouseleave', Cursor.stopFraming);
        });

        const links = document.querySelectorAll('a, button');
        links.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                Cursor.startFraming(link, 'OPEN');
            });
            link.addEventListener('mouseleave', (e) => {
                e.stopPropagation();

                // If leaving a link but still inside a card, revert to card framing
                const parentCard = link.closest('.project-card');
                if (parentCard) {
                    Cursor.startFraming(parentCard, 'EXPLORE');
                } else {
                    Cursor.stopFraming();
                }
            });
        });

        Cursor.render();
    },

    startFraming(element, labelText) {
        Cursor.isFraming = true;
        Cursor.frameTarget = element;
        Cursor.targetDotScale = 1.3; // Target 2x size

        if (Cursor.label) {
            Cursor.label.innerText = labelText;
            Cursor.label.style.opacity = '1';
        }
        setBodyState('is-cursor-framing', true);
    },

    stopFraming() {
        Cursor.isFraming = false;
        Cursor.frameTarget = null;
        Cursor.targetDotScale = 1; // Target normal size

        if (Cursor.label) {
            Cursor.label.style.opacity = '0';
        }
        setBodyState('is-cursor-framing', false);
    },

    render() {
        // 1. Smoothly interpolate (lerp) the dot's scale
        Cursor.dotScale += (Cursor.targetDotScale - Cursor.dotScale) * 0.2;

        // 2. Apply exact mouse position + smoothed scale to the dot simultaneously
        if (Cursor.dot) {
            Cursor.dot.style.transform = `translate3d(${Cursor.mouseX}px, ${Cursor.mouseY}px, 0) translate(-50%, -50%) scale(${Cursor.dotScale})`;
        }

        // 3. Apply exact mouse position to the label
        if (Cursor.label) {
            Cursor.label.style.transform = `translate3d(${Cursor.mouseX}px, ${Cursor.mouseY}px, 0) translate(-50%, 25px)`;
        }

        if (Cursor.isFraming && Cursor.frameTarget) {
            const rect = Cursor.frameTarget.getBoundingClientRect();
            const targetCenterX = rect.left + (rect.width / 2);
            const targetCenterY = rect.top + (rect.height / 2);

            Cursor.followerX += (targetCenterX - Cursor.followerX) * 0.2;
            Cursor.followerY += (targetCenterY - Cursor.followerY) * 0.2;

            if (Cursor.follower) {
                Cursor.follower.style.width = `${rect.width + 30}px`;
                Cursor.follower.style.height = `${rect.height + 30}px`;
            }
        } else {
            Cursor.followerX += (Cursor.mouseX - Cursor.followerX) * 0.15;
            Cursor.followerY += (Cursor.mouseY - Cursor.followerY) * 0.15;

            if (Cursor.follower) {
                Cursor.follower.style.width = '40px';
                Cursor.follower.style.height = '40px';
            }
        }

        if (Cursor.follower) {
            Cursor.follower.style.transform = `translate3d(${Cursor.followerX}px, ${Cursor.followerY}px, 0) translate(-50%, -50%)`;
        }

        requestAnimationFrame(Cursor.render);
    }
};

/*
========================================
SCROLL SPY (NAVBAR HIGHLIGHTING)
========================================
*/
const ScrollSpy = {
    init() {
        // Select all main sections that have an ID
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar__link');

        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');

                    // Remove active class from all links
                    navLinks.forEach(link => {
                        link.classList.remove('is-active');
                        // Add active class if the link's href matches the current section ID
                        if (link.getAttribute('href') === `#${currentId}`) {
                            link.classList.add('is-active');
                        }
                    });
                }
            });
        }, {
            // Triggers when a section crosses the middle of the viewport
            rootMargin: '-40% 0px -60% 0px',
            threshold: 0
        });

        sections.forEach(section => observer.observe(section));
    }
};

/*
========================================
NAVBAR SCROLL STATE
========================================
*/
const Navbar = {
    el: document.querySelector("nav"),
    SCROLL_OFFSET: 50,

    init() {
        if (!Navbar.el) return;

        // Run once on load to catch initial state
        Navbar.update();

        // Listen for scroll events
        window.addEventListener("scroll", Navbar.update, {
            passive: true,
        });
    },

    update() {
        const scrollY = window.scrollY;

        setBodyState(
            "is-scrolled",
            window.scrollY > Navbar.SCROLL_OFFSET
        );

        const progressEl = document.getElementById("scroll-progress");
        if (progressEl) {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollY / scrollHeight) * 100;
            progressEl.style.width = `${progress}%`;
        }
    }
};

/*
========================================
SYSTEM THEME TOGGLE
========================================
*/
const Theme = {
    toggleBtn: document.getElementById("theme-toggle"),
    STORAGE_KEY: "portfolio-theme-preference",

    init() {
        if (!Theme.toggleBtn) return;

        // 1. Load preference from storage
        const savedTheme = Theme.load();

        // 2. Apply the initial theme
        Theme.apply(savedTheme);

        // 3. Bind the click event
        Theme.toggleBtn.addEventListener("click", Theme.handleToggle);
    },

    load() {
        return localStorage.getItem(Theme.STORAGE_KEY) ?? "deep-space";
    },

    handleToggle(event) {
        event.preventDefault();

        // Determine new theme based on current state
        const isCurrentlyEInk = hasBodyState("theme-e-ink");
        const newTheme = isCurrentlyEInk ? "deep-space" : "e-ink";

        Theme.apply(newTheme);
    },

    apply(theme) {
        const isEInk = theme === "e-ink";

        // Update Body State
        setBodyState("theme-e-ink", isEInk);

        // Persist to Storage
        localStorage.setItem(Theme.STORAGE_KEY, theme);

        // Update UI Element (Button Text)
        if (Theme.toggleBtn) {
            Theme.toggleBtn.textContent = isEInk
                ? "System Mode: Deep Space"
                : "System Mode: E-Ink";
        }
    }
};

/*
========================================
TRANSFORMING SOCIAL SIDEBAR OBSERVER
========================================
*/
const SocialSidebar = {
    init() {
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
};

/*
========================================
SCROLL TICKER (INERTIA)
========================================
*/
const Ticker = {
    el: document.getElementById("work-ticker"),

    currentX: 0,
    targetX: 0,
    speed: 0.8,
    lerp: 0.08,
    isRunning: false,

    init() {
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
};

/*
========================================
BINARY TEXT SCRAMBLE EFFECT
========================================
*/
const ScrambleText = {
    // The characters to use during the scramble phase
    chars: "01",

    init() {
        const scrambleElements = document.querySelectorAll('.scramble-text');
        if (scrambleElements.length === 0) return;

        // Create an observer to trigger the effect when the card enters the viewport
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Trigger the scramble
                    ScrambleText.run(entry.target, ScrambleText.chars);

                    // Unobserve so it only runs once per card reload to avoid visual fatigue
                    observerInstance.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2 // Triggers when 20% of the element is visible
        });

        scrambleElements.forEach(el => observer.observe(el));
    },

    run(element, chars) {
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
};

/*
========================================
ABOUT TABS & DATA INJECTION
========================================
*/
const AboutTabs = {
    init() {
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
};

/*
========================================
ABOUT TERMINAL EXPANDER
========================================
*/
const AboutTerminalExpander = {
    init() {
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
};

/*
========================================
SCROLL-SCRUB TEXT REVEAL
========================================
*/
const ScrollReveal = {
    init() {
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
};

/*
========================================
LIVE TERMINAL TYPING EFFECT
========================================
*/
const TerminalTyping = {
    init() {
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
                TerminalTyping.typeLines(lines);
                observer.disconnect(); // Run only once
            }
        }, { threshold: 0.3 });

        observer.observe(terminal);
    },

    // 3. Type character by character, then snap links into place
    async typeLines(lines) {
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
};

/*
========================================
LIVE TELEMETRY CLOCK
========================================
*/
const Clock = {
    init() {
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
};

/*
========================================
LAB TERMINAL & DYNAMIC REGISTRY
========================================
*/
const LabTerminal = {
    init() {
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
};

/*
========================================
SYSTEM TOOLKIT LOGIC
========================================
*/
const Toolkit = {
    init() {
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
};