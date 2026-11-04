// Admin Dashboard Logic (Clean Slate - No Demo Data)

document.addEventListener('DOMContentLoaded', () => {
    loadAdminStats();
    loadAdminProducts();
    loadAdminCategories();
    populateCategoryDropdown();
});

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
        subtitleEl.innerText = 'مرحباً بك مجدداً، نظرة عامة على نشاط متجر ياسمين الشام';
    } else if (tabId === 'products') {
        titleEl.innerText = 'إدارة المنتجات';
        subtitleEl.innerText = 'إضافة، تعديل وحذف منتجات المكياج والملابس';
    } else if (tabId === 'categories') {
        titleEl.innerText = 'إدارة الأقسام';
        subtitleEl.innerText = 'إضافة وتعديل أقسام المتجر وصورها البصرية';
    }
}

// Load Stats
function loadAdminStats() {
    const visitors = localStorage.getItem('yasmine_visitors') || '1042';
    const products = JSON.parse(localStorage.getItem('yasmine_products') || '[]');
    const categories = JSON.parse(localStorage.getItem('yasmine_categories') || '[]');

    document.getElementById('stat-visitors').innerText = parseInt(visitors).toLocaleString();
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
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-400">لا توجد منتجات مسجلة حالياً. استخدم زر "إضافة منتج جديد".</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(product => {
        const catObj = categories.find(c => c.id === product.category);
        const catName = catObj ? catObj.name : product.category;

        return `
            <tr class="hover:bg-gray-50/80 transition">
                <td class="p-4">
                    <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-cover rounded-xl shadow-sm">
                </td>
                <td class="p-4 font-bold text-brandGray-dark">${product.name}</td>
                <td class="p-4"><span class="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">${catName}</span></td>
                <td class="p-4 font-black text-brandRed">$${parseFloat(product.price).toLocaleString()}</td>
                <td class="p-4 text-center space-x-2 space-x-reverse">
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
    const description = document.getElementById('product-desc').value;
    const existingImage = document.getElementById('product-image-existing').value;
    const imageFile = document.getElementById('product-image-file').files[0];

    let products = JSON.parse(localStorage.getItem('yasmine_products') || '[]');

    const processSave = (imageUrl) => {
        if (idInput) {
            // Edit
            products = products.map(p => p.id == idInput ? { ...p, name, category, price, image: imageUrl || existingImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop', description } : p);
        } else {
            // Add
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, name, category, price, image: imageUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop', description });
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

// Reset Store Data
function resetStoreData() {
    if (!confirm('هل تريد مسح جميع بيانات المتجر والبدء من الصفر؟')) return;
    localStorage.removeItem('yasmine_categories');
    localStorage.removeItem('yasmine_products');
    localStorage.removeItem('yasmine_cart');
    location.reload();
}

// Toast Notification
function showToast(text) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 left-5 bg-brandGray-dark text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-2';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> <span>${text}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.print = ''; // dummy
        toast.remove();
    }, 3000);
}
