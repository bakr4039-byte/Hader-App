const firebaseConfig = {
  apiKey: "AIzaSyAuOkZYWzjBTpuWdeibeEWC0tVR87byEEw",
  authDomain: "hader-system.firebaseapp.com",
  projectId: "hader-system",
  storageBucket: "hader-system.firebasestorage.app",
  messagingSenderId: "1039709774940",
  appId: "1:1039709774940:web:078351fe5cb90593473299"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const SCHOOL_LOC = { lat: 24.7136, lng: 46.6753 }; // إحداثيات مجمع أبي بن كعب
let WORK_START, WORK_END;
let map, userMarker, schoolCircle;

// 1. تشغيل الخريطة فور فتح الصفحة
function initMap() {
    map = L.map('map').setView([SCHOOL_LOC.lat, SCHOOL_LOC.lng], 17);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // علامة المدرسة
    L.marker([SCHOOL_LOC.lat, SCHOOL_LOC.lng]).addTo(map)
        .bindPopup('موقع المدرسة المعتمد').openPopup();

    // رسم دائرة النطاق المسموح (50 متر)
    schoolCircle = L.circle([SCHOOL_LOC.lat, SCHOOL_LOC.lng], {
        color: '#27ae60',
        fillColor: '#2ecc71',
        fillOpacity: 0.2,
        radius: 50
    }).addTo(map);
}

// 2. تحديث موقع المعلم على الخريطة باستمرار
function trackUser() {
    navigator.geolocation.watchPosition((pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        const dist = calculateDistance(uLat, uLng, SCHOOL_LOC.lat, SCHOOL_LOC.lng);

        document.getElementById('distance-info').innerText = `المسافة: ${Math.round(dist)} متر`;

        if (userMarker) {
            userMarker.setLatLng([uLat, uLng]);
        } else {
            userMarker = L.circleMarker([uLat, uLng], { radius: 8, color: 'blue', fillColor: '#3498db', fillOpacity: 1 }).addTo(map)
                .bindPopup('موقعك الحالي').openPopup();
        }
        
        // تغيير لون الدائرة إذا كان المعلم بالخارج
        schoolCircle.setStyle({ color: dist <= 50 ? '#27ae60' : '#e74c3c' });
    }, null, { enableHighAccuracy: true });
}

// 3. دالة البصمة المعدلة
function processAttendance(type) {
    const msg = document.getElementById('status-msg');
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
            if (type === 'انصراف' && currentMins < endMins) { diff = endMins - currentMins; status = "خروج مبكر"; }

            const urlParams = new URLSearchParams(window.location.search);
            database.ref(`attendance/${dateStr}/${urlParams.get('id')}`).update({
                name: urlParams.get('name'),
                [type === 'حضور' ? 'checkIn' : 'checkOut']: timeStr,
                [type === 'حضور' ? 'lateMins' : 'earlyMins']: diff,
                [type === 'حضور' ? 'inStatus' : 'outStatus']: status
            }).then(() => {
                msg.innerHTML = `<span style="color:green">✅ تم تسجيل ${type} (${timeStr})</span>`;
            });
        } else {
            msg.innerHTML = `<span style="color:red">❌ فشل: أنت خارج النطاق بمسافة ${Math.round(dist)} م</span>`;
        }
    });
}

// الدوال المساعدة (تحويل الوقت وحساب المسافة)
function parseTimeToMinutes(timeStr) {
    const parts = timeStr.match(/\d+/g);
    let hrs = parseInt(parts[0]); let mins = parseInt(parts[1]);
    if (timeStr.includes("م") && hrs < 12) hrs += 12;
    return (hrs * 60) + mins;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// تشغيل الساعة وجلب المواعيد
database.ref('settings/workHours').on('value', s => { 
    WORK_START = s.val()?.start; WORK_END = s.val()?.end;
    document.getElementById('set-start').innerText = WORK_START || '--';
    document.getElementById('set-end').innerText = WORK_END || '--';
});

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById('display-name').innerText = "الأستاذ/ " + (urlParams.get('name') || "غير معروف");
    document.getElementById('display-id').innerText = urlParams.get('id') || "---";
    initMap();
    trackUser();
};
setInterval(() => { document.getElementById('current-time').innerText = new Date().toLocaleTimeString('ar-SA'); }, 1000);