function getCurrentUserSystem() {
  return JSON.parse(localStorage.getItem("burdaaCurrentUser")) || null;
}

function getSessions() {
  return JSON.parse(localStorage.getItem("burdaaSessions")) || [];
}

function saveSessions(sessions) {
  localStorage.setItem("burdaaSessions", JSON.stringify(sessions));
}

function getActiveSession() {
  return JSON.parse(localStorage.getItem("burdaaActiveSession")) || null;
}

function setActiveSession(session) {
  localStorage.setItem("burdaaActiveSession", JSON.stringify(session));
}

function clearActiveSession() {
  localStorage.removeItem("burdaaActiveSession");
}

function getAttendances() {
  return JSON.parse(localStorage.getItem("burdaaAttendances")) || [];
}

function saveAttendances(attendances) {
  localStorage.setItem("burdaaAttendances", JSON.stringify(attendances));
}

function createFakeQrCode() {
  return "BURDAA-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

/* DERS BAŞLAT */
const sessionForm = document.getElementById("sessionForm");
if (sessionForm) {
  const lessonDateInput = document.getElementById("lessonDate");
  const lessonTimeInput = document.getElementById("lessonTime");

  if (lessonDateInput && !lessonDateInput.value) {
    lessonDateInput.value = new Date().toISOString().split("T")[0];
  }

  if (lessonTimeInput && !lessonTimeInput.value) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    lessonTimeInput.value = `${hh}:${mm}`;
  }

  sessionForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const lessonName = document.getElementById("lessonName").value;
    const lessonClass = document.getElementById("lessonClass").value.trim();
    const lessonDuration = document.getElementById("lessonDuration").value.trim();
    const lessonDate = document.getElementById("lessonDate").value;
    const lessonTime = document.getElementById("lessonTime").value;
    const lessonLocation = document.getElementById("lessonLocation").value.trim();
    const sessionMessage = document.getElementById("sessionMessage");

    if (!lessonName || !lessonClass || !lessonDuration || !lessonDate || !lessonTime || !lessonLocation) {
      sessionMessage.textContent = "Lütfen tüm alanları doldurunuz.";
      sessionMessage.className = "form-message error";
      return;
    }

    const currentUser = getCurrentUserSystem();
    const newSession = {
      id: Date.now(),
      lessonName,
      lessonClass,
      lessonDuration,
      lessonDate,
      lessonTime,
      lessonLocation,
      teacherName: currentUser ? currentUser.name : "Öğretmen",
      qrCode: createFakeQrCode(),
      isActive: true
    };

    const sessions = getSessions();
    sessions.push(newSession);
    saveSessions(sessions);
    setActiveSession(newSession);

    sessionMessage.textContent = "Yoklama oturumu oluşturuldu. QR ekranına yönlendiriliyorsunuz...";
    sessionMessage.className = "form-message success";

    setTimeout(() => {
      window.location.href = "ogretmen-qr.html";
    }, 700);
  });
}

/* QR ÖĞRETMEN SAYFASI */
const qrCodeText = document.getElementById("qrCodeText");
if (qrCodeText) {
  const activeSession = getActiveSession();

  const nameEl = document.getElementById("activeLessonName");
  const classEl = document.getElementById("activeLessonClass");
  const dateEl = document.getElementById("activeLessonDate");
  const timeEl = document.getElementById("activeLessonTime");
  const durationEl = document.getElementById("activeLessonDuration");
  const locationEl = document.getElementById("activeLessonLocation");
  const liveAttendanceList = document.getElementById("liveAttendanceList");
  const refreshQrBtn = document.getElementById("refreshQrBtn");
  const closeSessionBtn = document.getElementById("closeSessionBtn");

  if (activeSession) {
    if (nameEl) nameEl.textContent = activeSession.lessonName;
    if (classEl) classEl.textContent = activeSession.lessonClass;
    if (dateEl) dateEl.textContent = activeSession.lessonDate;
    if (timeEl) timeEl.textContent = activeSession.lessonTime;
    if (durationEl) durationEl.textContent = activeSession.lessonDuration + " dk";
    if (locationEl) locationEl.textContent = activeSession.lessonLocation;
    qrCodeText.textContent = activeSession.qrCode;
  } else {
    qrCodeText.textContent = "AKTİF YOKLAMA BULUNMUYOR";
  }

  function renderLiveAttendance() {
    const attendances = getAttendances();
    const currentActive = getActiveSession();

    if (!currentActive) {
      liveAttendanceList.innerHTML = "<li>Aktif yoklama bulunmuyor.</li>";
      return;
    }

    const filtered = attendances.filter(item => item.sessionId === currentActive.id);

    if (filtered.length === 0) {
      liveAttendanceList.innerHTML = "<li>Henüz katılım yok</li>";
      return;
    }

    liveAttendanceList.innerHTML = filtered
      .map(item => `<li>${item.studentName} - Katıldı</li>`)
      .join("");
  }

  renderLiveAttendance();

  if (refreshQrBtn) {
    refreshQrBtn.addEventListener("click", () => {
      const currentActive = getActiveSession();
      if (!currentActive) return;

      currentActive.qrCode = createFakeQrCode();
      setActiveSession(currentActive);

      const sessions = getSessions().map(session =>
        session.id === currentActive.id ? currentActive : session
      );
      saveSessions(sessions);

      qrCodeText.textContent = currentActive.qrCode;
    });
  }

  if (closeSessionBtn) {
    closeSessionBtn.addEventListener("click", () => {
      const currentActive = getActiveSession();
      if (!currentActive) return;

      const sessions = getSessions().map(session =>
        session.id === currentActive.id ? { ...session, isActive: false } : session
      );

      saveSessions(sessions);
      clearActiveSession();
      window.location.href = "ogretmen-raporlar.html";
    });
  }
}

