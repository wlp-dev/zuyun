/**
 * User: xiaoqing QQ:402036784
 * Date: 12-1-30
 * Time: 下午6:56
 *
 */

$(document).ready(function(){
    //菜单展开，折叠事件
    $('.mtitle div.mtxt').click(function(){
        $('#leftnav .mexpanded').removeClass('mexpanded').addClass('mcollapsed');
        var p = $(this).parent().parent();
        p.addClass('mexpanded');
        var id = p.attr('id');
        $.cookie('menu_last_expand', id, { expires: 365, path: '/' });
    });
    //如果没有展开的菜单，则展开最后一次打开的菜单
    if($('#leftnav .mexpanded').length < 1)
    {
        var id = $.cookie('menu_last_expand');
        if(id)
        {
            $('#'+id).addClass('mexpanded');
        }
    }

    //日期选择widget
    $(".js_st").click(function(){
        WdatePicker({doubleCalendar:true,dateFmt:'yyyy-MM-dd 00:00:00'});
    });
    if($('.js_st').length>0)
    {
        $(".js_et").click(function(){
            WdatePicker({doubleCalendar:true,dateFmt:'yyyy-MM-dd 23:59:59'});
        });
    }else{
        $(".js_et").click(function(){
            WdatePicker({dateFmt:'yyyy-MM-dd'});
        });
    }
    $(".js_ts").click(function(){
        WdatePicker({doubleCalendar:true,dateFmt:'yyyy-MM-dd HH:mm:ss'});
    });
    var timelist = ['00:00:00','07:50:00',"08:50:00","09:00:00","09:50:00","10:50:00","11:50:00","12:50:00","13:50:00",'14:50:00','23:59:59'];
    var selectTime='<select name="fast_time[]">';
    for(var i in timelist)
        selectTime += '<option value="'+timelist[i]+'">'+timelist[i]+'</option>';
    selectTime += '</select>';

    $(selectTime).insertAfter('.js_ts.js_ts_fast').change(function(){
        var ts=$(this).prev();
        var val=ts.trimVal();
        if(val.length<19)return;
        ts.val(val.substr(0, 11)+this.value);
    });

    var table = $('table.tablesorter');
    if(table.length > 0 && table.find('tbody tr').length > 0)
    {
      table.tablesorter();
      // 不进行默认排序，要默认请使用<table cellspacing="1" class="tablesorter {sortlist: [[0,0],[4,0]]}">的方式
     /* table.trigger("update");
      // set sorting column and direction, this will sort on the first and third column
      //行数（0,), 排序0=ASC 1=DESC
      var sorting = [[0, 1]];
      // sort on the first column
      table.trigger("sorton",[sorting]);*/
    }
    //tip提示
    $(".js_tip").tipTip({maxWidth: "auto", edgeOffset: 10, delay:0, fadeIn:200});

    //清除搜索浮动
    $('#sections-header').css('height', 'auto').append('<div class="clearfix"></div>');
});

/**
 * 链接跳转
 * @param url
 */
function linkto(url)
{
    location.href=url;
}

/**
 * 切换内容显示/隐藏
 * @param currentId 对应当前按钮触发显示的内容的ID
 * @param classSelector 各个内容块都有的相同的CSS类名
 */
function toggleBox(currentId, classSelector)
{
    $(classSelector).each(function(index,tag){
        if(currentId == tag.id){
            $(tag).show();
        }else{
            $(tag).hide();
        }
    });
}

//Ajax状态显示
var asyncUI = {
    id : 'js_ajax_doing',
    status : 0,
    timer : null,
    start : function(){
        $('body').append('<div id="'+asyncUI.id+'" style="position: fixed; left:50%; top:50px;padding:5px 10px;border:1px solid #ffb10a; background: #ff9; -moz-border-radius:5px; -webkit-border-radius:5px; border-radius:5px; -moz-box-shadow: 0 1px 1px #fff inset; -webkit-box-shadow: 0 1px 1px #fff inset; box-shadow:  0 1px 1px #fff inset;">'+js_lang.doing+'</div>');
        asyncUI.timer = setInterval(function(){
            var buf='.';
            if(asyncUI.status==1)
                buf = '.o';
            else if(asyncUI.status==2)
                buf = '.o0';
            asyncUI.status++;
            if(asyncUI.status>2)asyncUI.status=0;
            $('#'+asyncUI.id).html(js_lang.doing+buf);
        }, 500);
    },

    alert : function(msg){
        alert(msg);
    },

    finish : function(){
        $('#'+asyncUI.id).remove();
        clearInterval(asyncUI.timer);
    }
};

