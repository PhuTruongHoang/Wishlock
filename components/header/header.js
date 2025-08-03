const loadHeader = fetch("components/header/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;

    // Chờ DOM cập nhật xong, mới gắn sự kiện
    const loginBtn = document.querySelector(".login-button");
    const loginModal = document.getElementById("login-modal");
    const closeBtn = document.querySelector(".close-button");

    if (loginBtn && loginModal && closeBtn) {
      loginBtn.addEventListener("click", () => {
        loginModal.classList.remove("hidden");
      });

      closeBtn.addEventListener("click", () => {
        loginModal.classList.add("hidden");
      });

      window.addEventListener("click", (e) => {
        if (e.target === loginModal) {
          loginModal.classList.add("hidden");
        }
      });
    } else {
      console.warn("Login elements not found");
    }
  })
  .catch(err => console.error("Header load failed:", err));
