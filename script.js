<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إدارة روابط المعلمين - مجمع أبي بن كعب</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .container {
            background-color: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            width: 90%;
            max-width: 800px;
            text-align: center;
        }

        h1 {
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }

        .input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
            justify-content: center;
        }

        input {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            width: 200px;
            font-family: 'Tajawal', sans-serif;
            text-align: center;
        }

        .btn-add {
            background-color: #34495e;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s;
        }

        .btn-add:hover {
            background-color: #2c3e50;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th {
            border-bottom: 2px solid #eee;
            padding: 15px;
            color: #7f8c8d;
            font-weight: bold;
        }

        td {
            padding: 15px;
            border-bottom: 1px solid #f9f9f9;
        }

        .btn-delete {
            color: #e74c3c;
            cursor: pointer;
            border: none;
            background: none;
            font-size: 18px;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 30px;
            text-decoration: none;
            color: #3498db;
            font-weight: bold;
        }

        .back-link i {
            background-color: #34495e;
            color: white;
            padding: 5px;
            border-radius: 4px;
            font-size: 12px;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>
        إدارة قاعدة بيانات الروابط المعتمدة
        <i class="fas fa-paperclip"></i>
    </h1>

    <div class="input-group">
        <input type="text" id="teacherName" placeholder="اسم المعلم">
        <input type="text" id="jobID" placeholder="الرقم الوظيفي">
        <button class="btn-add" onclick="addLink()">إضافة للقاعدة</button>
    </div>

    <table>
        <thead>
            <tr>
                <th>المعلم</th>
                <th>الرقم الوظيفي</th>
                <th>الإجراءات</th>
            </tr>
        </thead>
        <tbody id="linksTableBody">
            </tbody>
    </table>

    <a href="dashboard.html" class="back-link">
        العودة للوحة الإدارة
        <i class="fas fa-arrow-left"></i>
    </a>
</div>

<script>
    // تحميل البيانات عند فتح الصفحة
    document.addEventListener('DOMContentLoaded', displayLinks);

    function addLink() {
        const name = document.getElementById('teacherName').value;
        const id = document.getElementById('jobID').value;

        if (name === "" || id === "") {
            alert("يرجى ملء جميع الحقول");
            return;
        }

        const linkData = { name, id };
        
        // جلب البيانات الحالية من localStorage
        let links = JSON.parse(localStorage.getItem('approvedLinks')) || [];
        links.push(linkData);
        
        // حفظ البيانات
        localStorage.setItem('approvedLinks', JSON.stringify(links));
        
        // مسح الحقول وتحديث الجدول
        document.getElementById('teacherName').value = "";
        document.getElementById('jobID').value = "";
        displayLinks();
    }

    function displayLinks() {
        const tableBody = document.getElementById('linksTableBody');
        tableBody.innerHTML = "";
        
        let links = JSON.parse(localStorage.getItem('approvedLinks')) || [];

        links.forEach((link, index) => {
            const row = `
                <tr>
                    <td>${link.name}</td>
                    <td>${link.id}</td>
                    <td>
                        <button class="btn-delete" onclick="deleteLink(${index})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    function deleteLink(index) {
        let links = JSON.parse(localStorage.getItem('approvedLinks'));
        links.splice(index, 1);
        localStorage.setItem('approvedLinks', JSON.stringify(links));
        displayLinks();
    }
</script>

</body>
</html>