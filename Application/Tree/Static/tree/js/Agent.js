/**
 * Created by Administrator on 2016-05-08.
 */
if (typeof Agent == "undefined") {
    Agent = {};

}

Agent = {
    // 登陆
    login : function () {
        Agent.check($('#login_form'), function (result) {
            layer.msg(result.data);
            Agent.needFlush(result.error, "?m=Home_Agent_Index");
        })
    },

    // 修改密码
    editPassword : function () {
        Agent.check($('#edit_password_form'), function (result) {
            layer.msg(result.data);
            Agent.needFlush(result.error, "?m=Home_Agent_Logout", 1000);
        })
    },

    //注册
    reg : function () {
        Agent.check($('#reg_form'), function (result) {
            layer.msg(result.data);
            Agent.needFlush(result.error, "?m=Home_Agent_Login");
        })
    },

    //编辑家谱信息
    editFamily : function () {
        Agent.check($('#edit_form'), function (result) {
            layer.msg(result.data);
            Agent.needFlush(result.error, "?m=Home_Family_List");
        })
    },
    
    editFamilyBook : function (family_id) {
        Agent.check($('#video_form'), function (result) {
            layer.msg(result.data);
            Agent.needFlush(result.error, "?m=Home_Family_Msg&do=book_list&family_id="+family_id);
        })
    },

    //编辑家谱纪录片（视频）
    editFamilyVideo : function (family_id) {
        Agent.check($('#video_form'), function (result) {
            layer.msg(result.data);
            Agent.needFlush(result.error, "?m=Home_Family_Msg&do=video_list&family_id="+family_id);
        })
    },

    //编辑家谱公益榜
    editFamilyBenefit : function (family_id) {
        Agent.check($('#benefit_form'), function (result) {
            layer.msg(result.data);
            Agent.needFlush(result.error, "?m=Home_Family_Msg&do=benefit_list&family_id="+family_id);
        })
    },

    //编辑家谱名人
    editFamilyCelebrity : function (family_id) {
        Agent.check($('#celebrity_form'), function (result) {
            layer.msg(result.data);
            Agent.needFlush(result.error, "?m=Home_Family_Msg&do=celebrity_list&family_id="+family_id);
        })
    },
    
    //编辑家族名企
    editFamilyCompany : function (family_id) {
      Agent.check($('#company_form'), function (result) {
            layer.msg(result.data);
            Agent.needFlush(result.error, "?m=Home_Family_Msg&do=company_list&family_id="+family_id);
        })
    },

    //创建编辑器
    createEditor : function (selecterId) {
	var opt = {
               toolbars : [['undo','redo','removeformat','|','bold','italic','underline','|','indent','justifyleft', 'justifycenter', 'justifyright','justifyjustify','|','forecolor', 'backcolor','|','insertorderedlist','insertunorderedlist','|','simpleupload','insertimage','fullscreen']],
               initialFrameHeight:200,
               autoHeightEnabled : true
        };
        var content = UE.getEditor(selecterId, opt);
    },

    //加载角色
    loadSearchUser : function () {
        Agent.check($('#search_form'), function (result) {
            var html = '';
            $.each(result.data, function (i, v) {
                html += '<div class="item">';
                html += '<input type="hidden" name="uid[]" value="'+v.id+'" id="search_page">';
                html += '<a href="#"><img src="'+v.head+'"></a>';
                html += '<h4><a href="#">'+v.name+'</a></h4>';
                html += '<span>'+v.summary+'['+v.birthdate+'-'+v.deathdate+']<br />'+v.gname+'</span>';
                html += '</div>';
            });
            $('#user_list').html(html);
            $('.page_number').replaceWith(result.page);

        });
    },

    //添加用户（名人，公益榜）
    addUser : function (mod, family_id) {
       Agent.ajax3("?m=Home_Family_Msg&do="+mod+"_add&family_id="+family_id,$('.select').find("input[name='uid[]']").serialize(),
           function(result){
           layer.msg(result.data);
           $('#searchUser').modal('hide');
           Agent.needFlush(result.error, "?m=Home_Family_Msg&do="+mod+"_list&family_id="+family_id);
       });
    },

    //显示搜索用户弹窗
    showSearchUser : function () {
        $('#searchUser').modal('show')
    },

    //上传头像
    openUpload : function(userId) {
        layer.open({
            type : 2,
            title : '上传头像',
            area : [ '700px', '480px' ],
            fix : false, // 不固定
            maxmin : true,
            content : './?m=Home_User_HeadUpload&do=show&user_id=' + userId
        });
    },

    fileBindChange : function(selecterId, url, sucCallBack, errorCallBack) {
        $("#" + selecterId).on("change", function() {
            Agent.fileUpload(selecterId, url, sucCallBack, errorCallBack);
        });
    },

    fileUpload : function(selecterId, url, sucCallBack, errorCallBack) {
        $.ajaxFileUpload({
            url : url,
            secureuri : false,
            fileElementId : selecterId,
            dataType : 'json',
            success : function(result) {
                sucCallBack(result);
                // 重新替换上传文件控件，可以让其继续上传
                Agent.fileBindChange(selecterId, url, sucCallBack, errorCallBack);
            },
            error : function(result) {
                errorCallBack(result);
                // 重新替换上传文件控件，可以让其继续上传
                Agent.fileBindChange(selecterId, url, sucCallBack, errorCallBack);
            }
        });
    },

    // 表单提交
    check : function(ob, calback) {
        ob.ajaxSubmit({
            dataType : 'json',
            success : function(ret) {
                calback(ret);
            }
        });
    },

    // 刷新操作
    needFlush : function(code, url, time) {
        time = time | 600;
        if (code == 0) {
            setTimeout(function() {
                if (url != null)
                    window.location.href = url;
                else
                    window.location.reload(true);
            }, time);
        }
    },

    ajax5 : function(type, url, data, datatye, calBack) {
        $.ajax({
            type : type,
            url : url,
            data : data,
            dataType : datatye,
            success : function(data) {
                calBack(data);
            }
        });
    },
    ajax4 : function(type, url, data, calBack) {
        Agent.ajax5(type, url, data, "json", calBack);
    },
    ajax3 : function(url, data, calBack) {
        Agent.ajax4("post", url, data, calBack);
    },
    ajax2 : function(url, data, calBack) {
        Agent.ajax4("get", url, data, calBack);
    }
};