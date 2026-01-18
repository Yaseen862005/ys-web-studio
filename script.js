/* =========================
  YS Web Studio - Scripts
  File: script.js
  Notes:
  - Keep JS simple and readable
  - Projects list is in one place for easy editing
========================= */

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Intro loader (3s) ----------
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("siteLoader");
  const HIDE_AFTER = 3000;

  window.setTimeout(() => {
    document.body.classList.add("is-loaded");
    document.body.classList.remove("is-loading");
    if (loader) loader.setAttribute("aria-hidden", "true");
  }, HIDE_AFTER);
});

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
let navLockUntil = 0;
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
    navLockUntil = Date.now() + 900;
    const nav = document.querySelector('nav.links');
    requestAnimationFrame(() => nav?._positionIndicator?.());

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });

    // close mobile nav after click
    mobileNav?.classList.remove("open");
  });
});

// ---------- Desktop nav indicator (single underline) ----------
const initNavIndicator = () => {
  const nav = document.querySelector('nav.links');
  if (!nav) return;

  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.appendChild(indicator);

  const positionIndicator = () => {
    const activeLink = nav.querySelector('a.nav-link.active:not(.btn)') || nav.querySelector('a.nav-link:not(.btn)');
    if (!activeLink) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const x = linkRect.left - navRect.left;
    const w = linkRect.width;

    nav.style.setProperty('--nav-x', `${x}px`);
    nav.style.setProperty('--nav-w', `${w}px`);
    indicator.style.opacity = '1';
  };
  nav._positionIndicator = positionIndicator;

  const debouncedPosition = (() => {
    let timer;
    return () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(positionIndicator, 120);
    };
  })();

  const observer = new MutationObserver((mutations) => {
    const shouldUpdate = mutations.some(
      (m) => m.type === 'attributes' && m.attributeName === 'class' && m.target.classList?.contains('nav-link')
    );
    if (shouldUpdate) positionIndicator();
  });

  observer.observe(nav, { attributes: true, subtree: true, attributeFilter: ['class'] });
  window.addEventListener('resize', debouncedPosition, { passive: true });
  window.addEventListener('load', positionIndicator, { once: true });

  requestAnimationFrame(positionIndicator);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavIndicator);
} else {
  initNavIndicator();
}

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("show");
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* =========================
  Liquid blob parallax / tilt
========================= */
const blobContainerEl = document.querySelector(".blob-container");
const blobReduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (blobReduceMotion) {
  document.querySelectorAll('[filter="url(#blobDistort)"]').forEach((node) => {
    node.removeAttribute("filter");
  });
}

if (blobContainerEl && !blobReduceMotion) {
  let rafId = null;
  let tiltX = 0;
  let tiltY = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const applyTilt = () => {
    blobContainerEl.style.setProperty("--tiltX", `${tiltX}deg`);
    blobContainerEl.style.setProperty("--tiltY", `${tiltY}deg`);

    // Slightly move light hot-spots with the cursor
    const glowX = clamp(50 + tiltX * 1.8, 18, 82);
    const glowY = clamp(52 - tiltY * 1.6, 20, 82);
    blobContainerEl.style.setProperty("--glowX", `${glowX}%`);
    blobContainerEl.style.setProperty("--glowY", `${glowY}%`);

    rafId = null;
  };

  const queueTilt = (x, y) => {
    tiltX = x;
    tiltY = y;
    if (!rafId) {
      rafId = requestAnimationFrame(applyTilt);
    }
  };

  const handleMove = (e) => {
    const rect = blobContainerEl.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const x = clamp(px * 14, -14, 14);
    const y = clamp(-py * 12, -12, 12);
    queueTilt(x, y);
  };

  blobContainerEl.addEventListener("pointermove", handleMove);
  blobContainerEl.addEventListener("pointerleave", () => queueTilt(0, 0));

  queueTilt(0, 0);
}

/* =========================
  Blob outline scaling based on liquid bubble size
========================= */
const liquidBubblesEl = document.querySelector(".liquid-bubbles");
const blobOutlineEl = document.querySelector(".blob-outline");