//弹出菜单或是表格控制
var contextBox = {
    lastId : '',
    setHtml : function(ele, title, html, style){
        var ts = +new Date();
        var id = 'js_contextBox_'+ts;
        if(contextBox.lastId)contextBox.close(contextBox.lastId);
        contextBox.lastId = id;
        $('<div style="display: inline; position: relative; width: 0; height: 0;" id="'+id+'"></div>').insertAfter(ele);
        var div = [];
        div.push('<div style="position: absolute;border: 1px solid #222;background: #fff; border-radius: 5px;'+style+'">');
        div.push('<div style="height: 23px; line-height: 23px;clear: both;overflow: auto;"><strong style="float:left;margin-left: 5px;">'+title+'</strong><a style="float:right;margin-right: 8px;" href="javascript:" onclick="contextBox.close(\''+id+'\');">'+js_lang.close+'</a></div>');
        div.push(html);
        div.push('</div>');
        $('#'+id).html(div.join("\n"));
    },
    close : function(id){
        $('#'+id).remove();
    }
};

/**
 * 关闭当前窗口
 */
function close_window()
{
    window.opener=null;
    window.open("","_self");
    window.close();
}

/**
 * 实现jquery取值时去除左右空白
 */
(function( $ ){
  $.fn.trimVal = function() {
    return $.trim(this.val());
  };
})( jQuery );

/**
 *  创建一个弹出菜单
 * @param e event 点击事件时的event变量
 * @param elem object 点击对象
 * @param menus object {'模块':{'name':'名称'}}
 * @param urlObj object 附加URL参数
 */
function makePopupMenu(e, elem, menus, urlObj)
{
    var aSpan = $('#js_menu_span');
    aSpan.remove();
    $('<span id="js_menu_span" style="position:relative;"></span>').insertAfter(elem);
    var html = [];
    html.push('<ul class="popup_menu">');
    $.each(menus, function(k,v){
      html.push('<li><a href="?m=');
      html.push(k);
      html.push('&'+ $.param(urlObj));
      html.push('">');
      html.push(v['name']);
      html.push('</a></li>');
    });
    html.push('</ul>');
    aSpan=$('#js_menu_span');
    aSpan.html(html.join(''));
    var onClick = function(e){
       stopBubble(e);
    };
    $('.popup_menu a').click(onClick);
    onClick(e);
    $(document.body).click(function(){
      $('#js_menu_span').hide();
    });
}
//阻止事件冒泡函数
function stopBubble(e)
{
    if (e && e.stopPropagation)
        e.stopPropagation();
    else
        window.event.cancelBubble=true
}
function intval(str)
{
    var num=parseInt(str);
    return isNaN(num) ? 0 : num;
}

function floatval(str)
{
    var num=parseFloat(str);
    return isNaN(num) ? 0 : num;
}

function post(url, data, success_callback, error_callback)
{
  if(!success_callback)success_callback=function(){};
  if(!error_callback)error_callback=alert;
  asyncUI.start();
  $.ajax({
    url: url,
    cache: false,
    data: data,
    dataType: 'json', //xml, json, script, or html
    timeout: 120*1000, //120s
    type: 'POST'
  })
  .done(function(data, textStatus, jqXHR) {
      try{
        success_callback(data, textStatus, jqXHR);
      }catch(e){
        error_callback(textStatus+"\nCause by: "+ e.message, jqXHR);
      }
   })
  .fail(function(jqXHR, textStatus, errorThrown) { error_callback(js_lang.ajax_callback_fail+"！\nCause by: "+errorThrown+"\n\n"+js_lang.ajax_return+"："+jqXHR.responseText, jqXHR); })
  .always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) { asyncUI.finish(); });
}