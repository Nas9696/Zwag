// auth.js - نظام إدارة المستخدمين والصلاحيات

// التحقق من حالة تسجيل الدخول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود مستخدم مسجل الدخول
    checkLoginStatus();

    // إضافة زر تسجيل الخروج إلى القائمة
    addLogoutButton();

    // تطبيق الصلاحيات على واجهة المستخدم
    applyPermissions();
});

// وظيفة للتحقق من حالة تسجيل الدخول
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // إذا لم يكن هناك مستخدم مسجل الدخول، توجيهه إلى صفحة تسجيل الدخول
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // إضافة معلومات المستخدم إلى الصفحة
    const userInfoElement = document.createElement('div');
    userInfoElement.className = 'user-info';
    userInfoElement.innerHTML = `
        <i class="fas fa-user-circle"></i>
        <span>مرحباً، ${currentUser.name}</span>
        ${currentUser.isAdmin ? '<span class="admin-badge">مشرف</span>' : ''}
    `;

    // إضافة معلومات المستخدم إلى الهيدر
    const header = document.querySelector('header');
    if (header) {
        header.appendChild(userInfoElement);
    }
}

// وظيفة لإضافة زر تسجيل الخروج إلى القائمة
function addLogoutButton() {
    const navList = document.querySelector('.main-nav ul');
    if (!navList) return;

    const logoutItem = document.createElement('li');
    logoutItem.className = 'nav-item logout-item';

    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.className = 'nav-link logout-link';
    logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> تسجيل الخروج';
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    logoutItem.appendChild(logoutLink);
    navList.appendChild(logoutItem);
}

// وظيفة لتسجيل الخروج
function logout() {
    // عرض تأكيد قبل تسجيل الخروج
    if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
        // حذف بيانات المستخدم من التخزين المحلي
        localStorage.removeItem('currentUser');

        // توجيه المستخدم إلى صفحة تسجيل الدخول
        window.location.href = 'login.html';
    }
}

// وظيفة لتطبيق الصلاحيات على واجهة المستخدم
function applyPermissions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // إذا كان المستخدم ليس مشرفًا، إخفاء أزرار التعديل والحذف
    if (!currentUser.isAdmin) {
        // إخفاء أزرار التعديل والحذف في جدول الأعضاء
        hideEditDeleteButtons();

        // إخفاء أزرار التعديل والحذف في جدول التحصيلات
        hideCollectionEditButtons();

        // إخفاء قسم إدارة المشرفين
        hideAdminSection();
    } else {
        // إظهار قسم إدارة المشرفين للمشرفين فقط
        showAdminSection();
    }
}

// وظيفة لإخفاء أزرار التعديل والحذف في جدول الأعضاء
function hideEditDeleteButtons() {
    // استخدام MutationObserver لمراقبة التغييرات في DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // البحث عن أزرار التعديل والحذف وإخفائها
                const editButtons = document.querySelectorAll('.edit-btn, .delete-btn');
                editButtons.forEach(button => {
                    button.style.display = 'none';
                });
            }
        });
    });

    // بدء مراقبة جدول الأعضاء
    const membersTable = document.getElementById('membersBody');
    if (membersTable) {
        observer.observe(membersTable, { childList: true, subtree: true });

        // إخفاء الأزرار الموجودة بالفعل
        const existingButtons = membersTable.querySelectorAll('.edit-btn, .delete-btn');
        existingButtons.forEach(button => {
            button.style.display = 'none';
        });
    }
}

// وظيفة لإخفاء أزرار التعديل والحذف في جدول التحصيلات
function hideCollectionEditButtons() {
    // استخدام MutationObserver لمراقبة التغييرات في DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // البحث عن أزرار الحذف وإخفائها
                const deleteButtons = document.querySelectorAll('#collectionBody .delete-btn');
                deleteButtons.forEach(button => {
                    button.style.display = 'none';
                });
            }
        });
    });

    // بدء مراقبة جدول التحصيلات
    const collectionTable = document.getElementById('collectionBody');
    if (collectionTable) {
        observer.observe(collectionTable, { childList: true, subtree: true });

        // إخفاء الأزرار الموجودة بالفعل
        const existingButtons = collectionTable.querySelectorAll('.delete-btn');
        existingButtons.forEach(button => {
            button.style.display = 'none';
        });
    }

    // إخفاء نموذج إضافة تحصيل جديد
    const collectionForm = document.getElementById('collectionForm');
    if (collectionForm) {
        collectionForm.style.display = 'none';
    }
}

