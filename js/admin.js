// Admin Dashboard Logic

const DEFAULT_CATEGORIES = [
    { id: 'makeup', name: 'المكياج ومستحضرات التجميل', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop' },
    { id: 'women', name: 'ملابس نسائية راقية', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop' },
    { id: 'kids', name: 'ملابس أطفال عصرية', image: 'https://images.unsplash.com/photo-1503944583220-7eeec393dffb?q=80&w=800&auto=format&fit=crop' }
];

const DEFAULT_SETTINGS = {
    name: 'ياسمين الشام',
    phone: '+963 980 980 165',
    address: 'سوريا - درعا / الكرك الشرقي'
};

if (!localStorage.getItem('yasmine_categories')) {
    localStorage.setItem('yasmine_categories', JSON.stringify(DEFAULT_CATEGORIES));
}
if (!localStorage.getItem('yasmine_store_settings')) {
    localStorage.setItem('yasmine_store_settings', JSON.stringify(DEFAULT_SETTINGS));
}

// Clean up any legacy default visitor numbers > 1000
let storedVisitors = parseInt(localStorage.getItem('yasmine_visitors') || '0');
if (storedVisitors > 1000) {
    localStorage.setItem('yasmine_visitors', '0');
}

document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
});

// Check Login State
function checkLoginState() {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    const loginContainer = document.getElementById('login-container');
    const adminWrapper = document.getElementById('admin-main-wrapper');

    if (isLoggedIn) {
        if (loginContainer) loginContainer.classList.add('hidden');
        if (adminWrapper) adminWrapper.classList.remove('hidden');
        loadAdminStats();
        loadAdminProducts();
        loadAdminCategories();
        loadStoreSettingsForm();
        populateCategoryDropdown();
    } else {
        if (loginContainer) loginContainer.classList.remove('hidden');
        if (adminWrapper) adminWrapper.classList.add('hidden');
    }
}

// Handle Login Form Submit
function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorEl = document.getElementById('login-error');

    // Default credentials: admin / 123
    if (user === 'admin' && pass === '123') {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        checkLoginState();
    } else {
        if (errorEl) errorEl.classList.remove('hidden');
    }
}

// Logout Admin
function logoutAdmin() {
    if (!confirm('هل تريد تسجيل الخروج من لوحة التحكم؟')) return;
    sessionStorage.removeItem('isAdminLoggedIn');
    location.reload();
}

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('aside nav button').forEach(el => {
        el.classList.remove('bg-brandRed', 'text-white', 'shadow');
        el.classList.add('text-gray-300', 'hover:bg-gray-800', 'hover:text-white');
    });

    const activeTab = document.getElementById(`tab-${tabId}`);
    const activeNav = document.getElementById(`nav-${tabId}`);

    if (activeTab) activeTab.classList.remove('hidden');
    if (activeNav) {
        activeNav.classList.remove('text-gray-300', 'hover:bg-gray-800', 'hover:text-white');
        activeNav.classList.add('bg-brandRed', 'text-white', 'shadow');
    }

    // Update Header titles
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    if (tabId === 'dashboard') {
        titleEl.innerText = 'لوحة التحكم والإحصائيات';
        subtitleEl.innerText = 'مرحباً بك مجدداً، إدارة متجر ياسمين الشام';
    } else if (tabId === 'products') {
        titleEl.innerText = 'إدارة المنتجات';
        subtitleEl.innerText = 'إضافة، تعديل وحذف منتجات المكياج والملابس';
    } else if (tabId === 'categories') {
        titleEl.innerText = 'إدارة الأقسام';
        subtitleEl.innerText = 'إضافة وتعديل أقسام المتجر وصورها البصرية';
    } else if (tabId === 'settings') {
        titleEl.innerText = 'إعدادات المتجر والتحديث';
        subtitleEl.innerText = 'تعديل بيانات التواصل وتصدير التحديثات لـ GitHub';
        loadStoreSettingsForm();
    }
}

