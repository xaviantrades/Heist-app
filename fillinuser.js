import { db, getUserData, addToBalance } from "./firestore.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const userId = localStorage.getItem("userId");


async function updateReferralBonus() {

    const userData = await getUserData(db, userId);

    const currentReferrals = Number(userData.referralCount) || 0;
    const creditedReferrals = Number(userData.creditedReferralCount) || 0;


    const newReferrals = currentReferrals - creditedReferrals;


    if (newReferrals > 0) {

        const amount = newReferrals * 1910;


        // Add only new referral earnings
        await addToBalance(
            db,
            userId,
            amount
        );


        // Save progress so it doesn't repeat
        await updateDoc(
            doc(db, "users", userId),
            {
                creditedReferralCount: currentReferrals
            }
        );
    }
  console.log("2000");
  function updateReferralAmount() {
    const currentAmount = currentReferrals * 2311.5;
    const referralMessage = `UGX ${currentAmount.toLocaleString("en-UG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;

    document.querySelectorAll(".comm").forEach(element => {
        element.textContent = referralMessage;
    });
}

updateReferralAmount();
}



updateReferralBonus();

const userData = await getUserData(db);
const balanceEls = document.querySelectorAll(".bal");

if (userData) {
    const balance = Number(userData.balance) || 0;
    const formatted = `UGX ${balance.toLocaleString("en-UG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;

    balanceEls.forEach(el => el.textContent = formatted);
}



const SITE_URL = "https://xaviantrades.github.io/Heist-app/";

function formatDate(timestamp) {
    if (!timestamp) return "N/A";
    // Firestore Timestamp object has a toDate() method
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

async function renderProfile(db) {
    const userData = await getUserData(db);

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

  if (document.getElementById("refno")) { document.getElementById("refno").textContent = userData.referralCount; }
  if (document.getElementById("refo")) { document.getElementById("refo").textContent = userData.referralCount; }

  if (document.getElementById("reff")) { document.getElementById("reff").textContent = userData.referralCount; }
    
    
    if (document.querySelectorAll(".fullNameValue")) {
    document.querySelectorAll(".fullNameValue").forEach(element => {
        element.textContent = userData.fullName;
    });
}

if (document.querySelectorAll(".phoneValue")) {
    document.querySelectorAll(".phoneValue").forEach(element => {
        element.textContent = userData.phoneNumber;
    });
}
  
  if (document.querySelectorAll(".referralCodeValue").length) {
    document.querySelectorAll(".referralCodeValue").forEach(element => {
        element.textContent = userData.referralCode;
    });
}

if (document.querySelectorAll(".referralLinkValue").length) {
    document.querySelectorAll(".referralLinkValue").forEach(element => {
        element.value = `${SITE_URL}/signup?ref=${userData.referralCode}`;
    });
}
  
  if (document.querySelectorAll(".referralLinValue").length) {
    document.querySelectorAll(".referralLinValue").forEach(element => {
        element.textContent = `${SITE_URL}/signup?ref=${userData.referralCode}`;
    });
  }

  
  
  if (document.getElementById("memberSinceValue")) { document.getElementById("memberSinceValue").textContent = formatDate(userData.createdAt); } 
  
  if (document.getElementById("referredByValue")) { document.getElementById("referredByValue").textContent = userData.referredBy || "Self"; } 
  
  // Copy code button 
  
  const copyCodeBtn = document.getElementById("copyCodeBtn"); if (copyCodeBtn) { copyCodeBtn.addEventListener("click", () => { navigator.clipboard.writeText(userData.referralCode); alert("Referral code copied!"); }); } // Copy link button 
  const copyLinkBtn = document.getElementById("copyLinkBtn"); if (copyLinkBtn) { copyLinkBtn.addEventListener("click", () => { const referralLink = `${SITE_URL}/signup?ref=${userData.referralCode}`; navigator.clipboard.writeText(referralLink); alert("Referral link copied!"); }); }
    

    

    
}

renderProfile(db);

console.log("filling working");