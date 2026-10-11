// COSMO Darkroom — vitrine. Rien d'indispensable ici : sans script, tout le contenu reste lisible.
(() => {
  "use strict";

  // L'en-tête prend un fond dès qu'on quitte le haut de la page.
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Le menu, sur les écrans étroits.
  const french = document.documentElement.lang === "fr";
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu");
  if (toggle && menu) {
    const set = (open) => {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", french ? (open ? "Fermer le menu" : "Ouvrir le menu")
        : (open ? "Close the menu" : "Open the menu"));
    };
    toggle.addEventListener("click", () => set(!menu.classList.contains("open")));
    menu.addEventListener("click", (event) => event.target.closest("a") && set(false));
    document.addEventListener("keydown", (event) => event.key === "Escape" && set(false));
  }

  // Les comparaisons avant / après : le curseur déplace la limite entre les deux images.
  document.querySelectorAll(".compare").forEach((figure) => {
    const input = figure.querySelector("input[type=range]");
    const caption = figure.querySelector("figcaption");
    if (!input) return;
    const place = () => figure.style.setProperty("--pos", `${input.value}%`);
    // la poignée s'arrête au bas de l'image, pas de la légende
    const measure = () => figure.style.setProperty("--cap", caption ? `${caption.offsetHeight + 14}px` : "0px");
    input.addEventListener("input", place);
    window.addEventListener("resize", measure);
    place();
    measure();
  });

  // La galerie : un clic agrandit l'image et donne sa recette.
  const lightbox = document.getElementById("lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    const image = lightbox.querySelector("img");
    const text = lightbox.querySelector("p");
    document.querySelectorAll(".shot").forEach((shot) => {
      shot.addEventListener("click", () => {
        image.src = shot.dataset.full;
        image.alt = shot.querySelector("img").alt;
        text.textContent = shot.dataset.caption;
        lightbox.showModal();
      });
    });
    lightbox.querySelector(".close").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => event.target === lightbox && lightbox.close());
  }

  // Les blocs apparaissent quand ils entrent dans la fenêtre.
  const blocks = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const watcher = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("seen");
          watcher.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    blocks.forEach((block) => watcher.observe(block));
  } else {
    blocks.forEach((block) => block.classList.add("seen"));
  }

  // Les vidéos d'outils jouent quand elles sont à l'écran, s'arrêtent quand elles en sortent.
  const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !still) {
    const player = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.play().catch(() => {});
        else entry.target.pause();
      });
    }, { threshold: 0.5 });
    document.querySelectorAll(".film.use video").forEach((video) => player.observe(video));
  }

  // La vidéo de la comète se met en pause quand elle sort de l'écran.
  const film = document.querySelector(".film video");
  if (film && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => !entry.isIntersecting && film.pause()).observe(film);
  }
})();