/* ÖĞRENCİ QR SAYFASI */
/* ÖĞRENCİ QR SAYFASI */
const scanQrBtn = document.getElementById("scanQrBtn");
if (scanQrBtn) {
  const activeSession = getActiveSession();

  const nameEl = document.getElementById("studentActiveLessonName");
  const classEl = document.getElementById("studentActiveLessonClass");
  const dateEl = document.getElementById("studentActiveLessonDate");
  const timeEl = document.getElementById("studentActiveLessonTime");
  const locationEl = document.getElementById("studentActiveLessonLocation");
  const scanMessage = document.getElementById("scanMessage");
  const successCheckArea = document.getElementById("successCheckArea");
  const scannerBox = document.getElementById("scannerBox");
  const scannerText = document.getElementById("scannerText");

  if (activeSession) {
    if (nameEl) nameEl.textContent = activeSession.lessonName;
    if (classEl) classEl.textContent = activeSession.lessonClass;
    if (dateEl) dateEl.textContent = activeSession.lessonDate;
    if (timeEl) timeEl.textContent = activeSession.lessonTime;
    if (locationEl) locationEl.textContent = activeSession.lessonLocation;
  } else {
    if (scanMessage) {
      scanMessage.textContent = "Şu anda aktif bir yoklama bulunmuyor.";
      scanMessage.className = "form-message error";
    }
  }

  scanQrBtn.addEventListener("click", () => {
    const currentUser = getCurrentUserSystem();
    const currentActive = getActiveSession();

    if (!currentActive) {
      scanMessage.textContent = "Aktif QR yoklaması bulunmuyor.";
      scanMessage.className = "form-message error";
      return;
    }

    const attendances = getAttendances();
    const alreadyJoined = attendances.find(
      item => item.sessionId === currentActive.id && item.studentEmail === currentUser.email
    );

    if (alreadyJoined) {
      scanMessage.textContent = "Bu yoklamaya zaten katıldınız.";
      scanMessage.className = "form-message error";
      return;
    }

    attendances.push({
      id: Date.now(),
      sessionId: currentActive.id,
      lessonName: currentActive.lessonName,
      lessonDate: currentActive.lessonDate,
      lessonTime: currentActive.lessonTime,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      status: "Katıldı"
    });

    saveAttendances(attendances);

    if (scannerBox) {
      scannerBox.classList.add("hidden");
    }

    if (successCheckArea) {
      successCheckArea.classList.remove("hidden");
    }

    if (scannerText) {
      scannerText.textContent = "Tarama Tamamlandı";
    }

    scanMessage.textContent = "QR okuma başarılı. Yoklama kaydınız oluşturuldu.";
    scanMessage.className = "form-message success";
  });
}

/* ÖĞRENCİ YOKLAMALARIM */
const studentAttendanceList = document.getElementById("studentAttendanceList");
if (studentAttendanceList) {
  const currentUser = getCurrentUserSystem();
  const attendances = getAttendances().filter(
    item => currentUser && item.studentEmail === currentUser.email
  );

  if (attendances.length === 0) {
    studentAttendanceList.innerHTML = "<li>Henüz kayıtlı yoklama bulunmuyor.</li>";
  } else {
    studentAttendanceList.innerHTML = attendances
      .map(item => `<li>${item.lessonName} - ${item.lessonDate} ${item.lessonTime} - ${item.status}</li>`)
      .join("");
  }
}

