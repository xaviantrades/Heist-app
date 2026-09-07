import { signup, processReferral, db } from "./firestore.js";

// Pre-fill referral code from URL on page load
window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get("ref");

    if (referralCode) {
        document.getElementById("id_referral_code").value = referralCode;
    }
});

document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const userName = document.getElementById("id_username").value.trim();
    const fullName = document.getElementById("id_full_name").value.trim();
    const phoneNumber = document.getElementById("id_phone").value.trim();
    const password = document.getElementById("id_password1").value;
    const referredByCode = document.getElementById("id_referral_code").value.trim();

    const msg = document.getElementById("msg");
    const btn = document.querySelector(".btn.primary.full");

    function redirectToLogin() {
        setTimeout(() => {
            window.location.href = "login.html";
        }, 3000);
    }

    // ...rest of your submit handler unchanged

  // Basic validation
    if (!userName || !fullName || !phoneNumber || !password) {
        msg.textContent = "Please fill in all required fields.";
        return;
    }

    // Store original button state
    const originalText = btn.textContent;

    // Set loading state
    btn.disabled = true;
    btn.textContent = "Please wait...";
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";

    try {
    const result = await signup(
        userName,
        fullName,
        phoneNumber,
        password
    );

    msg.textContent = "signup successful";

    if (referredByCode && result?.userId) {
        await processReferral(db, referredByCode, result.userId);
    }

    redirectToLogin();

} catch (error) {
    msg.textContent = `signup error: ${error.message || error}`;
    btn.disabled = false;
    btn.textContent = originalText;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
    }
  });