document.addEventListener("DOMContentLoaded", () => {
  initProductPlaceholders();
  initCustomCursor();
  initHeroParallax();
  initGallery();
  initProgressBars();
  initScrollAnimations();
  initScrollToTop();
});

function initProductPlaceholders() {
  const thumbs = document.querySelectorAll(".product-thumb");
  thumbs.forEach((thumb) => {
    const img = thumb.querySelector("img");
    if (!img) return;

    const applyState = () => {
      const src = (img.getAttribute("src") || "").trim();
      if (src) {
        thumb.classList.add("has-image");
        if (thumb.hasAttribute("data-placeholder")) {
          thumb.dataset.placeholder = "";
        }
      } else {
        thumb.classList.remove("has-image");
        if (!thumb.dataset.placeholder) {
          thumb.dataset.placeholder = img.alt || "Product image placeholder";
        }
      }
    };

    applyState();
    img.addEventListener("load", applyState);
    img.addEventListener("error", applyState);
  });
}

function initCustomCursor() {
  const cursorEl = document.querySelector(".custom-cursor");
  if (!cursorEl) return;

  const updateCursor = (event) => {
    cursorEl.style.opacity = "1";
    cursorEl.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  };

  window.addEventListener("mousemove", updateCursor);

  const focusTargets = document.querySelectorAll("a, button, .btn");
  focusTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      cursorEl.style.width = "48px";
      cursorEl.style.height = "48px";
      cursorEl.style.borderColor = "rgba(217, 176, 129, 1)";
    });

    target.addEventListener("mouseleave", () => {
      cursorEl.style.width = "24px";
      cursorEl.style.height = "24px";
      cursorEl.style.borderColor = "rgba(217, 176, 129, 0.8)";
    });
  });

  if (window.Cursor && typeof window.Cursor === "function") {
    new window.Cursor({
      container: document.body,
      className: "cursor-helper",
      speed: 0.15,
      ease: "expo.out"
    });
  }
}

function initHeroParallax() {
  const hero = document.querySelector(".hero-media");
  if (!hero || typeof window.gsap === "undefined") return;

  const gsap = window.gsap;
  const primary = hero.querySelector(".hero-image.primary");
  const secondary = hero.querySelector(".hero-image.secondary");
  if (!primary || !secondary) return;

  hero.addEventListener("mousemove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 20;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 20;

    gsap.to(primary, {
      duration: 1.2,
      x: x * -0.4,
      y: y * -0.4,
      ease: "expo.out"
    });

    gsap.to(secondary, {
      duration: 1.2,
      x: x,
      y: y,
      ease: "expo.out"
    });
  });
}

function initGallery() {
  const container = document.querySelector(".interactive-swiper");
  const captionEl = document.querySelector(".interactive-gallery .interactive-caption");
  const slides = container ? Array.from(container.querySelectorAll(".swiper-slide")) : [];

  if (!container || slides.length === 0) return;

  const setCaption = (content) => {
    if (!captionEl) return;
    captionEl.textContent = content || "";
  };

  if (typeof window.Swiper === "undefined") {
    setCaption(slides[0]?.dataset?.caption || "");
    return;
  }

  setCaption(slides[0]?.dataset?.caption || "");

  const swiper = new window.Swiper(container, {
    loop: true,
    speed: 600,
    spaceBetween: 32,
    centeredSlides: false,
    centeredSlidesBounds: true,
    slidesPerView: 2,
    grabCursor: true,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false
    },
    pagination: {
      el: container.querySelector(".swiper-pagination"),
      clickable: true
    },
    navigation: {
      nextEl: container.querySelector(".swiper-button-next"),
      prevEl: container.querySelector(".swiper-button-prev")
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 20
      },
      800: {
        slidesPerView: 2,
        spaceBetween: 32
      }
    },
    on: {
      init(swiperInstance) {
        const active = swiperInstance.slides[swiperInstance.activeIndex];
        setCaption(active?.dataset?.caption || "");
      },
      slideChangeTransitionStart(swiperInstance) {
        const active = swiperInstance.slides[swiperInstance.activeIndex];
        setCaption(active?.dataset?.caption || "");
      }
    }
  });

  if (swiper.autoplay) {
    container.addEventListener("mouseenter", () => swiper.autoplay.stop());
    container.addEventListener("mouseleave", () => swiper.autoplay.start());
  }
}

function initProgressBars() {
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const gsapInstance = window.gsap;
  const progressBars = document.querySelectorAll(".progress");
  progressBars.forEach((bar) => {
    const target = Number(bar.dataset.progress || bar.getAttribute("data-progress") || 0);

    if (!bar.querySelector(".progress-fill")) {
      const fill = document.createElement("span");
      fill.className = "progress-fill";
      bar.appendChild(fill);

      const label = document.createElement("span");
      label.className = "progress-label";
      label.textContent = `${target}%`;
      bar.appendChild(label);

      if (hasGSAP) {
        gsapInstance.fromTo(
          fill,
          { width: "0%" },
          {
            width: `${target}%`,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bar,
              start: "top 85%",
              once: true
            }
          }
        );

        gsapInstance.from(label, {
          y: 12,
          opacity: 0,
          duration: 0.8,
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bar,
            start: "top 85%",
            once: true
          }
        });
      } else {
        fill.style.width = `${target}%`;
      }
    }
  });
}

function initScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const gsapInstance = window.gsap;
  const { ScrollTrigger } = window;
  gsapInstance.registerPlugin(ScrollTrigger);

  gsapInstance.from(".hero-content h1", {
    y: 80,
    opacity: 0,
    duration: 1.2,
    ease: "expo.out"
  });

  gsapInstance.from(".hero-content p", {
    y: 50,
    opacity: 0,
    duration: 1,
    delay: 0.2,
    ease: "expo.out"
  });

  gsapInstance.from(".hero-content .btn", {
    y: 30,
    opacity: 0,
    duration: 1,
    delay: 0.35,
    ease: "expo.out"
  });

  gsapInstance.utils.toArray(".product-card").forEach((card, index) => {
    gsapInstance.from(card, {
      opacity: 0,
      y: 80,
      duration: 1,
      delay: index * 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        once: true
      }
    });
  });

  gsapInstance.utils.toArray(".story-panel").forEach((panel) => {
    gsapInstance.from(panel, {
      opacity: 0,
      y: 60,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: panel,
        start: "top 80%",
        once: true
      }
    });
  });

  gsapInstance.utils.toArray(".showcase-card").forEach((card) => {
    gsapInstance.from(card, {
      opacity: 0,
      y: 70,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        once: true
      }
    });
  });

  gsapInstance.from(".final-impact", {
    opacity: 0,
    y: 80,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".final-impact",
      start: "top 80%",
      once: true
    }
  });
}

function initScrollToTop() {
  const link = document.querySelector(".to-top");
  if (!link) return;

  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
