const firebaseConfig = {
    apiKey: "AIzaSyAuOkZYWzjBTpuWdeibeEWC0tVR87byEEw",
    authDomain: "hader-system.firebaseapp.com",
    projectId: "hader-system",
    storageBucket: "hader-system.firebasestorage.app",
    messagingSenderId: "1039709774940",
    appId: "1:1039709774940:web:078351fe5cb90593473299"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

async function runReport() {
    const m = document.getElementById('m').value;
    const y = document.getElementById('y').value;
    const body = document.getElementById('rep-body');
    body.innerHTML = "<tr><td colspan='5'>جاري الحساب...</td></tr>";

    database.ref('attendance').once('value', (s) => {
        const days = s.val();
        const stats = {};
        if (days) {
            for (let date in days) {
                if (date.includes(`-${m}-${y}`)) {
                    for (let id in days[date]) {
                        const r = days[date][id];
                        if (!stats[id]) stats[id] = { name: r.name, days: 0, late: 0, early: 0 };
                        stats[id].days++;
                        stats[id].late += (r.lateMins || 0);
                        stats[id].early += (r.earlyMins || 0);
                    }
                }
            }
            body.innerHTML = "";
            for (let id in stats) {
                const st = stats[id];
                body.innerHTML += `<tr><td><b>${st.name}</b></td><td>${st.days}</td><td>${st.late}</td><td>${st.early}</td><td>${st.late > 60 ? '⚠️ يحتاج تنبيه' : '⭐ ممتاز'}</td></tr>`;
            }
        }
    });
}

function exportExcel() {
    const table = document.getElementById("rep-table");
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, "تقرير_انضباط_المجمع.xlsx");
}