if (liquidBubblesEl && blobOutlineEl && !blobReduceMotion) {
  const updateBlobOutlineScale = () => {
    // Get all bubble elements
    const bubbles = liquidBubblesEl.querySelectorAll("span");
    let maxDistance = 0;
    const containerBounds = blobContainerEl.getBoundingClientRect();
    const containerCenterX = containerBounds.width / 2;
    const containerCenterY = containerBounds.height / 2;
    
    bubbles.forEach(bubble => {
      const bubbleBounds = bubble.getBoundingClientRect();
      
      // Calculate the radius in pixels
      const bubbleRadius = bubbleBounds.width / 2;
      
      // Calculate bubble center relative to container
      const bubbleCenterX = bubbleBounds.left - containerBounds.left + bubbleRadius;
      const bubbleCenterY = bubbleBounds.top - containerBounds.top + bubbleRadius;
      
      // Distance from container center to bubble edge
      const distToBubbleCenter = Math.sqrt(
        Math.pow(bubbleCenterX - containerCenterX, 2) + 
        Math.pow(bubbleCenterY - containerCenterY, 2)
      );
      const distToEdge = distToBubbleCenter + bubbleRadius;
      maxDistance = Math.max(maxDistance, distToEdge);
    });
    
    // Container radius (SVG is 150 units in a 300x300 viewBox)
    const containerRadius = containerBounds.width / 2;
    
    // Calculate scale needed with generous buffer for safety
    // Increased to 1.15 (15%) buffer to ensure no spillover during morphing
    const neededScale = (maxDistance / containerRadius) * 1.15;
    const constrainedScale = Math.max(1, Math.min(neededScale, 1.5));
    
    // Apply transform directly to element
    blobOutlineEl.style.transform = `scale(${constrainedScale})`;
  };
  
  // Use RAF for smooth updates
  let rafId = null;
  const scheduleUpdate = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateBlobOutlineScale();
      rafId = null;
    });
  };
  
  // Monitor continuously at higher frequency during active animation
  setInterval(scheduleUpdate, 16); // ~60fps
  
  // Also update on window resize
  window.addEventListener("resize", scheduleUpdate);
  
  // Initial update
  scheduleUpdate();
}

