/* =========================
  YS Web Studio - Scripts
  File: script.js
  Notes:
  - Keep JS simple and readable
  - Projects list is in one place for easy editing
========================= */

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Mobile menu ----------
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

menuBtn?.addEventListener("click", () => {
  mobileNav.classList.toggle("open");
});

// Close mobile nav when clicking a link (better UX)
mobileNav?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => mobileNav.classList.remove("open"));
});

// ---------- Smooth anchor scroll with header offset ----------
const header = document.querySelector('.header');
const anchorLinks = document.querySelectorAll('.nav-link, .mobile-nav .nav-link');
const setActiveLink = (href) => {
  if (!href) return;
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === href);
  });
};

anchorLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();

    const headerOffset = (header?.offsetHeight || 0) + 10;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    // immediate visual feedback
    setActiveLink(href);

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });

    // close mobile nav after click
    mobileNav?.classList.remove("open");
  });
});

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("show");
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* =========================
  WORK / PROJECTS
  - You can add/edit projects here
  - level: "basic" | "excellent" | "legendary"
========================= */
const projects = [
  {
    company: "NovaCommerce",
    goal: "Premium eCommerce landing for product launches.",
    level: "excellent",
    tags: ["Landing", "Speed", "UI"],
    url: "https://example.com", // TODO: replace with your real link
    thumb: "thumb-a"
  },
  {
    company: "Pulse Analytics",
    goal: "Modern company site for a data platform.",
    level: "legendary",
    tags: ["Brand", "Motion", "Conversion"],
    url: "https://example.com", // TODO
    thumb: "thumb-b"
  },
  {
    company: "Helio Studio",
    goal: "Portfolio site for a creative team.",
    level: "basic",
    tags: ["Portfolio", "Clean", "Mobile"],
    url: "https://example.com", // TODO
    thumb: "thumb-c"
  },
  {
    company: "Apex Dental",
    goal: "Clinic website designed for bookings & trust.",
    level: "excellent",
    tags: ["Business", "SEO", "Forms"],
    url: "https://example.com", // TODO
    thumb: "thumb-b"
  },
  {
    company: "Northline Gym",
    goal: "Landing page built to convert memberships.",
    level: "legendary",
    tags: ["Landing", "CTA", "Performance"],
    url: "https://example.com", // TODO
    thumb: "thumb-a"
  },
  {
    company: "Luma Real Estate",
    goal: "Company website with premium sections and clarity.",
    level: "excellent",
    tags: ["Business", "UI", "Trust"],
    url: "https://example.com", // TODO
    thumb: "thumb-c"
  }
];

// Render project cards into #workGrid
const workGrid = document.getElementById("workGrid");

function levelLabel(level){
  if (level === "basic") return "Basic";
  if (level === "excellent") return "Excellent";
  return "Legendary";
}

function renderProjects(filter = "all"){
  if (!workGrid) return;

  workGrid.innerHTML = "";

  const filtered = filter === "all"
    ? projects
    : projects.filter(p => p.level === filter);

  filtered.forEach((p, idx) => {
    const a = document.createElement("a");
    a.className = `work-card reveal fade-item`;
    a.href = p.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("data-level", p.level);

    // Card HTML
    a.innerHTML = `
      <div class="work-thumb ${p.thumb}"></div>
      <div class="work-body">
        <div class="work-title">${p.company}</div>
        <div class="work-goal">${p.goal}</div>

        <div class="meta-row">
          <span class="badge-level level-${p.level}">${levelLabel(p.level)}</span>
          <div class="tags">
            ${p.tags.map(t => `<span>${t}</span>`).join("")}
          </div>
        </div>
      </div>
    `;

    workGrid.appendChild(a);

    // reveal observer for newly created nodes
    revealObserver.observe(a);

    // smooth-in animation on insert
    requestAnimationFrame(() => {
      a.classList.add("fade-in");
    });
  });
}

renderProjects("all");

// Filters
document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProjects(btn.dataset.filter || "all");
  });
});

/* =========================
  FAQ accordion (single-open)
========================= */
document.querySelectorAll(".faq").forEach((item) => {
  const btn = item.querySelector(".faq-q");
  const panel = item.querySelector(".faq-a");
  const ico = item.querySelector(".faq-ico");

  const close = () => {
    item.classList.remove("open");
    btn?.setAttribute("aria-expanded", "false");
    if (panel) panel.style.height = "0px";
    if (ico) ico.textContent = "+";
  };

  const open = () => {
    // Close other open items
    document.querySelectorAll(".faq.open").forEach((other) => {
      if (other !== item) {
        const b = other.querySelector(".faq-q");
        const p = other.querySelector(".faq-a");
        const i = other.querySelector(".faq-ico");
        other.classList.remove("open");
        b?.setAttribute("aria-expanded", "false");
        if (p) p.style.height = "0px";
        if (i) i.textContent = "+";
      }
    });

    item.classList.add("open");
    btn?.setAttribute("aria-expanded", "true");
    if (panel) panel.style.height = panel.scrollHeight + "px";
    if (ico) ico.textContent = "–";
  };

  btn?.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    if (isOpen) close();
    else open();
  });

  // Keep correct height on resize
  window.addEventListener("resize", () => {
    if (item.classList.contains("open") && panel) {
      panel.style.height = panel.scrollHeight + "px";
    }
  });
});

