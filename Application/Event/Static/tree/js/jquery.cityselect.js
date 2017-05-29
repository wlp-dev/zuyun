/*
Ajax 三级省市联动
settings 参数说明
-----
prov:默认省份
city:默认城市
dist:默认地区（县）
nodata:无数据状态
required:必选项
------------------------------ */
(function($){
    $.fn.citySelect = function(settings){
        if(this.length<1){return;}

        // 默认值
        settings = $.extend({
            prov:null,
            city:null,
            dist:null,
            nodata:null,
            required:false
        },settings);

        var box_obj = this;
        var prov_obj = box_obj.find(".prov");
        var city_obj = box_obj.find(".city");
        var dist_obj = box_obj.find(".dist");
        var select_provhtml = (settings.required) ? "" : "<option value=''>请选择省份</option>";
        var select_cityhtml = (settings.required) ? "" : "<option value=''>请选择城市</option>";
        var select_disthtml = (settings.required) ? "" : "<option value=''>请选择区县</option>";

        var setCss = function(type){
            if(settings.nodata=="none"){
                if(type == 1)
                    city_obj.css("display","none");
                dist_obj.css("display","none");
            }else if(settings.nodata=="hidden"){
                if(type == 1)
                    city_obj.css("visibility","hidden");
                dist_obj.css("visibility","hidden");
            }
        };
        // 赋值市级函数
        var cityStart = function(){
            var prov_id = prov_obj.val();
            city_obj.empty().attr("disabled",true);
            dist_obj.html(select_disthtml).attr("disabled",true);
            if(prov_id < 0){
                setCss(1);
                return;
            }

            // 遍历赋值市级下拉列表
            temp_html = select_cityhtml;
            Utils.post('/index.php/agent/api/getArea', {'do':'get_by_pid','pid':prov_id,'data_type':'json'}, function(data){
                $.each(data,function(i,city){
                    temp_html+="<option value='"+city.id+"'>"+city.name+"</option>";
                });
                city_obj.html(temp_html).attr("disabled",false).css({"display":"","visibility":""});
                // 若有传入市级的值，则选中
                setTimeout(function(){
                    if(settings.city!=null){
                        city_obj.val(settings.city);
                        distStart();
                    }
                },1);
            });
        };

        // 赋值地区（县）函数
        var distStart=function(){
            var prov_id = prov_obj.val();
            var city_id=city_obj.val();
            dist_obj.empty().attr("disabled",true);

            if(Utils.intval(prov_id) <= 0 || Utils.intval(city_id) <= 0){
                setCss(2);
                return;
            }

            // 遍历赋值区（县）下拉列表
            temp_html = select_disthtml;
            Utils.post('/index.php/agent/api/getArea', {'do':'get_by_pid','pid':city_id,'data_type':'json'}, function(data){
                $.each(data,function(i,dist){
                    temp_html+="<option value='"+dist.id+"'>"+dist.name+"</option>";
                });
                dist_obj.html(temp_html).attr("disabled",false).css({"display":"","visibility":""});
                 // 若有传入区（县）的值，则选中
                setTimeout(function(){
                    if(settings.dist!=null){
                        dist_obj.val(settings.dist);
                    }
                },1);
            });
        };

        var init=function(){
            // 遍历赋值省份下拉列表
            temp_html = select_provhtml;
            Utils.post('/index.php/agent/api/getArea', {'do':'get_by_pid','pid':0,'data_type':'json'}, function(data){
                $.each(data,function(i,prov){
                    temp_html+="<option value='"+prov.id+"'>"+prov.name+"</option>";
                });
                prov_obj.html(temp_html);
                city_obj.html(select_cityhtml);
                dist_obj.html(select_disthtml);
                 // 若有传入省份的值，则选中
                setTimeout(function(){
                    if(settings.prov!=null){
                        prov_obj.val(settings.prov);
                        cityStart();
                    }
                },1);
            });

            // 选择省份时发生事件
            prov_obj.bind("change",function(){
                cityStart();
            });

            // 选择市级时发生事件
            city_obj.bind("change",function(){
                distStart();
            });
        };

        // 设置省市json数据
        init();
    };
})(jQuery);