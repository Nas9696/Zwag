// script.js - الوظائف التفاعلية لتطبيق جمعية زواج (صفحة واحدة)

// --- إعداد لوحة التوقيع ---
function setupSignaturePad() {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) {
        console.error('لم يتم العثور على عنصر لوحة التوقيع (canvas).');
        return;
    }

    // تأكد من أن مكتبة SignaturePad قد تم تحميلها
    if (typeof SignaturePad === 'undefined') {
        console.error('مكتبة SignaturePad غير محملة.');
        // يمكنك محاولة تحميلها ديناميًا أو إظهار رسالة خطأ للمستخدم
        return;
    }

    // تهيئة SignaturePad
    // قد تحتاج إلى تعديل الخيارات حسب الحاجة
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)' // خلفية بيضاء
    });

    // جعل signaturePad متاحًا عالميًا أو في نطاق أعلى إذا لزم الأمر
    window.signaturePad = signaturePad; // مثال: جعله متاحًا عالميًا

    // ربط زر المسح (إذا لم يتم ربطه في مكان آخر)
    const clearButton = document.getElementById('clearSignatureButton');
    if (clearButton) {
        clearButton.onclick = () => {
            signaturePad.clear();
        };
    }

    // ربط زر الحفظ (إذا كان لديك زر حفظ للتوقيع)
    // const saveButton = document.getElementById('saveSignatureButton');
    // if (saveButton) {
    //     saveButton.onclick = () => {
    //         if (signaturePad.isEmpty()) {
    //             alert("الرجاء التوقيع أولاً.");
    //         } else {
    //             const dataURL = signaturePad.toDataURL(); // الحصول على التوقيع كصورة base64
    //             console.log(dataURL);
    //             // يمكنك هنا إرسال dataURL إلى الخادم أو تخزينها
    //         }
    //     };
    // }

    // تغيير حجم الكانفاس عند تغيير حجم النافذة (اختياري)
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear(); // مسح التوقيع عند تغيير الحجم
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // استدعاء أولي لضبط الحجم

    console.log('تم إعداد لوحة التوقيع بنجاح.');
}

// --- إدارة البيانات (استخدام localStorage للتخزين المؤقت) ---
// script.js - منطق بسيط وفعال لتطبيق جمعية زواج

document.addEventListener('DOMContentLoaded', () => {
    // --- تهيئة أولية ---
    loadMembers(); // تحميل الأعضاء عند بدء التشغيل
    loadCollections(); // تحميل التحصيلات عند بدء التشغيل
    setTodaysDateForJoinDate(); // تعيين تاريخ اليوم في نموذج التسجيل
    setupNavigation();
    setupMobileMenu(); // إعداد القائمة للأجهزة المحمولة
    setupRegistrationForm();
    renderMembersTable(); // عرض الجدول الأولي
    populateAgreementMemberSelect(); // ملء قائمة الاتفاقية الأولية
    setupTermsAndConditions(); // إعداد الشروط والأحكام (بما في ذلك زر الطباعة واختيار العضو)
    setupSignaturePad(); // إعداد لوحة التوقيع

    // ربط الأزرار الإضافية في قسم الشروط (التي لم يتم ربطها داخل setupTermsAndConditions)
    const editButton = document.getElementById('editTermsButton');
    const whatsappButton = document.getElementById('sendWhatsAppButton');
    const clearSignatureButton = document.getElementById('clearSignatureButton');

    if (editButton) editButton.onclick = () => enableTermsEditing(true); // البدء بالتمكين
    if (whatsappButton) whatsappButton.onclick = sendTermsViaWhatsApp;
    if (clearSignatureButton) {
        const canvas = document.getElementById('signatureCanvas');
        const signaturePad = window.signaturePad; // الوصول إلى المتغير العام
        if (canvas && signaturePad) {
            clearSignatureButton.onclick = () => signaturePad.clear();
        } else {
            console.error("لم يتم العثور على لوحة التوقيع أو الكانفاس لزر المسح.");
        }
    }

    // تحميل محتوى الشروط المحفوظ إن وجد (اختياري)
    // const savedTerms = localStorage.getItem('termsContent');
    // if (savedTerms) {
    //     const termsContentElement = document.getElementById('termsContent');
    //     if (termsContentElement) termsContentElement.innerHTML = savedTerms;
    // }

    showSection('register'); // إظهار قسم التسجيل افتراضيًا
});

// إعداد القائمة للأجهزة المحمولة
function setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        // إضافة فئة mobile-hidden للقائمة في الأجهزة المحمولة
        if (window.innerWidth <= 768) {
            mainNav.classList.add('mobile-hidden');
        }

        // تبديل حالة القائمة عند النقر على زر القائمة
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-hidden');
        });

        // إغلاق القائمة عند النقر على أي رابط
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    mainNav.classList.add('mobile-hidden');
                }
            });
        });

        // إعادة ضبط حالة القائمة عند تغيير حجم النافذة
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                mainNav.classList.remove('mobile-hidden');
            } else {
                mainNav.classList.add('mobile-hidden');
            }
        });
    }
}

let members = [];
let nextMemberNumericId = 1;

function loadMembers() {
    const storedMembers = localStorage.getItem('zwaGMembers');
    const storedNextId = localStorage.getItem('zwaGNextId');
    if (storedMembers) {
        members = JSON.parse(storedMembers);
        nextMemberNumericId = storedNextId ? parseInt(storedNextId) : calculateNextId();
    } else {
        members = [];
        nextMemberNumericId = 1;
    }
}

function saveMembers() {
    localStorage.setItem('zwaGMembers', JSON.stringify(members));
    localStorage.setItem('zwaGNextId', nextMemberNumericId.toString());
}

function calculateNextId() {
    return members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navLinks.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            link.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    navLinks.forEach(nav => nav.classList.remove('active'));
    contentSections.forEach(section => section.classList.remove('active'));
    const targetLink = document.querySelector(`a[href="#${sectionId}"]`);
    const targetSection = document.getElementById(sectionId);
    if(targetLink) targetLink.classList.add('active');
    if(targetSection) targetSection.classList.add('active');
}

// المتغيرات العامة للبحث والتصفية
let filteredMembers = [];

// وظيفة عرض جدول الأعضاء
function renderMembersTable() {
    // تحديث قائمة الأعضاء المصفاة
    updateFilteredMembers();

    const tableBody = document.getElementById('membersBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (filteredMembers.length === 0) {
        const row = tableBody.insertRow();
        row.className = 'empty-row';
        const cell = row.insertCell();
        cell.colSpan = 7; // تعديل عدد الأعمدة بعد حذف 3 أعمدة

        // رسالة مختلفة إذا كان هناك أعضاء ولكن لا توجد نتائج للبحث
        if (members.length === 0) {
            cell.innerHTML = '<i class="fas fa-users-slash"></i> لا يوجد أعضاء مسجلون حالياً.';
        } else {
            cell.innerHTML = '<i class="fas fa-search"></i> لا توجد نتائج مطابقة لمعايير البحث.';
        }

        return;
    }

    // عرض الأعضاء المصفاة
    filteredMembers.forEach((member, index) => {
        const row = tableBody.insertRow();

        // إضافة خلية الرقم (تسلسلي بدءًا من 1)
        const idCell = row.insertCell();
        idCell.textContent = index + 1;
        idCell.style.textAlign = 'center';

        // إضافة خلية الاسم
        const nameCell = row.insertCell();
        nameCell.textContent = member.name;
        nameCell.style.fontWeight = 'bold';

        // إضافة خلية الحالة
        const statusCell = row.insertCell();
        statusCell.textContent = member.maritalStatus || 'لم يتزوج';
        statusCell.classList.add('status-cell');

        // إضافة خلية تاريخ الزواج
        const marriageDateCell = row.insertCell();
        marriageDateCell.textContent = member.marriageDate ? formatDate(member.marriageDate) : '-';
        marriageDateCell.style.textAlign = 'center';

        // إضافة خلية المتبقي على الزواج
        const remainingDaysCell = row.insertCell();
        if (member.marriageDate && (member.maritalStatus === 'تم تحديد الزواج')) {
            const remainingDays = calculateRemainingDays(member.marriageDate);
            remainingDaysCell.textContent = remainingDays > 0 ? `${remainingDays} يوم` : 'اليوم';

            // تطبيق لون الخلفية حسب المدة المتبقية
            if (remainingDays <= 7) {
                remainingDaysCell.style.backgroundColor = '#f8d7da';
                remainingDaysCell.style.color = '#721c24';
            } else if (remainingDays <= 30) {
                remainingDaysCell.style.backgroundColor = '#fff3cd';
                remainingDaysCell.style.color = '#856404';
            } else {
                remainingDaysCell.style.backgroundColor = '#d4edda';
                remainingDaysCell.style.color = '#155724';
            }
        } else {
            remainingDaysCell.textContent = '-';
        }
        remainingDaysCell.style.textAlign = 'center';

        // إضافة خلية حالة الدفع
        const paymentCell = row.insertCell();
        paymentCell.textContent = member.paymentStatus || 'لم يستلم';
        paymentCell.classList.add('status-cell');
        if (member.paymentStatus === 'استلم') {
            paymentCell.style.backgroundColor = '#d4edda';
            paymentCell.style.color = '#155724';
        } else {
            paymentCell.style.backgroundColor = '#f8d7da';
            paymentCell.style.color = '#721c24';
        }

        // إضافة خلية الإجراءات
        const actionsCell = row.insertCell();
        actionsCell.style.textAlign = 'center';

        // زر تعديل
        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i> تعديل';
        editButton.className = 'edit-btn';
        editButton.onclick = () => handleEditMember(member.id);
        actionsCell.appendChild(editButton);

        // زر حذف
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> حذف';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => {
            if (confirm(`هل أنت متأكد من حذف العضو ${member.name}؟`)) {
                handleDeleteMember(member.id);
            }
        };
        actionsCell.appendChild(deleteButton);

        // زر تفاصيل
        const detailsButton = document.createElement('button');
        detailsButton.innerHTML = '<i class="fas fa-info-circle"></i> تفاصيل';
        detailsButton.className = 'details-btn';
        detailsButton.onclick = () => showMemberDetails(member.id);
        actionsCell.appendChild(detailsButton);
    });

    // تحديث الإحصائيات
    updateMembersStats();
}