// Open first FAQ by default (small conversion boost)
document.querySelector(".faq .faq-q")?.click();

/* =========================
  Active nav link by section
  - Highlights where the user is
========================= */
const navLinks = document.querySelectorAll('.nav-link');
const sectionIds = Array.from(navLinks)
  .map(a => a.getAttribute('href'))
  .filter(h => h && h.startsWith('#'))
  .map(h => h.slice(1));

const sections = sectionIds
  .map(id => document.getElementById(id))
  .filter(Boolean);

const updateActiveOnScroll = () => {
  const headerOffset = (header?.offsetHeight || 0) + 12;
  const probe = window.scrollY + headerOffset + window.innerHeight * 0.15;
  let currentId = sections[0]?.id || "";

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    if (probe >= sec.offsetTop) {
      currentId = sec.id;
    } else {
      break;
    }
  }

  // If near bottom, force last section active
  const docHeight = document.documentElement.scrollHeight;
  const viewportBottom = window.scrollY + window.innerHeight + 2;
  if (viewportBottom >= docHeight) {
    currentId = sections[sections.length - 1]?.id || currentId;
  }

  setActiveLink(`#${currentId}`);
};

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateActiveOnScroll();
    ticking = false;
  });
}, { passive: true });

window.addEventListener('resize', () => {
  updateActiveOnScroll();
});

// initial state
updateActiveOnScroll();

/* =========================
  Count up animation for .count elements
  - Add class="count" data-count="NUMBER" in HTML
========================= */
const counters = document.querySelectorAll('.count');

const countUp = (el, to) => {
  const duration = 900;
  const start = performance.now();
  const from = 0;

  const step = (t) => {
    const p = Math.min(1, (t - start) / duration);
    const val = Math.round(from + (to - from) * (p * (2 - p))); // easeOut

    // Detect suffix based on original text
    const original = el.dataset.original || el.textContent;
    el.dataset.original = original;

    const hasPercent = original.includes('%');
    const hasPlus = original.includes('+');

    if (hasPercent) el.textContent = `+${val}%`;
    else if (hasPlus) el.textContent = `${val}+`;
    else el.textContent = `${val}`;

    if (p < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const to = Number(el.dataset.count || '0');
    if (!to || el.dataset.done) return;
    el.dataset.done = '1';
    countUp(el, to);
  });
}, { threshold: 0.6 });

counters.forEach(c => countObserver.observe(c));

/* =========================
  Contact form -> Email OR WhatsApp (no backend)
  IMPORTANT:
  - This does NOT send automatically from the website.
  - It opens the user's Email client (mailto) or WhatsApp (wa.me) with a pre-filled message.
  - For "real" sending without user interaction, you'll need a backend or a form service.
========================= */
const contactForm = document.getElementById("contactForm");
const contactMethodInput = document.getElementById("contactMethod");
const methodButtons = document.querySelectorAll(".contact-method");
const sendBtn = document.getElementById("sendBtn");

// Your contact destinations
const TO_EMAIL = "yaseen862005@gmail.com";
// WhatsApp wa.me requires digits only (no +)
const WA_NUMBER = "962786365888";

// Simple email format check (good enough for frontend validation)
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}


