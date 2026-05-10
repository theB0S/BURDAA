const currentUser = JSON.parse(localStorage.getItem("burdaaCurrentUser"));
const userName = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

if (!currentUser) {
  window.location.href = "secim.html";
} else {
  if (userName) {
    userName.textContent = currentUser.name;
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("burdaaCurrentUser");
    window.location.href = "index.html";
  });
}