import { getUserProducts } from "./firestore.js";
import { totalEarning, balance } from "./products-display.js"; 

const total = await totalEarning; 
console.log(total); 

const formattedBalance = await balance; 
console.log(formattedBalance);

document.querySelectorAll(".earnings").forEach(el => {
  el.textContent = formattedBalance;
});

const userId = localStorage.getItem("userId");

async function calculateAndDisplayTotal() {
  try {
    const products = await getUserProducts(userId);

    // Calculate cumulative sum (handles missing prices gracefully)
    const total = products.reduce((sum, product) => {
      const price = parseFloat(product.price) || 0;
      return sum + price;
    }, 0);

    // Sum up all dailyReturn fields (handles missing/null values gracefully)
    const todayEarnings = products.reduce((sum, product) => {
      const dailyReturn = parseFloat(product.dailyReturn) || 0;
      return sum + dailyReturn;
    }, 0);

    // Format for display (adjust currency as needed)
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX'
    }).format(total);

    const formattedTodayEarnings = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX'
    }).format(todayEarnings);

    // Inject into HTML
    const container = document; // or a specific wrapper element, see note below
    const numProductEl = container.querySelector('.numproduct');
    const totalProductEl = container.querySelector('.totalproduct');

    if (numProductEl) numProductEl.textContent = products.length;
    if (totalProductEl) totalProductEl.textContent = formattedTotal;

    // Display today's earnings in all elements with class "todayearn"
    if (document.querySelectorAll(".todayearn").length) {
      document.querySelectorAll(".todayearn").forEach(element => {
        element.textContent = formattedTodayEarnings;
      });
    }

    return total; // Return for further use if needed

  } catch (error) {
    console.error("Error calculating total:", error);
    return 0;
  }
}

// Run on page load
calculateAndDisplayTotal();