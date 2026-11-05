// Firebase Cloud Service (Firestore & Storage)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase safely
let app, db, storage;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (e) {
    console.warn("Firebase initialization skipped or failed:", e);
}

// Default fallback data if Firebase is not yet configured or empty
const DEFAULT_CATEGORIES = [
    { id: 'makeup', name: 'المكياج ومستحضرات التجميل', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop' },
    { id: 'women', name: 'ملابس نسائية راقية', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop' },
    { id: 'kids', name: 'ملابس أطفال عصرية', image: 'https://images.unsplash.com/photo-1503944583220-7eeec393dffb?q=80&w=800&auto=format&fit=crop' }
];

const DEFAULT_SETTINGS = {
    name: 'ياسمين الشام',
    phone: '+963 980 980 165',
    address: 'سوريا - درعا / الكرك الشرقي',
    adminUser: 'admin',
    adminPass: '123'
};

// Fetch Categories from Firestore
export async function fetchCategories() {
    try {
        if (!db) throw new Error("No DB");
        const querySnapshot = await getDocs(collection(db, "categories"));
        const cats = [];
        querySnapshot.forEach((docSnap) => {
            cats.push(docSnap.data());
        });
        if (cats.length === 0) {
            for (const cat of DEFAULT_CATEGORIES) {
                await setDoc(doc(db, "categories", cat.id), cat);
            }
            return DEFAULT_CATEGORIES;
        }
        return cats;
    } catch (e) {
        console.warn("Firebase fetch categories fallback to localStorage:", e);
        return JSON.parse(localStorage.getItem('yasmine_categories') || JSON.stringify(DEFAULT_CATEGORIES));
    }
}

// Save Category to Firestore (with localStorage sync fallback)
export async function saveCategoryToCloud(cat) {
    try {
        if (db) {
            await setDoc(doc(db, "categories", cat.id), cat);
        }
    } catch (e) {
        console.error("Error saving category to cloud:", e);
    }
}

// Delete Category from Firestore
export async function deleteCategoryFromCloud(catId) {
    try {
        if (db) {
            await deleteDoc(doc(db, "categories", catId));
        }
    } catch (e) {
        console.error("Error deleting category from cloud:", e);
    }
}

// Fetch Products from Firestore
export async function fetchProducts() {
    try {
        if (!db) throw new Error("No DB");
        const querySnapshot = await getDocs(collection(db, "products"));
        const prods = [];
        querySnapshot.forEach((docSnap) => {
            prods.push(docSnap.data());
        });
        return prods;
    } catch (e) {
        console.warn("Firebase fetch products fallback to localStorage:", e);
        return JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    }
}

// Save Product to Firestore
export async function saveProductToCloud(product) {
    try {
        if (db) {
            await setDoc(doc(db, "products", String(product.id)), product);
        }
    } catch (e) {
        console.error("Error saving product to cloud:", e);
    }
}

// Delete Product from Firestore
export async function deleteProductFromCloud(productId) {
    try {
        if (db) {
            await deleteDoc(doc(db, "products", String(productId)));
        }
    } catch (e) {
        console.error("Error deleting product from cloud:", e);
    }
}

// Fetch Store Settings & Admin Auth
export async function fetchStoreSettings() {
    try {
        if (!db) throw new Error("No DB");
        const docRef = doc(db, "settings", "store");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                name: data.name || DEFAULT_SETTINGS.name,
                phone: data.phone || DEFAULT_SETTINGS.phone,
                address: data.address || DEFAULT_SETTINGS.address,
                adminUser: data.adminUser || DEFAULT_SETTINGS.adminUser,
                adminPass: data.adminPass || DEFAULT_SETTINGS.adminPass
            };
        } else {
            await setDoc(docRef, DEFAULT_SETTINGS);
            return DEFAULT_SETTINGS;
        }
    } catch (e) {
        console.warn("Firebase fetch settings fallback to localStorage:", e);
        return JSON.parse(localStorage.getItem('yasmine_store_settings') || JSON.stringify(DEFAULT_SETTINGS));
    }
}

// Save Store Settings & Admin Auth to Firestore
export async function saveStoreSettingsToCloud(settings) {
    try {
        if (db) {
            await setDoc(doc(db, "settings", "store"), settings);
        }
    } catch (e) {
        console.error("Error saving settings to cloud:", e);
    }
}

// Upload Image File to Firebase Storage with reliable Base64 fallback
export async function uploadImageToStorage(file, pathFolder = 'images') {
    try {
        if (!storage || firebaseConfig.apiKey === "YOUR_API_KEY" || !firebaseConfig.apiKey) {
            throw new Error("Firebase Storage not configured");
        }
        const storageRef = ref(storage, `${pathFolder}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (e) {
        console.warn("Using instant local Base64 image conversion:", e);
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.readAsDataURL(file);
        });
    }
}
