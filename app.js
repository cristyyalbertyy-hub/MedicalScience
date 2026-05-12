const navToggle = document.querySelector(".nav-toggle");
const activePage = document.body.dataset.page;

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll("[data-nav]").forEach((link) => {
  if (link.dataset.nav === activePage) {
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  }

  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelector(".sound-button")?.addEventListener("click", (event) => {
  event.currentTarget.textContent = "Video ready for sound";
});
