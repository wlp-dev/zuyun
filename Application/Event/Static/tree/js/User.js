if (typeof User == "undefined") {
	User = {};

}

User = {
		imgShow:function(id)
		{
			User.ajax3("./?m=Home_User_Show&do=showimg",{"id":id},function(result){
				layer.photos({
				    photos: result.data
				  });
			});
			
		},
	//确认支付的钱已经支付成功
	confirmCoin : function(order_no) {
			User.ajax3("./?m=Home_User_Coin&do=confirm",{"order_no":order_no},function(result){
				alert(result.data);
			});
	},
	patchHtml : function(select, result) {
		if (result.error > 0) {
			layer.msg(result.data.data);
			_hasmore = false;
		} else {
			$(select).append(result.data.data);

			start = start + result.data.start;
			if (result.data.islast == 1)
				_hasmore = false;
		}
		_loaded = true;
		layer.closeAll();
	},
	loadingMore : function(url, param, calback) {
		if (_hasmore) {
			layer.msg('加载中...', {
				icon : 16
			});
			_loaded = false;

			User.ajax3(url, param, function(result) {
				calback(result);
			});
		}
	},
	scollLoading : function(calback) {
		$(window).scroll(
				function() {
					totalheight = parseFloat($(window).height())
							+ parseFloat($(window).scrollTop()); // 浏览器的高度加上滚动条的高度

					if ($(document).height() <= totalheight) // 当文档的高度小于或者等于总的高度的时候，开始动态加载数据
					{
						if (_loaded)
							// 此处是滚动条到底部时候触发的事件，在这里写要加载的数据，或者是拉动滚动条的操作
							calback();
					}
				});
	},
	openUpload : function(userId) {
		layer.open({
			type : 2,
			area : [ '700px', '480px' ],
			fix : false, // 不固定
			maxmin : true,
			content : './?m=Home_User_HeadUpload&do=show&user_id=' + userId
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
	loadingArea : function(ob) {
		User.ajax3("?m=Home_User_Personal&do=area", {
			"areaid" : $(ob).val()
		}, function(result) {

			var _nextOb = $(ob).parents(".col-sm-2").next();
			console.info(result);
			if (_nextOb) {
				var _nextSelet = _nextOb.find(".dropdown");
				_nextSelet.empty();
				_nextSelet.append(result.data.lcal1);
			}

			var _nextOb_2 = _nextOb.next();

			if (_nextOb_2) {
				var _nextSelet_2 = _nextOb_2.find(".dropdown");
				_nextSelet_2.empty();
				_nextSelet_2.append(result.data.lcal2);
			}
		});
	},
	// 加载 更多的评论
	getMorePL : function(ob, moodId) {
		layer.msg('加载中...', {
			icon : 16
		});
		start = parseInt($(ob).attr("start"), 10);
		User.ajax3("?m=Home_User_Index&do=morepl", {
			"start" : start,
			"moodId" : moodId
		}, function(result) {

			if (result.error == 0) {
				$(ob).parents(".more").siblings("#content_pl").append(
						result.data.data);
				$(ob).attr("start", parseInt(start + result.data.start, 10));
				if (result.data.islast == 1) {
					$(".more").remove();
				}
			} else {
				$(".more").remove();
			}
			layer.closeAll();
		});
	},
	// 删除心情或删除评论
	del : function(ob, moodId, id, action) {
		if (!"delpl" == action || !"delmood" == action) {
			layer.msg('不能做此删除操作!');
			return;
		}

		User.confirm(function() {
			User.ajax3("?m=Home_User_Index&do=" + action, {
				"id" : id,
				"moodId" : moodId
			}, function(result) {
				layer.msg(result.data);
				if ("delpl" == action) {
					var _pltotal = $(ob).parents(".review").find("#pl_num");
					var num = parseInt(_pltotal.html(), 10);
					num = num - 1 > 0 ? num - 1 : 0;
					_pltotal.html(num);
					$(ob).parents("dl").remove();
				} else
					User.needFlush(result.error, "?m=Home_User_Personal");
			});
		}, function() {
		});

	},
	confirm : function(ok, cancle) {
		layer.confirm('您真要进行删除操作么？', {
			btn : [ '确定', '取消' ]
		// 按钮
		}, function() {
			ok();
		}, function() {
			cancle();
		});
	},
	// 点击“回复”
	reply_pl : function(ob, userName, userId) {

		setReplyPl(ob, userName, userId);
	},
	// 对别人的评论点赞
	zan : function(ob, id, done) {
		User.ajax3("?m=Home_User_Index&do=" + done, {
			"id" : id
		}, function(result) {
			layer.msg(result.data);
			if (result.error == 0) {
				var t = $.trim($(ob).html());
				var total = parseInt(t, 10);
				$(ob).html(total + 1);
			}

		});
	},
	// 评论别人的心情
	pl : function(ob) {

		User.check(ob, function(result) {
			if (result.error == 0) {
				var _dlOb = $(ob).siblings("#content_pl");
				_dlOb.append(result.data);

				var _dlplnum = ob.siblings(".talk_num").find("#pl_num");
				var num = parseInt(_dlplnum.html(), 10);
				num++;
				_dlplnum.html(num);
				ob[0].reset();
				layer.msg("评论成功");
			} else
				layer.msg(result.data);

		});
	},

	// 登陆
	login : function() {
		User.check($("#user"), function(result) {
			layer.msg(result.data);
			User.needFlush(result.error, "?m=Home_User_Index");
		});
	},
	// 发布个人心情
	publishMyMood : function() {
		User.check($("#mood"), function(result) {
			layer.msg(result.data);
			User.needFlush(result.error, null);
		});
	},
	logined : function(code) {
		// code<0说明用户没有登陆，得重新登陆才能继续操作
		if (code < 0) {
			layer.msg("用户没有登陆!");
			User.needFlush(0, "?m=Home_User_Login");
			return false;
		}
		return true;
	},
	fileBindChange : function(selecterId, url, sucCallBack, errorCallBack) {
		$("#" + selecterId).on("change", function() {
			User.fileUpload(selecterId, url, sucCallBack, errorCallBack);
		});
	},
	fileUpload : function(selecterId, url, sucCallBack, errorCallBack) {

		$.ajaxFileUpload({
			url : url,
			secureuri : false,
			fileElementId : selecterId,
			dataType : 'json',
			success : function(result) {
				if (User.logined(result.error))
					sucCallBack(result);
				// 重新替换上传文件控件，可以让其继续上传
				User
						.fileBindChange(selecterId, url, sucCallBack,
								errorCallBack);

			},
			error : function(result) {
				errorCallBack(result);
				User
						.fileBindChange(selecterId, url, sucCallBack,
								errorCallBack);
			}
		});
	},// 刷新操作
	needFlush : function(code, url) {
		if (code == 0) {
			setTimeout(function() {
				if (url != null)
					window.location.href = url;
				else
					window.location.reload(true);
			}, 600);
		}
	},
	ajax5 : function(type, url, data, datatye, calBack) {
		$.ajax({
			type : type,
			url : url,
			data : data,
			dataType : datatye,
			success : function(data) {
				if (User.logined(data.error))
					calBack(data);
			}
		});
	},
	ajax4 : function(type, url, data, calBack) {
		User.ajax5(type, url, data, "json", calBack);
	},
	ajax3 : function(url, data, calBack) {
		User.ajax4("post", url, data, calBack);
	},
	ajax2 : function(url, calBack) {
		User.ajax3(url, {}, calBack);
	}
};

//根据相对路径获取绝对路径
function getPath(relativePath,absolutePath){
    var reg = new RegExp("\\.\\./","g");
    var uplayCount = 0;     // 相对路径中返回上层的次数。
    var m = relativePath.match(reg);
    if(m) uplayCount = m.length;
     
    var lastIndex = absolutePath.length-1; 
    for(var i=0;i<=uplayCount;i++){
        lastIndex = absolutePath.lastIndexOf("/",lastIndex);
    }
    return absolutePath.substr(0,lastIndex+1) + relativePath.replace(reg,"");
}   

function include(jssrc){
    // 先获取当前a.js的src。a.js中调用include,直接获取最后1个script标签就是a.js的引用。
    var scripts = document.getElementsByTagName("script");
    var lastScript = scripts[scripts.length-1];
    var src = lastScript.src;
    if(src.indexOf("http://")!=0 && src.indexOf("/") !=0){      
        // a.js使用相对路径,先替换成绝对路径
        var url = location.href;
        var index = url.indexOf("?");
        if(index != -1){
            url = url.substring(0, index-1);
        }
         
        src = getPath(src,url);
    }
    var jssrcs = jssrc.split("|");  // 可以include多个js，用|隔开
    for(var i=0;i<jssrcs.length;i++){
        // 使用juqery的同步ajax加载js.
        // 使用document.write 动态添加的js会在当前js的后面，可能会有js引用问题
        // 动态创建script脚本，是非阻塞下载，也会出现引用问题
        $.ajax({type:'GET',url:getPath(jssrc,src),async:false,dataType:'script'});
    }
}