import { db, getUserData, addToBalance, getWithdrawals, requestWithdrawal } from "./firestore.js";
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



const SITE_URL = "https://hashein-7k1t.onrender.com";

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

  
  
  if (document.getElementById("memberSinceValue")) { document.getElementById("memberSinceValue").textContent = formatDate(userData.createdAt); } if (document.getElementById("referredByValue")) { document.getElementById("referredByValue").textContent = userData.referredBy || "Self"; } // Copy code button 
  const copyCodeBtn = document.getElementById("copyCodeBtn"); if (copyCodeBtn) { copyCodeBtn.addEventListener("click", () => { navigator.clipboard.writeText(userData.referralCode); alert("Referral code copied!"); }); } // Copy link button 
  const copyLinkBtn = document.getElementById("copyLinkBtn"); if (copyLinkBtn) { copyLinkBtn.addEventListener("click", () => { const referralLink = `${SITE_URL}/signup?ref=${userData.referralCode}`; navigator.clipboard.writeText(referralLink); alert("Referral link copied!"); }); }
    

    

    
}

renderProfile(db);

console.log("filling working");



const accbalance = Number(userData.balance);

const msgg = document.getElementById("msgg");


const amountt = document.getElementById("amountInput");


const phono = document.getElementById("phoneInput");


const withdrawBtn = document.getElementById("withdrawBtn");

if (withdrawBtn) {

    withdrawBtn.addEventListener("click", async () => {

        const amount = Number(amountt.value);
        const phoneNumber = phono.value.trim();

        // 1. Validate amount
        if (isNaN(amount) || amountt.value.trim() === "") {
            msgg.textContent = "Invalid amount.";
            return;
        }

        if (amount > accbalance || amount < 3500) {
            msgg.textContent = `Invalid amount. Maximum is ${accbalance}, minimum is 3500.`;
            return;
        }

        // 2. Validate phone number: must start with "07", numeric only, max 20 digits
        const phoneRegex = /^07\d*$/;

        if (!phoneRegex.test(phoneNumber) || phoneNumber.length > 10) {
            msgg.textContent = "Invalid phone number. Must start with 07 and be a 10 digits number.";
            return;
        }
      withdrawBtn.disabled = true;
            withdrawBtn.textContent = '⏳ Processing…';

        // 3. All checks passed
        msgg.textContent = "";
       await requestWithdrawal(userId, phoneNumber, amount);

overlay.classList.add('show');
      withdrawBtn.disabled = false;
        withdrawBtn.textContent = '💸 Withdraw Now';
       amountt.value = "";
phono.value = "";
      renderHistory();
      
    });
  

}



function formatCurrency(amount) {
  return Number(amount).toLocaleString('en-UG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}



 const historyBody = document.getElementById('historyBody');
        const historyCount = document.getElementById('historyCount');
const totalWithdrawn = document.getElementById('totalWithdrawn');
// Fetch history for the same user

async function renderHistory() {
  const tbody = historyBody;
  try {
    const history = await getWithdrawals(userId);
    tbody.innerHTML = '';

    if (history.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4">
            <div class="empty-state">
              <div class="icon">📭</div>
              <p>No withdrawals yet.</p>
            </div>
          </td>
        </tr>
      `;
      historyCount.textContent = '0 entries';
      totalWithdrawn.textContent = '0';
      return;
    }

    // already newest first from Firestore query
    let total = 0;
    history.forEach(item => {
      total += Number(item.amount);
      const tr = document.createElement('tr');
      const statusClass = item.status || 'pending';
      const statusLabel = statusClass.charAt(0).toUpperCase() + statusClass.slice(1);
      const providerLabel = 'Mobile Money';
      tr.innerHTML = `
        <td style="font-size:12px;white-space:nowrap;">${item.createdAt || '—'}</td>
        <td>${providerLabel}</td>
        <td style="font-weight:600;">UGX ${formatCurrency(Number(item.amount))}</td>
        <td><span class="status ${statusClass}"><span class="dot"></span>${statusLabel}</span></td>
      `;
      tbody.appendChild(tr);
    });

    historyCount.textContent = `${history.length} entries`;
    totalWithdrawn.textContent = formatCurrency(total);

  } catch (error) {
    console.error("Failed to render history:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <p>Couldn't load withdrawal history. Please try again.</p>
          </div>
        </td>
      </tr>
    `;
  }
}

if (historyBody && historyCount && totalWithdrawn) {
  renderHistory();
}

