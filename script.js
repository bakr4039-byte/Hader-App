// 1. إعدادات Firebase الخاصة بمشروعك (Hader-System)
const firebaseConfig = {
  apiKey: "AIzaSyAuOkZYWzjBTpuWdeibeEWC0tVR87byEEw",
  authDomain: "hader-system.firebaseapp.com",
  projectId: "hader-system",
  storageBucket: "hader-system.firebasestorage.app",
  messagingSenderId: "1039709774940",
  appId: "1:1039709774940:web:078351fe5cb90593473299",
  measurementId: "G-J709DDTXK4"
};

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ********************************************************
// 2. إحداثيات مجمع أبي بن كعب (تأكد من تحديثها لموقعك الدقيق)
// ********************************************************
const SCHOOL_LOC = { 
    lat: 24.48.00.7, 
    lng: 46.38.41.8 
};

let WORK_START, WORK_END;
let map, userMarker, schoolCircle, distanceLine;

// جلب بيانات المعلم من الرابط
const urlParams = new URLSearchParams(window.location.search);
const teacherId = urlParams.get('id');
const teacherName = urlParams.get('name');

// 3. دالة تشغيل الخريطة ورسم المواقع
function initMap() {
    // إنشاء الخريطة وتوسيطها مبدئياً على المدرسة
    map = L.map('map').setView([SCHOOL_LOC.lat, SCHOOL_LOC.lng], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // أ) علامة موقع المدرسة (أيقونة ثابتة)
    L.marker([SCHOOL_LOC.lat, SCHOOL_LOC.lng]).addTo(map)
        .bindPopup('<b>مقر مجمع أبي بن كعب</b>').openPopup();

    // ب) رسم دائرة النطاق المسموح (50 متر)
    schoolCircle = L.circle([SCHOOL_LOC.lat, SCHOOL_LOC.lng], {
        color: '#27ae60',
        fillColor: '#2ecc71',
        fillOpacity: 0.1,
        radius: 50 
    }).addTo(map);

    // ج) تهيئة "خط المسافة" الذي سيربط بين المعلم والمدرسة
    distanceLine = L.polyline([], {
        color: '#3498db', 
        weight: 3, 
        dashArray: '5, 10', // خط منقط لشكل احترافي
        opacity: 0.7
    }).addTo(map);
}

// 4. تتبع موقع المعلم وتحديث الخريطة والخط بشكل حي
function trackUser() {
    if (!navigator.geolocation) return;

    // استخدام watchPosition للتحديث المستمر دون توقف
    navigator.geolocation.watchPosition((pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        
        // حساب المسافة الحالية
        const dist = calculateDistance(uLat, uLng, SCHOOL_LOC.lat, SCHOOL_LOC.lng);

        // تحديث نص المسافة في الواجهة
        const distInfo = document.getElementById('distance-info');
        if(distInfo) distInfo.innerText = `المسافة عن المدرسة: ${Math.round(dist)} متر`;

        // تحديث مكان المعلم (النقطة الزرقاء) على الخريطة
        if (userMarker) {
            userMarker.setLatLng([uLat, uLng]);
        } else {
            userMarker = L.circleMarker([uLat, uLng], { 
                radius: 8, 
                color: 'blue', 
                fillColor: '#3498db', 
                fillOpacity: 1 
            }).addTo(map);
        }

        // إظهار المسافة في فقاعة فوق المعلم مباشرة
        userMarker.bindTooltip(`أنت هنا (${Math.round(dist)} م)`, {
            permanent: true, 
            direction: 'top',
            className: 'dist-tooltip'
        }).openTooltip();

        // رسم وتحديث الخط بين المعلم والمدرسة
        const points = [
            [uLat, uLng],
            [SCHOOL_LOC.lat, SCHOOL_LOC.lng]
        ];
        distanceLine.setLatLngs(points);

        // تغيير لون الدائرة والخط بناءً على المسافة (أخضر إذا دخل، أحمر إذا خرج)
        const isInside = dist <= 50;
        const statusColor = isInside ? '#27ae60' : '#e74c3c';
        
        schoolCircle.setStyle({ color: statusColor, fillColor: statusColor });
        distanceLine.setStyle({ color: statusColor });

        // ميزة إضافية: جعل الخريطة تشمل المعلم والمدرسة معاً في الرؤية
        const bounds = L.latLngBounds([
            [uLat, uLng],
            [SCHOOL_LOC.lat, SCHOOL_LOC.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });

    }, (err) => {
        console.error("خطأ في تحديد الموقع: ", err);
    }, { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0 
    });
}

// 5. دالة تسجيل الحضور والانصراف
function processAttendance(type) {
    const msg = document.getElementById('status-msg');
    if (!teacherId) return alert("خطأ: رابط غير صالح!");
    
    msg.innerText = "جاري التأكد من موقعك الجغرافي... ⏳";

    navigator.geolocation.getCurrentPosition((pos) => {
        const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, SCHOOL_LOC.lat, SCHOOL_LOC.lng);
        
        if (dist <= 50) { 
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
            const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '-');
            
            const currentMins = parseTimeToMinutes(timeStr);
            const startMins = parseTimeToMinutes(WORK_START);
            const endMins = parseTimeToMinutes(WORK_END);

            let diff = 0; let status = "منضبط";
            if (type === 'حضور' && currentMins > startMins) { diff = currentMins - startMins; status = "تأخير"; }
            else if (type === 'انصراف' && currentMins < endMins) { diff = endMins - currentMins; status = "خروج مبكر"; }

            database.ref(`attendance/${dateStr}/${teacherId}`).update({
                name: teacherName,
                [type === 'حضور' ? 'checkIn' : 'checkOut']: timeStr,
                [type === 'حضور' ? 'lateMins' : 'earlyMins']: diff,
                [type === 'حضور' ? 'inStatus' : 'outStatus']: status
            }).then(() => {
                msg.innerHTML = `<span style="color:green">✅ تم تسجيل ${type} (${timeStr})</span>`;
            });
        } else {
            msg.innerHTML = `<span style="color:red">❌ فشل: أنت خارج نطاق الـ 50 متر!<br>المسافة الحالية: ${Math.round(dist)} متر</span>`;
        }
    }, null, { enableHighAccuracy: true });
}

// الدوال المساعدة
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.match(/\d+/g);
    let hrs = parseInt(parts[0]);
    let mins = parseInt(parts[1]);
    if (timeStr.includes("م") && hrs < 12) hrs += 12;
    if (timeStr.includes("ص") && hrs === 12) hrs = 0;
    return (hrs * 60) + mins;
}

// الاستماع لإعدادات الوقت
database.ref('settings/workHours').on('value', (snapshot) => {
    const hours = snapshot.val();
    if (hours) {
        WORK_START = hours.start; WORK_END = hours.end;
        if(document.getElementById('set-start')) document.getElementById('set-start').innerText = WORK_START;
        if(document.getElementById('set-end')) document.getElementById('set-end').innerText = WORK_END;
    }
});

window.onload = () => {
    const clock = document.getElementById('current-time');
    if(clock) setInterval(() => { clock.innerText = new Date().toLocaleTimeString('ar-SA'); }, 1000);
    
    document.getElementById('display-name').innerText = "الأستاذ/ " + (teacherName || "غير معروف");
    document.getElementById('display-id').innerText = teacherId || "---";
    
    initMap();
    trackUser();
};