// Load Store Settings into Form
function loadStoreSettingsForm() {
    const settings = JSON.parse(localStorage.getItem('yasmine_store_settings') || JSON.stringify(DEFAULT_SETTINGS));
    const nameInput = document.getElementById('setting-store-name');
    const phoneInput = document.getElementById('setting-store-phone');
    const addressInput = document.getElementById('setting-store-address');

    if (nameInput) nameInput.value = settings.name;
    if (phoneInput) phoneInput.value = settings.phone;
    if (addressInput) addressInput.value = settings.address;
}

// Save Store Settings
function saveStoreSettings(e) {
    e.preventDefault();
    const name = document.getElementById('setting-store-name').value;
    const phone = document.getElementById('setting-store-phone').value;
    const address = document.getElementById('setting-store-address').value;

    const settings = { name, phone, address };
    localStorage.setItem('yasmine_store_settings', JSON.stringify(settings));
    showToast('تم حفظ إعدادات المتجر وتحديث البيانات بنجاح');
}

// Export Updated app.js for GitHub Pages
function exportAppData() {
    const categories = localStorage.getItem('yasmine_categories') || '[]';
    const products = localStorage.getItem('yasmine_products') || '[]';
    const settings = localStorage.getItem('yasmine_store_settings') || '{}';

    const fileContent = `// Auto-generated Store App Script
const DEFAULT_CATEGORIES = ${categories};

const DEFAULT_PRODUCTS = ${products};

const DEFAULT_SETTINGS = ${settings};

if (!localStorage.getItem('yasmine_categories')) {
    localStorage.setItem('yasmine_categories', JSON.stringify(DEFAULT_CATEGORIES));
}
if (!localStorage.getItem('yasmine_products')) {
    localStorage.setItem('yasmine_products', JSON.stringify(DEFAULT_PRODUCTS));
}
if (!localStorage.getItem('yasmine_store_settings')) {
    localStorage.setItem('yasmine_store_settings', JSON.stringify(DEFAULT_SETTINGS));
}

// Visitor Counter Logic (Clean & Real - Flush any legacy default > 1000)
let visitorCount = parseInt(localStorage.getItem('yasmine_visitors') || '0');
if (visitorCount > 1000) {
    visitorCount = 1;
    localStorage.setItem('yasmine_visitors', visitorCount);
}
if (!sessionStorage.getItem('visited_session')) {
    visitorCount++;
    localStorage.setItem('yasmine_visitors', visitorCount);
    sessionStorage.setItem('visited_session', 'true');
}

// State
let currentCategoryFilter = 'all';

// Load Store Data on Startup
document.addEventListener('DOMContentLoaded', () => {
    applyStoreSettings();
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

// Apply Store Dynamic Settings (Name, Phone, Address)
function applyStoreSettings() {
    const s = JSON.parse(localStorage.getItem('yasmine_store_settings') || JSON.stringify(DEFAULT_SETTINGS));

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
function renderCategories() {
    const cats = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const container = document.getElementById('categories-grid');
    if (!container) return;

    if (cats.length === 0) {
        container.innerHTML = \`
            <div class="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-200">
                <i class="fa-solid fa-folder-open text-4xl mb-3 text-gray-300"></i>
                <p class="text-sm font-bold">لا توجد أقسام مضافة حالياً.</p>
            </div>
        \`;
        return;
    }

    container.innerHTML = cats.map(cat => \`
        <div onclick="filterCategoryByClick('\${cat.id}')" class="group relative bg-gray-900 rounded-2xl overflow-hidden shadow-md cursor-pointer h-64 transform transition hover:-translate-y-1">
            <img src="\${cat.image}" alt="\${cat.name}" class="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                <h4 class="text-white text-xl font-black mb-1">\${cat.name}</h4>
                <p class="text-brandRed-light text-xs font-bold flex items-center gap-1">
                    <span>تصفح المنتجات</span>
                    <i class="fa-solid fa-arrow-left text-[10px]"></i>
                </p>
            </div>
        </div>
    \`).join('');
}

// Render Category Tabs
function renderCategoryTabs() {
    const cats = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) return;

    let html = \`<button onclick="filterCategory('all')" class="category-tab px-4 py-2 rounded-xl text-xs font-bold \${currentCategoryFilter === 'all' ? 'bg-brandRed text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition">الكل</button>\`;

    html += cats.map(cat => \`
        <button onclick="filterCategory('\${cat.id}')" class="category-tab px-4 py-2 rounded-xl text-xs font-bold \${currentCategoryFilter === cat.id ? 'bg-brandRed text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition">
            \${cat.name}
        </button>
    \`).join('');

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

// Render Products Grid
function renderProducts(searchQuery = '') {
    const prods = JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    const cats = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const container = document.getElementById('products-grid');
    if (!container) return;

    const filtered = prods.filter(p => {
        if (p.status === 'hidden') return false;
        const matchesCategory = currentCategoryFilter === 'all' || p.category === currentCategoryFilter;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = \`
            <div class="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-200">
                <i class="fa-solid fa-box-open text-4xl mb-3 text-gray-300"></i>
                <p class="text-base font-bold">لا توجد منتجات مسجلة حالياً في هذا القسم.</p>
            </div>
        \`;
        return;
    }

    container.innerHTML = filtered.map(product => {
        const catObj = cats.find(c => c.id === product.category);
        const catName = catObj ? catObj.name : product.category;

        return \`
            <div onclick="openProductModalDetail(\${product.id})" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group transform transition hover:-translate-y-1 hover:shadow-xl cursor-pointer">
                <div class="relative h-56 overflow-hidden bg-gray-100">
                    <img src="\${product.image}" alt="\${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <span class="absolute top-3 right-3 bg-brandGray-dark/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        \${catName}
                    </span>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <h4 class="font-bold text-base text-brandGray-dark group-hover:text-brandRed transition line-clamp-1 mb-2">
                            \${product.name}
                        </h4>
                        <p class="text-xs text-gray-500 line-clamp-2 mb-4">\${product.description || ''}</p>
                    </div>
                    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span class="font-black text-brandRed text-base">$\${parseFloat(product.price).toLocaleString()}</span>
                        <span class="text-xs font-bold text-gray-400 group-hover:text-brandRed flex items-center gap-1 transition">
                            <span>التفاصيل</span>
                            <i class="fa-solid fa-arrow-left text-[10px]"></i>
                        </span>
                    </div>
                </div>
            </div>
        \`;
    }).join('');
}

// Product Details Modal
function openProductModalDetail(productId) {
    const prods = JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    const cats = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const product = prods.find(p => p.id === productId);
    if (!product || product.status === 'hidden') return;

    const catObj = cats.find(c => c.id === product.category);
    const catName = catObj ? catObj.name : product.category;

    const modal = document.getElementById('product-modal');
    const content = document.getElementById('product-modal-content');
    if (!modal || !content) return;

    content.innerHTML = \`
        <div class="h-72 md:h-full bg-gray-100">
            <img src="\${product.image}" alt="\${product.name}" class="w-full h-full object-cover">
        </div>
        <div class="p-6 md:p-8 flex flex-col justify-between">
            <div>
                <span class="bg-red-100 text-brandRed text-xs font-bold px-3 py-1 rounded-full">\${catName}</span>
                <h3 class="text-2xl font-black text-brandGray-dark mt-3 mb-2">\${product.name}</h3>
                <p class="text-2xl font-black text-brandRed mb-4">$\${parseFloat(product.price).toLocaleString()}</p>
                <p class="text-sm text-gray-600 leading-relaxed mb-6">\${product.description || 'لا يوجد وصف متاح.'}</p>
            </div>
            <div class="bg-gray-100 p-4 rounded-xl text-center text-xs font-bold text-gray-600">
                <i class="fa-solid fa-eye text-brandRed ml-1"></i> تفاصيل المنتج
            </div>
        </div>
    \`;

    modal.classList.remove('hidden');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.add('hidden');
}
`;

    const blob = new Blob([fileContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تصدير ملف app.js بنجاح!');
}

// Load Stats
function loadAdminStats() {
    let visitors = parseInt(localStorage.getItem('yasmine_visitors') || '0');
    if (visitors > 1000) visitors = 0;
    const products = JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');

    document.getElementById('stat-visitors').innerText = visitors.toLocaleString();
    document.getElementById('stat-products').innerText = products.length;
    document.getElementById('stat-categories').innerText = categories.length;
}

// Load Products Table
function loadAdminProducts() {
    const products = JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const tbody = document.getElementById('admin-products-table');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-400">لا توجد منتجات مسجلة حالياً. استخدم زر "إضافة منتج جديد".</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(product => {
        const catObj = categories.find(c => c.id === product.category);
        const catName = catObj ? catObj.name : product.category;
        const isHidden = product.status === 'hidden';

        return `
            <tr class="hover:bg-gray-50/80 transition">
                <td class="p-4">
                    <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-cover rounded-xl shadow-sm">
                </td>
                <td class="p-4 font-bold text-brandGray-dark">${product.name}</td>
                <td class="p-4"><span class="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">${catName}</span></td>
                <td class="p-4 font-black text-brandRed">$${parseFloat(product.price).toLocaleString()}</td>
                <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold ${isHidden ? 'bg-red-100 text-brandRed' : 'bg-emerald-100 text-emerald-700'}">
                        ${isHidden ? 'مخفي / خلصان' : 'متاح'}
                    </span>
                </td>
                <td class="p-4 text-center space-x-2 space-x-reverse">
                    <button onclick="toggleProductStatus(${product.id})" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-xl font-bold text-xs transition">
                        ${isHidden ? 'إظهار' : 'إخفاء'}
                    </button>
                    <button onclick="editProduct(${product.id})" class="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1.5 rounded-xl font-bold text-xs transition">
                        <i class="fa-solid fa-pen-to-square ml-1"></i> تعديل
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="bg-red-100 hover:bg-red-200 text-brandRed px-3 py-1.5 rounded-xl font-bold text-xs transition">
                        <i class="fa-solid fa-trash-can ml-1"></i> حذف
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Toggle Product Status (Active / Hidden)
function toggleProductStatus(id) {
    let products = JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    products = products.map(p => {
        if (p.id === id) {
            const newStatus = p.status === 'hidden' ? 'active' : 'hidden';
            return { ...p, status: newStatus };
        }
        return p;
    });
    localStorage.setItem('yasmine_products', JSON.stringify(products));
    loadAdminProducts();
    showToast('تم تحديث حالة المنتج بنجاح');
}

// Load Categories Grid
function loadAdminCategories() {
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const container = document.getElementById('admin-categories-grid');
    if (!container) return;

    if (categories.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-gray-400 py-8 bg-white rounded-2xl border border-gray-200">لا توجد أقسام مسجلة حالياً. أضف أقساماً جديدة ليراها العملاء.</p>`;
        return;
    }

    container.innerHTML = categories.map(cat => `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div class="h-48 overflow-hidden bg-gray-100">
                <img src="${cat.image}" alt="${cat.name}" class="w-full h-full object-cover">
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <span class="text-[10px] font-bold text-brandRed uppercase tracking-wider">ID: ${cat.id}</span>
                    <h4 class="font-black text-lg text-brandGray-dark mt-1 mb-2">${cat.name}</h4>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <button onclick="editCategory('${cat.id}')" class="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1.5 rounded-xl font-bold text-xs transition">
                        <i class="fa-solid fa-pen-to-square ml-1"></i> تعديل
                    </button>
                    <button onclick="deleteCategory('${cat.id}')" class="bg-red-100 hover:bg-red-200 text-brandRed px-3 py-1.5 rounded-xl font-bold text-xs transition">
                        <i class="fa-solid fa-trash-can ml-1"></i> حذف
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Populate Category Dropdown in Product Form
function populateCategoryDropdown() {
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const select = document.getElementById('product-category');
    if (!select) return;

    if (categories.length === 0) {
        select.innerHTML = `<option value="">-- يرجى إضافة قسم أولاً --</option>`;
        return;
    }

    select.innerHTML = categories.map(cat => `
        <option value="${cat.id}">${cat.name}</option>
    `).join('');
}

// Product Modal Operations
function openProductModal() {
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    if (categories.length === 0) {
        alert('يجب إضافة قسم واحد على الأقل قبل إضافة المنتجات.');
        switchTab('categories');
        return;
    }

    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-image-existing').value = '';
    document.getElementById('product-status').value = 'active';
    document.getElementById('product-modal-title').innerText = 'إضافة منتج جديد مع صورة';
    document.getElementById('product-admin-modal').classList.remove('hidden');
}

function closeProductAdminModal() {
    document.getElementById('product-admin-modal').classList.add('hidden');
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-status').value = product.status || 'active';
    document.getElementById('product-image-existing').value = product.image;
    document.getElementById('product-image-file').value = '';
    document.getElementById('product-desc').value = product.description || '';

    document.getElementById('product-modal-title').innerText = 'تعديل المنتج';
    document.getElementById('product-admin-modal').classList.remove('hidden');
}

function saveProduct(e) {
    e.preventDefault();
    const idInput = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const status = document.getElementById('product-status').value;
    const description = document.getElementById('product-desc').value;
    const existingImage = document.getElementById('product-image-existing').value;
    const imageFile = document.getElementById('product-image-file').files[0];

    let products = JSON.parse(localStorage.getItem('yasmine_products') || '[]');

    const processSave = (imageUrl) => {
        if (idInput) {
            // Edit
            products = products.map(p => p.id == idInput ? { ...p, name, category, price, status, image: imageUrl || existingImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop', description } : p);
        } else {
            // Add
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, name, category, price, status, image: imageUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop', description });
        }

        localStorage.setItem('yasmine_products', JSON.stringify(products));
        closeProductAdminModal();
        loadAdminStats();
        loadAdminProducts();
        showToast('تم حفظ المنتج بنجاح');
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(uploadEvent) {
            processSave(uploadEvent.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        processSave(existingImage);
    }
}

function deleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    let products = JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    products = products.filter(p => p.id !== id);
    localStorage.setItem('yasmine_products', JSON.stringify(products));
    loadAdminStats();
    loadAdminProducts();
    showToast('تم حذف المنتج بنجاح');
}

// Category Modal Operations
function openCategoryModal() {
    document.getElementById('category-form').reset();
    document.getElementById('category-original-id').value = '';
    document.getElementById('category-image-existing').value = '';
    document.getElementById('category-id').disabled = false;
    document.getElementById('category-modal-title').innerText = 'إضافة قسم جديد مع صورة';
    document.getElementById('category-admin-modal').classList.remove('hidden');
}

function closeCategoryAdminModal() {
    document.getElementById('category-admin-modal').classList.add('hidden');
}

function editCategory(id) {
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    document.getElementById('category-original-id').value = cat.id;
    document.getElementById('category-id').value = cat.id;
    document.getElementById('category-id').disabled = true; // Don't change slug easily
    document.getElementById('category-name').value = cat.name;
    document.getElementById('category-image-existing').value = cat.image;
    document.getElementById('category-image-file').value = '';

    document.getElementById('category-modal-title').innerText = 'تعديل القسم والصورة';
    document.getElementById('category-admin-modal').classList.remove('hidden');
}

function saveCategory(e) {
    e.preventDefault();
    const originalId = document.getElementById('category-original-id').value;
    const id = document.getElementById('category-id').value.trim().toLowerCase();
    const name = document.getElementById('category-name').value;
    const existingImage = document.getElementById('category-image-existing').value;
    const imageFile = document.getElementById('category-image-file').files[0];

    let categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');

    const processCategorySave = (imageUrl) => {
        if (originalId) {
            // Edit
            categories = categories.map(c => c.id === originalId ? { ...c, name, image: imageUrl || existingImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop' } : c);
        } else {
            // Add
            if (categories.some(c => c.id === id)) {
                alert('معرف القسم موجود مسبقاً، اختر معرفاً آخر بالإنجليزية.');
                return;
            }
            categories.push({ id, name, image: imageUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop' });
        }

        localStorage.setItem('yasmine_categories', JSON.stringify(categories));
        closeCategoryAdminModal();
        loadAdminStats();
        loadAdminCategories();
        populateCategoryDropdown();
        showToast('تم حفظ القسم بنجاح');
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(uploadEvent) {
            processCategorySave(uploadEvent.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        processCategorySave(existingImage);
    }
}

function deleteCategory(id) {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    let categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');
    categories = categories.filter(c => c.id !== id);
    localStorage.setItem('yasmine_categories', JSON.stringify(categories));
    loadAdminStats();
    loadAdminCategories();
    populateCategoryDropdown();
    showToast('تم حذف القسم بنجاح');
}

// Toast Notification
function showToast(text) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 left-5 bg-brandGray-dark text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-2';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> <span>${text}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
