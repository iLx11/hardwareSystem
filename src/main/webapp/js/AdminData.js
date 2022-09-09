var Mana = new Vue({
    el: '#hardware_sys_PC',
    data: {
        userList: [],
        AnaList: [],
        SpList: [],
        HardwareList: [],
    },
    mounted() {

        this.onloadDo();

    },
    methods: {
        //加载完成后执行（导入列表）
        onloadDo() {
            let that = this;
            $.ajax({
                type: "GET",
                url: "/user/selectAll",
                success(res) {
                    that.userList = JSON.parse(res);
                }
            });
            $.ajax({
                type: "GET",
                url: "/hardware/selectAll",
                success(res) {
                    that.HardwareList = arrayh = JSON.parse(res);
                    let pattern1 = /^AGSW/;
                    let pattern2 = /^SPSW/;
                    let aa = arrayh.filter((o, i) => {
                        return pattern1.test(o.hardwareID);
                    });
                    let bb = arrayh.filter((o, i) => {
                        return pattern2.test(o.hardwareID);
                    });
                    that.AnaList = [];
                    that.SpList = [];
                    for (let i = 0; i < aa.length; i++) {
                        that.AnaList.push(aa[i]);
                    }
                    for (let i = 0; i < bb.length; i++) {
                        that.SpList.push(bb[i]);
                    }
                }
            });
        },
        //模拟引脚显示
        analogShow(k) {
            console.log("sdfsdfadf")
                let barIn = $('.bar-input').eq(k)[0];
                barIn.addEventListener('change', function() {
                    $('.ind').eq(k).html(barIn.value + '%');
                });
                barIn.addEventListener('mousemove', function() {
                    $('.ind').eq(k).html(barIn.value + '%');
                });

        },
        //简单控制
        SPSWControl(k, s) {
            console.log(`${k}-----${s}`)
            let that = this;
            let hardwareIP = "http://192.168.2.178"
            storage.save("hardwareIP", hardwareIP); //储存函数

            // storage.retrieve("hardwareIP") //读取函数
            $.ajax({
                type: "GET",
                url: storage.retrieve("hardwareIP") + "/spswControl",
                data: {
                    name: that.HardwareList[k + that.AnaList.length].name,
                    hardwareID: that.HardwareList[k + that.AnaList.length].hardwareID,
                    hardwarePort: that.HardwareList[k + that.AnaList.length].hardwarePort,
                    instruction: s,
                },
                success(res) {
                    warn("发送成功");
                }
            });
        },
        //用户退出
        exit() {
            conf("请问您真的想要退出吗", () => {
                this.changeUser(3, false, null, $('.ch_n').html(), (res) => {
                    warn("已退出");
                    window.location.href = '/index.html';
                });
            });
        },
        //用户更改输入
        dataTransfer(a) {
            let that = this;
            $('.userChangeBox').show();
            $('.cover').show().on("click", () => {
                $('.userChangeBox').hide();
                $('.cover').hide();
            });
            $('.Boxsub').on("click", () => {
                if ($('#change_put').val().trim() != "") {
                    $('.userChangeBox').hide();
                    $('.cover').hide();
                    if (a == 1) {
                        $.ajax({
                            type: "POST",
                            url: "/user/userVerify",
                            data: {
                                name: $('#change_put').val(),
                            },
                            success(response) {
                                if (response != "Exist") {
                                    that.changeUser(a, false, $('#change_put').val(), current_user, (res) => {
                                        warn("修改完成");
                                        that.userList = JSON.parse(res);
                                        $('.ch_n').html($('#change_put').val());
                                    });
                                } else {
                                    warn("抱歉，此用户名已注册");
                                }
                            }
                        });
                    }
                    if (a == 2) {
                        that.changeUser(a, false, md5($('#change_put').val()), current_user, (res) => { warn("修改完成"); });
                    }
                }else {
                    warn("输入内容为空或为空格");
                }
            });
            $('#change_put').val("");
        },
        delUser(k) {
            let that = this;
            conf("您确定要删除此用户吗", () => {
                $.ajax({
                    type: "GET",
                    url: "/user/deleteUser",
                    data: {
                        id: that.userList[k].id,
                    },
                    success(res) {
                        that.userList = JSON.parse(res);
                        warn("删除成功");

                    }
                });
            });
        },
        changeMana(k) {
            let that = this;
            conf("您确定要更改此用户的管理员权限吗", () => {
                console.log(this.userList[k].mana);
                this.changeUser(4, !this.userList[k].mana, null, this.userList[k].name, (res) => {
                    console.log(res)
                    that.userList = JSON.parse(res);
                    warn("修改完成");
                });
            });
        },
        changeUser(a, b, c, d, e) {
            let that = this;
            $.ajax({
                type: "POST",
                url: "/user/changeUser",
                data: {
                    set: a,
                    status: b,
                    value: c,
                    name: d,
                },
                success(res) {
                    e(res);
                }
            });
        },
        addHardware() {
            let that = this;
            $(".changeH").show();
            $(".cover").show().on("click", () => {
                $(".cover").hide();
                $(".changeH").hide();
            });
            document.querySelector(".changeH_sub").onclick = function() {
                if ($(".h_inp")[0].value.trim() != "" &&
                    $(".h_inp")[1].value.trim() != "" &&
                    $(".h_inp")[2].value.trim() != "") {
                    $(".changeH").hide();
                    $(".cover").hide();
                    that.addHardwareDo();
                } else {
                    warn("有输入框未填写哦");
                }
            }
        },
        addHardwareDo() {
            let that = this;
            $.ajax({
                type: "POST",
                url: "/hardware/addHardware",
                data: {
                    name: $(".h_inp")[0].value,
                    hardware_id: $(".h_inp")[2].value,
                    hardware_port: $(".h_inp")[1].value,
                },
                success(res) {
                    warn("添加成功")
                    that.onloadDo();
                }
            });

        },
        changeHardware(k) {
            let that = this;
            $(".changeH").show();
            $(".cover").show().on("click", () => {
                $(".cover").hide();
                $(".changeH").hide();
            });
            $(".h_inp")[0].value = this.HardwareList[k].name;
            $(".h_inp")[1].value = this.HardwareList[k].hardwarePort;
            $(".h_inp")[2].value = this.HardwareList[k].hardwareID;
            document.querySelector(".changeH_sub").onclick = function() {
                if ($(".h_inp")[0].value.trim() != "" &&
                    $(".h_inp")[1].value.trim() != "" &&
                    $(".h_inp")[2].value.trim() != "") {
                    $(".changeH").hide();
                    $(".cover").hide();
                    that.changeHardwareDo(k);
                } else {
                    warn("有输入框未填写哦")
                }
            };
        },
        changeHardwareDo(k) {
            let that = this;
            $.ajax({
                type: "POST",
                url: "/hardware/changeHardware",
                data: {
                    id: that.HardwareList[k].id,
                    name: $(".h_inp")[0].value,
                    hardware_id: $(".h_inp")[2].value,
                    hardware_port: $(".h_inp")[1].value,
                },
                success(res) {
                    warn("修改成功")
                    that.onloadDo();
                }
            });
        },
        changeStatus(k) {
            let that = this;
            conf("请问是否要更改此硬件的状态", () => {
                $.ajax({
                    type: "POST",
                    url: "/hardware/changeStatus",
                    data: {
                        id: that.HardwareList[k].id,
                        status: !that.HardwareList[k].status,
                    },
                    success(res) {
                        warn("修改成功")
                        that.onloadDo();
                    }
                });
            });
        },
        delHardware(k) {
            let that = this;
            conf("请问是否要删除此硬件", () => {
                $.ajax({
                    type: "POST",
                    url: "/hardware/delHardware",
                    data: {
                        id: that.HardwareList[k].id,
                    },
                    success(res) {
                        warn("删除成功")
                        that.onloadDo();
                    }
                });
            });
        }
    }
});