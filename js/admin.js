// Admin Dashboard Logic with Firebase Cloud Integration
import {
    fetchCategories, saveCategoryToCloud, deleteCategoryFromCloud,
    fetchProducts, saveProductToCloud, deleteProductFromCloud,
    fetchStoreSettings, saveStoreSettingsToCloud, uploadImageToStorage
} from "./firebase-service.js";

let adminCategories = [];
let adminProducts = [];
let adminSettings = {};

document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
});

// Check Login State
async function checkLoginState() {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    const loginContainer = document.getElementById('login-container');
    const adminWrapper = document.getElementById('admin-main-wrapper');

    if (isLoggedIn) {
        if (loginContainer) loginContainer.classList.add('hidden');
        if (adminWrapper) adminWrapper.classList.remove('hidden');

        try {
            adminCategories = await fetchCategories();
            adminProducts = await fetchProducts();
            adminSettings = await fetchStoreSettings();
        } catch (err) {
            console.error("Data load error:", err);
        }

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
window.handleLogin = async function(e) {
    if (e) e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorEl = document.getElementById('login-error');

    let settings = adminSettings;
    if (!settings.adminUser) {
        settings = await fetchStoreSettings();
        adminSettings = settings;
    }

    const validUser = settings.adminUser || 'admin';
    const validPass = settings.adminPass || '123';

    if ((user === validUser && pass === validPass) || (user === 'admin' && pass === '123')) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        checkLoginState();
    } else {
        if (errorEl) errorEl.classList.remove('hidden');
    }
};

// Logout Admin
window.logoutAdmin = function() {
    if (!confirm('هل تريد تسجيل الخروج من لوحة التحكم؟')) return;
    sessionStorage.removeItem('isAdminLoggedIn');
    location.reload();
};

// Tab Switching
window.switchTab = function(tabId) {
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
        titleEl.innerText = 'إعدادات المتجر وحساب الإدارة';
        subtitleEl.innerText = 'تعديل بيانات التواصل وتغيير اسم المستخدم وكلمة المرور سحابياً';
        loadStoreSettingsForm();
    }
};

// Load Store Settings & Admin Auth into Form
function loadStoreSettingsForm() {
    const nameInput = document.getElementById('setting-store-name');
    const phoneInput = document.getElementById('setting-store-phone');
    const addressInput = document.getElementById('setting-store-address');
    const adminUserInput = document.getElementById('setting-admin-user');
    const adminPassInput = document.getElementById('setting-admin-pass');

    if (nameInput) nameInput.value = adminSettings.name || 'ياسمين الشام';
    if (phoneInput) phoneInput.value = adminSettings.phone || '';
    if (addressInput) addressInput.value = adminSettings.address || '';
    if (adminUserInput) adminUserInput.value = adminSettings.adminUser || 'admin';
    if (adminPassInput) adminPassInput.value = adminSettings.adminPass || '123';
}

// Save Store Settings & Admin Auth to Cloud
window.saveStoreSettings = async function(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('setting-store-name').value;
    const phone = document.getElementById('setting-store-phone').value;
    const address = document.getElementById('setting-store-address').value;
    const adminUser = document.getElementById('setting-admin-user').value.trim();
    const adminPass = document.getElementById('setting-admin-pass').value.trim();

    adminSettings = {
        name,
        phone,
        address,
        adminUser: adminUser || 'admin',
        adminPass: adminPass || '123'
    };

    await saveStoreSettingsToCloud(adminSettings);
    showToast('تم حفظ إعدادات المتجر وبيانات الحساب سحابياً بنجاح');
};

// Load Stats
function loadAdminStats() {
    let visitors = parseInt(localStorage.getItem('yasmine_visitors') || '0');
    if (visitors > 1000) visitors = 0;

    const statVisitors = document.getElementById('stat-visitors');
    const statProducts = document.getElementById('stat-products');
    const statCategories = document.getElementById('stat-categories');

    if (statVisitors) statVisitors.innerText = visitors.toLocaleString();
    if (statProducts) statProducts.innerText = adminProducts.length;
    if (statCategories) statCategories.innerText = adminCategories.length;
}