// وظيفة لإخفاء قسم إدارة المشرفين
function hideAdminSection() {
    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
        adminSection.style.display = 'none';
    }
}

// وظيفة لإظهار قسم إدارة المشرفين
function showAdminSection() {
    // التحقق من وجود قسم إدارة المشرفين
    let adminSection = document.getElementById('adminSection');

    // إذا لم يكن موجودًا، إنشاؤه
    if (!adminSection) {
        // إنشاء قسم إدارة المشرفين
        adminSection = document.createElement('div');
        adminSection.id = 'adminSection';
        adminSection.className = 'content-section';

        // إضافة محتوى قسم إدارة المشرفين
        adminSection.innerHTML = `
            <div class="section-header">
                <div class="section-title">
                    <i class="fas fa-user-shield"></i>
                    <h2>إدارة المستخدمين والصلاحيات</h2>
                </div>
                <div class="section-subtitle">
                    إدارة المستخدمين والمشرفين وصلاحيات الوصول للنظام
                </div>
            </div>

            <div class="admin-tabs">
                <button class="admin-tab active" data-tab="users">
                    <i class="fas fa-users"></i> المستخدمون
                </button>
                <button class="admin-tab" data-tab="admins">
                    <i class="fas fa-user-shield"></i> المشرفون
                </button>
                <button class="admin-tab" data-tab="logs">
                    <i class="fas fa-history"></i> سجل الإجراءات
                </button>
            </div>

            <div class="admin-tab-content active" id="users-tab">
                <div class="admin-panel">
                    <div class="admin-form">
                        <h3>إضافة مستخدم جديد</h3>
                        <form id="addUserForm">
                            <div class="form-group">
                                <label for="userName">اسم المستخدم</label>
                                <input type="text" id="userName" placeholder="أدخل اسم المستخدم" required>
                            </div>
                            <div class="form-group">
                                <label for="userId">رقم الهوية</label>
                                <input type="text" id="userId" placeholder="أدخل رقم الهوية" pattern="\\d{10}" maxlength="10" required>
                            </div>
                            <div class="form-group">
                                <label for="userPhone">رقم الجوال (اختياري)</label>
                                <input type="text" id="userPhone" placeholder="05xxxxxxxx" pattern="05\\d{8}">
                            </div>
                            <div class="form-group">
                                <label for="userEmail">البريد الإلكتروني (اختياري)</label>
                                <input type="email" id="userEmail" placeholder="example@domain.com">
                            </div>
                            <button type="submit" class="admin-btn">
                                <i class="fas fa-plus-circle"></i> إضافة مستخدم
                            </button>
                        </form>
                    </div>

                    <div class="users-list">
                        <h3>قائمة المستخدمين</h3>
                        <div class="admin-search">
                            <input type="text" id="userSearchInput" placeholder="بحث عن مستخدم...">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="admins-table-container">
                            <table class="admins-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>الاسم</th>
                                        <th>رقم الهوية</th>
                                        <th>رقم الجوال</th>
                                        <th>البريد الإلكتروني</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="usersBody">
                                    <!-- سيتم ملء هذا الجدول بالبيانات -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="admin-tab-content" id="admins-tab">
                <div class="admin-panel">
                    <div class="admin-form">
                        <h3>إضافة مشرف جديد</h3>
                        <form id="addAdminForm">
                            <div class="form-group">
                                <label for="adminName">اسم المشرف</label>
                                <input type="text" id="adminName" placeholder="أدخل اسم المشرف" required>
                            </div>
                            <div class="form-group">
                                <label for="adminId">رقم الهوية</label>
                                <input type="text" id="adminId" placeholder="أدخل رقم الهوية" pattern="\\d{10}" maxlength="10" required>
                            </div>
                            <div class="form-group">
                                <label for="adminPhone">رقم الجوال (اختياري)</label>
                                <input type="text" id="adminPhone" placeholder="05xxxxxxxx" pattern="05\\d{8}">
                            </div>
                            <div class="form-group">
                                <label for="adminEmail">البريد الإلكتروني (اختياري)</label>
                                <input type="email" id="adminEmail" placeholder="example@domain.com">
                            </div>
                            <button type="submit" class="admin-btn">
                                <i class="fas fa-plus-circle"></i> إضافة مشرف
                            </button>
                        </form>
                    </div>

                    <div class="admins-list">
                        <h3>قائمة المشرفين</h3>
                        <div class="admin-search">
                            <input type="text" id="adminSearchInput" placeholder="بحث عن مشرف...">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="admins-table-container">
                            <table class="admins-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>الاسم</th>
                                        <th>رقم الهوية</th>
                                        <th>رقم الجوال</th>
                                        <th>البريد الإلكتروني</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="adminsBody">
                                    <!-- سيتم ملء هذا الجدول بالبيانات -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="admin-tab-content" id="logs-tab">
                <div class="logs-container">
                    <h3>سجل الإجراءات</h3>
                    <div class="logs-filters">
                        <div class="form-group">
                            <label for="logTypeFilter">نوع الإجراء</label>
                            <select id="logTypeFilter">
                                <option value="">جميع الإجراءات</option>
                                <option value="add">إضافة</option>
                                <option value="edit">تعديل</option>
                                <option value="delete">حذف</option>
                                <option value="login">تسجيل دخول</option>
                                <option value="logout">تسجيل خروج</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="logDateFilter">التاريخ</label>
                            <select id="logDateFilter">
                                <option value="">جميع التواريخ</option>
                                <option value="today">اليوم</option>
                                <option value="week">هذا الأسبوع</option>
                                <option value="month">هذا الشهر</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="logUserFilter">المستخدم</label>
                            <select id="logUserFilter">
                                <option value="">جميع المستخدمين</option>
                                <!-- سيتم ملء هذه القائمة بواسطة JavaScript -->
                            </select>
                        </div>
                    </div>
                    <div class="logs-table-container">
                        <table class="logs-table">
                            <thead>
                                <tr>
                                    <th>التاريخ والوقت</th>
                                    <th>المستخدم</th>
                                    <th>نوع الإجراء</th>
                                    <th>التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody id="logsBody">
                                <!-- سيتم ملء هذا الجدول بالبيانات -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // إضافة قسم إدارة المشرفين إلى الصفحة
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.appendChild(adminSection);
        }

        // إضافة رابط إدارة المشرفين إلى القائمة
        addAdminNavLink();

        // تهيئة علامات التبويب
        initAdminTabs();

        // تهيئة نماذج إضافة المستخدمين والمشرفين
        initUserForm();
        initAdminForm();

        // عرض قوائم المستخدمين والمشرفين
        renderUsersList();
        renderAdminsList();

        // عرض سجل الإجراءات
        renderActionLogs();
    } else {
        // إظهار قسم إدارة المشرفين إذا كان موجودًا
        adminSection.style.display = 'block';
    }
}

// وظيفة لإضافة رابط إدارة المشرفين إلى القائمة
function addAdminNavLink() {
    const navList = document.querySelector('.main-nav ul');
    if (!navList) return;

    // التحقق من عدم وجود الرابط بالفعل
    if (document.querySelector('a[href="#adminSection"]')) return;

    const adminItem = document.createElement('li');
    adminItem.className = 'nav-item';

    const adminLink = document.createElement('a');
    adminLink.href = '#adminSection';
    adminLink.className = 'nav-link';
    adminLink.innerHTML = '<i class="fas fa-user-shield"></i> إدارة المشرفين';
    adminLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('adminSection');
    });

    adminItem.appendChild(adminLink);

    // إضافة العنصر قبل زر تسجيل الخروج
    const logoutItem = document.querySelector('.logout-item');
    if (logoutItem) {
        navList.insertBefore(adminItem, logoutItem);
    } else {
        navList.appendChild(adminItem);
    }
}

// وظيفة لتهيئة نموذج إضافة المشرفين
function initAdminForm() {
    const addAdminForm = document.getElementById('addAdminForm');
    if (!addAdminForm) return;

    addAdminForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // الحصول على قيم الحقول
        const adminName = document.getElementById('adminName').value.trim();
        const adminId = document.getElementById('adminId').value.trim();

        // التحقق من صحة البيانات
        if (!adminName || !adminId || !/^\d{10}$/.test(adminId)) {
            alert('يرجى التأكد من إدخال جميع البيانات بشكل صحيح');
            return;
        }

        // الحصول على قائمة المشرفين الحالية
        let admins = JSON.parse(localStorage.getItem('admins')) || [];

        // التحقق من عدم وجود مشرف بنفس رقم الهوية
        if (admins.some(admin => admin.id === adminId)) {
            alert('يوجد مشرف مسجل بنفس رقم الهوية');
            return;
        }

        // إضافة المشرف الجديد
        admins.push({ id: adminId, name: adminName });

        // حفظ قائمة المشرفين
        localStorage.setItem('admins', JSON.stringify(admins));

        // إعادة عرض قائمة المشرفين
        renderAdminsList();

        // إعادة تعيين النموذج
        addAdminForm.reset();

        // عرض رسالة نجاح
        alert(`تمت إضافة المشرف ${adminName} بنجاح`);
    });
}

// وظيفة لعرض قائمة المشرفين
function renderAdminsList() {
    const adminsBody = document.getElementById('adminsBody');
    if (!adminsBody) return;

    // الحصول على قائمة المشرفين
    const admins = JSON.parse(localStorage.getItem('admins')) || [];

    // تفريغ الجدول
    adminsBody.innerHTML = '';

    // إضافة المشرف الرئيسي (لا يمكن حذفه)
    const mainAdmin = { id: '1234567890', name: 'أحمد محمد', isMainAdmin: true };

    // دمج المشرف الرئيسي مع قائمة المشرفين
    const allAdmins = [mainAdmin, ...admins];

    // ملء الجدول بالبيانات
    allAdmins.forEach((admin, index) => {
        const row = document.createElement('tr');

        // إضافة خلية الرقم
        const indexCell = document.createElement('td');
        indexCell.textContent = index + 1;
        row.appendChild(indexCell);

        // إضافة خلية الاسم
        const nameCell = document.createElement('td');
        nameCell.textContent = admin.name;
        row.appendChild(nameCell);

        // إضافة خلية رقم الهوية
        const idCell = document.createElement('td');
        idCell.textContent = admin.id;
        row.appendChild(idCell);

        // إضافة خلية الإجراءات
        const actionsCell = document.createElement('td');

        // إضافة زر الحذف (إلا للمشرف الرئيسي)
        if (!admin.isMainAdmin) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-admin-btn';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.title = 'حذف المشرف';
            deleteButton.addEventListener('click', function() {
                deleteAdmin(admin.id);
            });
            actionsCell.appendChild(deleteButton);
        } else {
            // إضافة شارة المشرف الرئيسي
            const mainAdminBadge = document.createElement('span');
            mainAdminBadge.className = 'main-admin-badge';
            mainAdminBadge.textContent = 'مشرف رئيسي';
            actionsCell.appendChild(mainAdminBadge);
        }

        row.appendChild(actionsCell);

        // إضافة الصف إلى الجدول
        adminsBody.appendChild(row);
    });
}

// وظيفة لحذف مشرف
function deleteAdmin(adminId) {
    // عرض تأكيد قبل الحذف
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المشرف؟')) {
        // الحصول على قائمة المشرفين
        let admins = JSON.parse(localStorage.getItem('admins')) || [];

        // حذف المشرف
        admins = admins.filter(admin => admin.id !== adminId);

        // حفظ قائمة المشرفين
        localStorage.setItem('admins', JSON.stringify(admins));

        // إعادة عرض قائمة المشرفين
        renderAdminsList();

        // عرض رسالة نجاح
        alert('تم حذف المشرف بنجاح');
    }
}
