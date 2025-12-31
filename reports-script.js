const firebaseConfig = {
    apiKey: "AIzaSyAuOkZYWzjBTpuWdeibeEWC0tVR87byEEw",
    databaseURL: "https://hader-system-default-rtdb.firebaseio.com/",
    projectId: "hader-system"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const WORK_START = "07:00"; 
const WORK_END = "13:00";

// تعيين تواريخ اليوم افتراضياً
document.getElementById('dateFrom').valueAsDate = new Date();
document.getElementById('dateTo').valueAsDate = new Date();

async function fetchRangeReport() {
    const from = new Date(document.getElementById('dateFrom').value);
    const to = new Date(document.getElementById('dateTo').value);
    
    if (from > to) return alert("تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء");

    const table = document.getElementById('reportTableBody');
    table.innerHTML = "<tr><td colspan='7'>جاري جلب البيانات...</td></tr>";

    // تصفير الإحصائيات
    let s = { abs:0, lDays:0, lMins:0, eDays:0, eMins:0, noOut:0 };

    try {
        const teachersSnap = await db.ref('teachers').once('value');
        const teachers = teachersSnap.val() || {};
        let tableRows = "";

        // حلقة تكرارية لكل يوم في النطاق
        for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toLocaleDateString('en-GB').replace(/\//g, '-'); // تنسيق DD-MM-YYYY
            const attSnap = await db.ref('attendance/' + dateStr).once('value');
            const attData = attSnap.val() || {};

            Object.keys(teachers).forEach(id => {
                const t = teachers[id];
                const rec = attData[id] || null;

                if (!rec) {
                    s.abs++;
                    tableRows += `<tr class="row-abs"><td>${t.name}</td><td>${dateStr}</td><td colspan="4">غائب</td><td>غياب</td></tr>`;
                } else {
                    const late = calculateDiff(WORK_START, rec.checkIn);
                    const early = rec.checkOut ? calculateDiff(rec.checkOut, WORK_END) : 0;
                    
                    if (late > 0) { s.lDays++; s.lMins += late; }
                    if (early > 0) { s.eDays++; s.eMins += early; }
                    if (rec.checkIn && !rec.checkOut) s.noOut++;

                    tableRows += `
                        <tr>
                            <td>${t.name}</td>
                            <td>${dateStr}</td>
                            <td>${rec.checkIn || '--'}</td>
                            <td>${rec.checkOut || '--'}</td>
                            <td>${late}</td>
                            <td>${early}</td>
                            <td>${rec.checkIn ? 'حاضر' : 'غائب'}</td>
                        </tr>`;
                }
            });
        }

        table.innerHTML = tableRows;
        // تحديث واجهة الإحصائيات
        document.getElementById('tAbs').innerText = s.abs;
        document.getElementById('tLateDays').innerText = s.lDays;
        document.getElementById('tLateMins').innerText = s.lMins;
        document.getElementById('tEarlyDays').innerText = s.eDays;
        document.getElementById('tEarlyMins').innerText = s.eMins;
        document.getElementById('tNoOut').innerText = s.noOut;

    } catch (e) { console.error(e); table.innerHTML = "<tr><td colspan='7'>خطأ في جلب البيانات</td></tr>"; }
}

function calculateDiff(time1, time2) {
    if (!time1 || !time2 || time2 === '--') return 0;
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff > 0 ? diff : 0;
}

// تشغيل التقرير لأول مرة عند الفتح
fetchRangeReport();