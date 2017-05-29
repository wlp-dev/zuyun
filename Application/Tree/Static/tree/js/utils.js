var Utils = {
	/*
	*获取表单所有 Input (扩展表单种类中...) 值，
	*obj 父层DOM eg: '.login','#login'
	*return {key:val} key为表单元素的name
	*/
	getData : function(obj,check_RegExp,errorFun,redundance){
		var redundance = redundance ? redundance : [];
		var data = {};
		var checkRes = true;
		$(obj).find('input,select').each(function(i,e){
			var key = $(e).attr('name');
			if (!checkRes) {return;}
			if (key) {
				data[key] = $(e).val();
				if (check_RegExp && $.inArray(key,redundance) == -1) {
					var ispass = Utils.checkFrom(check_RegExp[key][0],data[key]);
					//console.log(ispass,key);
					if (!ispass && errorFun) {
						checkRes = false;
						errorFun(key,e);
						return {};
					}
				}
			};
		});
		if (checkRes) {
			return data;
		}else{
			return false;
		}
	},
	checkFrom : function(regExp,value){
		if(regExp.test(value)){
			return true;
		}else{
			return false;
		}
	},
	checkArrReg : function(regExp,data){
		for(var i in regExp){
			var ispass = Utils.checkFrom(regExp[i][0],data[i]);
			if (!ispass) {
				return [false,i];
			}
		}
		return [true,''];
	},
	getUnixYM : function (unix){
		//unix时间转换成年月
	    var d = new Date(unix*1000);
	    var y = d.getFullYear();
	    var m = d.getMonth()+1;
	    m = (m >= 10) ? m : '0'+m;
	    return y+m;
	},
	datetonow : function(unix) {
		if(unix < 0){
			return $string;
		}else{
			var result = {};
			var hour = unix%86400;
			result['day'] = Math.floor(unix/86400);
			if (hour>0) {
				result['hour'] = Math.floor(hour/3600);
				var minute = hour%3600;
				if (minute>0) {
					result['minute'] = Math.floor(minute/60);
					var second = hour%60;
					if (second>0) {
						result['second'] = second;
					}
				}
			}
			return result;
		}
	},
	random : function (number){
		//获取随机数
		if (!number) number = 10;
		return Math.floor(Math.random()*number);
	},
	back : function(){
		history.back();
	},
	reload : function(){
		location.reload();
	},
	pagination : function(pageIndex,pageSize,url,callback) {
		//分页
        $.ajax({
            type: "POST",
            dataType: "text",
            url: url,      //提交到一般处理程序请求数据
            data: {
            	pageIndex : pageIndex,
            	pageSize : pageSize
            }, //提交两个参数：pageIndex(页面索引)，pageSize(显示条数)
            success: callback
        });
    },
    modCheckClick : function(callback){
    	$('.mod_checkbox').click(function(){
    		$(this).toggleClass('glyphicon-ok');
    		if (callback) {
    			var data = $(this).attr('data');
    			callback(data);
    		};
    	});
    },
    getFormData : function(wrap){
	    var data  = {};
	    var dom = '';
	    if (wrap) {
	    	dom = wrap+' input,'+wrap+' textarea,'+wrap+' select';
	    }else{
	    	dom = 'input,textarea,select';
	    }
	    $(dom).each(function(i,e){
	      var name = $(e).attr('name');
	      if (name) {
	      	if ($(e).attr('type') == 'radio') {
	      		if ($(e).is(":checked")) {
	      			data[name] = $(e).val();
	      		}
	      	}else if($(e).attr('type') == 'checkbox'){
	      		if ($(e).is(":checked")) {
	      			if (!data[name]) {
	      				data[name] = [];
	      			}
	      			data[name].push($(e).val());
	      		}
	      	}else{
	      		data[name] = $(e).val();
	      	}

	      };
	    });
	    return data;
	},
	getFromArrData : function(wrap,item){
		var data = [];
		$(wrap+' '+item).each(function(i,e){
			var tempData = {};
			$(e).find('input').each(function(i,e){
			      var name = $(e).attr('name');
			      if (name) {
			        tempData[name] = $(e).val();
			      };
			});
			data.push(tempData);
		})
		return data;
	},
	check : function(type,value){
		var regExp = Utils.getRegExp(type);
		if(regExp.test(value)){
			return true;
		}else{
			return false;
		}
	},
	getRegExp : function(type){
		var reg = {
			'idcard' : /^\d{17}[X|x|\d]$/,
			'email' : /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
			'phone' : /^.+$/,
			'mobiphone' : /^1\d{10}$/,
		};
		return reg[type];
	},
	defaultInputText : function(obj,styleName,text){
		if (!text) {
			var text = $(obj).val();
		}
	    $(obj).focus(function(){
	        if(styleName)	$(obj).addClass(styleName);
	        if($(obj).val() == text){
	            $(obj).val('');
	        }
	    }).blur(function(){
	        if(styleName)
	            $(obj).removeClass(styleName);
	        if($(obj).val() == ""){
	            $(obj).val(text);
	        }
	    })
	},
	radio: function(obj,value){
		$(obj).siblings('input[type=hidden]').val(value);
		$(obj +' .mod_item[data='+value+']').addClass('select').siblings().removeClass('select');
	},
	area : function(){
		Utils.area_default();
		Utils.area_ini();
		$('.mod_area_province').on('change',function(){
			var id = $(this).val();
			var area = id;
			var string = Utils.area_option(zone[id]);
			if (zone[id]) {
				for(var i in zone[id]){
					area = i;
					break;
				}
				var city = $(this).siblings('.mod_area_city');
				city.html(string).show();
				if (zone[city.val()]) {
					for(var i in zone[city.val()]){
						area = i;
						break;
					}
					city.siblings('.mod_area_town').html(Utils.area_option(zone[city.val()])).show()
				}else{
					$(this).siblings('.mod_area_town').html('').hide();
				}
			}else{
				$(this).siblings('select').html('').hide();
			}
			$(this).parents('.mod_area_detail').siblings('.area').val(area);
		});
		$('.mod_area_city').on('change',function(){
			var id = $(this).val();
			var area = id;
			if (zone[id]) {
				$(this).siblings('.mod_area_town').html(Utils.area_option(zone[id])).show();
				for(var i in zone[id]){
					area = i;
					break;
				}
			}else{
				$(this).siblings('.mod_area_town').html('').hide();
			}
			$(this).parents('.mod_area_detail').siblings('.area').val(area);
		});
		$('.mod_area_town').click(function(){
			var id = $(this).val();
			var area = id;
			$(this).parents('.mod_area_detail').siblings('.area').val(area);
		});
	},
	area_ini:function(){
		$('.mod_area_province').each(function(i,e){
			var id = $(e).val();
			if (zone[id]) {
				$(this).siblings('.mod_area_city').html(Utils.area_option(zone[id])).show();
			}else{
				$(this).parents('select').siblings('.mod_area_city').html('').hide();
			}
		});
	},
	area_default : function() {
		// $('.mod_area_province').each(function(i,e){
		// 	var id = $(this).siblings('.area').val();
		// 	if (zone_key[id]['pid'] == 0) return;
		// 	//区
		// 	if (zone_key[zone_key[zone_key[id]['pid']]['pid']]['pid'] == 1) {
		// 		$(this).siblings('.mod_area_province').html(Utils.area_option(zone[zone_key[zone_key[id]['pid']]['pid']])).show();
		// 		$(this).siblings('.mod_area_city').html(Utils.area_option(zone[zone_key[id]['pid']])).show();
		// 		$(this).siblings('.mod_area_town').html(Utils.area_option(zone[zone_key[id]['pid']])).show();
		// 		console.log(zone[id],id)
		// 	}
		// 	//市
		// 	if (zone_key[zone_key[id]['pid']]['pid'] == 1) {
		// 		$(this).siblings('.mod_area_province').html(Utils.area_option(zone[zone_key[id]['pid']])).show();
		// 		$(this).siblings('.mod_area_city').html(Utils.area_option(zone[id])).show();
		// 	}
		// });
	},
	area_option : function(data){
		if (!data) {
			return '<option value="">--</>';
		}
		var string = '';
		for(var i in data){
			string += '<option value="'+i+'">'+data[i]+'</>';
		}
		return string;
	},
	area_edit : function(obj){
		$(obj).parents('.mod_area_msg').hide().siblings('.mod_area_detail').show();
	},
	mod_select : function(obj,callback){
		$(obj).find('li').last().css('border',0);

		var ini = $(obj).find('.mod_value').val();
		if (ini != '') {
			var text = $(obj).find('li[data='+ini+']').html();
			$(obj).find('.mod_text span').html(text);
		}

		$(obj).mouseover(function(){
			$(obj).addClass('mod_select_hover');
		}).mouseout(function(){
			$(obj).removeClass('mod_select_hover');
		});
		$(obj).on('click','li',function(){
			var data= $(this).attr('data');
			$(obj).find('.mod_value').val(data);
			$(obj).find('.mod_text').children('span').html($(this).html());
			$(obj).removeClass('mod_select_hover');
			if (callback) {
				callback(data,this,obj);
			};
		});
	},
	mod_checkbox : function(obj,callback){
		var data = $(obj).find('.mod_checkbox_value').val();
		function change(data,o){
			if (data == 1) {
				$(o).addClass('mod_checkbox_1');
			}else{
				$(o).removeClass('mod_checkbox_1');
			}
		}

		change(data,obj);

		$(obj).click(function(){
			var data = $(obj).find('.mod_checkbox_value').val();
			var click_val = (data == 1) ? 0 : 1;
			$(obj).find('.mod_checkbox_value').val(click_val);
			change(click_val,obj);
			if (callback) {
				callback(data,this,obj);
			};
		});
	},
	mod_add_del : function() {
		$('.mod_add_del').on('click','.del',function(){
			var count = $(this).siblings('.mod_val').val();
			if (!count||count<1){
				count=1;
			}
			$(this).siblings('.mod_val').val(count-1);
		}).on('click','.add',function(){
			var val = $(this).siblings('.mod_val').val();
			$(this).siblings('.mod_val').val(parseInt(val)+1);
		});
	},
	mod_radio : function(){
		$('.mod_radio').each(function(i,e){
			var data = $(e).find('.mod_val').val();
			$(e).find('.mod_item[data='+data+']').addClass('mod_checked').siblings('.mod_item').removeClass('mod_checked')
		});
		$('.mod_radio').on('click','.mod_item',function(){
			var data = $(this).attr('data');
			var _P = $(this).parents('.mod_radio').eq(0);
			_P.find('.mod_item').removeClass('mod_checked')
			$(this).addClass('mod_checked');
			_P.find('.mod_val').val(data);
		});
	},
	mod_tag : function() {
	    $('.mod_tag .mod_tit li').click(function(){
	        var index = $(this).index();
	        $(this).addClass('cur').siblings().removeClass('cur');
	        var _P = $(this).parents('.mod_tag').eq(0);
	        _P.find('.mod_tag_item').eq(index).show().siblings().hide();
	    });
	},
	get_pos : function(id){
		var o = typeof id === 'string' ? document.getElementById(id) : id,
			x=0,
			y=0,
			st = document.documentElement.scrollTop || document.body.scrollTop,
			sl = document.documentElement.scrollLeft || document.body.scrollLeft,
			ch = document.documentElement.clientHeight||document.body.clientHeight,
			cw = document.documentElement.clientWidth||document.body.clientWidth;
		while(o){
			x+=o.offsetLeft;
			y+=o.offsetTop;
			o = o.offsetParent;
		}
		return {x:x,y:y,st:st,sl:sl,ch:ch,cw:cw}
	},
    /*
    *验证表单，通过后返回数据
    */
    validate : function (obj,regexp) {
        $(obj).on('blur change','input[type=text],textarea,select',function () {
            var val = $(this).val(),
                key = $(this).attr('name');
            var reg = regexp[key][0],
                tips = regexp[key][1];
            Utils.validate_check(this,val,reg,tips);
        })
    },
    validate_check : function (obj,val,reg,string) {
        if (reg.test(val)) {
            $(obj).parent().removeClass('has-error');
            $(obj).next('.tips').hide();
            return true;
        }else{
            $(obj).parent().addClass('has-error');
            $(obj).next('.tips').html(string).show();
            return false;
        }
    },
    validate_data : function (wrap,regexp) {
        var data  = {},
            error = [],
            dom = '';
        if (wrap) {
            dom = wrap+' input,'+wrap+' textarea,'+wrap+' select';
        }else{
            dom = 'input,textarea,select';
        }
        $(dom).each(function(i,e){
            var val = $(e).val(),
                key = $(e).attr('name');
            if (key === undefined || !regexp[key]) {
                return ;
            }
            var reg = regexp[key][0],
                tips = regexp[key][1];
            if (Utils.validate_check(e,val,reg,tips)) {
                data[key] = val;
            }else{
                error.push(regexp[key][1]);//[key] = regexp[key][1];
            }
        });
        if (error.length>0) {
            return {'ret':false,'data':error};
        }else{
            return {'ret':true,'data':data};
        }
    },

	/**
	 * post提交ajax
	 * @param url
	 * @param data
	 * @param success_callback
	 * @param error_callback
     */
	post : function (url, data, success_callback, error_callback) {
		if(!success_callback)success_callback=function(){};
	  	if(!error_callback)error_callback=alert;
		$.ajax({
			url: url,
			cache: false,
			data: data,
			dataType: 'json', //xml, json, script, or html
			timeout: 120*1000, //120s
			type: 'POST'
		}).done(function(data, textStatus, jqXHR) {
		  try{
			success_callback(data, textStatus, jqXHR);
		  }catch(e){
			error_callback(textStatus+"\nCause by: "+ e.message, jqXHR);
		  }
		}).fail(function(jqXHR, textStatus, errorThrown) { error_callback("执行回调操作失败！\nCause by: "+errorThrown+"\n\n返回结果："+jqXHR.responseText, jqXHR); });
	},

	intval : function (str) {
		var num=parseInt(str);
        return isNaN(num) ? 0 : num;
	},

	floatval : function (str) {
		var num=parseFloat(str);
    	return isNaN(num) ? 0 : num;
	}
};


