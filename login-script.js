// login-script.js - سكريبت صفحة تسجيل الدخول

// تهيئة الجسيمات المتحركة في الخلفية
document.addEventListener('DOMContentLoaded', function() {
    // تعيين السنة الحالية في تذييل الصفحة
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // تهيئة الجسيمات المتحركة
    initParticles();
    
    // تهيئة نظام تسجيل الدخول
    initLoginSystem();
});

// وظيفة لتهيئة الجسيمات المتحركة
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#0056b3'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    },
                    polygon: {
                        nb_sides: 5
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#0056b3',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }
}

// وظيفة لتهيئة نظام تسجيل الدخول
function initLoginSystem() {
    const loginButton = document.getElementById('loginButton');
    const idNumberInput = document.getElementById('idNumber');
    const idError = document.getElementById('idError');
    const welcomeUser = document.getElementById('welcomeUser');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    // قائمة المستخدمين (سيتم استبدالها بقاعدة بيانات حقيقية)
    const users = [
        { id: '1234567890', name: 'أحمد محمد', isAdmin: true },
        { id: '2345678901', name: 'محمد علي', isAdmin: false },
        { id: '3456789012', name: 'خالد عبدالله', isAdmin: false },
        { id: '4567890123', name: 'عبدالرحمن سعد', isAdmin: false },
        { id: '5678901234', name: 'فهد ناصر', isAdmin: false }
    ];
    
    // قائمة المشرفين الإضافيين
    const admins = [
        { id: '6789012345', name: 'سلطان محمد' },
        { id: '7890123456', name: 'عبدالعزيز خالد' }
    ];
    
    // إضافة المشرفين إلى قائمة المستخدمين
    admins.forEach(admin => {
        users.push({ ...admin, isAdmin: true });
    });
    
    // التحقق من صحة رقم الهوية
    idNumberInput.addEventListener('input', function() {
        validateIdNumber();
    });
    
    // معالجة النقر على زر الدخول
    loginButton.addEventListener('click', function() {
        handleLogin();
    });
    
    // معالجة الضغط على مفتاح الإدخال
    idNumberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    // وظيفة للتحقق من صحة رقم الهوية
    function validateIdNumber() {
        const idNumber = idNumberInput.value.trim();
        
        // التحقق من أن رقم الهوية يتكون من 10 أرقام فقط
        if (idNumber === '') {
            idError.textContent = '';
            return false;
        } else if (!/^\d{10}$/.test(idNumber)) {
            idError.textContent = 'يجب أن يتكون رقم الهوية من 10 أرقام فقط';
            return false;
        } else {
            idError.textContent = '';
            return true;
        }
    }
    
    // وظيفة لمعالجة تسجيل الدخول
    function handleLogin() {
        if (!validateIdNumber()) {
            idNumberInput.focus();
            return;
        }
        
        const idNumber = idNumberInput.value.trim();
        const user = users.find(u => u.id === idNumber);
        
        if (user) {
            // عرض رسالة الترحيب
            welcomeMessage.textContent = `أهلاً وسهلاً بك يا ${user.name}`;
            welcomeUser.style.display = 'block';
            
            // تخزين معلومات المستخدم في التخزين المحلي
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                name: user.name,
                isAdmin: user.isAdmin
            }));
            
            // توجيه المستخدم إلى الصفحة الرئيسية بعد ثانيتين
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            // عرض رسالة خطأ
            idError.textContent = 'رقم الهوية غير مسجل في النظام';
            idNumberInput.focus();
        }
    }
    
    // التحقق مما إذا كان المستخدم مسجل الدخول بالفعل
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // إذا كان المستخدم مسجل الدخول بالفعل، توجيهه إلى الصفحة الرئيسية
        window.location.href = 'index.html';
    }
}
