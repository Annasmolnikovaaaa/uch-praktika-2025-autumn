document.addEventListener("DOMContentLoaded", () => {
  initProductPlaceholders();
  initGallery();
  initProgressBars();
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

function initGallery() {
  const container = document.querySelector(".interactive-swiper");
  const captionEl = document.querySelector(".interactive-gallery .interactive-caption");
  const slides = container ? Array.from(container.querySelectorAll(".swiper-slide")) : [];

  if (!container || slides.length === 0) return;

  const setCaption = (content) => {
    if (!captionEl) return;
    captionEl.textContent = content || "";
  };

  setCaption(slides[0]?.dataset?.caption || "");

  slides.forEach((slide) => {
    slide.setAttribute("tabindex", "0");
    slide.addEventListener("focus", () => setCaption(slide.dataset.caption || ""));
    slide.addEventListener("mouseenter", () => setCaption(slide.dataset.caption || ""));
  });
}

function initProgressBars() {
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
      fill.style.width = `${target}%`;
    }
  });
}

