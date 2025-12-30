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

function saveHours() {
    const start = document.getElementById('set-work-start').value;
    const end = document.getElementById('set-work-end').value;
    if(start && end) {
        database.ref('settings/workHours').set({ start, end });
        alert("تم تحديث المواعيد! سيتم إعادة حساب التأخير بناءً عليها.");
    }
}

database.ref('settings/workHours').once('value', (s) => {
    const h = s.val();
    if(h) {
        document.getElementById('set-work-start').value = h.start;
        document.getElementById('set-work-end').value = h.end;
    }
});

function loadData() {
    const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    database.ref(`attendance/${dateStr}`).on('value', (snapshot) => {
        const data = snapshot.val();
        const body = document.getElementById('table-body');
        body.innerHTML = "";
        
        if (data) {
            for (let id in data) {
                const r = data[id];
                const late = r.lateMins || 0;
                const early = r.earlyMins || 0;
                
                body.innerHTML += `
                    <tr>
                        <td><b>${r.name}</b><br><small>${id}</small></td>
                        <td>${r.checkIn || '--'}</td>
                        <td style="color:${late > 0 ? 'red' : 'green'}; font-weight:bold; font-size:1.1rem;">${late}</td>
                        <td>${r.checkOut || '--'}</td>
                        <td style="color:${early > 0 ? 'orange' : 'green'}; font-weight:bold; font-size:1.1rem;">${early}</td>
                        <td>${r.checkOut ? '<span class="badge-green">مكتمل ✅</span>' : '<span class="badge-red">⚠️ لم ينصرف</span>'}</td>
                    </tr>`;
            }
        } else {
            body.innerHTML = "<tr><td colspan='6'>بانتظار أول عملية بصمة لليوم...</td></tr>";
        }
    });
}

function logout() { sessionStorage.clear(); window.location.href="login.html"; }
window.onload = loadData;