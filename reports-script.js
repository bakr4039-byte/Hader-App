const firebaseConfig = {
    apiKey: "AIzaSyAuOkZYWzjBTpuWdeibeEWC0tVR87byEEw",
    databaseURL: "https://hader-system-default-rtdb.firebaseio.com/", 
    projectId: "hader-system"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// المواعيد الرسمية للمدرسة
const START_TIME = "07:00"; 
const END_TIME = "13:00";

// ضبط تاريخ اليوم تلقائياً
document.getElementById('reportDate').valueAsDate = new Date();

function loadReport() {
    const dateInput = document.getElementById('reportDate').value;
    if(!dateInput) return;
    const dKey = dateInput.split('-').reverse().join('-'); // تحويل للتنسيق DD-MM-YYYY

    db.ref('teachers').once('value', st => {
        const teachers = st.val() || {};
        db.ref('attendance/' + dKey).once('value', sa => {
            const attData = sa.val() || {};
            calculateAndRender(teachers, attData);
        });
    });
}

function calculateAndRender(teachers, attendance) {
    const body = document.getElementById('tableBody');
    body.innerHTML = "";
    
    let stats = { total: 0, abs: 0, out: 0, lCount: 0, lMins: 0, eMins: 0 };
    stats.total = Object.keys(teachers).length;

    Object.keys(teachers).forEach(id => {
        const t = teachers[id];
        const record = attendance[id] || null;

        if (!record) {
            stats.abs++;
            body.innerHTML += `<tr class="row-absent"><td>${t.name}</td><td colspan="5">غائب / لم يحضر</td></tr>`;
        } else {
            if(record.checkOut) stats.out++;

            // حساب التأخير
            const late = record.checkIn ? diffMins(START_TIME, record.checkIn) : 0;
            if(late > 0) { stats.lCount++; stats.lMins += late; }

            // حساب الخروج المبكر
            const early = record.checkOut ? diffMins(record.checkOut, END_TIME) : 0;
            if(early > 0) stats.eMins += early;

            body.innerHTML += `
                <tr>
                    <td><strong>${t.name}</strong></td>
                    <td>${record.checkIn || '--:--'}</td>
                    <td>${record.checkOut || '--:--'}</td>
                    <td style="color:${late > 0 ? '#f39c12' : 'black'}">${late}</td>
                    <td style="color:${early > 0 ? '#e74c3c' : 'black'}">${early}</td>
                    <td>${record.outDuringDay || 0}</td>
                </tr>`;
        }
    });

    // تحديث الصناديق في الواجهة
    document.getElementById('sTotal').innerText = stats.total;
    document.getElementById('sAbs').innerText = stats.abs;
    document.getElementById('sOut').innerText = stats.out;
    document.getElementById('sLateCount').innerText = stats.lCount;
    document.getElementById('sLateMins').innerText = stats.lMins;
    document.getElementById('sEarlyMins').innerText = stats.eMins;
}

function diffMins(t1, t2) {
    if(!t1 || !t2) return 0;
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff > 0 ? diff : 0;
}

loadReport();