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

function saveShift() {
    const start = document.getElementById('start-time').value;
    const end = document.getElementById('end-time').value;
    if(start && end) database.ref('settings/workHours').set({ start, end });
}

database.ref('settings/workHours').once('value', s => {
    if(s.val()) {
        document.getElementById('start-time').value = s.val().start;
        document.getElementById('set-end').value = s.val().end;
    }
});

function loadData() {
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
                        <td>${r.checkIn || '--'}</td>
                        <td style="color:red">${r.lateMins || 0}</td>
                        <td>${r.checkOut || '--'}</td>
                        <td style="color:orange">${r.earlyMins || 0}</td>
                        <td>${r.checkOut ? '✅ انصرف' : '⏳ موجود'}</td>
                    </tr>`;
            }
        }
    });
}
function logout() { sessionStorage.clear(); window.location.href="login.html"; }
window.onload = loadData;