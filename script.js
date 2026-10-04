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
