function getUsers() {
  return JSON.parse(localStorage.getItem("burdaaUsers")) || [];
}

function saveUsers(users) {
  localStorage.setItem("burdaaUsers", JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem("burdaaCurrentUser", JSON.stringify(user));
}

function getRoleFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("rol");
}

function goToPage(page) {
  window.location.href = page;
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value.trim();
    const role = document.getElementById("registerRole").value;
    const department = document.getElementById("department").value.trim();
    const message = document.getElementById("registerMessage");

    if (!name || !email || !password || !role || !department) {
      message.textContent = "Lütfen tüm alanları doldurunuz.";
      message.className = "form-message error";
      return;
    }

    if (password.length < 4) {
      message.textContent = "Şifre en az 4 karakter olmalıdır.";
      message.className = "form-message error";
      return;
    }

    const users = getUsers();
    const userExists = users.find((user) => user.email === email);

    if (userExists) {
      message.textContent = "Bu e-posta ile kayıtlı bir kullanıcı zaten var.";
      message.className = "form-message error";
      return;
    }

    const newUser = {
      name,
      email,
      password,
      role,
      department,
    };

    users.push(newUser);
    saveUsers(users);

    message.textContent = "Kayıt başarılı. Giriş sayfasına yönlendiriliyorsunuz...";
    message.className = "form-message success";

    setTimeout(() => {
      goToPage(`giris.html?rol=${encodeURIComponent(role)}`);
    }, 800);
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const role = getRoleFromUrl();
  const hiddenRole = document.getElementById("role");
  const loginTitle = document.getElementById("loginTitle");
  const loginText = document.getElementById("loginText");

  if (hiddenRole) {
    hiddenRole.value = role || "";
  }

  if (role === "ogrenci") {
    loginTitle.textContent = "Öğrenci Girişi";
    loginText.textContent =
      "Öğrenci hesabınızla giriş yaparak ders katılım bilgilerinizi görüntüleyebilirsiniz.";
  } else if (role === "ogretmen") {
    loginTitle.textContent = "Öğretmen Girişi";
    loginText.textContent =
      "Öğretmen hesabınızla giriş yaparak ders başlatabilir ve QR kod oluşturabilirsiniz.";
  } else {
    loginTitle.textContent = "Sisteme Giriş Yap";
    loginText.textContent = "Devam etmeden önce giriş türünü seçiniz.";
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const selectedRole = document.getElementById("role").value;
    const message = document.getElementById("loginMessage");

    if (!selectedRole) {
      message.textContent = "Lütfen önce giriş türünü seçiniz.";
      message.className = "form-message error";
      return;
    }

    const users = getUsers();

    const matchedUser = users.find(
      (user) =>
        user.email === email &&
        user.password === password &&
        user.role === selectedRole
    );

    if (!matchedUser) {
      message.textContent = "E-posta, şifre veya kullanıcı türü hatalı.";
      message.className = "form-message error";
      return;
    }

    setCurrentUser(matchedUser);
    message.textContent = "Giriş başarılı. Yönlendiriliyorsunuz...";
    message.className = "form-message success";

    setTimeout(() => {
      if (matchedUser.role === "ogrenci") {
        goToPage("ogrenci-panel.html");
      } else {
        goToPage("ogretmen-panel.html");
      }
    }, 700);
  });
}