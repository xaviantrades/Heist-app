import { addProduct } from "./firestore.js";
/**************************************************
POPILATE REDIRECTED PRODUCTS 
ON THE PLACE BUY SCREEN
**************************************************/
const storedProduct = sessionStorage.getItem("selectedProduct");

if (!storedProduct) {
    console.error("No product has been selected.");
} else {
    const product = JSON.parse(storedProduct);

    console.log(product);

    document.getElementById("name").textContent = product.name;
    document.getElementById("productTag").textContent = product.tag;
    document.getElementById("productPrice").textContent = product.price;

document.querySelector('.btn.primary.full').textContent = product.price;

document.getElementById("paybtn").textContent = "💳 Pay " + product.price;

  document.getElementById("points").textContent = product.points;
  
  document.getElementById("dailyearn").textContent = product.dailyearn;

  document.getElementById("returnAmount").textContent = product.returnAmount;

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

buyproducts();