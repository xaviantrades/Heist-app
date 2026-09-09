import { addProduct } from "./firestore.js";
/**************************************************
POPILATE REDIRECTED PRODUCTS 
ON THE PLACE BUY SCREEN
**************************************************/
const storedProduct = sessionStorage.getItem("selectedProduct");

function removeEmojis(text) {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}]/gu, "")
    .replace(/\/day/gi, "")
    .replace(/ugx/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatMoney(amount) {
  return "UGX " + Number(amount).toLocaleString("en-US");
}

if (!storedProduct) {
    console.error("No product has been selected.");
} else {
    const product = JSON.parse(storedProduct);

    console.log(product);

    document.getElementById("name").textContent = product.name;
    document.getElementById("productTag").textContent = product.tag;

document.querySelector(".tag").textContent = product.tag;
    
   const pricee = formatMoney(removeEmojis(product.price));
     document.getElementById("productPrice").textContent = pricee;

document.querySelector('.btn.primary.full').textContent = product.price;

document.getElementById("paybtn").textContent = "💳 Pay " + product.price;

  document.getElementById("points").textContent = product.points;



  const cleanText = removeEmojis(product.dailyearn);

  const finalAmount = formatMoney(cleanText);
  
  document.getElementById("dailyearn").textContent = finalAmount;

  document.getElementById("dailyget").textContent = finalAmount;

  

  document.querySelector(".detail-image img").src = product.image;
  
  
const retur = formatMoney(product.returnAmount);
  document.getElementById("returnAmount").textContent = retur;

document.getElementById("totlr").textContent = retur;
  
    const detailsContainer = document.getElementById("productDetails");

    if (detailsContainer) {
        detailsContainer.innerHTML = "";

        product.details.forEach((detail) => {
            const span = document.createElement("span");
            span.textContent = detail;
            detailsContainer.appendChild(span);
        });
    }
}
/*****************
ADD BOUGHT PRODUCTS TO FIRESTORE
*******************/


export async function buyproducts() {
  const storedProduct = sessionStorage.getItem("selectedProduct");

  if (!storedProduct) {
    console.error("No product found in session storage.");
    return null;
  }

  let product;
  try {
    product = JSON.parse(storedProduct);
  } catch (err) {
    console.error("Failed to parse stored product:", err);
    return null;
  }

  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No logged-in user found.");
    return null;
  }

  // Sanitize display-formatted fields into real numbers before saving
  const cleanPrice = parseInt(String(product.price).replace(/\D/g, ""), 10) || 0;
  const cleanPoints = parseInt(String(product.points).replace(/\D/g, ""), 10) || 0;
  const cleanDailyearn = parseInt(String(product.dailyearn).replace(/\D/g, ""), 10) || 0;

  try {
    await addProduct(
      userId,
      product,
      cleanPrice,
      cleanPoints,
      product.returnAmount,   // already numeric from earlier fix
      cleanDailyearn
    );

    
    console.log("products saved to cloud");

    return product;
  } catch (err) {
    console.error("Failed to add product:", err);
    return null;
  }
}

