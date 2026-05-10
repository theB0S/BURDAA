const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu.classList.toggle("show");
  });

  document.querySelectorAll(".nav a").forEach((item) => {
    item.addEventListener("click", () => {
      navMenu.classList.remove("show");
    });
  });

  document.addEventListener("click", (e) => {
    const clickedInsideMenu = navMenu.contains(e.target);
    const clickedToggle = menuToggle.contains(e.target);

    if (!clickedInsideMenu && !clickedToggle) {
      navMenu.classList.remove("show");
    }
  });
}