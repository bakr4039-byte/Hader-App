// 1. تحديث الساعة والتاريخ بشكل حي
function updateClock() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    document.getElementById('current-time').innerText = now.toLocaleDateString('ar-SA', options);
}
setInterval(updateClock, 1000);
updateClock();

// 2. إعدادات الموقع الجغرافي للمدرسة (إحداثيات افتراضية للرياض)
const schoolLocation = {
    lat: 24.7136, 
    lng: 46.6753  
};
const allowedRadius = 15000; // المسافة المسموحة (15000 متر)

// 3. دالة بدء فحص الموقع والتحضير
function startCheck() {
    const btn = document.getElementById('attendance-btn');
    const msg = document.getElementById('status-msg');

    msg.innerText = "جاري تحديد موقعك... ⏳";
    btn.disabled = true;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                const distance = calculateDistance(userLat, userLng, schoolLocation.lat, schoolLocation.lng);

                if (distance <= allowedRadius) {
                    const timeNow = new Date().toLocaleTimeString('ar-SA');
                    msg.innerHTML = `<span style="color: green">✅ تم إثبات حضورك بنجاح! <br> الوقت: ${timeNow}</span>`;
                    btn.style.background = "#27ae60";
                    
                    // إرسال البيانات للتخزين
                    sendAttendanceToServer("الأستاذ/ محمد", "10127", timeNow);
                } else {
                    msg.innerHTML = `<span style="color: red">❌ أنت خارج نطاق المدرسة. <br> المسافة الحالية: ${Math.round(distance)} متر</span>`;
                    btn.disabled = false;
                }
            },
            (error) => {
                msg.innerText = "يرجى تفعيل الـ GPS في جهازك.";
                btn.disabled = false;
            }
        );
    } else {
        msg.innerText = "متصفحك لا يدعم تحديد الموقع.";
    }
}

// 4. دالة "الإرسال" (تحفظ البيانات في ذاكرة المتصفح للربط مع صفحة المدير)
function sendAttendanceToServer(name, id, time) {
    const record = {
        teacherName: name,
        teacherId: id,
        attendanceTime: time,
        date: new Date().toLocaleDateString('ar-SA'),
        status: "حاضر"
    };

    // جلب السجلات القديمة وإضافة الجديد
    let records = JSON.parse(localStorage.getItem('attendanceData')) || [];
    records.push(record);
    
    // حفظ السجل المحدث
    localStorage.setItem('attendanceData', JSON.stringify(records));
    console.log("تم حفظ البيانات بنجاح:", record);
}

// 5. معادلة حساب المسافة
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}