// وظيفة لحساب عدد الأيام المتبقية على الزواج
function calculateRemainingDays(marriageDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // تعيين الوقت إلى بداية اليوم

    const marriageDay = new Date(marriageDate);
    marriageDay.setHours(0, 0, 0, 0); // تعيين الوقت إلى بداية اليوم

    // حساب الفرق بالمللي ثانية وتحويله إلى أيام
    const diffTime = marriageDay - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

// وظيفة لتحديث قائمة الأعضاء المصفاة
function updateFilteredMembers() {
    const searchInput = document.getElementById('memberSearchInput');
    const statusFilter = document.getElementById('statusFilter');
    const paymentFilter = document.getElementById('paymentFilter');
    const regularityFilter = document.getElementById('regularityFilter');

    // إذا لم تكن عناصر التصفية موجودة، استخدم جميع الأعضاء
    if (!searchInput || !statusFilter || !paymentFilter || !regularityFilter) {
        filteredMembers = [...members];
        return;
    }

    const searchTerm = searchInput.value.trim().toLowerCase();
    const statusValue = statusFilter.value;
    const paymentValue = paymentFilter.value;
    const regularityValue = regularityFilter.value;

    // تطبيق التصفية
    filteredMembers = members.filter(member => {
        // البحث في الاسم ورقم الهوية ورقم الجوال
        const matchesSearch =
            !searchTerm ||
            member.name.toLowerCase().includes(searchTerm) ||
            member.memberId.includes(searchTerm) ||
            member.memberPhone.includes(searchTerm);

        // تصفية حسب الحالة
        const matchesStatus = !statusValue || member.maritalStatus === statusValue;

        // تصفية حسب حالة الدفع
        const matchesPayment = !paymentValue || member.paymentStatus === paymentValue;

        // تصفية حسب حالة الانتظام
        const matchesRegularity = !regularityValue || member.regularityStatus === regularityValue;

        // يجب أن تتطابق جميع المعايير
        return matchesSearch && matchesStatus && matchesPayment && matchesRegularity;
    });
}

// وظيفة البحث والتصفية
function filterMembers() {
    // تحديث قائمة الأعضاء المصفاة
    updateFilteredMembers();

    // عرض الجدول مع النتائج المصفاة
    renderMembersTable();
}

// وظيفة تحديث الإحصائيات
function updateMembersStats() {
    const statsContainer = document.getElementById('membersStats');
    if (!statsContainer) return;

    // حساب الإحصائيات
    const totalMembers = members.length;
    const marriedMembers = members.filter(m => m.maritalStatus === 'تزوج').length;
    const unmarriedMembers = members.filter(m => m.maritalStatus === 'لم يتزوج').length;
    const scheduledMembers = members.filter(m => m.maritalStatus === 'تم تحديد الزواج').length;

    const receivedPayments = members.filter(m => m.paymentStatus === 'استلم').length;
    const pendingPayments = members.filter(m => m.paymentStatus === 'لم يستلم').length;

    // حساب إجمالي المبالغ
    let totalPaidAmount = 0;
    members.forEach(member => {
        if (member.transactions && member.transactions.length > 0) {
            member.transactions.forEach(tr => {
                totalPaidAmount += tr.amount;
            });
        }
    });

    // المبلغ الإجمالي المفترض (1000 ريال × عدد الأعضاء)
    const totalExpectedAmount = totalMembers * 1000;

    // المبلغ المتبقي
    const remainingAmount = totalExpectedAmount - totalPaidAmount;

    // نسبة التحصيل
    const collectionPercentage = totalMembers > 0 ? Math.round((totalPaidAmount / totalExpectedAmount) * 100) : 0;

    // إنشاء بطاقات الإحصائيات
    statsContainer.innerHTML = `
        <div class="stat-card primary">
            <i class="fas fa-users"></i>
            <div class="stat-label">إجمالي الأعضاء</div>
            <div class="stat-value">${totalMembers}</div>
        </div>

        <div class="stat-card success">
            <i class="fas fa-user-check"></i>
            <div class="stat-label">متزوجون</div>
            <div class="stat-value">${marriedMembers}</div>
        </div>

        <div class="stat-card warning">
            <i class="fas fa-user-clock"></i>
            <div class="stat-label">غير متزوجين</div>
            <div class="stat-value">${unmarriedMembers}</div>
        </div>

        <div class="stat-card danger">
            <i class="fas fa-calendar-alt"></i>
            <div class="stat-label">تم تحديد الزواج</div>
            <div class="stat-value">${scheduledMembers}</div>
        </div>

        <div class="stat-card primary">
            <i class="fas fa-money-bill-wave"></i>
            <div class="stat-label">المبلغ المفترض</div>
            <div class="stat-value">${totalExpectedAmount} ريال</div>
        </div>

        <div class="stat-card success">
            <i class="fas fa-hand-holding-usd"></i>
            <div class="stat-label">المبلغ المحصل</div>
            <div class="stat-value">${totalPaidAmount} ريال</div>
        </div>

        <div class="stat-card warning">
            <i class="fas fa-coins"></i>
            <div class="stat-label">المبلغ المتبقي</div>
            <div class="stat-value">${remainingAmount} ريال</div>
        </div>

        <div class="stat-card danger">
            <i class="fas fa-percentage"></i>
            <div class="stat-label">نسبة التحصيل</div>
            <div class="stat-value">${collectionPercentage}%</div>
        </div>
    `;
}

// دالة مساعدة لتنسيق التاريخ
function formatDate(dateString) {
    if (!dateString) return '-';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // إذا كان التاريخ غير صالح

        // تنسيق التاريخ بالطريقة العربية: يوم/شهر/سنة
        return date.toLocaleDateString('ar-SA');
    } catch (e) {
        return dateString;
    }
}

function handleDeleteMember(memberId) {
    members = members.filter(m => m.id !== memberId);
    saveMembers();
    renderMembersTable();
}

// وظيفة تعديل بيانات العضو
function handleEditMember(memberId) {
    const member = members.find(m => m.id === memberId);
    if (!member) {
        alert('لم يتم العثور على العضو!');
        return;
    }

    // إنشاء نافذة منبثقة للتعديل
    const editDiv = document.createElement('div');
    editDiv.className = 'details-modal';

    const modalContent = `
        <div class='details-content'>
            <div class='details-header'>
                <h3>تعديل بيانات العضو</h3>
                <button class='details-close-btn' onclick='this.closest(".details-modal").remove()'>&times;</button>
            </div>

            <div class='details-body'>
                <form id="editMemberForm">
                    <div class="form-group">
                        <label for="editName">الاسم الكامل</label>
                        <input type="text" id="editName" value="${member.name || ''}" placeholder="أدخل الاسم الكامل">
                    </div>

                    <div class="form-group">
                        <label for="editMemberId">رقم الهوية</label>
                        <input type="text" id="editMemberId" value="${member.memberId || ''}" placeholder="أدخل رقم الهوية" pattern="\\d{10}">
                    </div>

                    <div class="form-group">
                        <label for="editEmail">البريد الإلكتروني</label>
                        <input type="email" id="editEmail" value="${member.email || ''}" placeholder="أدخل البريد الإلكتروني">
                    </div>

                    <div class="form-group">
                        <label for="editPhone">رقم الجوال</label>
                        <input type="tel" id="editPhone" value="${member.memberPhone || ''}" placeholder="05xxxxxxxx" pattern="05\\d{8}">
                    </div>

                    <div class="form-group">
                        <label for="editAddress">العنوان</label>
                        <textarea id="editAddress" placeholder="أدخل العنوان التفصيلي" rows="3">${member.address || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="editMaritalStatus">حالة الزواج</label>
                        <select id="editMaritalStatus" onchange="toggleEditMarriageDateField()">
                            <option value="لم يتزوج" ${member.maritalStatus === 'لم يتزوج' ? 'selected' : ''}>لم يتزوج</option>
                            <option value="تزوج" ${member.maritalStatus === 'تزوج' ? 'selected' : ''}>متزوج</option>
                            <option value="تم تحديد الزواج" ${member.maritalStatus === 'تم تحديد الزواج' ? 'selected' : ''}>تم تحديد الزواج</option>
                        </select>
                    </div>

                    <div class="form-group" id="editMarriageDateGroup" style="${(member.maritalStatus === 'تزوج' || member.maritalStatus === 'تم تحديد الزواج') ? 'display:block' : 'display:none'}">
                        <label for="editMarriageDate">تاريخ الزواج</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="date" id="editMarriageDate" value="${member.marriageDate || ''}" style="flex: 1;">
                            <button type="button" class="details-btn details-btn-danger" style="padding: 5px 10px;" onclick="clearMarriageDate()">
                                <i class="fas fa-times"></i> إلغاء التاريخ
                            </button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="editPaymentStatus">حالة الدفع</label>
                        <select id="editPaymentStatus">
                            <option value="استلم" ${member.paymentStatus === 'استلم' ? 'selected' : ''}>استلم</option>
                            <option value="لم يستلم" ${member.paymentStatus === 'لم يستلم' ? 'selected' : ''}>لم يستلم</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editRegularityStatus">حالة الانتظام</label>
                        <select id="editRegularityStatus">
                            <option value="منتظم" ${member.regularityStatus === 'منتظم' ? 'selected' : ''}>منتظم</option>
                            <option value="متأخر" ${member.regularityStatus === 'متأخر' ? 'selected' : ''}>متأخر</option>
                            <option value="متعثر" ${member.regularityStatus === 'متعثر' ? 'selected' : ''}>متعثر</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editNotes">ملاحظات إضافية</label>
                        <textarea id="editNotes" placeholder="أي ملاحظات إضافية" rows="3">${member.notes || ''}</textarea>
                    </div>
                </form>
            </div>

            <div class='details-actions'>
                <button class='details-btn details-btn-primary' onclick='saveMemberEdit(${member.id})'>حفظ التعديلات</button>
                <button class='details-btn details-btn-secondary' onclick='this.closest(".details-modal").remove()'>إلغاء</button>
            </div>
        </div>
    `;

    editDiv.innerHTML = modalContent;
    document.body.appendChild(editDiv);
}

// وظيفة لإظهار/إخفاء حقل تاريخ الزواج في نموذج التعديل
function toggleEditMarriageDateField() {
    const maritalStatus = document.getElementById('editMaritalStatus');
    const marriageDateGroup = document.getElementById('editMarriageDateGroup');

    if (maritalStatus && marriageDateGroup) {
        if (maritalStatus.value === 'تزوج' || maritalStatus.value === 'تم تحديد الزواج') {
            marriageDateGroup.style.display = 'block';
        } else {
            marriageDateGroup.style.display = 'none';
        }
    }
}

// وظيفة لإلغاء تاريخ الزواج
function clearMarriageDate() {
    const marriageDateInput = document.getElementById('editMarriageDate');
    if (marriageDateInput) {
        marriageDateInput.value = '';
    }
}

// وظيفة حفظ تعديلات العضو
function saveMemberEdit(memberId) {
    const member = members.find(m => m.id === memberId);
    if (!member) {
        alert('لم يتم العثور على العضو!');
        return;
    }

    // الحصول على القيم المعدلة
    const name = document.getElementById('editName').value.trim();
    if (!name) {
        alert('يرجى إدخال اسم العضو');
        return;
    }

    const memberId_value = document.getElementById('editMemberId').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    const maritalStatus = document.getElementById('editMaritalStatus').value;
    const marriageDate = document.getElementById('editMarriageDate').value;
    const paymentStatus = document.getElementById('editPaymentStatus').value;
    const regularityStatus = document.getElementById('editRegularityStatus').value;
    const notes = document.getElementById('editNotes').value.trim();

    // لا نتحقق من تاريخ الزواج، نسمح بأن يكون فارغًا

    // تحديث بيانات العضو
    member.name = name;
    member.memberId = memberId_value;
    member.email = email;
    member.memberPhone = phone;
    member.address = address;
    member.maritalStatus = maritalStatus;
    member.marriageDate = marriageDate;
    member.paymentStatus = paymentStatus;
    member.regularityStatus = regularityStatus;
    member.notes = notes;

    // حفظ التغييرات
    saveMembers();

    // تحديث واجهة المستخدم
    renderMembersTable();

    // إغلاق النافذة المنبثقة
    const modal = document.querySelector('.details-modal');
    if (modal) modal.remove();

    // عرض رسالة نجاح
    alert(`تم تحديث بيانات العضو ${name} بنجاح.`);
}

function setupRegistrationForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    // الحصول على عناصر النموذج
    const formSteps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const prevButtons = document.querySelectorAll('.prev-step-btn');
    const agreeTermsCheckbox = document.getElementById('agreeTermsRegister');
    const submitButton = document.getElementById('registerSubmitButton');

    // تعيين تاريخ الانضمام إلى تاريخ اليوم
    setTodaysDateForJoinDate();

    // إضافة مستمعات الأحداث لأزرار التنقل بين الخطوات
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            // الحصول على الخطوة الحالية والتالية
            const currentStep = button.closest('.form-step');
            const currentStepNum = parseInt(currentStep.dataset.step);
            const nextStepNum = currentStepNum + 1;
            const nextStep = document.querySelector(`.form-step[data-step="${nextStepNum}"]`);

            // التحقق من صحة الحقول في الخطوة الحالية
            if (validateStep(currentStepNum)) {
                // إخفاء الخطوة الحالية وإظهار الخطوة التالية
                currentStep.classList.remove('active');
                nextStep.classList.add('active');

                // تحديث مؤشرات الخطوات
                updateStepIndicators(nextStepNum);
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            // الحصول على الخطوة الحالية والسابقة
            const currentStep = button.closest('.form-step');
            const currentStepNum = parseInt(currentStep.dataset.step);
            const prevStepNum = currentStepNum - 1;
            const prevStep = document.querySelector(`.form-step[data-step="${prevStepNum}"]`);

            // إخفاء الخطوة الحالية وإظهار الخطوة السابقة
            currentStep.classList.remove('active');
            prevStep.classList.add('active');

            // تحديث مؤشرات الخطوات
            updateStepIndicators(prevStepNum);
        });
    });

    // إضافة مستمع للتحقق من حالة مربع الموافقة على الشروط
    if (agreeTermsCheckbox && submitButton) {
        agreeTermsCheckbox.addEventListener('change', () => {
            // تفعيل زر التسجيل فقط إذا تم الموافقة على الشروط
            submitButton.disabled = !agreeTermsCheckbox.checked;
        });
    }

    // إضافة مستمعات الأحداث للحقول لإظهار التحقق المباشر
    const allInputs = form.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateInput(input);
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                validateInput(input);
            }
        });
    });

    // معالجة تقديم النموذج
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // التحقق من صحة الحقول المدخلة
        if (!validateAllSteps()) {
            return;
        }

        // التحقق من وجود اسم على الأقل
        const name = form.memberName.value.trim();
        if (!name) {
            alert('يرجى إدخال اسم العضو على الأقل');
            return;
        }

        // جمع بيانات العضو الجديد
        const email = form.memberEmail.value.trim();
        const memberId = form.memberId.value.trim();
        const memberPhone = form.memberPhone.value.trim();
        const joinDate = form.joinDate.value;
        const memberStatus = form.memberStatus.value;
        const address = form.address.value.trim() || '';
        const notes = form.notes.value.trim() || '';

        // إنشاء كائن العضو الجديد
        const newMember = {
            id: nextMemberNumericId,
            name,
            email,
            memberId,
            memberPhone,
            joinDate,
            memberStatus,
            maritalStatus: 'لم يتزوج', // القيمة الافتراضية
            address,
            notes,
            marriageDate: '',
            paymentStatus: 'لم يستلم',
            regularityStatus: 'منتظم',
            transactions: []
        };

        // إضافة العضو الجديد وحفظ البيانات
        members.push(newMember);
        nextMemberNumericId++;
        saveMembers();

        // تحديث قائمة الأعضاء في قسم الشروط والأحكام
        populateAgreementMemberSelect();

        // عرض رسالة نجاح
        showSuccessMessage(`تم تسجيل العضو ${name} بنجاح.`);

        // إعادة تعيين النموذج
        resetForm();

        // الانتقال إلى قائمة الأعضاء
        renderMembersTable();
        showSection('members');
    });

    // وظيفة للتحقق من صحة خطوة معينة
    function validateStep(stepNumber) {
        const stepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        const allFields = stepElement.querySelectorAll('input, select, textarea');
        let isValid = true;

        allFields.forEach(field => {
            // التحقق فقط من الحقول التي تحتوي على قيمة أو لها سمة pattern
            if (field.value.trim() !== '' || field.hasAttribute('pattern')) {
                if (!validateInput(field)) {
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    // وظيفة للتحقق من صحة جميع الخطوات
    function validateAllSteps() {
        let isValid = true;

        formSteps.forEach(step => {
            const stepNumber = parseInt(step.dataset.step);
            if (!validateStep(stepNumber)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // وظيفة للتحقق من صحة حقل معين
    function validateInput(input) {
        // إذا كان الحقل غير إلزامي وفارغ، فهو صالح
        if (!input.hasAttribute('required') && input.value.trim() === '') {
            input.classList.remove('invalid');

            // إزالة رسالة الخطأ إن وجدت
            const errorElement = input.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }

            return true;
        }

        const value = input.value.trim();
        const isValid = input.checkValidity() && (input.hasAttribute('required') ? value !== '' : true);

        if (!isValid) {
            input.classList.add('invalid');

            // إظهار رسالة خطأ مخصصة
            const errorMessage = input.title || 'يرجى التحقق من صحة البيانات المدخلة';
            const errorElement = input.parentElement.querySelector('.error-message');

            if (!errorElement) {
                const newErrorElement = document.createElement('div');
                newErrorElement.className = 'error-message';
                newErrorElement.textContent = errorMessage;
                input.parentElement.appendChild(newErrorElement);
            }
        } else {
            input.classList.remove('invalid');

            // إزالة رسالة الخطأ إن وجدت
            const errorElement = input.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        }

        return isValid;
    }

    // وظيفة لتحديث مؤشرات الخطوات
    function updateStepIndicators(activeStepNum) {
        stepIndicators.forEach(indicator => {
            const stepNum = parseInt(indicator.dataset.step);

            // إزالة جميع الفئات
            indicator.classList.remove('active', 'completed');

            // إضافة الفئة المناسبة
            if (stepNum === activeStepNum) {
                indicator.classList.add('active');
            } else if (stepNum < activeStepNum) {
                indicator.classList.add('completed');
            }
        });
    }

    // وظيفة لإظهار رسالة نجاح
    function showSuccessMessage(message) {
        // إنشاء عنصر رسالة النجاح
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        // إضافة العنصر إلى الصفحة
        document.body.appendChild(successMessage);

        // إظهار الرسالة بتأثير متحرك
        setTimeout(() => {
            successMessage.classList.add('show');
        }, 10);

        // إزالة الرسالة بعد 3 ثوانٍ
        setTimeout(() => {
            successMessage.classList.remove('show');
            setTimeout(() => {
                successMessage.remove();
            }, 300);
        }, 3000);
    }

    // وظيفة لإعادة تعيين النموذج
    function resetForm() {
        // إعادة تعيين قيم الحقول
        form.reset();

        // إعادة تعيين تاريخ الانضمام
        setTodaysDateForJoinDate();

        // إعادة تعيين حالة مربع الاختيار وزر التسجيل
        if (agreeTermsCheckbox && submitButton) {
            agreeTermsCheckbox.checked = false;
            submitButton.disabled = true;
        }

        // إعادة تعيين الخطوات
        formSteps.forEach(step => {
            step.classList.remove('active');
        });
        formSteps[0].classList.add('active');

        // إعادة تعيين مؤشرات الخطوات
        updateStepIndicators(1);

        // إزالة رسائل الخطأ
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(message => {
            message.remove();
        });

        // إزالة فئة invalid من الحقول
        const invalidInputs = form.querySelectorAll('.invalid');
        invalidInputs.forEach(input => {
            input.classList.remove('invalid');
        });

        // إذا كان هناك أسماء متعددة، ضع الاسم التالي في حقل الاسم
        if (bulkNames.length > 0 && currentNameIndex < bulkNames.length) {
            document.getElementById('memberName').value = bulkNames[currentNameIndex];
        }
    }
}

function setTodaysDateForJoinDate() {
    const joinDateInput = document.getElementById('joinDate');
    if (joinDateInput) {
        const today = new Date().toISOString().split('T')[0];
        joinDateInput.value = today;
        // جعل الحقل للقراءة فقط إذا أردنا ذلك
        // joinDateInput.readOnly = true;
    }
}

// --- منطق الشروط والأحكام والطباعة ---

// وظيفة لملء القائمة المنسدلة لاختيار العضو في قسم الاتفاقية
function populateAgreementMemberSelect() {
    const selectElement = document.getElementById('selectMemberForAgreement');
    if (!selectElement) return;

    selectElement.innerHTML = '<option value="" disabled selected>-- اختر العضو --</option>'; // مسح الخيارات وإضافة خيار افتراضي

    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id; // يمكن استخدام ID أو الاسم كقيمة
        option.textContent = member.name;
        selectElement.appendChild(option);
    });
}

function setupTermsAndConditions() {
    const agreeCheckbox = document.getElementById('agreeTerms');
    const printButton = document.getElementById('printTermsButton');
    const memberNameSpan = document.getElementById('printMemberName');
    const dateSpan = document.getElementById('printDate');
    const memberSelect = document.getElementById('selectMemberForAgreement'); // الحصول على القائمة المنسدلة

    if (!agreeCheckbox || !printButton || !memberNameSpan || !dateSpan || !memberSelect) return;

    // استدعاء أولي لملء القائمة
    // populateAgreementMemberSelect(); // تم نقله إلى DOMContentLoaded

    agreeCheckbox.addEventListener('change', () => {
        // تفعيل زر الطباعة فقط إذا تم تحديد عضو والموافقة على الشروط
        printButton.disabled = !agreeCheckbox.checked || !memberSelect.value;
    });

    memberSelect.addEventListener('change', () => {
        // تفعيل زر الطباعة فقط إذا تم تحديد عضو والموافقة على الشروط
        printButton.disabled = !agreeCheckbox.checked || !memberSelect.value;
    });

    printButton.addEventListener('click', () => {
        const selectedMemberId = memberSelect.value;
        const selectedMember = members.find(m => m.id.toString() === selectedMemberId);

        if (selectedMember) {
            memberNameSpan.textContent = selectedMember.name;
            dateSpan.textContent = new Date().toLocaleDateString('ar-SA'); // تاريخ اليوم بالتنسيق المحلي

            // إخفاء العناصر غير المرغوب فيها قبل الطباعة
            const elementsToHide = document.querySelectorAll('header, nav, footer, #members, #register, #home, #terms > div:not(#printableTerms)'); // إخفاء كل شيء ما عدا المحتوى القابل للطباعة
            elementsToHide.forEach(el => el.style.display = 'none');

            // إظهار قسم الطباعة فقط
            const printableSection = document.getElementById('printableTerms');
            if (printableSection) printableSection.style.display = 'block';

            window.print(); // فتح نافذة الطباعة

            // إعادة إظهار العناصر بعد الطباعة
            elementsToHide.forEach(el => el.style.display = '');
            if (printableSection) printableSection.style.display = ''; // إعادة إخفاء قسم الطباعة إذا كان مخفياً افتراضياً

            // مسح الاسم والتاريخ وإعادة تعيين الحالة بعد الطباعة
            memberNameSpan.textContent = '..............................';
            dateSpan.textContent = '..............................';
            agreeCheckbox.checked = false;
            memberSelect.value = ''; // إعادة تعيين القائمة المنسدلة
            printButton.disabled = true;

        } else {
            alert("الرجاء اختيار عضو من القائمة أولاً.");
        }
    });
}


function printTerms() {
    const termsContent = document.getElementById('termsContent');
    // تصحيح: استخدام المعرف الصحيح للقائمة المنسدلة
    const memberSelect = document.getElementById('selectMemberForAgreement');
    const memberName = memberSelect.selectedOptions[0]?.text || 'غير محدد';
    const signatureCanvas = document.getElementById('signatureCanvas');

    if (!termsContent) {
        console.error("عنصر محتوى الشروط غير موجود!");
        return;
    }

    // إنشاء نافذة جديدة للطباعة
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>طباعة الاتفاقية</title>');
    // إضافة تنسيقات أساسية للطباعة وتضمين Font Awesome إذا لزم الأمر
    printWindow.document.write('<link rel="stylesheet" href="style.css">'); // ربط ملف CSS الرئيسي
    printWindow.document.write('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">');
    printWindow.document.write('<style> @media print { body { font-family: sans-serif; direction: rtl; } header, nav, footer, button, select, input, .signature-controls, #sendAgreementOptions { display: none !important; } #termsContent, #signatureAreaPrint { display: block !important; } canvas { border: 1px solid #ccc; } } </style>');
    printWindow.document.write('</head><body dir="rtl">');

    // إضافة عنوان واسم العضو
    printWindow.document.write(`<h1>اتفاقية العضوية</h1>`);
    printWindow.document.write(`<p><strong>العضو:</strong> ${memberName}</p>`);
    printWindow.document.write('<hr>');

    // نسخ محتوى الشروط
    printWindow.document.write('<h2>الشروط والأحكام:</h2>');
    printWindow.document.write(termsContent.innerHTML);

    // إضافة منطقة التوقيع إذا كان هناك توقيع
    if (signatureCanvas && !isCanvasBlank(signatureCanvas)) {
        printWindow.document.write('<div id="signatureAreaPrint" style="margin-top: 30px; padding-top: 20px; border-top: 1px dashed #ccc;">');
        printWindow.document.write('<h3>توقيع العضو:</h3>');
        const signatureImage = signatureCanvas.toDataURL('image/png');
        printWindow.document.write(`<img src="${signatureImage}" alt="توقيع العضو" style="border: 1px solid #000; max-width: 300px;">`);
        printWindow.document.write('</div>');
    }

    printWindow.document.write('</body></html>');
    printWindow.document.close(); // ضروري لـ IE

    // تأخير الطباعة قليلاً للسماح بتحميل المحتوى والصور
    setTimeout(() => {
        printWindow.focus(); // ضروري لبعض المتصفحات
        printWindow.print();
        // printWindow.close(); // أغلق النافذة بعد الطباعة (اختياري)
    }, 500); // تأخير 500 مللي ثانية
}

// وظيفة مساعدة للتحقق مما إذا كان الكانفاس فارغًا
function isCanvasBlank(canvas) {
    if (!canvas) return true;
    const context = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(
        context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return !pixelBuffer.some(pixel => pixel !== 0);
}


// تمكين/تعطيل تحرير محتوى الشروط
function enableTermsEditing(enable) {
    const termsContent = document.getElementById('termsContent');
    const editButton = document.getElementById('editTermsButton'); // افترض وجود زر بهذا المعرف
    if (!termsContent || !editButton) {
        console.error("عناصر تحرير الشروط غير موجودة!");
        return;
    }

    termsContent.contentEditable = enable;
    if (enable) {
        termsContent.style.border = '2px dashed #ffc107'; // تمييز عند التمكين
        termsContent.style.backgroundColor = '#fffacd';
        termsContent.focus();
        editButton.innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات'; // تغيير نص الزر
        editButton.onclick = () => enableTermsEditing(false); // عند الضغط مرة أخرى، يتم الحفظ (التعطيل)
    } else {
        termsContent.style.border = 'none';
        termsContent.style.backgroundColor = 'transparent';
        // هنا يمكنك إضافة منطق لحفظ التعديلات إذا لزم الأمر (مثلاً في localStorage)
        // localStorage.setItem('termsContent', termsContent.innerHTML);
        alert('تم حفظ التعديلات (إذا تم تطبيق الحفظ).');
        editButton.innerHTML = '<i class="fas fa-edit"></i> تعديل الشروط'; // إعادة نص الزر الأصلي
        editButton.onclick = () => enableTermsEditing(true); // عند الضغط مرة أخرى، يتم التمكين
    }
}

// إرسال الاتفاقية عبر واتساب
function sendTermsViaWhatsApp() {
    const termsContent = document.getElementById('termsContent');
    // تصحيح: استخدام المعرف الصحيح للقائمة المنسدلة
    const memberSelect = document.getElementById('selectMemberForAgreement');
    const memberName = memberSelect.selectedOptions[0]?.text || 'غير محدد';
    const signatureCanvas = document.getElementById('signatureCanvas');

    if (!termsContent) {
        console.error("عنصر محتوى الشروط غير موجود!");
        alert('لا يمكن إرسال الشروط، المحتوى غير موجود.');
        return;
    }

    let message = `*اتفاقية العضوية*

`;
    message += `*العضو:* ${memberName}

`;
    message += `*الشروط والأحكام:*
`;
    // تحويل HTML إلى نص عادي (بسيط)
    // قد تحتاج إلى مكتبة أكثر قوة لتحويل HTML معقد
    const plainTextTerms = termsContent.innerText || termsContent.textContent || '';
    message += plainTextTerms.replace(/<br\s*[/]?>/gi, "\n").replace(/<[^>]+>/g, ''); // إزالة تاجات HTML

    // لا يمكن إرسال صورة التوقيع مباشرة كنص في واتساب
    // يمكنك إخبار المستخدم بأن التوقيع موجود أو إرسال رابط للصورة إذا تم رفعها
    if (signatureCanvas && !isCanvasBlank(signatureCanvas)) {
        message += `\n\n*ملاحظة:* تم توقيع الاتفاقية إلكترونياً.`;
    }

    // ترميز الرسالة لـ URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    // فتح رابط واتساب في نافذة جديدة
    window.open(whatsappUrl, '_blank');
}

// قسم التحصيل
let collections = [];
function setupCollectionForm() {
    // تحميل التحصيلات عند بدء التشغيل
    loadCollections();

    // الحصول على عناصر النموذج
    const form = document.getElementById('collectionForm');
    if (!form) return;

    // إعداد علامات التبويب للمتزوجين وتواريخ الزواج
    setupMarriageTabs();

    // إعداد اختيار نوع التحصيل (فردي، مجموعة، الكل)
    setupSelectionTypeRadios();

    // إعداد حقول النموذج
    setupFormFields();

    // معالجة تقديم النموذج
    form.addEventListener('submit', handleCollectionFormSubmit);

    // إعداد أزرار تصدير البيانات والطباعة
    setupCollectionTableActions();
}

// وظيفة لإعداد علامات التبويب للمتزوجين وتواريخ الزواج
function setupMarriageTabs() {
    // عرض المتزوجين والذين تم تحديد زواجهم
    renderMarriedMembersCards();

    // إضافة مستمعي الأحداث لعلامات التبويب
    const marriageTabs = document.querySelectorAll('.marriage-tab');
    marriageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // إلغاء تنشيط جميع علامات التبويب
            marriageTabs.forEach(t => t.classList.remove('active'));

            // تنشيط علامة التبويب المحددة
            tab.classList.add('active');

            // إخفاء جميع محتويات علامات التبويب
            const tabContents = document.querySelectorAll('.marriage-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));

            // إظهار المحتوى المرتبط بعلامة التبويب المحددة
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// وظيفة لعرض بطاقات الأعضاء المتزوجين والذين تم تحديد زواجهم
function renderMarriedMembersCards() {
    // الحصول على حاويات البطاقات
    const marriedCardsContainer = document.getElementById('marriedMembersCards');
    const scheduledCardsContainer = document.getElementById('scheduledMembersCards');

    if (!marriedCardsContainer || !scheduledCardsContainer) return;

    // تصفية الأعضاء المتزوجين والذين تم تحديد زواجهم
    const marriedMembers = members.filter(m => m.maritalStatus === 'تزوج');
    const scheduledMembers = members.filter(m => m.maritalStatus === 'تم تحديد الزواج');

    // عرض الأعضاء المتزوجين
    if (marriedMembers.length > 0) {
        marriedCardsContainer.innerHTML = '';
        marriedMembers.forEach(member => {
            const card = createMemberCard(member);
            marriedCardsContainer.appendChild(card);
        });
    } else {
        marriedCardsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>لا يوجد أعضاء متزوجون حاليًا</p>
            </div>
        `;
    }

    // عرض الأعضاء الذين تم تحديد زواجهم
    if (scheduledMembers.length > 0) {
        scheduledCardsContainer.innerHTML = '';
        scheduledMembers.forEach(member => {
            const card = createMemberCard(member);
            scheduledCardsContainer.appendChild(card);
        });
    } else {
        scheduledCardsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>لا يوجد أعضاء تم تحديد زواجهم حاليًا</p>
            </div>
        `;
    }
}

// وظيفة لإنشاء بطاقة عضو
function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'marriage-card';

    let countdownClass = '';
    let countdownText = '';

    if (member.marriageDate) {
        const remainingDays = calculateRemainingDays(member.marriageDate);

        if (remainingDays <= 7) {
            countdownClass = 'very-soon';
            countdownText = remainingDays > 0 ? `${remainingDays} يوم فقط على الزواج!` : 'اليوم هو يوم الزواج!';
        } else if (remainingDays <= 30) {
            countdownClass = 'urgent';
            countdownText = `${remainingDays} يوم على الزواج`;
        } else {
            countdownText = `${remainingDays} يوم على الزواج`;
        }
    }

    card.innerHTML = `
        <div class="marriage-card-header">
            <h4 class="marriage-card-name">${member.name}</h4>
        </div>
        <div class="marriage-card-date">
            <i class="fas fa-calendar-alt"></i>
            <span>${member.marriageDate ? formatDate(member.marriageDate) : 'لم يتم تحديد تاريخ'}</span>
        </div>
        ${member.marriageDate ? `
            <div class="marriage-card-countdown ${countdownClass}">
                <i class="fas fa-hourglass-half"></i>
                ${countdownText}
            </div>
        ` : ''}
    `;

    return card;
}

// وظيفة لإعداد أزرار اختيار نوع التحصيل
function setupSelectionTypeRadios() {
    const selectionRadios = document.querySelectorAll('input[name="selectionType"]');
    const singleMemberSelection = document.getElementById('singleMemberSelection');
    const multipleMemberSelection = document.getElementById('multipleMemberSelection');
    const selectedMembersPreview = document.getElementById('selectedMembersPreview');

    if (!selectionRadios.length || !singleMemberSelection || !multipleMemberSelection) return;

    selectionRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectionType = radio.value;

            // إخفاء جميع أقسام الاختيار
            singleMemberSelection.style.display = 'none';
            multipleMemberSelection.style.display = 'none';
            selectedMembersPreview.style.display = 'none';

            // إظهار القسم المناسب حسب نوع الاختيار
            if (selectionType === 'single') {
                singleMemberSelection.style.display = 'block';
            } else if (selectionType === 'multiple') {
                multipleMemberSelection.style.display = 'block';
                selectedMembersPreview.style.display = 'block';
                setupMultiSelectMembers();
            } else if (selectionType === 'all') {
                // لا نحتاج لإظهار أي قسم للاختيار عند اختيار "جميع الأعضاء"
            }
        });
    });
}

// وظيفة لإعداد اختيار متعدد للأعضاء
function setupMultiSelectMembers() {
    const membersList = document.getElementById('membersMultiSelectList');
    const searchInput = document.getElementById('membersSearchInput');
    const selectAllBtn = document.getElementById('selectAllMembers');
    const deselectAllBtn = document.getElementById('deselectAllMembers');

    if (!membersList) return;

    // ملء قائمة الأعضاء
    membersList.innerHTML = '';
    members.forEach(member => {
        const item = document.createElement('div');
        item.className = 'member-checkbox-item';
        item.innerHTML = `
            <label>
                <input type="checkbox" value="${member.id}" data-name="${member.name}">
                ${member.name}
            </label>
        `;
        membersList.appendChild(item);
    });

    // إضافة مستمع الأحداث للبحث
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            const items = membersList.querySelectorAll('.member-checkbox-item');

            items.forEach(item => {
                const label = item.querySelector('label');
                const memberName = label.textContent.trim().toLowerCase();

                if (memberName.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // إضافة مستمعي الأحداث لأزرار اختيار الكل وإلغاء اختيار الكل
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const checkboxes = membersList.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (checkbox.parentElement.parentElement.style.display !== 'none') {
                    checkbox.checked = true;
                }
            });
            updateSelectedMembersPreview();
        });
    }

    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => {
            const checkboxes = membersList.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            updateSelectedMembersPreview();
        });
    }

    // إضافة مستمعي الأحداث لمربعات الاختيار
    const checkboxes = membersList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedMembersPreview);
    });

    // تحديث معاينة الأعضاء المختارين
    updateSelectedMembersPreview();
}

