const header = document.querySelector(".site-header");

window.addEventListener(
  "scroll",
  () => header.classList.toggle("is-scrolled", window.scrollY > 12),
  { passive: true },
);

document.documentElement.classList.add("motion-ready");

const replayHeroPills = () => {
  if (!document.querySelector(".hero-pill")) return;
  document.querySelectorAll(".hero-pill").forEach((pill) => {
    pill.style.removeProperty("left");
    pill.style.removeProperty("top");
    pill.style.removeProperty("bottom");
    pill.style.removeProperty("z-index");
    pill.classList.remove("is-dragging");
  });
  document.documentElement.classList.remove("pills-playing");
  // Reading layout resets the completed keyframes before replaying them.
  void document.documentElement.offsetWidth;
  requestAnimationFrame(() => document.documentElement.classList.add("pills-playing"));
};

window.addEventListener("pageshow", replayHeroPills);
document.querySelector(".wordmark")?.addEventListener("click", () => {
  window.setTimeout(replayHeroPills, 80);
});

const pillField = document.querySelector(".hero-pill-field");
const hero = document.querySelector(".hero");
let pillLayer = 10;

if (pillField && hero) {
  const pillDescription = document.createElement("div");
  pillDescription.className = "pill-description";
  pillDescription.setAttribute("role", "status");
  pillDescription.setAttribute("aria-live", "polite");
  hero.appendChild(pillDescription);
  let descriptionTimer;

  const showPillDescription = (pill) => {
    const description = pill.dataset.description;
    if (!description) return;

    document.querySelectorAll(".hero-pill.has-description").forEach((activePill) => {
      activePill.classList.remove("has-description");
    });
    pill.classList.add("has-description");
    pillDescription.innerHTML = `<strong>${pill.textContent.trim()}</strong>${description}`;

    const heroBounds = hero.getBoundingClientRect();
    const pillBounds = pill.getBoundingClientRect();
    const cardWidth = Math.min(310, window.innerWidth - 32);
    const left = Math.min(
      Math.max(16, pillBounds.left - heroBounds.left + pillBounds.width / 2 - cardWidth / 2),
      heroBounds.width - cardWidth - 16,
    );
    let top = pillBounds.top - heroBounds.top - 112;
    if (top < 16) top = pillBounds.bottom - heroBounds.top + 14;

    pillDescription.style.left = `${left}px`;
    pillDescription.style.top = `${top}px`;
    pillDescription.classList.add("is-visible");

    window.clearTimeout(descriptionTimer);
    descriptionTimer = window.setTimeout(() => {
      pillDescription.classList.remove("is-visible");
      pill.classList.remove("has-description");
    }, 4500);
  };

  document.querySelectorAll(".hero-pill").forEach((pill) => {
    if (pill.dataset.description) {
      pill.tabIndex = 0;
      pill.setAttribute("role", "button");
      pill.setAttribute("aria-label", `${pill.textContent.trim()}: ${pill.dataset.description}`);

      pill.addEventListener("click", () => showPillDescription(pill));
      pill.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showPillDescription(pill);
        }
      });
    }

    pill.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      showPillDescription(pill);
      pill.setPointerCapture(event.pointerId);

      const fieldBounds = pillField.getBoundingClientRect();
      const pillBounds = pill.getBoundingClientRect();
      const heroBounds = hero.getBoundingClientRect();
      const offsetX = event.clientX - pillBounds.left;
      const offsetY = event.clientY - pillBounds.top;
      const minTop = heroBounds.top - fieldBounds.top;

      pill.style.left = `${pillBounds.left - fieldBounds.left}px`;
      pill.style.top = `${pillBounds.top - fieldBounds.top}px`;
      pill.style.bottom = "auto";
      pill.style.zIndex = `${++pillLayer}`;
      pill.classList.add("is-dragging");

      const movePill = (moveEvent) => {
        const nextLeft = Math.min(
          Math.max(0, moveEvent.clientX - fieldBounds.left - offsetX),
          fieldBounds.width - pillBounds.width,
        );
        const nextTop = Math.min(
          Math.max(minTop, moveEvent.clientY - fieldBounds.top - offsetY),
          fieldBounds.height - pillBounds.height,
        );
        pill.style.left = `${nextLeft}px`;
        pill.style.top = `${nextTop}px`;
        showPillDescription(pill);
      };

      const settleWithoutHidingLabels = () => {
        const siblings = [...document.querySelectorAll(".hero-pill")].filter(
          (other) => other !== pill,
        );
        const edgeOverlap = 12;

        for (let pass = 0; pass < 12; pass += 1) {
          let moved = false;
          let left = Number.parseFloat(pill.style.left);
          let top = Number.parseFloat(pill.style.top);
          const width = pill.offsetWidth;
          const height = pill.offsetHeight;

          siblings.forEach((other) => {
            const otherBounds = other.getBoundingClientRect();
            const otherLeft = otherBounds.left - fieldBounds.left;
            const otherTop = otherBounds.top - fieldBounds.top;
            const overlapX = Math.min(left + width, otherLeft + otherBounds.width) - Math.max(left, otherLeft);
            const overlapY = Math.min(top + height, otherTop + otherBounds.height) - Math.max(top, otherTop);

            if (overlapX <= edgeOverlap || overlapY <= edgeOverlap) return;

            const pillCenterX = left + width / 2;
            const pillCenterY = top + height / 2;
            const otherCenterX = otherLeft + otherBounds.width / 2;
            const otherCenterY = otherTop + otherBounds.height / 2;

            if (overlapX < overlapY) {
              left += (pillCenterX < otherCenterX ? -1 : 1) * (overlapX - edgeOverlap);
            } else {
              top += (pillCenterY < otherCenterY ? -1 : 1) * (overlapY - edgeOverlap);
            }

            left = Math.min(Math.max(0, left), fieldBounds.width - width);
            top = Math.min(Math.max(minTop, top), fieldBounds.height - height);
            moved = true;
          });

          pill.style.left = `${left}px`;
          pill.style.top = `${top}px`;
          if (!moved) break;
        }
      };

      const releasePill = () => {
        settleWithoutHidingLabels();
        pill.classList.remove("is-dragging");
        pill.removeEventListener("pointermove", movePill);
        pill.removeEventListener("pointerup", releasePill);
        pill.removeEventListener("pointercancel", releasePill);
      };

      pill.addEventListener("pointermove", movePill);
      pill.addEventListener("pointerup", releasePill);
      pill.addEventListener("pointercancel", releasePill);
    });
  });
}

const revealItems = document.querySelectorAll("[data-reveal]");
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -7%" },
);

revealItems.forEach((item) => revealObserver.observe(item));

// A restrained cursor-follow effect adds depth without obscuring the work.
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (canHover) {
  document.querySelectorAll(".project-visual").forEach((visual) => {
    visual.addEventListener("pointermove", (event) => {
      const bounds = visual.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
      visual.style.setProperty("--parallax-x", `${x}px`);
      visual.style.setProperty("--parallax-y", `${y}px`);
    });

    visual.addEventListener("pointerleave", () => {
      visual.style.setProperty("--parallax-x", "0px");
      visual.style.setProperty("--parallax-y", "0px");
    });
  });
}