var Mod_datapicker = {
	weekdaysFull : ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
	weekdaysShort : ['日','一','二','三','四','五','六'],
	getCurrentMonth : function() {
		var date = new Date();
		return date.getMonth()+1;
	},
	getFirstDay: function(year, month) {
		//获取每个月第一天再星期几
        var firstDay = new Date(year, month-1, 1);
        return firstDay.getDay();
    },
	getMonthLen: function(year, month) {
		//获取当月总共有多少天
        var nextMonth = new Date(year, month, 1);
        nextMonth.setHours(nextMonth.getHours() - 3);
        return nextMonth.getDate();
    },
    buildHead : function(d){
    	var string = '<tr>';
    	for(var i in d){
    		string += '<th>'+d[i]+'</th>';
    	}
    	return string+'</tr>';
    },
    buildCeil : function(day,string,status){
    	return '<td class="ceil'+(status? ' '+status : '')+'" data="'+day+'">'+string+'</td>';
    },
    buildBody : function(first,days,data){
    	var string = '';
    	///建立空格
    	string += '<tr>'
    	for (var i = 0; i < first; i++) {
    		string += this.buildCeil('','','disable');
    	}
    	for (var n = 0; n < days; n++) {
    		var day = n+1;
    		var key = this.year + '-' +this.month +'-'+ day;
    		var ext_msg = data[key] ? ('<div class="celltip">'+data[key]['ceil']+'</div>') : '';
    		var status = data[key] ? data[key]['status'] : 'disable';
    		var last = (n+first)%7;
    		if (last == 0) {
    			string += '</tr><tr>';
    		}
    		string += this.buildCeil(day,'<div class="day">'+day+'</div>'+ext_msg,status);
    	};
    	for (var i = 0; i < 7; i++) {
    		if ((last+i)%7 >= 6) {
    			break;
    		}
    		string += this.buildCeil('','','disable');
    	};
    	string += '</tr>';
    	return string;
    },
    year : 2015,
    month : 5,
    is_mobile : true,
    picker : function(year,month,data,obj,callback){
    	this.year = year;
    	this.month = month;
    	var first = this.getFirstDay(year,month);
    	var days = this.getMonthLen(year,month);
    	var head = this.buildHead(this.weekdaysShort);
    	var body = this.buildBody(first,days,data);
    	$(obj).html('<table data="'+year+'-'+month+'">'+head+body+'</table>');
    	$(obj).on('tap','td',function(){
    		var _t =this;
    		var y_m = $(this).parents('table').attr('data');
    		var date = $(this).find('.day').html();
    		if (callback) {
    			callback(y_m,date,_t);
    		}
    	}).on('click','td',function(){
    		if (Mod_datapicker.is_mobile) {
    			return;
    		}
    		var _t =this;
    		var y_m = $(this).parents('table').attr('data');
    		var date = $(this).find('.day').html();
    		if (callback) {
    			callback(y_m,date,_t);
    		}
    	});
    }
};

var Calendar = {
    getMonthDay : function(month,year) {
        var days = 30;
        switch(month){
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                days = 31;
                break;
            case 2:
                days = 28;
                break;
        }
        if ((year%4 == 0 || year%400 == 0) && month == 2) {
            days = 29;
        }
        return days;
    }
};


$(document).ready(function(){
	$('.mod_select').each(function(i,e){
		Utils.mod_select(e);
	});
	$('.mod_checkbox').each(function(i,e){
		Utils.mod_checkbox(e);
	});
	Utils.mod_add_del();
	Utils.mod_radio();
	Utils.mod_tag();
});