/* RAPORLAR */
const reportTableBody = document.getElementById("reportTableBody");
if (reportTableBody) {
  const sessions = getSessions();
  const attendances = getAttendances();
  const activeSession = getActiveSession();

  const sessionCountEl = document.getElementById("reportSessionCount");
  const attendanceCountEl = document.getElementById("reportAttendanceCount");
  const activeStatusEl = document.getElementById("reportActiveStatus");
  const attendanceHistoryList = document.getElementById("attendanceHistoryList");

  if (sessionCountEl) sessionCountEl.textContent = sessions.length;
  if (attendanceCountEl) attendanceCountEl.textContent = attendances.length;
  if (activeStatusEl) activeStatusEl.textContent = activeSession ? "Aktif" : "Pasif";

  if (sessions.length === 0) {
    reportTableBody.innerHTML = `<tr><td colspan="5">Henüz kayıtlı yoklama oturumu bulunmuyor.</td></tr>`;
  } else {
    reportTableBody.innerHTML = sessions
      .slice()
      .reverse()
      .map(session => `
        <tr>
          <td>${session.lessonName}</td>
          <td>${session.lessonClass}</td>
          <td>${session.lessonDate}</td>
          <td>${session.lessonTime}</td>
          <td>${session.lessonDuration} dk</td>
        </tr>
      `)
      .join("");
  }

  if (attendanceHistoryList) {
    if (attendances.length === 0) {
      attendanceHistoryList.innerHTML = "<li>Henüz öğrenci katılımı bulunmuyor.</li>";
    } else {
      attendanceHistoryList.innerHTML = attendances
        .slice()
        .reverse()
        .map(item => `<li>${item.studentName} - ${item.lessonName} - ${item.lessonDate} ${item.lessonTime}</li>`)
        .join("");
    }
  }
  function getChatMessages() {
  return JSON.parse(localStorage.getItem("burdaaChatMessages")) || [];
}

function saveChatMessages(messages) {
  localStorage.setItem("burdaaChatMessages", JSON.stringify(messages));
}

/* DERS CHAT */
function getChatMessages() {
  return JSON.parse(localStorage.getItem("burdaaChatMessages")) || [];
}

function saveChatMessages(messages) {
  localStorage.setItem("burdaaChatMessages", JSON.stringify(messages));
}

/* DERS DUYURULARI */
const chatMessagesBox = document.getElementById("chatMessages");
if (chatMessagesBox) {
  const currentUser = getCurrentUserSystem();
  const chatCurrentUser = document.getElementById("chatCurrentUser");
  const teacherAnnouncementBox = document.getElementById("teacherAnnouncementBox");
  const studentInfoBox = document.getElementById("studentInfoBox");
  const sendChatMessageBtn = document.getElementById("sendChatMessageBtn");
  const chatMessageInput = document.getElementById("chatMessageInput");
  const chatMessageStatus = document.getElementById("chatMessageStatus");
  const studentNavLink = document.getElementById("studentNavLink");
  const teacherNavLink = document.getElementById("teacherNavLink");

  if (currentUser && chatCurrentUser) {
    chatCurrentUser.textContent = currentUser.name;
  }

  if (currentUser && currentUser.role === "ogretmen") {
    if (teacherAnnouncementBox) {
      teacherAnnouncementBox.classList.remove("hidden");
    }
    if (studentInfoBox) {
      studentInfoBox.classList.add("hidden");
    }
    if (studentNavLink) {
      studentNavLink.style.display = "none";
    }
  } else {
    if (teacherAnnouncementBox) {
      teacherAnnouncementBox.classList.add("hidden");
    }
    if (studentInfoBox) {
      studentInfoBox.classList.remove("hidden");
    }
    if (teacherNavLink) {
      teacherNavLink.style.display = "none";
    }
  }

  function renderChatMessages() {
    const messages = getChatMessages();

    if (!messages || messages.length === 0) {
      chatMessagesBox.innerHTML = `<div class="chat-empty">Henüz duyuru paylaşılmadı.</div>`;
      return;
    }

    chatMessagesBox.innerHTML = messages
      .slice()
      .reverse()
      .map(
        (msg) => `
          <div class="chat-message teacher-message announcement-message">
            <div class="chat-message-top">
              <strong>${msg.sender}</strong>
              <span>${msg.time}</span>
            </div>
            <p>${msg.text}</p>
          </div>
        `
      )
      .join("");
  }

  renderChatMessages();

  if (sendChatMessageBtn && chatMessageInput) {
    sendChatMessageBtn.addEventListener("click", () => {
      if (!currentUser || currentUser.role !== "ogretmen") {
        return;
      }

      const text = chatMessageInput.value.trim();

      if (!text) {
        if (chatMessageStatus) {
          chatMessageStatus.textContent = "Lütfen duyuru metni giriniz.";
          chatMessageStatus.className = "form-message error";
        }
        return;
      }

      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} - ${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;

      const messages = getChatMessages();

      messages.push({
        id: Date.now(),
        sender: currentUser.name,
        role: "ogretmen",
        text: text,
        time: time
      });

      saveChatMessages(messages);
      chatMessageInput.value = "";

      if (chatMessageStatus) {
        chatMessageStatus.textContent = "Duyuru başarıyla gönderildi.";
        chatMessageStatus.className = "form-message success";
      }

      renderChatMessages();
    });
  }
}
}