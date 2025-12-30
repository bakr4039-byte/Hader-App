// دالة لجلب البيانات وعرضها في الجدول
function displayAttendanceLogs() {
    const tableBody = document.getElementById('admin-table-body');
    const totalPresent = document.getElementById('total-present');
    
    // جلب البيانات من الـ localStorage بنفس الاسم الذي استخدمته أنت
    let data = JSON.parse(localStorage.getItem('attendanceData')) || [];
    
    tableBody.innerHTML = ""; // مسح الجدول القديم
    
    // ترتيب البيانات لعرض الأحدث في الأعلى
    data.reverse().forEach(record => {
        const row = `
            <tr>
                <td>${record.teacherName}</td>
                <td>${record.teacherId}</td>
                <td>${record.attendanceTime}</td>
                <td>${record.date}</td>
                <td><span class="status-badge bg-green">${record.status}</span></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
    
    // تحديث إجمالي الحاضرين
    totalPresent.innerText = data.length;
}

// تشغيل الدالة تلقائياً عند فتح الصفحة
window.onload = displayAttendanceLogs;

// دالة لمسح السجلات إذا أردت البدء من جديد
function clearLogs() {
    if(confirm("هل تريد مسح جميع سجلات الحضور؟")) {
        localStorage.removeItem('attendanceData');
        displayAttendanceLogs();
    }
}