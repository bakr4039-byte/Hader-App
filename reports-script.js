// 1. إعدادات Firebase الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyAuOkZYWzjBTpuWdeibeEWC0tVR87byEEw",
  authDomain: "hader-system.firebaseapp.com",
  projectId: "hader-system",
  storageBucket: "hader-system.firebasestorage.app",
  messagingSenderId: "1039709774940",
  appId: "1:1039709774940:web:078351fe5cb90593473299"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const database = firebase.database();

async function generateReport() {
    const month = document.getElementById('month-select').value;
    const year = document.getElementById('year-select').value;
    const body = document.getElementById('reports-body');
    
    body.innerHTML = "<tr><td colspan='6'>جاري تحليل بيانات الشهر... 🔍</td></tr>";

    database.ref('attendance').once('value', (snapshot) => {
        const allDays = snapshot.val();
        const teacherSummaries = {}; // كائن لتجميع النتائج

        if (allDays) {
            // البحث في جميع أيام السنة المخزنة
            for (let dateKey in allDays) {
                // تصفية الأيام التي تتبع الشهر والسنة المختارين (التنسيق DD-MM-YYYY)
                if (dateKey.includes(`-${month}-${year}`)) {
                    const dayData = allDays[dateKey];
                    
                    for (let teacherId in dayData) {
                        const record = dayData[teacherId];
                        
                        if (!teacherSummaries[teacherId]) {
                            teacherSummaries[teacherId] = { 
                                name: record.name, 
                                totalDays: 0, 
                                totalLate: 0, 
                                totalEarly: 0 
                            };
                        }
                        
                        teacherSummaries[teacherId].totalDays += 1;
                        teacherSummaries[teacherId].totalLate += (record.lateMins || 0);
                        teacherSummaries[teacherId].totalEarly += (record.earlyMins || 0);
                    }
                }
            }
            displayData(teacherSummaries);
        } else {
            body.innerHTML = "<tr><td colspan='6'>لا توجد بيانات مسجلة في السحاب بعد.</td></tr>";
        }
    });
}

function displayData(stats) {
    const body = document.getElementById('reports-body');
    body.innerHTML = "";
    
    const teachers = Object.keys(stats);
    if (teachers.length === 0) {
        body.innerHTML = "<tr><td colspan='6'>لم يتم العثور على سجلات لهذا الشهر.</td></tr>";
        return;
    }

    teachers.forEach(id => {
        const s = stats[id];
        let evaluation = "ممتاز ⭐";
        let color = "#27ae60";
        
        if (s.totalLate > 60) { evaluation = "منضبط"; color = "#f39c12"; }
        if (s.totalLate > 180) { evaluation = "تنبيه ⚠️"; color = "#e74c3c"; }

        body.innerHTML += `
            <tr>
                <td><b>${s.name}</b></td>
                <td>${id}</td>
                <td><span class="stat-badge bg-days">${s.totalDays} يوم</span></td>
                <td><span class="stat-badge bg-late">${s.totalLate} دقيقة</span></td>
                <td>${s.totalEarly} دقيقة</td>
                <td style="color:${color}; font-weight:bold;">${evaluation}</td>
            </tr>`;
    });
}

function exportToExcel() {
    const table = document.querySelector("table");
    const wb = XLSX.utils.table_to_book(table, { sheet: "تقرير شهري" });
    const month = document.getElementById('month-select').value;
    XLSX.writeFile(wb, `تقرير_انضباط_شهر_${month}.xlsx`);
}