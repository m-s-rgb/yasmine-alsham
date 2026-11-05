// Store Front Logic with Firebase Cloud Integration
import { fetchCategories, fetchProducts, fetchStoreSettings } from "./firebase-service.js";

let currentCategoryFilter = 'all';
let cachedCategories = [];
let cachedProducts = [];

// Load Store Data on Startup
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load Settings
    const settings = await fetchStoreSettings();
    applyStoreSettings(settings);

    // 2. Load Categories
    cachedCategories = await fetchCategories();
    renderCategories(cachedCategories);
    renderCategoryTabs(cachedCategories);

    // 3. Load Products
    cachedProducts = await fetchProducts();
    renderProducts(cachedProducts, cachedCategories);

    // Search input listener
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProducts(cachedProducts, cachedCategories, e.target.value);
        });
    }
});

// Apply Store Dynamic Settings (Name, Phone, Address)
function applyStoreSettings(s) {
    const phoneTop = document.getElementById('store-phone-top');
    const phoneFooter = document.getElementById('store-phone-footer');
    const storeNameHeader = document.getElementById('store-name-header');
    const storeNameHero = document.getElementById('store-name-hero');
    const storeNameFooter = document.getElementById('store-name-footer');
    const storeNameCopy = document.getElementById('store-name-copy');
    const storeAddress = document.getElementById('store-address');

    if (phoneTop) phoneTop.innerText = s.phone;
    if (phoneFooter) phoneFooter.innerText = s.phone;
    if (storeNameHeader) storeNameHeader.innerText = s.name;
    if (storeNameHero) storeNameHero.innerText = s.name;
    if (storeNameFooter) storeNameFooter.innerText = s.name;
    if (storeNameCopy) storeNameCopy.innerText = s.name;
    if (storeAddress) storeAddress.innerText = s.address;
}

// Render Categories Grid on Homepage
function renderCategories(categories) {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    if (categories.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-200">
                <i class="fa-solid fa-folder-open text-4xl mb-3 text-gray-300"></i>
                <p class="text-sm font-bold">لا توجد أقسام مضافة حالياً.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = categories.map(cat => `
        <div onclick="window.filterCategoryByClick('${cat.id}')" class="group relative bg-gray-900 rounded-2xl overflow-hidden shadow-md cursor-pointer h-64 transform transition hover:-translate-y-1">
            <img src="${cat.image}" alt="${cat.name}" class="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                <h4 class="text-white text-xl font-black mb-1">${cat.name}</h4>
                <p class="text-brandRed-light text-xs font-bold flex items-center gap-1">
                    <span>تصفح المنتجات</span>
                    <i class="fa-solid fa-arrow-left text-[10px]"></i>
                </p>
            </div>
        </div>
    `).join('');
}

// Render Category Tabs
function renderCategoryTabs(categories) {
    const tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) return;

    let html = `<button onclick="window.filterCategory('all')" class="category-tab px-4 py-2 rounded-xl text-xs font-bold ${currentCategoryFilter === 'all' ? 'bg-brandRed text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition">الكل</button>`;

    html += categories.map(cat => `
        <button onclick="window.filterCategory('${cat.id}')" class="category-tab px-4 py-2 rounded-xl text-xs font-bold ${currentCategoryFilter === cat.id ? 'bg-brandRed text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition">
            ${cat.name}
        </button>
    `).join('');

    tabsContainer.innerHTML = html;
}

// Filter Category
window.filterCategory = function(catId) {
    currentCategoryFilter = catId;
    renderCategoryTabs(cachedCategories);
    renderProducts(cachedProducts, cachedCategories);
};

window.filterCategoryByClick = function(catId) {
    window.filterCategory(catId);
    const section = document.getElementById('products-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
};

// Render Products Grid (Browse Only - Hiding hidden/sold-out products)
function renderProducts(products, categories, searchQuery = '') {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const filtered = products.filter(p => {
        if (p.status === 'hidden') return false;
        const matchesCategory = currentCategoryFilter === 'all' || p.category === currentCategoryFilter;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-200">
                <i class="fa-solid fa-box-open text-4xl mb-3 text-gray-300"></i>
                <p class="text-base font-bold">لا توجد منتجات مسجلة حالياً في هذا القسم.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(product => {
        const catObj = categories.find(c => c.id === product.category);
        const catName = catObj ? catObj.name : product.category;

        return `
            <div onclick="window.openProductModalDetail(${product.id})" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group transform transition hover:-translate-y-1 hover:shadow-xl cursor-pointer">
                <div class="relative h-56 overflow-hidden bg-gray-100">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <span class="absolute top-3 right-3 bg-brandGray-dark/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        ${catName}
                    </span>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <h4 class="font-bold text-base text-brandGray-dark group-hover:text-brandRed transition line-clamp-1 mb-2">
                            ${product.name}
                        </h4>
                        <p class="text-xs text-gray-500 line-clamp-2 mb-4">${product.description || ''}</p>
                    </div>
                    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span class="font-black text-brandRed text-base">$${parseFloat(product.price).toLocaleString()}</span>
                        <span class="text-xs font-bold text-gray-400 group-hover:text-brandRed flex items-center gap-1 transition">
                            <span>التفاصيل</span>
                            <i class="fa-solid fa-arrow-left text-[10px]"></i>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Product Details Modal
window.openProductModalDetail = function(productId) {
    const product = cachedProducts.find(p => p.id === productId);
    if (!product || product.status === 'hidden') return;

    const catObj = cachedCategories.find(c => c.id === product.category);
    const catName = catObj ? catObj.name : product.category;

    const modal = document.getElementById('product-modal');
    const content = document.getElementById('product-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
        <div class="h-72 md:h-full bg-gray-100">
            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
        </div>
        <div class="p-6 md:p-8 flex flex-col justify-between">
            <div>
                <span class="bg-red-100 text-brandRed text-xs font-bold px-3 py-1 rounded-full">${catName}</span>
                <h3 class="text-2xl font-black text-brandGray-dark mt-3 mb-2">${product.name}</h3>
                <p class="text-2xl font-black text-brandRed mb-4">$${parseFloat(product.price).toLocaleString()}</p>
                <p class="text-sm text-gray-600 leading-relaxed mb-6">${product.description || 'لا يوجد وصف متاح.'}</p>
            </div>
            <div class="bg-gray-100 p-4 rounded-xl text-center text-xs font-bold text-gray-600">
                <i class="fa-solid fa-eye text-brandRed ml-1"></i> تفاصيل المنتج
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
};

window.closeProductModal = function() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.add('hidden');
};
