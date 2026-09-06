import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
  doc,
    setDoc,
    increment,
    serverTimestamp,
    updateDoc, 
  where,
    arrayUnion,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";



/* =========================================================
 * Config
 * ======================================================= */
const firebaseConfig = {
    apiKey: "AIzaSyDIW-u_rIotZgXdkQIrgaKQCNcc0IgIfaI",
    authDomain: "heinstsite-e16c9.firebaseapp.com",
    projectId: "heinstsite-e16c9",
    storageBucket: "heinstsite-e16c9.firebasestorage.app",
    messagingSenderId: "557424802007",
    appId: "1:557424802007:web:15c5964bee736950a15892",
    measurementId: "G-1RE01H3E6F"
  };


/* =========================================================
 * Firebase init
 * ======================================================= */
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* =========================================================
 * SIGN UP LOGIC
 * ======================================================= */
// Generate a random 5-character user ID
function generateUserId(length = 5) {
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        let result = "";

        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        return result;
}

function generateReferralCode(userName) {
    const digits = Math.floor(100 + Math.random() * 900); // random 3-digit number, 100–999
    return `${userName}${digits}`;
}

// generateReferralCode("john") → "john482"

export async function signup(userName, fullName, phoneNumber, password) {

    if (!userName || !fullName || !phoneNumber || !password) {
        throw new Error("All fields are required.");
    }

    // Generate referral code for THIS user
    const referralCode = generateReferralCode(userName);

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

    const hashedPassword = await hashPassword(password);

    let userId;
    let userRef;
    let existingUser;

    do {
        userId = generateUserId(5);

        userRef = doc(db, "users", userId);

        existingUser = await getDoc(userRef);

    } while (existingUser.exists());

    await setDoc(userRef, {
        userId,
        userName,
        fullName,
        phoneNumber,
        password: hashedPassword,
        referralCode,
        referralCount: 0,
        creditedReferralCount: 0,
        referredBy: null,
        createdAt: serverTimestamp()
    });

    return {
        success: true,
        userId
    };
}








 

  /*level1's level2 becomes =======================================
 * ADDING BUY PRODUCTS
 * ======================================================= */
export async function addProduct(
    userId,
    product,
    price,
    Points,
    returnAmount,
    
    dailyearn
) {
    if (
        !userId ||
        !product ||
        price === undefined ||
        Points === undefined ||
        returnAmount === undefined ||
        dailyearn === undefined
    ) {
        throw new Error("All product fields are required.");
    }

    // Reference:
    // users/{userId}/products
    const productsRef = collection(
        db,
        "users",
        userId,
        "products"
    );

    // Firestore automatically creates a random document ID
    const productRef = doc(productsRef);

    await setDoc(productRef, {
        product: product,
        price: Number(price),
        loyaltyPoints: Number(Points),
        return: Number(returnAmount),
        creditedEarn: 0,
        dailyReturn: Number(dailyearn),
        createdAt: serverTimestamp()
    });

    return {
        success: true,
        productId: productRef.id
    };
}

/* =========================================================
 * FATCHING ALL USRR PRODUCTS DATA LOGICS
 * ======================================================= */


// 1. Fetch all products for a user
export async function getUserProducts(userId) {
    const productsRef = collection(db, "users", userId, "products");
    const snapshot = await getDocs(productsRef);

    return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}



/* =========================================================
 * USER LOGIN LOGIC
 * ======================================================= */



export async function loginUser(userName, hashedPassword) {
  const usersRef = collection(db, "users");

  const q = query(
    usersRef,
    where("userName", "==", userName),
    where("password", "==", hashedPassword)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return {
      success: false,
      message: "Invalid username or password."
    };
  }

  const userDoc = snapshot.docs[0];

  return {
    success: true,
    userId: userDoc.id,
    userData: userDoc.data()
  };
}




/* =========================================================
 * REFFERAL PROGRAM
 * ======================================================= */


export async function processReferral(db, referralCode, newUserId) {
    // Find the user who owns this referral code
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("referralCode", "==", referralCode));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.warn("Invalid referral code:", referralCode);
        return null;
    }

    const referrerDoc = snapshot.docs[0];
    const referrerId = referrerDoc.id;
    const referrerName = referrerDoc.data().fullName; // adjust field name as needed

    // Increment referrer's count
    const referrerRef = doc(db, "users", referrerId);
    await updateDoc(referrerRef, {
        referralCount: increment(1)
    });

    // Save referrer's name on the new user's own doc
    const newUserRef = doc(db, "users", newUserId);
    await updateDoc(newUserRef, {
        referredBy: referrerName
    });

    return referrerName;
}




/***

USER DATA

**/


export async function getUserData(db) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        console.warn("No userId found in localStorage");
        return null;
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        console.warn("User document not found for userId:", userId);
        return null;
    }

    return userSnap.data();
}







export async function addToBalance(db, userId, amount) {
    if (!userId) {
        console.error("addToBalance: userId is required");
        return false;
    }

    if (typeof amount !== "number" || isNaN(amount)) {
        console.error("addToBalance: amount must be a valid number");
        return false;
    }

    try {
        const userRef = doc(db, "users", userId);

        await updateDoc(userRef, {
            balance: increment(amount)
        });

        return true;
    } catch (err) {
        console.error("addToBalance error:", err);
        return false;
    }
}


export async function updateProductCredit(db, userId, productId, amount) {
    const productRef = doc(
        db,
        "users",
        userId,
        "products",
        productId
    );

    await updateDoc(productRef, {
        creditedEarn: amount
    });
}