// Open an email draft reliably (Gmail compose first, then mailto fallback)
function openEmailDraft({ to, subject, body }) {
  const s = encodeURIComponent(subject);
  const b = encodeURIComponent(body);

  // 1) Gmail compose (works best if user uses Gmail)
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${s}&body=${b}`;

  // Try opening a new tab. If blocked, fallback to mailto in same tab.
  const win = window.open(gmailUrl, "_blank", "noopener");

  // 2) Fallback: mailto (depends on user's OS/browser email app setup)
  if (!win) {
    window.location.href = `mailto:${to}?subject=${s}&body=${b}`;
  }

  // Optional: copy message to clipboard as a safety net (won't break if denied)
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(body).catch(() => {});
  }
}


function setContactMethod(method){
  if (!contactMethodInput) return;
  contactMethodInput.value = method;

  // Toggle button UI
  methodButtons.forEach((b) => {
    const isActive = b.getAttribute("data-method") === method;
    b.classList.toggle("active", isActive);
    b.setAttribute("aria-pressed", String(isActive));
  });

    // Do NOT use browser validation bubbles (we validate via toast in submit handler)
  const emailInput = document.getElementById("email");
  if (emailInput) {
    const wantsEmail = method === "email";
    emailInput.required = false; // keep browser bubbles OFF
    emailInput.placeholder = wantsEmail ? "Email" : "Email (optional)";
  }

}

// Default method
setContactMethod("whatsapp");

methodButtons.forEach((b) => {
  b.addEventListener("click", () => {
    const m = b.getAttribute("data-method");
    if (m) setContactMethod(m);
  });
});

// =========================
// Toast helper (no alerts)
// =========================
const toastEl = document.getElementById("toast");
let toastTimer = null;

function showToast(message, type = "success") {
  if (!toastEl) return;

  toastEl.textContent = message;
  toastEl.className = `toast ${type} show`;
  toastEl.setAttribute("aria-hidden", "false");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
    toastEl.setAttribute("aria-hidden", "true");
  }, 3000);
}

// =========================
// Contact form submit
// =========================
contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name")?.value?.trim();
  const email = document.getElementById("email")?.value?.trim();
  const project = document.getElementById("project")?.value?.trim();
  const method = contactMethodInput?.value || "whatsapp";

  // =========================
  // Validation (anti-empty send) + toast instead of browser bubble/alert
  // =========================
  if (!name) {
    showToast("Please enter your name.", "error");
    document.getElementById("name")?.focus();
    return;
  }

  if (!project) {
    showToast("Please enter your project type.", "error");
    document.getElementById("project")?.focus();
    return;
  }

  if (method === "email") {
    if (!email) {
      showToast("Please enter your email so I can reply.", "error");
      document.getElementById("email")?.focus();
      return;
    }
    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address.", "error");
      document.getElementById("email")?.focus();
      return;
    }
  }

  // =========================
  // Build message
  // =========================
  const plainMessage =
`Hi YS Web Studio,

Name: ${name}
Email: ${email || "(not provided)"}
Project type: ${project}

Details:
- Goal:
- Pages/sections:
- Examples you like:
- Deadline:
- Budget:
`;

  // =========================
  // Send via selected method
  // =========================
  if (method === "email") {
    openEmailDraft({
      to: TO_EMAIL,
      subject: `Website Request — ${name || "Client"}`,
      body: plainMessage
    });
  } else {
    const text = encodeURIComponent(plainMessage);
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank", "noopener");
  }

  // =========================
  // Reset form after send
  // =========================
  contactForm.reset();
  setContactMethod("whatsapp");

  // =========================
  // Disable Send button for 1 second (anti double-submit)
  // =========================
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.6";
    sendBtn.style.pointerEvents = "none";

    setTimeout(() => {
      sendBtn.disabled = false;
      sendBtn.style.opacity = "";
      sendBtn.style.pointerEvents = "";
    }, 1000);
  }

  showToast("Draft opened. Please send it to complete.", "success");
});


/* =========================
  Magnetic buttons (advanced micro-interaction)
  - Adds a subtle "pull" effect on mouse move
  - Applied to .magnetic buttons only
========================= */
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.06}px, ${y * 0.06}px)`;
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});
/* =========================
  Background music (premium lounge vibe)
  Notes:
  - Browsers block autoplay until user interaction.
  - We show a Music toggle and remember the user's choice.
========================= */
const bgAudio = document.getElementById("bgAudio");
const audioBtn = document.getElementById("audioBtn");

if (bgAudio && audioBtn) {
  // Keep it subtle
  bgAudio.volume = 0.25;

  const KEY = "ys_music_enabled"; // localStorage key
  const saved = localStorage.getItem(KEY); // "1" (on), "0" (off), or null (first visit)

  // Default: ON for first-time visitors
  let enabled = saved === null ? true : saved === "1";



  const setUI = (isOn) => {
    audioBtn.setAttribute("aria-pressed", String(isOn));
    audioBtn.textContent = isOn ? "Music: On" : "Music: Off";
  };

  const tryPlay = async () => {
    try {
      await bgAudio.play();
      setUI(true);
      return true;
    } catch {
      // Autoplay blocked until user interacts
      return false;
    }
  };

  const stop = () => {
    bgAudio.pause();
    bgAudio.currentTime = 0;
    setUI(false);
  };

  // Init UI
  setUI(enabled);

    // Try to start on the FIRST user gesture anywhere on the page.
  // Use "document" + capture to catch clicks even if something inside stops propagation.
  let hinted = false;

  const gestureEvents = ["pointerdown", "touchstart", "keydown", "click"];

  const armAutoStart = () => {
    gestureEvents.forEach((ev) => {
      document.addEventListener(ev, startOnAnyGesture, { capture: true, passive: true });
    });
  };

  const disarmAutoStart = () => {
    gestureEvents.forEach((ev) => {
      document.removeEventListener(ev, startOnAnyGesture, { capture: true });
    });
  };

  const startOnAnyGesture = async () => {
    if (!enabled) return;

    const ok = await tryPlay();

    if (ok) {
      // Music started ✅ stop listening
      disarmAutoStart();
      return;
    }

    // Still blocked → keep listening and show hint once
    if (!hinted) {
      hinted = true;
      if (typeof showToast === "function") {
        showToast("Tap once anywhere to enable sound.", "info");
      }
    }
  };

  // Arm listeners on load
  armAutoStart();



  // Toggle button
  audioBtn.addEventListener("click", async () => {
    enabled = !enabled;

    // Persist as "1" or "0"
    localStorage.setItem(KEY, enabled ? "1" : "0");


    if (enabled) {
      const ok = await tryPlay();
      if (!ok && typeof showToast === "function") {
        showToast("Your browser blocked autoplay — tap again.", "info");
      }
    } else {
      stop();
    }
  });
}
