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

// إحداثيات مجمع أبي بن كعب (حي الياسمين - جامع الضيان)
const SCHOOL_LOC = { lat: 24.8142, lng: 46.6418 }; 

let WORK_START, WORK_END, map, userMarker, schoolCircle, distanceLine;
const urlParams = new URLSearchParams(window.location.search);
const tId = urlParams.get('id');
const tName = decodeURIComponent(urlParams.get('name') || "");

function init() {
    if (tName) {
        document.getElementById('display-name').innerText = "الأستاذ/ " + tName;
        document.getElementById('display-id').innerText = tId;
    }
    map = L.map('map').setView([SCHOOL_LOC.lat, SCHOOL_LOC.lng], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    // علامة المدرسة ونطاق الـ 50 متر
    L.marker([SCHOOL_LOC.lat, SCHOOL_LOC.lng]).addTo(map).bindPopup('مجمع أبي بن كعب');
    schoolCircle = L.circle([SCHOOL_LOC.lat, SCHOOL_LOC.lng], { color: '#27ae60', radius: 50, fillOpacity: 0.1 }).addTo(map);
    distanceLine = L.polyline([], {color: '#3498db', dashArray: '5, 10'}).addTo(map);
    
    trackUser();
}

function trackUser() {
    navigator.geolocation.watchPosition(pos => {
        const uLat = pos.coords.latitude; const uLng = pos.coords.longitude;
        const dist = calculateDistance(uLat, uLng, SCHOOL_LOC.lat, SCHOOL_LOC.lng);
        
        document.getElementById('distance-info').innerText = `المسافة الحالية: ${Math.round(dist)} متر`;
        
        if (userMarker) userMarker.setLatLng([uLat, uLng]);
        else userMarker = L.circleMarker([uLat, uLng], { radius: 7, color: 'blue' }).addTo(map);
        
        distanceLine.setLatLngs([[uLat, uLng], [SCHOOL_LOC.lat, SCHOOL_LOC.lng]]);
        document.getElementById('status-msg').innerText = dist <= 50 ? "✅ أنت داخل النطاق المسموح" : "❌ أنت خارج نطاق المجمع";
        schoolCircle.setStyle({ color: dist <= 50 ? '#27ae60' : '#e74c3c' });
    }, null, { enableHighAccuracy: true });
}

function processAttendance(type) {
    if(!WORK_START) return alert("بانتظار تحميل إعدادات الدوام...");
    
    navigator.geolocation.getCurrentPosition(pos => {
        const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, SCHOOL_LOC.lat, SCHOOL_LOC.lng);
        if (dist <= 50) {
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
            const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '-');
            
            const currentMins = now.getHours() * 60 + now.getMinutes();
            const startMins = parseTimeToMinutes(WORK_START);
            const endMins = parseTimeToMinutes(WORK_END);

            let diff = 0; let status = "منضبط";
            if (type === 'حضور' && currentMins > startMins) { diff = currentMins - startMins; status = "تأخير"; }
            if (type === 'انصراف' && currentMins < endMins) { diff = endMins - currentMins; status = "خروج مبكر"; }

            database.ref(`attendance/${dateStr}/${tId}`).update({
                name: tName,
                [type === 'حضور' ? 'checkIn' : 'checkOut']: timeStr,
                [type === 'حضور' ? 'lateMins' : 'earlyMins']: diff,
                [type === 'حضور' ? 'inStatus' : 'outStatus']: status
            }).then(() => alert(`تم تسجيل ${type} بنجاح عند الساعة ${timeStr}`));
        } else {
            alert(`فشل التسجيل! أنت على بُعد ${Math.round(dist)} متر من المجمع.`);
        }
    }, null, { enableHighAccuracy: true });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2-lat1)*Math.PI/180;
    const dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function parseTimeToMinutes(t) { 
    const p = t.split(':'); return parseInt(p[0]) * 60 + parseInt(p[1]); 
}

database.ref('settings/workHours').on('value', s => {
    if(s.val()) {
        WORK_START = s.val().start; WORK_END = s.val().end;
        document.getElementById('set-start').innerText = WORK_START;
        document.getElementById('set-end').innerText = WORK_END;
    }
});

window.onload = init;
setInterval(() => { document.getElementById('current-time').innerText = new Date().toLocaleTimeString('ar-SA'); }, 1000);