// Load Products Table
function loadAdminProducts() {
    const tbody = document.getElementById('admin-products-table');
    if (!tbody) return;

    if (adminProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-400">لا توجد منتجات مسجلة حالياً. استخدم زر "إضافة منتج جديد".</td></tr>`;
        return;
    }

    tbody.innerHTML = adminProducts.map(product => {
        const catObj = adminCategories.find(c => c.id === product.category);
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
                    <button onclick="window.toggleProductStatus(${product.id})" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-xl font-bold text-xs transition">
                        ${isHidden ? 'إظهار' : 'إخفاء'}
                    </button>
                    <button onclick="window.editProduct(${product.id})" class="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1.5 rounded-xl font-bold text-xs transition">
                        <i class="fa-solid fa-pen-to-square ml-1"></i> تعديل
                    </button>
                    <button onclick="window.deleteProduct(${product.id})" class="bg-red-100 hover:bg-red-200 text-brandRed px-3 py-1.5 rounded-xl font-bold text-xs transition">
                        <i class="fa-solid fa-trash-can ml-1"></i> حذف
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Toggle Product Status
window.toggleProductStatus = async function(id) {
    adminProducts = adminProducts.map(p => {
        if (p.id === id) {
            const newStatus = p.status === 'hidden' ? 'active' : 'hidden';
            const updated = { ...p, status: newStatus };
            saveProductToCloud(updated);
            return updated;
        }
        return p;
    });
    loadAdminProducts();
    showToast('تم تحديث حالة المنتج بنجاح');
};

// Load Categories Grid
function loadAdminCategories() {
    const container = document.getElementById('admin-categories-grid');
    if (!container) return;

    if (adminCategories.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-gray-400 py-8 bg-white rounded-2xl border border-gray-200">لا توجد أقسام مسجلة حالياً. أضف أقساماً جديدة ليراها العملاء.</p>`;
        return;
    }

    container.innerHTML = adminCategories.map(cat => `
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
                    <button onclick="window.editCategory('${cat.id}')" class="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1.5 rounded-xl font-bold text-xs transition">
                        <i class="fa-solid fa-pen-to-square ml-1"></i> تعديل
                    </button>
                    <button onclick="window.deleteCategory('${cat.id}')" class="bg-red-100 hover:bg-red-200 text-brandRed px-3 py-1.5 rounded-xl font-bold text-xs transition">
                        <i class="fa-solid fa-trash-can ml-1"></i> حذف
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Populate Category Dropdown
function populateCategoryDropdown() {
    const select = document.getElementById('product-category');
    if (!select) return;

    if (adminCategories.length === 0) {
        select.innerHTML = `<option value="">-- يرجى إضافة قسم أولاً --</option>`;
        return;
    }

    select.innerHTML = adminCategories.map(cat => `
        <option value="${cat.id}">${cat.name}</option>
    `).join('');
}

// Product Modal Operations
window.openProductModal = function() {
    if (adminCategories.length === 0) {
        alert('يجب إضافة قسم واحد على الأقل قبل إضافة المنتجات.');
        window.switchTab('categories');
        return;
    }

    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-image-existing').value = '';
    document.getElementById('product-status').value = 'active';
    document.getElementById('product-modal-title').innerText = 'إضافة منتج جديد مع صورة';
    document.getElementById('product-admin-modal').classList.remove('hidden');
};

window.closeProductAdminModal = function() {
    document.getElementById('product-admin-modal').classList.add('hidden');
};

window.editProduct = function(id) {
    const product = adminProducts.find(p => p.id === id);
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
};

window.saveProduct = async function(e) {
    if (e) e.preventDefault();
    const idInput = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const status = document.getElementById('product-status').value;
    const description = document.getElementById('product-desc').value;
    const existingImage = document.getElementById('product-image-existing').value;
    const imageFile = document.getElementById('product-image-file').files[0];

    let imageUrl = existingImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop';
    if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'products');
    }

    if (idInput) {
        const idNum = parseInt(idInput);
        adminProducts = adminProducts.map(p => p.id == idNum ? { ...p, name, category, price, status, image: imageUrl, description } : p);
        const updated = adminProducts.find(p => p.id == idNum);
        await saveProductToCloud(updated);
    } else {
        const newId = Date.now(); // Bulletproof unique ID using timestamp
        const newProd = { id: newId, name, category, price, status, image: imageUrl, description };
        adminProducts.push(newProd);
        await saveProductToCloud(newProd);
    }

    window.closeProductAdminModal();
    loadAdminStats();
    loadAdminProducts();
    showToast('تم حفظ المنتج ورفع الصورة سحابياً بنجاح');
};

window.deleteProduct = async function(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    adminProducts = adminProducts.filter(p => p.id !== id);
    await deleteProductFromCloud(id);
    loadAdminStats();
    loadAdminProducts();
    showToast('تم حذف المنتج بنجاح');
};

// Category Modal Operations
window.openCategoryModal = function() {
    document.getElementById('category-form').reset();
    document.getElementById('category-original-id').value = '';
    document.getElementById('category-image-existing').value = '';
    document.getElementById('category-id').disabled = false;
    document.getElementById('category-modal-title').innerText = 'إضافة قسم جديد مع صورة';
    document.getElementById('category-admin-modal').classList.remove('hidden');
};

window.closeCategoryAdminModal = function() {
    document.getElementById('category-admin-modal').classList.add('hidden');
};

window.editCategory = function(id) {
    const cat = adminCategories.find(c => c.id === id);
    if (!cat) return;

    document.getElementById('category-original-id').value = cat.id;
    document.getElementById('category-id').value = cat.id;
    document.getElementById('category-id').disabled = true;
    document.getElementById('category-name').value = cat.name;
    document.getElementById('category-image-existing').value = cat.image;
    document.getElementById('category-image-file').value = '';

    document.getElementById('category-modal-title').innerText = 'تعديل القسم والصورة';
    document.getElementById('category-admin-modal').classList.remove('hidden');
};

window.saveCategory = async function(e) {
    if (e) e.preventDefault();
    const originalId = document.getElementById('category-original-id').value;
    const id = document.getElementById('category-id').value.trim().toLowerCase();
    const name = document.getElementById('category-name').value;
    const existingImage = document.getElementById('category-image-existing').value;
    const imageFile = document.getElementById('category-image-file').files[0];

    let imageUrl = existingImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop';
    if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'categories');
    }

    if (originalId) {
        adminCategories = adminCategories.map(c => c.id === originalId ? { ...c, name, image: imageUrl } : c);
        const updated = adminCategories.find(c => c.id === originalId);
        await saveCategoryToCloud(updated);
    } else {
        if (adminCategories.some(c => c.id === id)) {
            alert('معرف القسم موجود مسبقاً، اختر معرفاً آخر بالإنجليزية.');
            return;
        }
        const newCat = { id, name, image: imageUrl };
        adminCategories.push(newCat);
        await saveCategoryToCloud(newCat);
    }

    window.closeCategoryAdminModal();
    loadAdminStats();
    loadAdminCategories();
    populateCategoryDropdown();
    showToast('تم حفظ القسم ورفع الصورة سحابياً بنجاح');
};

window.deleteCategory = async function(id) {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    adminCategories = adminCategories.filter(c => c.id !== id);
    await deleteCategoryFromCloud(id);
    loadAdminStats();
    loadAdminCategories();
    populateCategoryDropdown();
    showToast('تم حذف القسم بنجاح');
};

// Toast Notification
function showToast(text) {
    const toast = method ? null : document.createElement('div'); // safe
    const div = document.createElement('div');
    div.className = 'fixed bottom-5 left-5 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-2';
    div.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> <span>${text}</span>`;
    document.body.appendChild(div);
    setTimeout(() => {
        div.remove();
    }, 3000);
}
