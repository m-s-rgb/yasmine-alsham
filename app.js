// Store Data Initialization (Clean Slate - No Demo Data)
if (!localStorage.getItem('yasmine_categories')) {
    localStorage.setItem('yasmine_categories', JSON.stringify([]));
}
if (!localStorage.getItem('yasmine_products')) {
    localStorage.setItem('yasmine_products', JSON.stringify([]));
}

// Visitor Counter Logic
let visitorCount = parseInt(localStorage.getItem('yasmine_visitors') || '1042');
if (!sessionStorage.getItem('visited_session')) {
    visitorCount++;
    localStorage.setItem('yasmine_visitors', visitorCount);
    sessionStorage.setItem('visited_session', 'true');
}
document.getElementById('visitor-count-num').innerText = visitorCount.toLocaleString();

// State
let currentCategoryFilter = 'all';

// Load Store Data on Startup
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderCategoryTabs();
    renderProducts();

    // Search input listener
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProducts(e.target.value);
        });
    }
});

// Render Categories Grid on Homepage
function renderCategories() {
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const container = document.getElementById('categories-grid');
    if (!container) return;

    if (categories.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-200">
                <i class="fa-solid fa-folder-open text-4xl mb-3 text-gray-300"></i>
                <p class="text-sm font-bold">لا توجد أقسام مضافة حالياً. يجدر بالأدمن إضافة أقسام من لوحة التحكم.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = categories.map(cat => `
        <div onclick="filterCategoryByClick('${cat.id}')" class="group relative bg-gray-900 rounded-2xl overflow-hidden shadow-md cursor-pointer h-64 transform transition hover:-translate-y-1">
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
function renderCategoryTabs() {
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) return;

    let html = `<button onclick="filterCategory('all')" class="category-tab px-4 py-2 rounded-xl text-xs font-bold ${currentCategoryFilter === 'all' ? 'bg-brandRed text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition">الكل</button>`;

    html += categories.map(cat => `
        <button onclick="filterCategory('${cat.id}')" class="category-tab px-4 py-2 rounded-xl text-xs font-bold ${currentCategoryFilter === cat.id ? 'bg-brandRed text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition">
            ${cat.name}
        </button>
    `).join('');

    tabsContainer.innerHTML = html;
}

// Filter Category
function filterCategory(catId) {
    currentCategoryFilter = catId;
    renderCategoryTabs();
    renderProducts();
}

function filterCategoryByClick(catId) {
    filterCategory(catId);
    const section = document.getElementById('products-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Render Products Grid (Browse Only)
function renderProducts(searchQuery = '') {
    const products = JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const container = document.getElementById('products-grid');
    if (!container) return;

    const filtered = products.filter(p => {
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
            <div onclick="openProductModalDetail(${product.id})" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group transform transition hover:-translate-y-1 hover:shadow-xl cursor-pointer">
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
                        <span class="font-black text-brandRed text-base">${product.price.toLocaleString()} ل.س</span>
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
function openProductModalDetail(productId) {
    const products = JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const catObj = categories.find(c => c.id === product.category);
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
                <p class="text-2xl font-black text-brandRed mb-4">${product.price.toLocaleString()} ل.س</p>
                <p class="text-sm text-gray-600 leading-relaxed mb-6">${product.description || 'لا يوجد وصف متاح.'}</p>
            </div>
            <div class="bg-gray-100 p-4 rounded-xl text-center text-xs font-bold text-gray-600">
                <i class="fa-solid fa-eye text-brandRed ml-1"></i> وضع المعاينة والعرض فقط (غير مخصص للشراء الإلكتروني)
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.add('hidden');
}