// وظيفة لتحديث معاينة الأعضاء المختارين
function updateSelectedMembersPreview() {
    const membersList = document.getElementById('membersMultiSelectList');
    const selectedMembersList = document.getElementById('selectedMembersList');
    const selectedMembersCount = document.getElementById('selectedMembersCount');

    if (!membersList || !selectedMembersList || !selectedMembersCount) return;

    // الحصول على الأعضاء المختارين
    const selectedCheckboxes = membersList.querySelectorAll('input[type="checkbox"]:checked');
    const selectedMembers = Array.from(selectedCheckboxes).map(checkbox => ({
        id: checkbox.value,
        name: checkbox.getAttribute('data-name')
    }));

    // تحديث عدد الأعضاء المختارين
    selectedMembersCount.textContent = selectedMembers.length;

    // تحديث قائمة الأعضاء المختارين
    selectedMembersList.innerHTML = '';

    if (selectedMembers.length === 0) {
        selectedMembersList.innerHTML = '<div class="empty-state">لم يتم اختيار أي عضو</div>';
    } else {
        selectedMembers.forEach(member => {
            const tag = document.createElement('div');
            tag.className = 'selected-member-tag';
            tag.innerHTML = `
                <span>${member.name}</span>
                <button type="button" data-id="${member.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // إضافة مستمع الأحداث لزر الحذف
            const removeBtn = tag.querySelector('button');
            removeBtn.addEventListener('click', () => {
                const checkbox = membersList.querySelector(`input[value="${member.id}"]`);
                if (checkbox) {
                    checkbox.checked = false;
                    updateSelectedMembersPreview();
                }
            });

            selectedMembersList.appendChild(tag);
        });
    }
}

// وظيفة لإعداد حقول النموذج
function setupFormFields() {
    // ملء قائمة الأعضاء للاختيار الفردي
    const memberSelect = document.getElementById('collectionMember');
    if (memberSelect) {
        memberSelect.innerHTML = '<option value="">-- اختر عضو --</option>';
        members.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            memberSelect.appendChild(opt);
        });
    }

    // إعداد حقل تاريخ التحصيل
    const dateField = document.getElementById('collectionDate');
    if (dateField) {
        // تعيين تاريخ اليوم كقيمة افتراضية
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
    }

    // إظهار/إخفاء حقل اسم البنك
    const methodSelect = document.getElementById('collectionMethod');
    const bankNameGroup = document.getElementById('bankNameGroup');
    const otherBankGroup = document.getElementById('otherBankGroup');

    if (methodSelect && bankNameGroup) {
        methodSelect.addEventListener('change', () => {
            bankNameGroup.style.display = methodSelect.value === 'bank' ? 'block' : 'none';
            if (otherBankGroup) {
                otherBankGroup.style.display = 'none';
            }
        });
    }

    // إظهار/إخفاء حقل اسم البنك الآخر
    const bankSelect = document.getElementById('bankName');
    if (bankSelect && otherBankGroup) {
        bankSelect.addEventListener('change', () => {
            otherBankGroup.style.display = bankSelect.value === 'آخر' ? 'block' : 'none';
        });
    }

    // إظهار/إخفاء حقل اسم المستلم الآخر
    const recipientSelect = document.getElementById('collectionRecipient');
    const otherRecipientGroup = document.getElementById('otherRecipientGroup');

    if (recipientSelect && otherRecipientGroup) {
        recipientSelect.addEventListener('change', () => {
            otherRecipientGroup.style.display = recipientSelect.value === 'آخر' ? 'block' : 'none';
        });
    }
}

// وظيفة لمعالجة تقديم نموذج التحصيل
function handleCollectionFormSubmit(event) {
    event.preventDefault();

    // الحصول على نوع التحصيل المحدد
    const selectionType = document.querySelector('input[name="selectionType"]:checked').value;

    // الحصول على قيم الحقول المشتركة
    const form = event.target;
    const amount = parseFloat(form.collectionAmount.value);
    const date = form.collectionDate.value;
    const method = form.collectionMethod.value;
    const bankName = method === 'bank' ?
        (form.bankName.value === 'آخر' ? form.otherBankName.value.trim() : form.bankName.value) : '';
    const recipient = form.collectionRecipient.value === 'آخر' ?
        form.otherRecipientName.value.trim() : form.collectionRecipient.value;
    const notes = form.collectionNotes ? form.collectionNotes.value.trim() : '';

    // التحقق من صحة البيانات المشتركة
    if (!amount || !date || !method || !recipient || (method === 'bank' && !bankName)) {
        alert('يرجى ملء جميع الحقول المطلوبة.');
        return;
    }

    // معالجة التحصيل حسب نوع الاختيار
    if (selectionType === 'single') {
        // تحصيل لعضو فردي
        const memberId = parseInt(form.collectionMember.value);
        if (!memberId) {
            alert('يرجى اختيار عضو.');
            return;
        }

        addCollection(memberId, amount, recipient, date, method, bankName, notes);
    } else if (selectionType === 'multiple') {
        // تحصيل لمجموعة أعضاء
        const membersList = document.getElementById('membersMultiSelectList');
        const selectedCheckboxes = membersList.querySelectorAll('input[type="checkbox"]:checked');

        if (selectedCheckboxes.length === 0) {
            alert('يرجى اختيار عضو واحد على الأقل.');
            return;
        }

        // إضافة تحصيل لكل عضو مختار
        let addedCount = 0;
        selectedCheckboxes.forEach(checkbox => {
            const memberId = parseInt(checkbox.value);
            addCollection(memberId, amount, recipient, date, method, bankName, notes);
            addedCount++;
        });

        alert(`تمت إضافة عملية تحصيل لـ ${addedCount} عضو بنجاح.`);
    } else if (selectionType === 'all') {
        // تحصيل لجميع الأعضاء
        if (members.length === 0) {
            alert('لا يوجد أعضاء مسجلون.');
            return;
        }

        if (!confirm(`هل أنت متأكد من إضافة عملية تحصيل لجميع الأعضاء (${members.length} عضو)؟`)) {
            return;
        }

        // إضافة تحصيل لكل عضو
        let addedCount = 0;
        members.forEach(member => {
            addCollection(member.id, amount, recipient, date, method, bankName, notes);
            addedCount++;
        });

        alert(`تمت إضافة عملية تحصيل لـ ${addedCount} عضو بنجاح.`);
    }

    // إعادة تعيين النموذج
    form.reset();

    // إعادة تعيين حقل التاريخ إلى اليوم
    const dateField = document.getElementById('collectionDate');
    if (dateField) {
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
    }

    // إخفاء الحقول الإضافية
    const bankNameGroup = document.getElementById('bankNameGroup');
    const otherBankGroup = document.getElementById('otherBankGroup');
    const otherRecipientGroup = document.getElementById('otherRecipientGroup');

    if (bankNameGroup) bankNameGroup.style.display = 'none';
    if (otherBankGroup) otherBankGroup.style.display = 'none';
    if (otherRecipientGroup) otherRecipientGroup.style.display = 'none';
}

// وظيفة لإضافة تحصيل لعضو
function addCollection(memberId, amount, recipient, date, method, bankName, notes) {
    const member = members.find(m => m.id === memberId);
    if (!member) return false;

    const transaction = {
        amount,
        recipient,
        date,
        method,
        bankName: method === 'bank' ? bankName : '',
        notes
    };

    // إضافة المعاملة إلى العضو
    member.transactions = member.transactions || [];
    member.transactions.push(transaction);

    // تحديث حالة الدفع للعضو
    member.paymentStatus = 'استلم';

    // إضافة التحصيل إلى قائمة التحصيلات
    collections.push({
        memberId,
        ...transaction
    });

    // حفظ التغييرات
    saveMembers();
    saveCollections();

    // تحديث الجدول
    renderCollectionTable();

    return true;
}

// وظيفة لإعداد أزرار تصدير البيانات والطباعة
function setupCollectionTableActions() {
    // إعداد زر تصدير البيانات
    const exportBtn = document.getElementById('exportCollectionBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCollectionData);
    }

    // إعداد زر الطباعة
    const printBtn = document.getElementById('printCollectionBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printCollectionTable);
    }

    // إعداد حقل البحث
    const searchInput = document.getElementById('collectionSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterCollectionTable);
    }

    // إعداد فلاتر الجدول
    const methodFilter = document.getElementById('collectionMethodFilter');
    const dateFilter = document.getElementById('collectionDateFilter');

    if (methodFilter) {
        methodFilter.addEventListener('change', filterCollectionTable);
    }

    if (dateFilter) {
        dateFilter.addEventListener('change', filterCollectionTable);
    }
}

// وظيفة لتصدير بيانات التحصيل
function exportCollectionData() {
    if (collections.length === 0) {
        alert('لا توجد بيانات للتصدير.');
        return;
    }

    // إنشاء مصفوفة لبيانات التصدير
    const exportData = [];

    // إضافة صف العناوين
    exportData.push([
        'الرقم',
        'العضو',
        'المبلغ',
        'تاريخ التحصيل',
        'طريقة التحويل',
        'البنك',
        'المستلم',
        'ملاحظات'
    ]);

    // إضافة بيانات التحصيلات
    collections.forEach((col, index) => {
        const member = members.find(m => m.id === col.memberId);
        exportData.push([
            index + 1,
            member ? member.name : '',
            col.amount,
            formatDate(col.date),
            col.method === 'bank' ? 'تحويل بنكي' : col.method === 'cash' ? 'نقدي' : 'أخرى',
            col.method === 'bank' ? col.bankName : '-',
            col.recipient,
            col.notes || ''
        ]);
    });

    // إنشاء محتوى CSV
    let csvContent = '';
    exportData.forEach(row => {
        csvContent += row.join(',') + '\\n';
    });

    // إنشاء رابط للتنزيل
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `تحصيلات_جمعية_زواج_${formatDateForFileName(new Date())}.csv`);
    document.body.appendChild(link);

    // تنزيل الملف
    link.click();

    // إزالة الرابط
    document.body.removeChild(link);
}

// وظيفة لتنسيق التاريخ لاستخدامه في اسم الملف
function formatDateForFileName(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// وظيفة لطباعة جدول التحصيلات
function printCollectionTable() {
    if (collections.length === 0) {
        alert('لا توجد بيانات للطباعة.');
        return;
    }

    // إنشاء نافذة طباعة جديدة
    const printWindow = window.open('', '_blank');

    // إنشاء محتوى HTML للطباعة
    const printContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تحصيلات جمعية زواج</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    direction: rtl;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 20px;
                    color: #0056b3;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .print-date {
                    text-align: left;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                    color: #6c757d;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                th, td {
                    border: 1px solid #dee2e6;
                    padding: 10px;
                    text-align: right;
                }
                th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                .summary {
                    margin-top: 30px;
                    border-top: 2px solid #dee2e6;
                    padding-top: 20px;
                }
                .summary-item {
                    margin-bottom: 10px;
                }
                .footer {
                    margin-top: 50px;
                    text-align: center;
                    font-size: 0.9rem;
                    color: #6c757d;
                    border-top: 1px solid #dee2e6;
                    padding-top: 20px;
                }
                @media print {
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                    body {
                        margin: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>تحصيلات جمعية زواج</h1>
                <p>قائمة التحصيلات المالية للأعضاء</p>
            </div>

            <div class="print-date">
                تاريخ الطباعة: ${formatDate(new Date().toISOString().split('T')[0])}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>العضو</th>
                        <th>المبلغ</th>
                        <th>تاريخ التحصيل</th>
                        <th>طريقة التحويل</th>
                        <th>البنك</th>
                        <th>المستلم</th>
                    </tr>
                </thead>
                <tbody>
                    ${collections.map((col, index) => {
                        const member = members.find(m => m.id === col.memberId);
                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${member ? member.name : ''}</td>
                                <td>${col.amount} ريال</td>
                                <td>${formatDate(col.date)}</td>
                                <td>${col.method === 'bank' ? 'تحويل بنكي' : col.method === 'cash' ? 'نقدي' : 'أخرى'}</td>
                                <td>${col.method === 'bank' ? col.bankName : '-'}</td>
                                <td>${col.recipient}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div class="summary">
                <div class="summary-item">
                    <strong>إجمالي التحصيلات:</strong> ${calculateTotalAmount()} ريال
                </div>
                <div class="summary-item">
                    <strong>عدد العمليات:</strong> ${collections.length}
                </div>
                <div class="summary-item">
                    <strong>تحويلات بنكية:</strong> ${calculateBankTransfers()} ريال
                </div>
                <div class="summary-item">
                    <strong>مدفوعات نقدية:</strong> ${calculateCashPayments()} ريال
                </div>
            </div>

            <div class="footer">
                <p>التطبيق عمل الاستاذ / ناصر مسعود آل مستنير إهداء لابناء القبيلة</p>
                <p>تم إنشاء هذا التقرير بواسطة تطبيق جمعية زواج</p>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;

    // كتابة المحتوى في نافذة الطباعة
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
}

// وظيفة لحساب إجمالي المبلغ
function calculateTotalAmount() {
    return collections.reduce((total, col) => total + col.amount, 0);
}

// وظيفة لحساب إجمالي التحويلات البنكية
function calculateBankTransfers() {
    return collections
        .filter(col => col.method === 'bank')
        .reduce((total, col) => total + col.amount, 0);
}

// وظيفة لحساب إجمالي المدفوعات النقدية
function calculateCashPayments() {
    return collections
        .filter(col => col.method === 'cash')
        .reduce((total, col) => total + col.amount, 0);
}

// وظيفة لتصفية جدول التحصيلات
function filterCollectionTable() {
    const searchInput = document.getElementById('collectionSearchInput');
    const methodFilter = document.getElementById('collectionMethodFilter');
    const dateFilter = document.getElementById('collectionDateFilter');

    if (!searchInput || !methodFilter || !dateFilter) return;

    const searchTerm = searchInput.value.trim().toLowerCase();
    const methodValue = methodFilter.value;
    const dateValue = dateFilter.value;

    const tbody = document.getElementById('collectionBody');
    if (!tbody) return;

    // إعادة عرض الجدول مع تطبيق الفلاتر
    tbody.innerHTML = '';

    // تحديث إحصائيات التحصيل (سيتم تحديثها بناءً على جميع التحصيلات، وليس فقط المصفاة)
    updateCollectionStats();

    // تصفية وعرض التحصيلات
    collections.forEach((col, index) => {
        const member = members.find(m => m.id === col.memberId);
        const memberName = member ? member.name.toLowerCase() : '';
        const recipientName = col.recipient.toLowerCase();
        const bankName = col.bankName ? col.bankName.toLowerCase() : '';

        // تطبيق فلتر البحث
        const matchesSearch =
            memberName.includes(searchTerm) ||
            recipientName.includes(searchTerm) ||
            bankName.includes(searchTerm) ||
            col.amount.toString().includes(searchTerm);

        // تطبيق فلتر طريقة التحويل
        const matchesMethod = methodValue === '' || col.method === methodValue;

        // تطبيق فلتر التاريخ
        let matchesDate = true;
        if (dateValue !== '') {
            const collectionDate = new Date(col.date);
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // بداية الأسبوع (الأحد)
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfYear = new Date(today.getFullYear(), 0, 1);

            if (dateValue === 'today') {
                matchesDate = isSameDay(collectionDate, today);
            } else if (dateValue === 'week') {
                matchesDate = collectionDate >= startOfWeek && collectionDate <= today;
            } else if (dateValue === 'month') {
                matchesDate = collectionDate >= startOfMonth && collectionDate <= today;
            } else if (dateValue === 'year') {
                matchesDate = collectionDate >= startOfYear && collectionDate <= today;
            }
        }

        // إذا تطابقت جميع الفلاتر، أضف الصف إلى الجدول
        if (matchesSearch && matchesMethod && matchesDate) {
            const row = tbody.insertRow();

            // إضافة خلية الرقم التسلسلي
            const indexCell = row.insertCell();
            indexCell.textContent = index + 1;

            // إضافة خلية اسم العضو
            const nameCell = row.insertCell();
            nameCell.textContent = member ? member.name : '';

            // إضافة خلية المبلغ
            const amountCell = row.insertCell();
            amountCell.textContent = col.amount + ' ريال';

            // إضافة خلية تاريخ التحصيل
            const dateCell = row.insertCell();
            dateCell.textContent = formatDate(col.date);

            // إضافة خلية طريقة التحويل
            const methodCell = row.insertCell();
            methodCell.textContent = col.method === 'bank' ? 'تحويل بنكي' : col.method === 'cash' ? 'نقدي' : 'أخرى';

            // إضافة خلية اسم البنك
            const bankCell = row.insertCell();
            bankCell.textContent = col.method === 'bank' ? col.bankName : '-';

            // إضافة خلية المستلم
            const recipientCell = row.insertCell();
            recipientCell.textContent = col.recipient;

            // إضافة خلية الإجراءات
            const actionsCell = row.insertCell();
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'action-buttons';

            // زر حذف
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.title = 'حذف';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => {
                if (confirm(`هل أنت متأكد من حذف هذا التحصيل؟`)) {
                    deleteCollection(index);
                }
            };
            actionsDiv.appendChild(deleteButton);

            actionsCell.appendChild(actionsDiv);
        }
    });
}

// وظيفة للتحقق مما إذا كان تاريخان في نفس اليوم
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}
function renderCollectionTable() {
    // تحديث إحصائيات التحصيل
    updateCollectionStats();

    // استخدام وظيفة تصفية الجدول لعرض جميع التحصيلات
    // إعادة تعيين حقول البحث والفلاتر
    const searchInput = document.getElementById('collectionSearchInput');
    const methodFilter = document.getElementById('collectionMethodFilter');
    const dateFilter = document.getElementById('collectionDateFilter');

    if (searchInput) searchInput.value = '';
    if (methodFilter) methodFilter.value = '';
    if (dateFilter) dateFilter.value = '';

    // عرض جميع التحصيلات
    filterCollectionTable();
}

// وظيفة لحذف تحصيل
function deleteCollection(index) {
    collections.splice(index, 1);
    saveCollections();
    renderCollectionTable();
    alert('تم حذف التحصيل بنجاح.');
}

// وظيفة لحفظ التحصيلات
function saveCollections() {
    localStorage.setItem('zwaGCollections', JSON.stringify(collections));
}

// وظيفة لتحميل التحصيلات
function loadCollections() {
    const storedCollections = localStorage.getItem('zwaGCollections');
    if (storedCollections) {
        collections = JSON.parse(storedCollections);
    } else {
        collections = [];
    }
}

// وظيفة لتحديث إحصائيات التحصيل
function updateCollectionStats() {
    // حساب إجمالي التحصيلات
    let totalAmount = 0;
    let bankTransfers = 0;
    let cashPayments = 0;

    collections.forEach(col => {
        totalAmount += col.amount;
        if (col.method === 'bank') {
            bankTransfers += col.amount;
        } else if (col.method === 'cash') {
            cashPayments += col.amount;
        }
    });

    // تحديث عناصر الإحصائيات
    const totalAmountElement = document.getElementById('totalCollectionAmount');
    const totalCountElement = document.getElementById('totalCollectionCount');
    const bankTransfersElement = document.getElementById('bankTransfersAmount');
    const cashPaymentsElement = document.getElementById('cashPaymentsAmount');

    if (totalAmountElement) totalAmountElement.textContent = totalAmount + ' ريال';
    if (totalCountElement) totalCountElement.textContent = collections.length;
    if (bankTransfersElement) bankTransfersElement.textContent = bankTransfers + ' ريال';
    if (cashPaymentsElement) cashPaymentsElement.textContent = cashPayments + ' ريال';
}
// نافذة التفاصيل
function showMemberDetails(memberId) {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // حساب إحصائيات العضو
    let totalPaid = 0;
    let totalReceived = 0;

    // حساب المبالغ المدفوعة من قبل العضو
    if (member.transactions && member.transactions.length > 0) {
        member.transactions.forEach(tr => {
            totalPaid += tr.amount;
        });
    }

    // حساب المبالغ المستلمة من قبل العضو
    const receivedTransactions = [];
    members.forEach(m => {
        if (m.transactions && m.transactions.length > 0) {
            m.transactions.forEach(tr => {
                if (tr.recipient === member.name) {
                    totalReceived += tr.amount;
                    receivedTransactions.push({
                        from: m.name,
                        amount: tr.amount,
                        date: tr.date,
                        method: tr.method,
                        bankName: tr.bankName
                    });
                }
            });
        }
    });

    // حساب إحصائيات عامة
    const marriedMembers = members.filter(m => m.maritalStatus === 'تزوج').length;
    const unmarriedMembers = members.filter(m => m.maritalStatus === 'لم يتزوج').length;
    const scheduledMembers = members.filter(m => m.maritalStatus === 'تم تحديد الزواج').length;

    // المبلغ الإجمالي المفترض (1000 ريال × عدد الأعضاء)
    const totalExpectedAmount = members.length * 1000;

    // المبلغ المدفوع من جميع الأعضاء
    let totalPaidByAllMembers = 0;
    members.forEach(m => {
        if (m.transactions && m.transactions.length > 0) {
            m.transactions.forEach(tr => {
                totalPaidByAllMembers += tr.amount;
            });
        }
    });

    // المبلغ المتبقي
    const remainingAmount = totalExpectedAmount - totalPaidByAllMembers;

    // إنشاء نافذة التفاصيل
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'details-modal';

    // محتوى النافذة
    let modalContent = `
        <div class='details-content'>
            <div class='details-header'>
                <h3>تفاصيل العضو: ${member.name}</h3>
                <button class='details-close-btn' onclick='this.closest(".details-modal").remove()'>&times;</button>
            </div>

            <div class='details-section'>
                <h4>البيانات الشخصية</h4>
                <div class='details-grid'>
                    <div class='details-item'>
                        <div class='details-item-label'>الاسم</div>
                        <div class='details-item-value'>${member.name}</div>
                    </div>
                    <div class='details-item'>
                        <div class='details-item-label'>رقم الهوية</div>
                        <div class='details-item-value'>${member.memberId}</div>
                    </div>
                    <div class='details-item'>
                        <div class='details-item-label'>رقم الجوال</div>
                        <div class='details-item-value'>${member.memberPhone}</div>
                    </div>
                    <div class='details-item'>
                        <div class='details-item-label'>البريد الإلكتروني</div>
                        <div class='details-item-value'>${member.email || '-'}</div>
                    </div>
                    <div class='details-item'>
                        <div class='details-item-label'>تاريخ الانضمام</div>
                        <div class='details-item-value'>${formatDate(member.joinDate)}</div>
                    </div>
                    <div class='details-item'>
                        <div class='details-item-label'>حالة العضو</div>
                        <div class='details-item-value'>${member.memberStatus || 'نشط'}</div>
                    </div>
                    <div class='details-item'>
                        <div class='details-item-label'>الحالة الاجتماعية</div>
                        <div class='details-item-value'>${member.maritalStatus || 'لم يتزوج'}</div>
                    </div>
                    <div class='details-item'>
                        <div class='details-item-label'>تاريخ الزواج</div>
                        <div class='details-item-value'>${member.marriageDate ? formatDate(member.marriageDate) : '-'}</div>
                    </div>
                </div>
            </div>

            <div class='details-section'>
                <h4>حالة الزواج</h4>
                <div id="marriageStatusSection">
                    ${
                        member.maritalStatus === 'تزوج' ?
                        `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <p>العضو متزوج ${member.marriageDate ? `بتاريخ: ${formatDate(member.marriageDate)}` : 'بدون تحديد تاريخ'}</p>
                            <button class="details-btn details-btn-warning" onclick="showMarriageEditForm(${member.id})">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                        </div>
                        ` :
                        member.maritalStatus === 'تم تحديد الزواج' ?
                        `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div>
                                ${member.marriageDate ?
                                `<p>تم تحديد الزواج بتاريخ: ${formatDate(member.marriageDate)}</p>
                                <p>المتبقي على الزواج: ${calculateRemainingDays(member.marriageDate) > 0 ? `${calculateRemainingDays(member.marriageDate)} يوم` : 'اليوم'}</p>` :
                                `<p>تم تحديد الزواج بدون تحديد تاريخ</p>`}
                            </div>
                            <button class="details-btn details-btn-warning" onclick="showMarriageEditForm(${member.id})">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                        </div>
                        ` :
                        `
                        <div class="details-form-group">
                            <label for="marriageStatus">تحديث حالة الزواج:</label>
                            <select id="marriageStatus" onchange="toggleMarriageDateField()">
                                <option value="لم يتزوج" ${member.maritalStatus === 'لم يتزوج' ? 'selected' : ''}>لم يتزوج</option>
                                <option value="تم تحديد الزواج">تم تحديد الزواج</option>
                                <option value="تزوج">تزوج</option>
                            </select>
                        </div>
                        <div class="details-form-group" id="marriageDateGroup" style="display: none;">
                            <label for="marriageDate">تاريخ الزواج:</label>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <input type="date" id="marriageDate" style="flex: 1;">
                                <button type="button" class="details-btn details-btn-danger" style="padding: 5px 10px;" onclick="document.getElementById('marriageDate').value = ''">
                                    <i class="fas fa-times"></i> إلغاء التاريخ
                                </button>
                            </div>
                        </div>
                        <button class="details-btn details-btn-primary" onclick="updateMemberMarriageStatus(${member.id})">تحديث حالة الزواج</button>
                        `
                    }
                </div>
            </div>

            <div class='details-section'>
                <h4>المعاملات المالية</h4>
                <div class='details-stats'>
                    <div class='details-stat-card primary'>
                        <div class='details-stat-label'>إجمالي المدفوع</div>
                        <div class='details-stat-value'>${totalPaid} ريال</div>
                    </div>
                    <div class='details-stat-card success'>
                        <div class='details-stat-label'>إجمالي المستلم</div>
                        <div class='details-stat-value'>${totalReceived} ريال</div>
                    </div>
                    <div class='details-stat-card warning'>
                        <div class='details-stat-label'>الرصيد</div>
                        <div class='details-stat-value'>${totalReceived - totalPaid} ريال</div>
                    </div>
                </div>
            </div>

            <div class='details-section'>
                <h4>المبالغ المدفوعة من قبل العضو</h4>
                ${
                    member.transactions && member.transactions.length > 0 ?
                    `<table class='details-table'>
                        <thead>
                            <tr>
                                <th>المبلغ</th>
                                <th>المستلم</th>
                                <th>التاريخ</th>
                                <th>طريقة التحويل</th>
                                <th>اسم البنك</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${member.transactions.map(tr => `
                                <tr>
                                    <td>${tr.amount} ريال</td>
                                    <td>${tr.recipient}</td>
                                    <td>${formatDate(tr.date)}</td>
                                    <td>${tr.method === 'bank' ? 'تحويل بنكي' : tr.method === 'cash' ? 'نقدي' : 'أخرى'}</td>
                                    <td>${tr.method === 'bank' ? tr.bankName : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>` :
                    `<p>لا توجد مبالغ مدفوعة من قبل هذا العضو.</p>`
                }
            </div>

            <div class='details-section'>
                <h4>المبالغ المستلمة من قبل العضو</h4>
                ${
                    receivedTransactions.length > 0 ?
                    `<table class='details-table'>
                        <thead>
                            <tr>
                                <th>المبلغ</th>
                                <th>من العضو</th>
                                <th>التاريخ</th>
                                <th>طريقة التحويل</th>
                                <th>اسم البنك</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${receivedTransactions.map(tr => `
                                <tr>
                                    <td>${tr.amount} ريال</td>
                                    <td>${tr.from}</td>
                                    <td>${formatDate(tr.date)}</td>
                                    <td>${tr.method === 'bank' ? 'تحويل بنكي' : tr.method === 'cash' ? 'نقدي' : 'أخرى'}</td>
                                    <td>${tr.method === 'bank' ? tr.bankName : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>` :
                    `<p>لا توجد مبالغ مستلمة من قبل هذا العضو.</p>`
                }
            </div>



            <div class='details-actions'>
                <button class='details-btn details-btn-secondary' onclick='this.closest(".details-modal").remove()'>إغلاق</button>
            </div>
        </div>
    `;

    detailsDiv.innerHTML = modalContent;
    document.body.appendChild(detailsDiv);

    // إضافة مستمع الأحداث لحقل حالة الزواج
    setTimeout(() => {
        const marriageStatusSelect = document.getElementById('marriageStatus');
        if (marriageStatusSelect) {
            toggleMarriageDateField();
        }
    }, 100);
}

// وظيفة لإظهار/إخفاء حقل تاريخ الزواج بناءً على حالة الزواج المختارة
function toggleMarriageDateField() {
    const marriageStatus = document.getElementById('marriageStatus');
    const marriageDateGroup = document.getElementById('marriageDateGroup');

    if (marriageStatus && marriageDateGroup) {
        if (marriageStatus.value === 'تزوج' || marriageStatus.value === 'تم تحديد الزواج') {
            marriageDateGroup.style.display = 'block';
        } else {
            marriageDateGroup.style.display = 'none';
        }
    }
}

// وظيفة لعرض نموذج تعديل تاريخ الزواج
function showMarriageEditForm(memberId) {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const marriageStatusSection = document.getElementById('marriageStatusSection');
    if (!marriageStatusSection) return;

    // إنشاء نموذج تعديل تاريخ الزواج
    const editForm = `
        <div class="details-form-group">
            <label for="editMarriageStatus">حالة الزواج:</label>
            <select id="editMarriageStatus" onchange="toggleEditMarriageDateField2()">
                <option value="لم يتزوج" ${member.maritalStatus === 'لم يتزوج' ? 'selected' : ''}>لم يتزوج</option>
                <option value="تم تحديد الزواج" ${member.maritalStatus === 'تم تحديد الزواج' ? 'selected' : ''}>تم تحديد الزواج</option>
                <option value="تزوج" ${member.maritalStatus === 'تزوج' ? 'selected' : ''}>تزوج</option>
            </select>
        </div>
        <div class="details-form-group" id="editMarriageDateGroup2" style="${(member.maritalStatus === 'تزوج' || member.maritalStatus === 'تم تحديد الزواج') ? 'display:block' : 'display:none'}">
            <label for="editMarriageDate2">تاريخ الزواج:</label>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="date" id="editMarriageDate2" value="${member.marriageDate || ''}" style="flex: 1;">
                <button type="button" class="details-btn details-btn-danger" style="padding: 5px 10px;" onclick="document.getElementById('editMarriageDate2').value = ''">
                    <i class="fas fa-times"></i> إلغاء التاريخ
                </button>
            </div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button class="details-btn details-btn-primary" onclick="saveMarriageEdit(${member.id})">
                <i class="fas fa-save"></i> حفظ التعديلات
            </button>
            <button class="details-btn details-btn-secondary" onclick="cancelMarriageEdit(${member.id})">
                <i class="fas fa-times"></i> إلغاء
            </button>
        </div>
    `;

    // عرض النموذج
    marriageStatusSection.innerHTML = editForm;

    // تفعيل وظيفة إظهار/إخفاء حقل تاريخ الزواج
    setTimeout(() => {
        toggleEditMarriageDateField2();
    }, 100);
}

// وظيفة لإظهار/إخفاء حقل تاريخ الزواج في نموذج تعديل تاريخ الزواج
function toggleEditMarriageDateField2() {
    const marriageStatus = document.getElementById('editMarriageStatus');
    const marriageDateGroup = document.getElementById('editMarriageDateGroup2');

    if (marriageStatus && marriageDateGroup) {
        if (marriageStatus.value === 'تزوج' || marriageStatus.value === 'تم تحديد الزواج') {
            marriageDateGroup.style.display = 'block';
        } else {
            marriageDateGroup.style.display = 'none';
        }
    }
}

// وظيفة لحفظ تعديلات تاريخ الزواج
function saveMarriageEdit(memberId) {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const marriageStatus = document.getElementById('editMarriageStatus').value;
    const marriageDate = document.getElementById('editMarriageDate2').value;

    // تحديث بيانات العضو
    member.maritalStatus = marriageStatus;
    member.marriageDate = marriageDate || '';

    // حفظ التغييرات
    saveMembers();

    // تحديث واجهة المستخدم
    renderMembersTable();

    // تحديث قسم حالة الزواج في نافذة التفاصيل
    updateMarriageStatusDisplay(member);

    // عرض رسالة نجاح
    alert(`تم تحديث حالة الزواج للعضو ${member.name} بنجاح.`);
}

// وظيفة لإلغاء تعديل تاريخ الزواج
function cancelMarriageEdit(memberId) {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // تحديث قسم حالة الزواج في نافذة التفاصيل
    updateMarriageStatusDisplay(member);
}

// وظيفة لتحديث عرض حالة الزواج
function updateMarriageStatusDisplay(member) {
    const marriageStatusSection = document.getElementById('marriageStatusSection');
    if (!marriageStatusSection) return;

    if (member.maritalStatus === 'تزوج') {
        marriageStatusSection.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <p>العضو متزوج ${member.marriageDate ? `بتاريخ: ${formatDate(member.marriageDate)}` : 'بدون تحديد تاريخ'}</p>
            <button class="details-btn details-btn-warning" onclick="showMarriageEditForm(${member.id})">
                <i class="fas fa-edit"></i> تعديل
            </button>
        </div>
        `;
    } else if (member.maritalStatus === 'تم تحديد الزواج') {
        marriageStatusSection.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div>
                ${member.marriageDate ?
                `<p>تم تحديد الزواج بتاريخ: ${formatDate(member.marriageDate)}</p>
                <p>المتبقي على الزواج: ${calculateRemainingDays(member.marriageDate) > 0 ? `${calculateRemainingDays(member.marriageDate)} يوم` : 'اليوم'}</p>` :
                `<p>تم تحديد الزواج بدون تحديد تاريخ</p>`}
            </div>
            <button class="details-btn details-btn-warning" onclick="showMarriageEditForm(${member.id})">
                <i class="fas fa-edit"></i> تعديل
            </button>
        </div>
        `;
    } else {
        marriageStatusSection.innerHTML = `
        <div class="details-form-group">
            <label for="marriageStatus">تحديث حالة الزواج:</label>
            <select id="marriageStatus" onchange="toggleMarriageDateField()">
                <option value="لم يتزوج" ${member.maritalStatus === 'لم يتزوج' ? 'selected' : ''}>لم يتزوج</option>
                <option value="تم تحديد الزواج">تم تحديد الزواج</option>
                <option value="تزوج">تزوج</option>
            </select>
        </div>
        <div class="details-form-group" id="marriageDateGroup" style="display: none;">
            <label for="marriageDate">تاريخ الزواج:</label>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="date" id="marriageDate" style="flex: 1;">
                <button type="button" class="details-btn details-btn-danger" style="padding: 5px 10px;" onclick="document.getElementById('marriageDate').value = ''">
                    <i class="fas fa-times"></i> إلغاء التاريخ
                </button>
            </div>
        </div>
        <button class="details-btn details-btn-primary" onclick="updateMemberMarriageStatus(${member.id})">تحديث حالة الزواج</button>
        `;

        // تفعيل وظيفة إظهار/إخفاء حقل تاريخ الزواج
        setTimeout(() => {
            toggleMarriageDateField();
        }, 100);
    }
}

// وظيفة لتحديث حالة زواج العضو
function updateMemberMarriageStatus(memberId) {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const marriageStatus = document.getElementById('marriageStatus').value;
    const marriageDate = document.getElementById('marriageDate').value;

    // لا نتحقق من وجود تاريخ، نسمح بأن يكون فارغًا

    // تحديث بيانات العضو
    member.maritalStatus = marriageStatus;
    member.marriageDate = marriageDate || '';

    // حفظ التغييرات
    saveMembers();

    // تحديث واجهة المستخدم
    renderMembersTable();

    // تحديث قسم حالة الزواج في نافذة التفاصيل
    updateMarriageStatusDisplay(member);

    // عرض رسالة نجاح
    alert(`تم تحديث حالة الزواج للعضو ${member.name} بنجاح.`);
}
// متغيرات عالمية لنسخ الأسماء المتعددة
let bulkNames = [];
let currentNameIndex = 0;
let editableNames = []; // مصفوفة للأسماء القابلة للتعديل

// وظيفة لعرض نافذة نسخ الأسماء المتعددة
function showBulkNamesModal() {
    const modal = document.getElementById('bulkNamesModal');
    const textarea = document.getElementById('bulkNamesTextarea');

    // إعادة تعيين النافذة
    textarea.value = '';
    document.getElementById('namesPreviewList').innerHTML = '';
    document.getElementById('namesCount').textContent = '0';

    // إعادة تعيين علامات التبويب
    switchTab('paste-tab');

    // إعادة تعيين قائمة الأسماء القابلة للتعديل
    editableNames = [];
    renderEditableNames();

    // إضافة مستمع الأحداث للتحديث المباشر
    textarea.addEventListener('input', updateNamesPreview);

    // عرض النافذة
    modal.style.display = 'block';
}

// وظيفة لإغلاق نافذة نسخ الأسماء المتعددة
function closeBulkNamesModal() {
    const modal = document.getElementById('bulkNamesModal');
    modal.style.display = 'none';
}

// وظيفة للتبديل بين علامات التبويب
function switchTab(tabId) {
    // إخفاء جميع المحتويات
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // إلغاء تنشيط جميع الأزرار
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // تنشيط المحتوى والزر المطلوبين
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

// وظيفة لتحديث معاينة الأسماء
function updateNamesPreview() {
    const textarea = document.getElementById('bulkNamesTextarea');
    const previewList = document.getElementById('namesPreviewList');
    const namesCountElement = document.getElementById('namesCount');

    // تقسيم النص إلى أسماء
    const text = textarea.value.trim();
    const names = text ? text.split('\n').filter(name => name.trim() !== '') : [];

    // تحديث عدد الأسماء
    namesCountElement.textContent = names.length;

    // تحديث قائمة المعاينة
    previewList.innerHTML = '';
    names.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name.trim();
        previewList.appendChild(li);
    });
}

// وظيفة لتحليل الأسماء والانتقال إلى علامة التبويب تعديل
function parseNamesAndSwitchToEdit() {
    const textarea = document.getElementById('bulkNamesTextarea');
    const text = textarea.value.trim();

    if (!text) {
        alert('يرجى إدخال أسماء لمعالجتها');
        return;
    }

    // تقسيم النص إلى أسماء
    const names = text.split('\n')
        .map(name => name.trim())
        .filter(name => name !== '');

    if (names.length === 0) {
        alert('لم يتم العثور على أسماء صالحة');
        return;
    }

    // تعيين الأسماء القابلة للتعديل
    editableNames = names.map(name => ({ name, isEditing: false }));

    // عرض الأسماء في الجدول
    renderEditableNames();

    // الانتقال إلى علامة التبويب تعديل
    switchTab('edit-tab');
}

// وظيفة لعرض الأسماء القابلة للتعديل
function renderEditableNames() {
    const tableBody = document.getElementById('editableNamesBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    editableNames.forEach((item, index) => {
        const row = tableBody.insertRow();

        // خلية الرقم
        const indexCell = row.insertCell();
        indexCell.textContent = index + 1;

        // خلية الاسم
        const nameCell = row.insertCell();
        if (item.isEditing) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = item.name;
            input.id = `name-input-${index}`;
            nameCell.appendChild(input);
        } else {
            nameCell.textContent = item.name;
        }

        // خلية الإجراءات
        const actionsCell = row.insertCell();
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'name-actions';

        if (item.isEditing) {
            // زر حفظ
            const saveButton = document.createElement('button');
            saveButton.innerHTML = '<i class="fas fa-save"></i>';
            saveButton.title = 'حفظ';
            saveButton.className = 'edit-btn';
            saveButton.onclick = () => saveName(index);
            actionsDiv.appendChild(saveButton);

            // زر إلغاء
            const cancelButton = document.createElement('button');
            cancelButton.innerHTML = '<i class="fas fa-times"></i>';
            cancelButton.title = 'إلغاء';
            cancelButton.className = 'delete-btn';
            cancelButton.onclick = () => cancelEdit(index);
            actionsDiv.appendChild(cancelButton);
        } else {
            // زر تعديل
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.title = 'تعديل';
            editButton.className = 'edit-btn';
            editButton.onclick = () => editName(index);
            actionsDiv.appendChild(editButton);

            // زر حذف
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.title = 'حذف';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => deleteName(index);
            actionsDiv.appendChild(deleteButton);
        }

        actionsCell.appendChild(actionsDiv);
    });
}

// وظيفة لتعديل اسم
function editName(index) {
    editableNames[index].isEditing = true;
    renderEditableNames();

    // تركيز على حقل الإدخال
    setTimeout(() => {
        const input = document.getElementById(`name-input-${index}`);
        if (input) input.focus();
    }, 100);
}

// وظيفة لحفظ اسم بعد التعديل
function saveName(index) {
    const input = document.getElementById(`name-input-${index}`);
    if (!input) return;

    const newName = input.value.trim();
    if (!newName) {
        alert('لا يمكن أن يكون الاسم فارغًا');
        return;
    }

    editableNames[index].name = newName;
    editableNames[index].isEditing = false;
    renderEditableNames();
}

// وظيفة لإلغاء تعديل اسم
function cancelEdit(index) {
    editableNames[index].isEditing = false;
    renderEditableNames();
}

// وظيفة لحذف اسم
function deleteName(index) {
    if (confirm(`هل أنت متأكد من حذف "${editableNames[index].name}"؟`)) {
        editableNames.splice(index, 1);
        renderEditableNames();
    }
}

// وظيفة لإضافة صف اسم جديد
function addNewNameRow() {
    editableNames.push({ name: '', isEditing: true });
    renderEditableNames();

    // تركيز على حقل الإدخال الجديد
    setTimeout(() => {
        const input = document.getElementById(`name-input-${editableNames.length - 1}`);
        if (input) input.focus();
    }, 100);
}

// وظيفة لحذف جميع الأسماء
function removeAllNames() {
    if (editableNames.length === 0) {
        alert('لا توجد أسماء للحذف');
        return;
    }

    if (confirm('هل أنت متأكد من حذف جميع الأسماء؟')) {
        editableNames = [];
        renderEditableNames();
    }
}

// وظيفة لمعالجة الأسماء المتعددة وإضافتها مباشرة إلى قائمة الأعضاء
function processBulkNames() {
    // التحقق من وجود أسماء في علامة التبويب تعديل
    if (editableNames.length === 0) {
        // التحقق من وجود أسماء في علامة التبويب لصق
        const textarea = document.getElementById('bulkNamesTextarea');
        const text = textarea.value.trim();

        if (!text) {
            alert('يرجى إدخال أسماء لمعالجتها');
            return;
        }

        // تحليل الأسماء من النص
        const names = text.split('\n')
            .map(name => name.trim())
            .filter(name => name !== '');

        if (names.length === 0) {
            alert('لم يتم العثور على أسماء صالحة');
            return;
        }

        // تعيين الأسماء
        bulkNames = names;
    } else {
        // استخدام الأسماء من علامة التبويب تعديل
        bulkNames = editableNames.map(item => item.name);
    }

    if (bulkNames.length === 0) {
        alert('لم يتم العثور على أسماء صالحة');
        return;
    }

    // إضافة الأعضاء مباشرة إلى القائمة
    const today = new Date().toISOString().split('T')[0]; // تاريخ اليوم بتنسيق YYYY-MM-DD
    const addedMembers = [];

    bulkNames.forEach(name => {
        if (name.trim() === '') return; // تخطي الأسماء الفارغة

        // إنشاء كائن العضو الجديد
        const newMember = {
            id: nextMemberNumericId++,
            name: name,
            email: '',
            memberId: '',
            memberPhone: '',
            joinDate: today,
            memberStatus: 'نشط',
            maritalStatus: 'لم يتزوج',
            address: '',
            notes: 'تمت إضافته من خلال استيراد الأسماء المتعددة',
            marriageDate: '',
            paymentStatus: 'لم يستلم',
            regularityStatus: 'منتظم',
            transactions: []
        };

        // إضافة العضو إلى المصفوفة
        members.push(newMember);
        addedMembers.push(name);
    });

    // حفظ التغييرات
    saveMembers();

    // تحديث الجدول
    renderMembersTable();

    // إغلاق النافذة
    closeBulkNamesModal();

    // إعادة تعيين المتغيرات
    bulkNames = [];
    currentNameIndex = 0;
    editableNames = [];

    // عرض رسالة نجاح
    if (addedMembers.length > 0) {
        alert(`تم إضافة ${addedMembers.length} عضو بنجاح إلى قائمة الأعضاء.\n\nيمكنك الآن تعديل بيانات أي عضو من خلال النقر على زر "تعديل" المقابل له في القائمة.`);
    } else {
        alert('لم يتم إضافة أي أعضاء. يرجى التحقق من قائمة الأسماء.');
    }
}

// تعديل وظيفة معالجة تقديم النموذج لدعم الأسماء المتعددة
document.addEventListener('DOMContentLoaded', () => {
    setupCollectionForm();
    renderCollectionTable();

    // إضافة مستمع الأحداث لنموذج التسجيل
    const form = document.getElementById('registerForm');
    if (form) {
        const originalSubmitHandler = form.onsubmit;
        form.onsubmit = function(event) {
            // استدعاء المعالج الأصلي
            if (originalSubmitHandler) {
                originalSubmitHandler.call(this, event);
            }

            // التحقق من وجود أسماء متعددة
            if (bulkNames.length > 0 && currentNameIndex < bulkNames.length - 1) {
                // الانتقال إلى الاسم التالي
                currentNameIndex++;

                // تعيين الاسم التالي في حقل الاسم
                setTimeout(() => {
                    document.getElementById('memberName').value = bulkNames[currentNameIndex];

                    // إعادة تعيين النموذج إلى الخطوة الأولى
                    const formSteps = document.querySelectorAll('.form-step');
                    formSteps.forEach(step => step.classList.remove('active'));
                    formSteps[0].classList.add('active');

                    // تحديث مؤشرات الخطوات
                    updateStepIndicators(1);

                    // عرض رسالة
                    alert(`تم تسجيل العضو بنجاح. الاسم التالي "${bulkNames[currentNameIndex]}" (${currentNameIndex + 1}/${bulkNames.length}) تم وضعه في حقل الاسم.`);
                }, 500);
            } else if (bulkNames.length > 0 && currentNameIndex === bulkNames.length - 1) {
                // إعادة تعيين متغيرات الأسماء المتعددة
                setTimeout(() => {
                    alert('تم تسجيل جميع الأعضاء بنجاح!');
                    bulkNames = [];
                    currentNameIndex = 0;
                }, 500);
            }
        };
    }
});