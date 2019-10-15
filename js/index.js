(function () {
    // 页面配置
    config = {
        // appkey唯一标识
        appkey: 'wangshengcai_1553946484946',
        // 有关表格全部的数据
        tableData: [],
        // 左侧列表切换容器
        menuList: document.querySelector('.menu-list'),
        // 新增学生下面的两个按钮
        addStudentBtn: document.querySelectorAll('#add-student-form .btn'),
        // 编辑内容下面的两个按钮
        editStudentBtn: document.querySelectorAll('#edit-student-form .btn'),
        // 学生列表
        studentList: document.querySelector('.student-list'),
        // 新增学生
        addStudent: document.querySelector('.add-student'),
        // 表格主体部分
        tableBody: document.querySelector('#student-list .tbody'),
        // 遮罩层区域
        dialog: document.querySelector('#student-list .dialog'),
        // mask
        mask: document.querySelector('.dialog .mask'),
        // 编辑的表单
        editForm: document.querySelector('#edit-student-form'),
        // 编辑学生
        editStudentForm: document.getElementById('edit-student-form'),
        // 新增学生
        addStudentForm: document.getElementById('add-student-form'),
    }

    /**
     * 初始化函数
     */
    function init() {
        bindEvent();
        config.studentList.click();
    }
    init();

    /**
     * 事件绑定
     */
    function bindEvent() {
        config.menuList.addEventListener('click', changeMenu, false);
        config.addStudentBtn[0].addEventListener('click', addStudent, false);
        config.editStudentBtn[0].addEventListener('click', editStudent, false);
        config.tableBody.addEventListener('click', tableClick, false);
        config.mask.addEventListener('click', function () {
            config.dialog.classList.remove('show');
        }, false);
    }

    /**
     * 改变列表
     */
    function changeMenu(e) {
        var e = e || window.event, target = e.target || e.srcElement;
        if (target.tagName == 'DD') {
            initMenuCss(target);
            var content = document.getElementById(target.dataset.id);
            // var content = document.getElementById(target.getAttribute('data-id'));
            initContentCss(content);
            // 点击的是学生列表
            if (target.dataset.id == 'student-list') {
                rendTableData();
            }
        }
    }

    /**
     * 改变学生列表切换的状态选中与否
     */
    function initMenuCss(dom) {
        var active = document.querySelectorAll('.active');
        for (var i = 0; i < active.length; i++) {
            active[i].classList.remove('active');
        }
        dom.classList.add('active');
    }

    /**
     * 改变右侧内容切换的状态选中与否
     */
    function initContentCss(dom) {
        var contActive = document.querySelectorAll('.content-active');
        for (var i = 0; i < contActive.length; i++) {
            contActive[i].classList.remove('content-active');
        }
        dom.classList.add('content-active');
    }

    /**
     * 新增学生
     */
    function addStudent(e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;// 阻止默认事件
        var data = getFormData(config.addStudentForm);
        transferData('/api/student/addStudent', data, function (res) {
            var isTurnPage = confirm('提交成功，是否跳转页面？');
            if (isTurnPage) {
                config.studentList.click();// 重新刷新页面
            }
            config.addStudentForm.reset();// 表单重置
        })
    }

    /**
     * 编辑学生
     */
    function editStudent(e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;// 阻止默认事件
        var data = getFormData(config.editStudentForm);
        var isTurnPage = confirm('是否要更新数据？');
        if (isTurnPage) {
            transferData('/api/student/updateStudent', data, function (res) {
                config.studentList.click();// 重新刷新页面
                config.mask.click();// 遮罩层自动点击
            })
        }
        config.mask.click();// 遮罩层自动点击
    }

    /**
     * 获取表单里面的数据(编辑和新增)
     */
    function getFormData(form) {
        var name = form.name.value,
            sNo = form.sNo.value,
            sex = form.sex.value,
            birth = form.birth.value,
            email = form.email.value,
            phone = form.phone.value,
            address = form.address.value;
        // if (!name || !sNo || !sex || !birth || !email || !phone || !address) {
        //     alert('部分数据未填写完整，请输入完整后提交！');
        // }
        return { name, sNo, sex, birth, email, phone, address };
    }

    /**
     * ajax请求
     * @param {*} url 网址
     * @param {*} param 参数
     */
    function saveData(url, param) {
        var result = null;
        var xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        if (typeof param == 'string') {
            xhr.open('GET', url + '?' + param, false);
        } else if (typeof param == 'object') {
            var str = "";
            for (var prop in param) {
                str += prop + '=' + param[prop] + '&';
            }
            xhr.open('GET', url + '?' + str, false);
        } else {
            xhr.open('GET', url + '?' + param.toString(), false);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    result = JSON.parse(xhr.responseText);
                }
            }
        }
        xhr.send();
        return result;
    }

    /**
     * 减少请求函数的代码冗余
     * @param {*} url 网址
     * @param {*} param 参数
     * @param {*} callBack 回调函数
     */
    function transferData(url, param, callBack) {
        if (!param || param == null) {
            param = {};
        }
        var result = saveData('http://api.duyiedu.com' + url, Object.assign(param, {
            appkey: config.appkey
        }));
        if (result.status == 'success') {
            return callBack(result);
        } else {
            alert(result.msg);
        }
    }

    /**
     * 渲染右侧表格
     */
    function rendTableData() {
        transferData('/api/student/findAll', null, function (res) {
            var data = res.data;
            tableData = data;
            var str = '';
            data.forEach(function (item, index) {
                str += `<tr>
                            <td>${item.sNo}</td>
                            <td>${item.name}</td>
                            <td>${item.sex ? '女' : '男'}</td>
                            <td>${item.email}</td>
                            <td>${new Date().getFullYear() - item.birth}</td>
                            <td>${item.phone}</td>
                            <td>${item.address}</td>
                            <td>
                                <button class='btn edit' data-index=${index}>编辑</button>
                                <button class='btn del' data-index=${index}>删除</button>
                            </td>
                        </tr>`;
            })
            config.tableBody.innerHTML = str;
        })
    }

    /**
     * 表格按钮内部点击事件
     */
    function tableClick(e) {
        var e = e || window.event, target = e.target || e.srcElement;
        if (target.nodeName !== 'BUTTON') {
            return;
        }
        var isEdit = target.className.indexOf('edit') > -1;
        var isDel = target.className.indexOf('del') > -1;
        var index = target.dataset.index;
        // 编辑
        if (isEdit) {
            config.dialog.classList.add('show');
            renderForm(tableData[index]);
        }
        // 删除
        if (isDel) {
            var isDel = confirm('确定要删除吗？');
            if (isDel) {
                transferData('/api/student/delBySno', { sNo: tableData[index].sNo }, function (res) {
                    alert('已删除');
                    config.studentList.click();// 重新刷新页面
                })
            }
        }
    }

    /**
     * 回填表单数据
     */
    function renderForm(data) {
        for (var prop in data) {
            if (config.editForm[prop]) {
                config.editForm[prop].value = data[prop];
            }
        }
    }
}())