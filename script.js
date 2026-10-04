const header = document.querySelector(".site-header");

window.addEventListener(
  "scroll",
  () => header.classList.toggle("is-scrolled", window.scrollY > 12),
  { passive: true },
);

document.documentElement.classList.add("motion-ready");

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
