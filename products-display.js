import { getUserProducts, addToBalance, db, updateProductCredit } from "./firestore.js";

const userId = localStorage.getItem("userId");

export function computeEarnings(product) {
    const createdAt = product.createdAt?.toDate
        ? product.createdAt.toDate()
        : new Date(product.createdAt);

    const dailyEarn = Number(product.dailyReturn) || 0;

    const stopDate = new Date(createdAt);
    stopDate.setDate(stopDate.getDate() + 30);

    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const rawDaysElapsed = Math.floor((now - createdAt) / msPerDay);
    const daysElapsed = Math.min(Math.max(rawDaysElapsed, 0), 30);
    const isCompleted = now >= stopDate;

    let cumulative = 0;
    const dailyBreakdown = [];

    for (let day = 1; day <= daysElapsed; day++) {
        cumulative += dailyEarn;

        const date = new Date(createdAt);
        date.setDate(date.getDate() + day);

        dailyBreakdown.push({
            day,
            date,
            dailyEarn,
            cumulative: Number(cumulative.toFixed(2))
        });
    }

    return {
        ...product,
        createdAt,
        stopDate,
        daysElapsed,
        isCompleted,
        totalEarned: Number(cumulative.toFixed(2)),
        dailyBreakdown
    };
}

export const totalEarning = (async () => {
    const products = await getUserProducts(userId);
    const withEarnings = products.map(computeEarnings);
    renderProducts(withEarnings);
    return calculateTotalEarnings(withEarnings);
})();




async function updateBalanceFromProducts() {

    const products = await getUserProducts(userId);

    const withEarnings = products.map(computeEarnings);

    let amountToAdd = 0;

    for (const product of withEarnings) {

        const alreadyAdded = Number(product.creditedEarn || 0);

        const newAmount =
            Number(product.totalEarned || 0) - alreadyAdded;

        if (newAmount > 0) {

            amountToAdd += newAmount;

            // Mark this product's earnings as credited
            await updateProductCredit(
    db,
    userId,
    product.id,
    product.totalEarned
);
        }
    }

    // Add only the NEW earnings to balance
    if (amountToAdd > 0) {

        await addToBalance(
            db,
            userId,
            amountToAdd
        );
    }
}

updateBalanceFromProducts();


function renderProducts(products) {
    const containers = document.querySelectorAll(".order-list");
    if (!containers.length || products.length === 0) return;

    const html = products.map(p => `
        <div class="product-card">
            <h3>${p.product.name}</h3>
            <p>Price: ${p.price}</p>
            <p>Daily Wage, UGX:${p.dailyReturn.toLocaleString("en-UG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}</p>
            <p>Opt in On: ${p.createdAt.toLocaleDateString()}</p>
            <p>Opt out On: ${p.stopDate.toLocaleDateString()}</p>
            <p class="${p.isCompleted ? "status-completed" : "status-active"}">
                ${p.isCompleted ? "Completed" : "Active"} (Day ${p.daysElapsed}/30)
            </p>
            <p class="total">Disbursed Total, UGX:${p.totalEarned.toLocaleString("en-UG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}</p>
        </div>
    `).join("");

    containers.forEach(container => {
        container.innerHTML = html;
    });
}

export function calculateTotalEarnings(products) {
    return products.reduce((total, product) => {
        return total + (product.totalEarned || 0);
    }, 0);
}
// EXPORT THE PROMISE


// Optional: formatted balance as a Promise
export const balance = totalEarning.then(total => {
    return `UGX ${total.toLocaleString("en-UG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
});



