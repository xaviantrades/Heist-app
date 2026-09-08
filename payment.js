import { buyproducts } from "./productbuy.js";

console.log("Payment logic is working");

const API_BASE =
  "https://marzpay-api.investinginaionline.workers.dev";

// --------------------------------------------------
// GET PRODUCT
// --------------------------------------------------

const storedProduct = sessionStorage.getItem("selectedProduct");

if (!storedProduct) {
  console.error("No selected product found.");
}

let product = null;

try {
  product = JSON.parse(storedProduct);
} catch (error) {
  console.error("Invalid selectedProduct:", error);
}

if (!product || typeof product.price === "undefined") {
  console.error("Invalid product data.");
}

// Product price becomes the payment amount
const amount = Number(String(product?.price || 0).replace(/\D/g, ""));

// --------------------------------------------------
// USER DATA
// --------------------------------------------------

const userId = localStorage.getItem("userId");

// --------------------------------------------------
// HTML ELEMENTS
// --------------------------------------------------

const payBtn = document.getElementById("paybtn");
const phoneInput = document.getElementById("phone");
const statusEl = document.getElementById("status");

// --------------------------------------------------
// PAYMENT STATE
// --------------------------------------------------

let timer = null;
let active = false;


// --------------------------------------------------
// STATUS MESSAGE
// --------------------------------------------------

function message(text, type = "") {
  if (!statusEl) return;

  statusEl.textContent = text;
  statusEl.className = "status " + type;
}


// --------------------------------------------------
// STOP PAYMENT POLLING
// --------------------------------------------------

function stop() {
  active = false;

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}


// --------------------------------------------------
// BUTTON STATE
// --------------------------------------------------

function busy(value) {
  if (!payBtn) return;

  payBtn.disabled = value;
  payBtn.textContent = value
    ? "Processing..."
    : "Pay Now";
}


// --------------------------------------------------
// PAY BUTTON
// --------------------------------------------------

if (payBtn) {

  payBtn.addEventListener("click", async (event) => {

    event.preventDefault();

    stop();

    // ----------------------------------------------
    // VALIDATE USER
    // ----------------------------------------------

    if (!userId) {
      message("User is not logged in.", "error");
      return;
    }

    // ----------------------------------------------
    // VALIDATE PHONE
    // ----------------------------------------------

    const phone = phoneInput?.value.trim();

    if (!phone) {
      message(
        "Please enter your mobile-money number.",
        "error"
      );
      return;
    }

    // ----------------------------------------------
    // VALIDATE PRODUCT
    // ----------------------------------------------

    if (!product) {
      message(
        "Unable to load the selected product.",
        "error"
      );
      return;
    }

    // ----------------------------------------------
    // VALIDATE AMOUNT
    // ----------------------------------------------

    if (
      !Number.isInteger(amount) ||
      amount < 500 ||
      amount > 10000000
    ) {
      message(
        "Invalid product price.",
        "error"
      );
      return;
    }

    // ----------------------------------------------
    // START PAYMENT
    // ----------------------------------------------

    busy(true);

    message(
      "Pending",
      "processing"
    );

    try {

      const response = await fetch(
        API_BASE + "/collect-money",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            userId: userId,
            phone: phone,
            amount: amount
          })
        }
      );

      const data = await response.json();

      // --------------------------------------------
      // PAYMENT REQUEST FAILED
      // --------------------------------------------

      if (
        !response.ok ||
        data.status !== "success"
      ) {
        throw new Error(
          data.message ||
          "Payment could not be initiated."
        );
      }

      // --------------------------------------------
      // GET TRANSACTION REFERENCE
      // --------------------------------------------

      const transaction =
        data?.data?.transaction || {};

      const reference =
        transaction.reference ||
        data?.data?.reference ||
        "";

      if (!reference) {
        throw new Error(
          "MarzPay did not return a transaction reference."
        );
      }

      // --------------------------------------------
      // PAYMENT REQUEST SENT
      // --------------------------------------------

      message(
        "Pending",
        "processing"
      );

      // --------------------------------------------
      // START STATUS CHECKING
      // --------------------------------------------

      pollPayment(reference);

    } catch (error) {

      console.error(
        "Payment initiation error:",
        error
      );

      stop();

      message(
        "Payment failed",
        "error"
      );

      busy(false);
    }

  });

}


// --------------------------------------------------
// CHECK PAYMENT STATUS
// --------------------------------------------------

function pollPayment(reference) {

  active = true;

  let attempts = 0;

  async function check() {

    if (!active) return;

    attempts++;

    try {

      const response = await fetch(
        API_BASE +
        "/payment-status/" +
        encodeURIComponent(reference),
        {
          cache: "no-store"
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        data.status !== "success"
      ) {
        throw new Error(
          data.message ||
          "Status check failed."
        );
      }

      const payment =
        data.data || {};

      const status =
        String(
          payment.status || "processing"
        ).toLowerCase();

      // ------------------------------------------
      // SUCCESSFUL PAYMENT
      // ------------------------------------------

      if (status === "paid") {

        stop();

        message(
          "Payment successful",
          "success"
        );

        busy(false);

        // ----------------------------------------
        // ADD PRODUCT AFTER CONFIRMED PAYMENT
        // ----------------------------------------

        try {

          await buyproducts();

          console.log(
            "Product successfully added."
          );
          window.location.href = "dashboard.html";

        } catch (error) {

          console.error(
            "buyproducts error:",
            error
          );

          // Payment itself succeeded.
          // Therefore do NOT change status
          // back to "Payment failed".

        }

        return;
      }


      // ------------------------------------------
      // FAILED PAYMENT
      // ------------------------------------------

      if (status === "failed") {

        stop();

        message(
          "Payment failed",
          "error"
        );

        busy(false);

        return;
      }


      // ------------------------------------------
      // CANCELLED PAYMENT
      // ------------------------------------------

      if (status === "cancelled") {

        stop();

        message(
          "Payment cancelled",
          "error"
        );

        busy(false);

        return;
      }


      // ------------------------------------------
      // STILL PROCESSING
      // ------------------------------------------

      message(
        "Pending",
        "processing"
      );


      // ------------------------------------------
      // MAXIMUM 60 ATTEMPTS
      // 60 × 3 seconds = 3 minutes
      // ------------------------------------------

      if (attempts >= 60) {

        stop();

        message(
          "Pending",
          "processing"
        );

        busy(false);

        return;
      }


      // ------------------------------------------
      // CHECK AGAIN AFTER 3 SECONDS
      // ------------------------------------------

      timer = setTimeout(
        check,
        3000
      );

    } catch (error) {

      console.error(
        "Payment status error:",
        error
      );

      // Keep checking unless maximum attempts
      // have been reached.

      if (attempts >= 60) {

        stop();

        message(
          "Payment failed",
          "error"
        );

        busy(false);

        return;
      }

      timer = setTimeout(
        check,
        3000
      );
    }

  }

  check();
}

console.log("Payment logic is working");