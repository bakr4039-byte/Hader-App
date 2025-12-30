const firebaseConfig = { /* استخدم نفس إعدادات Firebase السابقة */ };
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function saveShift() {
    const start = document.getElementById('start-time').value;
    const end = document.getElementById('end-time').value;
    if(start && end) {
        database.ref('settings/workHours').set({ start, end });
        alert("تم تحديث مواعيد الدوام بنجاح!");
    }
}

database.ref('settings/workHours').on('value', s => {
    if(s.val()) {
        document.getElementById('start-time').value = s.val().start;
        document.getElementById('end-time').value = s.val().end;
    }
});

function loadTodayData() {
    const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    database.ref(`attendance/${dateStr}`).on('value', (snapshot) => {
        const data = snapshot.val();
        const body = document.getElementById('admin-table');
        body.innerHTML = "";
        if (data) {
            for (let id in data) {
                const r = data[id];
                body.innerHTML += `
                    <tr>
                        <td><b>${r.name}</b><br><small>${id}</small></td>
                        <td>${r.checkIn || '--:--'}</td>
                        <td style="color:red; font-weight:bold;">${r.lateMins || 0}</td>
                        <td>${r.checkOut || '--:--'}</td>
                        <td style="color:orange; font-weight:bold;">${r.earlyMins || 0}</td>
                        <td>${r.checkOut ? '<span style="color:green">✅ انصرف</span>' : '<span style="color:blue">⏳ متواجد</span>'}</td>
                    </tr>`;
            }
        } else {
            body.innerHTML = "<tr><td colspan='6'>لا توجد سجلات لليوم حتى الآن.</td></tr>";
        }
    });
}
function logout() { sessionStorage.clear(); window.location.href="login.html"; }
window.onload = loadTodayData;