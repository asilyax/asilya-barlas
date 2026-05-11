const menuToggle = document.querySelector(".site-header__menu-toggle");
const menuCloseLinks = document.querySelectorAll(
  ".site-header__logo, .site-header__mobile-menu a",
);

menuCloseLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (menuToggle) {
      menuToggle.checked = false;
    }
  });
});