/* =========================
  WORK / PROJECTS
  - You can add/edit projects here
  - level: "basic" | "excellent" | "legendary"
========================= */
const projects = [
  {
    company: "NovaCommerce",
    goal: "Launch-ready ecommerce page built to move product on day one.",
    level: "excellent",
    tags: ["Conversion", "Speed", "UI"],
    url: "https://example.com", // TODO: replace with your real link
    thumb: "thumb-a"
  },
  {
    company: "Pulse Analytics",
    goal: "Flagship site translating a complex data platform into a clear invitation to engage.",
    level: "legendary",
    tags: ["Positioning", "Conversion", "Motion"],
    url: "https://example.com", // TODO
    thumb: "thumb-b"
  },
  {
    company: "Helio Studio",
    goal: "Portfolio that frames the studio's craft and guides visitors to inquire.",
    level: "basic",
    tags: ["Portfolio", "Editorial", "Mobile"],
    url: "https://example.com", // TODO
    thumb: "thumb-c"
  },
  {
    company: "Apex Dental",
    goal: "Clinic site engineered to earn trust and drive bookings.",
    level: "excellent",
    tags: ["Bookings", "Trust", "SEO"],
    url: "https://example.com", // TODO
    thumb: "thumb-b"
  },
  {
    company: "Northline Gym",
    goal: "Conversion-led landing that sells memberships before the tour.",
    level: "legendary",
    tags: ["Conversion", "CTA", "Performance"],
    url: "https://example.com", // TODO
    thumb: "thumb-a"
  },
  {
    company: "Luma Real Estate",
    goal: "Premium real estate presence with clear paths to contact.",
    level: "excellent",
    tags: ["Trust", "Premium", "UI"],
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
const setInitialActiveLink = () => {
  const nav = document.querySelector('nav.links');
  const hash = window.location.hash;
  const hasHashLink = hash && nav?.querySelector(`.nav-link[href="${hash}"]`);
  const initial = hasHashLink ? hash : '#work';
  setActiveLink(initial);
  nav?._positionIndicator?.();
};
setInitialActiveLink();

const sectionIds = Array.from(navLinks)
  .map(a => a.getAttribute('href'))
  .filter(h => h && h.startsWith('#'))
  .map(h => h.slice(1));

const sections = sectionIds
  .map(id => document.getElementById(id))
  .filter(Boolean);

const updateActiveOnScroll = () => {
  if (Date.now() < navLockUntil) return;
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
  const nav = document.querySelector('nav.links');
  requestAnimationFrame(() => nav?._positionIndicator?.());
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

function clearFieldError(inputEl) {
  if (!inputEl) return;
  const field = inputEl.closest(".field");
  if (!field) return;
  field.classList.remove("has-error");
  inputEl.setAttribute("aria-invalid", "false");
  const errorEl = field.querySelector(".field-error");
  if (errorEl) errorEl.textContent = "";
}

function setFieldError(inputEl, message) {
  if (!inputEl) return;
  const field = inputEl.closest(".field");
  if (!field) return;
  field.classList.add("has-error");
  inputEl.setAttribute("aria-invalid", "true");
  const errorEl = field.querySelector(".field-error");
  if (errorEl) errorEl.textContent = message;
}

function clearAllFieldErrors() {
  clearFieldError(document.getElementById("name"));
  clearFieldError(document.getElementById("email"));
  clearFieldError(document.getElementById("project"));
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
  const previousMethod = contactMethodInput.value || "whatsapp";
  contactMethodInput.value = method;

  // Toggle button UI
  methodButtons.forEach((b) => {
    const isActive = b.getAttribute("data-method") === method;
    b.classList.toggle("active", isActive);
    b.setAttribute("aria-pressed", String(isActive));
  });

    // Do NOT use browser validation bubbles (we validate inline in submit handler)
  const emailInput = document.getElementById("email");
  if (emailInput) {
    const wantsEmail = method === "email";
    emailInput.required = false; // keep browser bubbles OFF
    emailInput.placeholder = wantsEmail ? "Email" : "Email (optional)";
    if (previousMethod === "email" && method === "whatsapp") {
      clearFieldError(emailInput);
    }
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

["name", "email", "project"].forEach((id) => {
  const el = document.getElementById(id);
  ["input", "change"].forEach((evt) => {
    el?.addEventListener(evt, () => {
      if (el.closest(".field")?.classList.contains("has-error")) {
        clearFieldError(el);
      }
    });
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

/* =========================
  Direct contact inline copy feedback
========================= */
const directChips = document.querySelectorAll(".direct-chip.allow-select");
const chipTimers = new WeakMap();
const reduceMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const prefersReducedMotion = () => Boolean(reduceMotionQuery?.matches);

const copyToClipboard = async (text) => {
  if (!text) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore and fallback
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    textarea.style.left = "-9999px";

    const prevFocus = document.activeElement;
    const selection = document.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    document.body.appendChild(textarea);
    try {
      textarea.focus({ preventScroll: true });
    } catch {
      textarea.focus();
    }
    textarea.select();

    const ok = document.execCommand("copy");

    document.body.removeChild(textarea);

    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (selection) {
      selection.removeAllRanges();
    }

    if (prevFocus && typeof prevFocus.focus === "function") {
      try {
        prevFocus.focus({ preventScroll: true });
      } catch {
        prevFocus.focus();
      }
    }

    return ok;
  } catch {
    return false;
  }
};

const ensureChipLayers = (chip) => {
  const original = (chip.dataset.originalText || chip.textContent || "").trim();
  chip.dataset.originalText = original;

  let label = chip.querySelector(".chip-label");
  let overlay = chip.querySelector(".chip-overlay");

  if (!label || !overlay) {
    chip.textContent = "";
    label = document.createElement("span");
    label.className = "chip-label";
    label.textContent = original;

    overlay = document.createElement("span");
    overlay.className = "chip-overlay";

    chip.append(label, overlay);
  } else {
    label.textContent = original;
  }

  return { label, overlay };
};

const syncOverlayMetrics = (chip) => {
  const label = chip.querySelector(".chip-label");
  const overlay = chip.querySelector(".chip-overlay");
  if (!label || !overlay) return;

  const chipCS = getComputedStyle(chip);
  const labelCS = getComputedStyle(label);

  chip.style.setProperty(
    "--chip-pad",
    `${chipCS.paddingTop} ${chipCS.paddingRight} ${chipCS.paddingBottom} ${chipCS.paddingLeft}`
  );

  chip.style.setProperty(
    "--chip-align",
    labelCS.textAlign || chipCS.textAlign || "left"
  );

  overlay.style.fontFamily = labelCS.fontFamily;
  overlay.style.fontSize = labelCS.fontSize;
  overlay.style.fontWeight = labelCS.fontWeight;
  overlay.style.letterSpacing = labelCS.letterSpacing;
  overlay.style.lineHeight = labelCS.lineHeight;
};

const lockChipWidth = (chip) => {
  if (chip.dataset.widthLocked === "true") return;
  const rect = chip.getBoundingClientRect();
  if (!rect?.width) return;
  chip.style.minWidth = `${rect.width}px`;
  chip.dataset.widthLocked = "true";
};

const setOverlayText = (chip, text) => {
  const overlay = chip.querySelector(".chip-overlay");
  if (!overlay) return;
  overlay.textContent = text;
};

const clearOverlayText = (chip) => setOverlayText(chip, "");

const clearChipTimer = (chip) => {
  const existing = chipTimers.get(chip);
  if (existing) {
    clearTimeout(existing);
    chipTimers.delete(chip);
  }
};

const showHintState = (chip) => {
  if (!canHover) return;
  if (chip.classList.contains("is-copied")) return;
  setOverlayText(chip, "Click to copy");
  chip.classList.add("is-hint");
};

const hideHintState = (chip) => {
  if (chip.classList.contains("is-copied")) return;
  chip.classList.remove("is-hint");
  clearOverlayText(chip);
};

const setCopiedState = (chip) => {
  chip.classList.remove("is-hint");
  setOverlayText(chip, "Copied");
  chip.classList.add("is-copied");
};

const clearCopiedState = (chip) => {
  chip.classList.remove("is-copied");
  clearOverlayText(chip);
};

const triggerCopyFeedback = async (chip) => {
  if (!chip) return;
  clearChipTimer(chip);

  const text = chip.dataset.copy || chip.dataset.originalText || (chip.textContent || "").trim();
  if (!text) return;

  const ok = await copyToClipboard(text);
  if (!ok) return;

  setCopiedState(chip);

  const t = setTimeout(() => {
    clearCopiedState(chip);
    chipTimers.delete(chip);
    if (canHover && chip.matches(":hover")) {
      showHintState(chip);
    }
  }, 1500);

  chipTimers.set(chip, t);
};

directChips.forEach((chip) => {
  ensureChipLayers(chip);
  syncOverlayMetrics(chip);
  lockChipWidth(chip);

  chip.addEventListener("pointerenter", (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    showHintState(chip);
  });

  chip.addEventListener("pointerleave", () => {
    hideHintState(chip);
  });

  chip.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    triggerCopyFeedback(chip);
  }, { passive: false });

  chip.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    triggerCopyFeedback(chip);
  });
});

let resizeRaf = null;
window.addEventListener("resize", () => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    directChips.forEach((chip) => {
      syncOverlayMetrics(chip);
    });
  });
});

// =========================
// Contact form submit
// =========================
contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const projectInput = document.getElementById("project");

  const name = nameInput?.value?.trim();
  const email = emailInput?.value?.trim();
  const project = projectInput?.value?.trim();
  const method = contactMethodInput?.value || "whatsapp";

  // =========================
  // Validation (anti-empty send) with inline errors
  // =========================
  clearAllFieldErrors();
  let firstInvalid = null;

  if (!name) {
    setFieldError(nameInput, "Please enter your name.");
    firstInvalid = firstInvalid || nameInput;
  }

  if (!project) {
    setFieldError(projectInput, "Please enter your project type.");
    firstInvalid = firstInvalid || projectInput;
  }

  if (method === "email") {
    if (!email) {
      setFieldError(emailInput, "Please enter your email so I can reply.");
      firstInvalid = firstInvalid || emailInput;
    } else if (!isValidEmail(email)) {
      setFieldError(emailInput, "Please enter a valid email address.");
      firstInvalid = firstInvalid || emailInput;
    }
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return;
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

  const pauseForBackground = () => {
    try {
      bgAudio.pause();
    } catch {
      // ignore
    }

    // If pause didn't stick, force a quick seek to stop playback without changing UI state
    try {
      if (!bgAudio.paused && bgAudio.currentTime > 0) {
        bgAudio.currentTime = bgAudio.currentTime;
      }
    } catch {
      // ignore
    }
  };

  // Init UI
  setUI(enabled);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseForBackground();
    } else if (enabled) {
      tryPlay();
    }
  });

  window.addEventListener("pagehide", pauseForBackground);
  window.addEventListener("beforeunload", pauseForBackground);

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

document.addEventListener('pointerdown', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  btn.style.setProperty('--rx', `${x}px`);
  btn.style.setProperty('--ry', `${y}px`);

  // restart animation deterministically
  btn.classList.remove('ripple-on');
  void btn.offsetWidth; // force reflow to restart the keyframes
  btn.classList.add('ripple-on');

  // cleanup
  window.setTimeout(() => {
    btn.classList.remove('ripple-on');
  }, 650);
}, { passive: true });
