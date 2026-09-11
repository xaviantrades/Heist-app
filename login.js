import { loginUser } from "./firestore.js";

/**
 * Hashein — Login page
 * Handles: mobile menu toggle and basic client-side validation.
 */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFormValidation();
});

/* -------------------------------------------------------
   Mobile menu toggle
   ------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.querySelector('.menu');
  const nav = document.querySelector('.topbar nav');
  if (!menuBtn || !nav) return;

  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('sf-hidden');
  });
}

/* -------------------------------------------------------
   Form validation
   ------------------------------------------------------- */
function initFormValidation() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const username = document.getElementById('id_username');
    const loginbtn = document.getElementById('loginbtn');
    const password = document.getElementById('id_password');
    let valid = true;

    if (!username.value.trim()) {
      valid = false;
      username.setCustomValidity('Please enter your username.');
    } else {
      username.setCustomValidity('');
    }

    if (!password.value) {
      valid = false;
      password.setCustomValidity('Please enter your password.');
    } else {
      password.setCustomValidity('');
    }

    if (!valid) {
      e.preventDefault();
      form.reportValidity();
    }
  });
}




document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userName = document
    .getElementById("id_username")
    .value
    .trim();

  const password = document.getElementById("id_password").value;

  loginbtn.textContent = "Please Wait"

  if (!userName || !password) {
    alert("Please enter your username and password.");
    return;
  }

  try {

    // Hash password before sending it to Firestore logic
    const hashedPassword = await hashPassword(password);

    // Call the Firestore function
    const result = await loginUser(userName, hashedPassword);

    if (result.success) {

      // Plain login logic
      localStorage.setItem("userId", result.userId);
      localStorage.setItem("isLogin", "true");

      // Optional: save user data
      localStorage.setItem(
        "userData",
        JSON.stringify(result.userData)
      );

      window.location.href = "index.html";

    } else {

      alert(result.message);

    }

  } catch (err) {

    console.error("Login error:", err);
    alert("Something went wrong. Please try again.");

  }
});


async function hashPassword(password) {

  const encoder = new TextEncoder();

  const data = encoder.encode(password);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  );

  return hashArray
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}
