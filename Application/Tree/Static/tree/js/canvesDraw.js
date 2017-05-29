/**
 * User: xiaoqing Email: liuxiaoqing437@gmail.com
 * Date: 2015-01-18
 * Time: 15:35
 * canvas家谱树形图
 */

//全局变量家谱数据,缩放比率,家庭Id,图片头像路径前缀
var w_familyTreeData;
var w_rate = 1;
var w_familyId;
var w_isForeiner;
var w_baseImgUrl = '/Application/Forum/Static/tree/';
var w_level;
var w_useId;
var w_imgChoose = false;
var w_showMod = window.showMod;


/*内层canvas画人函数*/
/*
参数含义{
   iniTop:位置初始高度
   initLeft:位置初始宽度
   data:用户信息集合
}
*/
function draw(initTop,initLeft,data){
   var opObj = data;
   var id = data.userId;
   var sex = data.gender;
   var src = data.head;
   var name = data.firstname + data.lastname;
   var live = data.isliving;
   var canvasBox = document.getElementById('drawBox');
   var canvasList = document.createElement('div');
   canvasBox.appendChild(canvasList);
   src = w_baseImgUrl + src + '?' + new Date().getTime();
   canvasList.innerHTML = '<em class="btnClose"></em><a class="avt-img"><img id="' + id + '_avatar" width="' + 62*w_rate + '" height="' + 62*w_rate + '" src="' + src + '"/ alt="头像" /></a> <div class="msg"><a onclick="getData(' + w_familyId + ',' + id + ',null,null,true)"  href="javascript:void(0)"><span class="avt-name">' + name + '</span></a><span class="com-btn"><a href="javascript:;" class="edit">编辑</a><a href="javascript:;" class="addition">添加</a></span></div>';
   canvasList.id = id;
   canvasList.className = "boy-box";
   canvasList.style.cursor = "pointer";
   canvasList.style.left = initLeft + 'px';
   canvasList.style.top = initTop + 'px';
   canvasList.style.width = 155*w_rate + 'px';
   canvasList.style.height = 64*w_rate + 'px';
   canvasList.style.fontSize = 16*w_rate + "px";
   $('.avt-img').css({width:62*w_rate +"px", height:62*w_rate + "px", marginRight:5*w_rate + "px"});
   $('.avt-name').css({'font-size':14*w_rate +"px",'padding-top': 3*w_rate});
   $('.com-btn').css({'left':62*w_rate + "px", "padding":3*w_rate + "px"});
   $('.com-btn>a').css('font-size',12*w_rate +"px");
   $('.btnClose').css({width:24*w_rate +"px", height:24*w_rate +"px"});
   if(sex == 1){
       canvasList.className = canvasList.className + " grad-boy";
   }
   else{
      canvasList.className = canvasList.className + " grad-girl";
   }
   if(live == 0){
     canvasList.style.background = '#bdc4c7';
   }
   if(w_showMod == 'edit') {
      $('#'+ id).find('img').click(function(){
         Agent.openUpload(id);
      });
      $('#'+ id).find('.edit').click(function(){
         editInfo(id);
      });
      $('#'+ id).find('.addition').click(function(){
         var isF = null;
         if(data.isForeiner == true){
            isF = true;
         }
         addMember(data,isF);
      });
      $('#'+ id).find('.btnClose').click(function(){
         deletePerson(data);
      });
   }
   operating(opObj);
}

/*外层canvas连线函数*/
/*
参数含义{
  startX:画笔起始x坐标
  startY:画笔起始y坐标
  endX:画笔结束x坐标
  endY:画笔结束y坐标
}
*/
function line(startX,startY,endX,endY){
   var canvasBox=document.getElementById('lineCanvas');
   var ctx = canvasBox.getContext('2d');
   ctx.beginPath();
   ctx.moveTo(startX,startY);
   ctx.lineTo(endX,endY);
   ctx.lineWidth = 2*w_rate;
   //ctx.shadowBlur=2;
   //ctx.shadowOffsetX=1;
   //ctx.shadowOffsetY=1;
   //ctx.shadowColor="#000";
   //ctx.strokeStyle ='#b2b2b2';
   ctx.strokeStyle ='#000';
   ctx.stroke();
}

/*根据canvas位置算出连线坐标*/
/*
参数含义{
   o:子女
   array:父母
   partnerOrder:父母配偶排行
   n:垂直偏移量
}
*/
function position(o,array,partnerOrder,n){
   var o1 = document.getElementById(o);
   var o2 = document.getElementById(array[0]);
   var o3 = document.getElementById(array[1]);
   var h = 80*w_rate/n*partnerOrder;
   var y = partnerOrder - 1;
   if(y == -1) y =0;
   //父母与子女的3段连线的起末坐标
   var sX1,sX2,sX3,eX2,eX3,sY1,sY2,sY3,eY1,eY2,eY3;
   sX1 = sX3 = eX3 = o1.offsetLeft + 100*w_rate + y*4*w_rate;//左右偏移量
   sY1 = eY1 = sY3 = o1.offsetTop - h;
   eY3 =o1.offsetTop;
   if(o3){
      eX1 = Math.max(o2.offsetLeft,o3.offsetLeft)- 20*w_rate + y*4*w_rate;
   }
   else{
         eX1 = o2.offsetLeft + 100*w_rate + y*4*w_rate;
   }
   sX2 = eX2 = eX1;
   sY2 = o1.offsetTop - h;
   eY2 = o1.offsetTop - 110*w_rate;
   if(!o3){
      eY2 = o1.offsetTop - 80*w_rate;
   }
   line(sX1,sY1,eX1,eY1);
   line(sX2,sY2,eX2,eY2);
   line(sX3,sY3,eX3,eY3);
}

/*逻辑关系函数*/
/*
参数含义{
   data:家谱数据
   fid:fimalyID
   uId:用户Id
   intX:上次用户图像left值
   intY:上次用户图像top值
   t:是否让图像居中显示
}
变量含义{
   l:谱数据数组长度
   gdata:家谱数据数组
   min:数据里level集合
   partner:配偶
   child:子女
   childPartner:子女配偶
   grandson:孙子女
   grandsonPartner:孙子女配偶
   tTop:第一层位置高度
   mTop:中间层位置高度
   bTop:底层位置高度
   tLeft:第一层位置宽度
   mLeft:中间层位置宽度
   bLeft:底层位置宽度
   mWidth:中简称每一子女及配偶宽度
   bWidth:底层每一孙子女及配偶宽度
   maxWidth:上两者宽度最大值
   z:下两层每一竖的距左位置
   gId:最长辈id
   level:最长辈所在层级
}
*/
function ogicalRela(data,fid,uId,intX,intY,t){
   w_familyTreeData = data;
   w_familyId = fid;
   var l = data.length;
   //初始第一人
   if(l<1){
      document.getElementById('firstPerson').style.display = 'block';
      document.getElementById('firstPerson').onclick = function(){
         addMember(data);
      };
      return;
   }
   var gdata = data;
   var min = [];
   var partner = [];
   var child = [];
   var childPartner =[];
   var grandson = [];
   var grandsonPartner = [];
   var tTop = 0;
   var mTop = 140*w_rate;
   var bTop = 280*w_rate;
   var mWidth = [];
   var bWidth = [];
   var maxWidth = [];
   var gId,tWidth,tLeft,mLeft,bLeft,z,zz;
   tWidth = tLeft = mLeft = bLeft = z = zz = 0;
   for(var i = 0;i < l;i++){
       min.push(gdata[i].level);
   }

   //算出数据里有多少个层级删去相同数
   min = filter(min);

   //算出数据里最高辈层级
   var level = eval('Math.min(' + min.toString() + ')');
   w_level = level;
   for(var i = 0;i<l;i++){
      if(gdata[i].level == level && gdata[i].isForeiner == false){
         gId = gdata[i];
      }
   }

   //算出数据里最高辈的配偶,子女
   for(var i = 0;i<l;i++){
      if(gdata[i].partnerId == gId.userId){
         partner.push(gdata[i]);
      }
      if(gdata[i].fatherId == gId.userId || gdata[i].motherId == gId.userId){
         child.push(gdata[i]);
      }
   }

   //算出最上层宽度
   tWidth+=200*w_rate;
   for(var i = 0;i < partner.length;i++){
      tWidth+=200*w_rate;
   }

   //按排行重新排列配偶子女
   partner = insertionSort(partner,"partnerOrder");
   child = insertionSort(child,"orders");
   for(var i = 0;i < child.length;i++){
      childPartner[i] = [];
      grandson[i] = [];
      mWidth[i] = 0;
      bWidth[i] = 0;
      for(var ii = 0;ii < l;ii++){
         if(gdata[ii].partnerId == child[i].userId){
            childPartner[i].push(gdata[ii]);
         }
         if(gdata[ii].fatherId == child[i].userId || gdata[ii].motherId == child[i].userId){
            grandson[i].push(gdata[ii]);
         }
      }

      //按排行重新排列子女配偶及孙子女
      childPartner[i] = insertionSort(childPartner[i],"partnerOrder");
      grandson[i] = insertionSort( grandson[i],"orders");
      grandson.push(grandson[i]);
      for(var ii = 0;ii < grandson[i].length;ii++){
         bWidth[i]+=200*w_rate;
         var gPartner = [];
         for(var iii = 0;iii < l;iii++){
            if(gdata[iii].partnerId == grandson[i][ii].userId){
               gPartner.push(gdata[iii]);
            }
         }

         //按排行重新排列孙子女配偶
         gPartner = insertionSort(gPartner,"partnerOrder");
         grandsonPartner.push(gPartner);
         for(var m = 0;m < gPartner.length;m++){
            bWidth[i]+=200*w_rate;
         }
      }
      mWidth[i]+=200*w_rate;
      for(var n = 0;n < childPartner[i].length;n++){
         mWidth[i]+=200*w_rate;
      }

      //算出下2层每一竖的最大宽度使父母总是居中
      maxWidth[i] = Math.max(mWidth[i],bWidth[i]);
      z = z + maxWidth[i];
   }

   //使最高层居中
   if(z < tWidth){
      tLeft = 0;
      zz = tWidth;
      z =  (tWidth -z)/2;
   }else{
      zz = z;
      tLeft = (z-tWidth)/2;
      z = 0;
   }
   center(t);
   var yyy = 0;
   //画出后辈

   for(var i = 0;i < child.length;i++){
      mLeft = z + (maxWidth[i] - mWidth[i])/2;
      bLeft = z + (maxWidth[i] - bWidth[i])/2;

      //画出儿子及配偶
      draw(mTop,mLeft,child[i]);
      mLeft+=200*w_rate;
      for(var n = 0;n < childPartner[i].length;n++){
         draw(mTop,mLeft,childPartner[i][n]);
         line(mLeft-85*w_rate,mTop+30*w_rate,mLeft,mTop+30*w_rate);
         mLeft+=200*w_rate;
      }

       //画孙子及配偶
      for(var ii = 0;ii < grandson[i].length;ii++){
         draw(bTop,bLeft,grandson[i][ii]);
         bLeft+=200*w_rate;
         for(var m = 0;m < grandsonPartner[yyy].length;m++){
            draw(bTop,bLeft,grandsonPartner[yyy][m]);
            line(bLeft-85*w_rate,bTop+30*w_rate,bLeft,bTop+30*w_rate);
            bLeft+=200*w_rate;
         }
         yyy++;
      }
      z= z + maxWidth[i];
   }

   //画出最长辈及配偶
   draw(tTop,tLeft,gId);
   for(var i = 0;i < partner.length;i++){
      tLeft+=200*w_rate;
      draw(tTop,tLeft,partner[i]);
      line(tLeft-85*w_rate,tTop+30*w_rate,tLeft,tTop+30*w_rate);
   }

   //使画布上下左右居中显示
   function center(t,f){
      //使拖动容器的宽高与画布内容相等
      document.getElementById('visibleBox').style.height = document.documentElement.clientHeight + 'px';
      var drawWidth = Math.round(zz - 40*w_rate);
      document.getElementById("drawBox").style.width = drawWidth +'px';
      var drawHeight = (60+140*(min.length-1))*w_rate;
      document.getElementById("drawBox").style.height = drawHeight + 'px';
      //使拖动容器在屏幕居中
      if(t == true){
         document.getElementById("drawBox").style.left = (document.documentElement.offsetWidth - zz + 40*w_rate)/2  + 'px';
         document.getElementById("drawBox").style.top = (document.documentElement.offsetHeight - drawHeight)/2  + 'px';
         if(zz < tWidth){
            document.getElementById("drawBox").style.left = (document.documentElement.offsetWidth - zz + 40*w_rate - (tWidth-zz))/2  + 'px';
         }
      }
      if(!f){
        //设置画布大小
         document.getElementById("lineCanvas").setAttribute('width',drawWidth);
         document.getElementById("lineCanvas").setAttribute('height',drawHeight);
      }
   }

   //双击头像重绘后使当前人物位置不变
   if(intX!=null){
      o = document.getElementById(uId);
      var lf = parseFloat(document.getElementById("drawBox").style.left,10);
      var tp = parseFloat(document.getElementById("drawBox").style.top,10);
      x = intX - o.offsetLeft;
      y = intY - o.offsetTop;
      document.getElementById("drawBox").style.left = x + lf + 'px';
      document.getElementById("drawBox").style.top = y + tp + 'px';
   }

   //浏览器窗口变化使拖动容器在屏幕居中
   window.onresize = function(){center(true,true)};

   /*画出上下代关系线*/
   var childrens=[];
   for(var i = 0;i<l;i++){
      if(gdata[i].isForeiner == 0 && gdata[i].level!=level){
         childrens.push(gdata[i]);
      }
   }
   var cpos = [];
   var cpOrder =[];
   for(var i=0;i<childrens.length;i++){
      cpos[i] = [];
      cpOrder[i] = 1;
      var nn = 2;
      var hasMa = true;
      for(var ii = 0;ii < l;ii++){
         if(gdata[ii].userId == childrens[i].fatherId||gdata[ii].userId == childrens[i].motherId){
            cpos[i].push(gdata[ii].userId);
            if(gdata[ii].isForeiner == false){
               var o = gdata[ii];
               var op = [];
               for(var iii = 0;iii < l;iii++){
                  if(gdata[iii].partnerId == o.userId){
                     for(var c = 0;c<childrens.length;c++){
                        if(childrens[c].fatherId == gdata[iii].userId || childrens[c].motherId == gdata[iii].userId){
                           op.push(gdata[iii]);
                           nn++;
                           break;
                        }
                     }
                  }
               }
               op = insertionSort(op,"partnerOrder");
               for(var p = 0;p < op.length;p++){
                  if(op[p].userId == childrens[i].fatherId||op[p].userId == childrens[i].motherId){
                     cpOrder[i] = p + 1;
                     hasMa = false;
                  }
               }
               if(hasMa == true){
                  cpOrder[i] = 0.5;
                  if(op.length == 0){
                     cpOrder[i] = 1;
                  }
               }
               if(nn>2){
                  nn = nn - 1;
               }
            }else{
               //cpOrder[i] = gdata[ii].partnerOrder;
            }
         }
      }
      position(childrens[i].userId,cpos[i],cpOrder[i],nn);
   }

   //双击人物区域重绘
   dbClickDraw();
}

/*双击人物区域重绘*/
function dbClickDraw() {
   $('#drawBox').find('div').dblclick(function () {
      var x = this.offsetLeft;
      var y = this.offsetTop;
      getData(w_familyId,this.id,x,y,null);
   })
}

/*数组排序函数*/
function insertionSort(myArray,attr){
   // 未排序部分的当前位置,已排序部分的当前位置,临时变量
   var len = myArray.length,value,i,j,temp;
   for (i=0; i < len; i++){
      /*当已排序部分的当前元素大于value,就将当前元素向后移一位，再将前一位与value比较*/
      value = myArray[i];
      for (j = i-1; j > -1 && myArray[j][attr] > value[attr]; j--){
         temp = myArray[j+1] = myArray[j];
      }
      myArray[j+1] = value;
    }
    return myArray;
}

/*去数组里面相同项函数*/
function filter(arr){
   var a = [],
   o = {}, i, v,
   len = arr.length;
   if (len < 2) {
      return arr;
   }
   for (i = 0; i < len; i++){
      v = arr[i];
      if (o[v] !== 1){
         a.push(v);
         o[v] = 1;
      }
   }
   return a;
}

/*家谱拖动功能*/
function drag(e){
   var x,y,m;
   var o = document.getElementById("drawBox");
   var ob = document.getElementById('visibleBox');
   ob.onselectstart = function(){return false};
   ob.onmousedown = function(e){
      e = e||window.event;
      e.which = e.which||e.button;
      //鼠标坐标
      e.pageX = e.pageX||e.x;
      e.pageY = e.pageY||e.y;
      if(e.which == 1) {
         m = true;
         x = e.pageX - parseInt(o.offsetLeft);
         y = e.pageY - parseInt(o.offsetTop);
      }
   };
   document.onmousemove = function(e){
      e = e||window.event;
      e.which = e.which||e.button;
      e.pageX = e.pageX||e.x;

      e.pageY = e.pageY||e.y;
      if(m){
         //移动后的位置
        o.style.left = e.pageX - x + 'px';
        o.style.top = e.pageY - y + 'px';
      }
   };
   document.onmouseup = function(){ m = false; }
}

/*滚轮缩放大小功能*/
function roll(e){
   e = e || event;
   //兼容firefox鼠标滚动上下属性的值
   var detail=e.detail||parseInt(-e.wheelDelta/40);

   //按鼠标点为中心点进行缩放
   var o = document.getElementById("drawBox");
   var x = (e.pageX - o.offsetLeft - o.offsetWidth/2)*0.1 + o.offsetWidth*0.05;
   var y = (e.pageY - o.offsetTop - o.offsetHeight/2)*0.1 + o.offsetHeight*0.05;

   //缩放大小比值范围限定
   if (detail <= -3){
      w_rate+= 0.1;
      if(w_rate>1.6){
         w_rate = 1.6;
         return ;
      }
      o.style.left = parseInt(o.style.left) - x + 'px';
      o.style.top = parseInt(o.style.top) - y + 'px';
   }
   //向下滚
   else if (detail >= 3){
      w_rate-= 0.1;
      if(w_rate<0.7){
         w_rate = 0.7;
         return;
      }
      o.style.left = parseInt(o.style.left) + x + 'px';
      o.style.top = parseInt(o.style.top) + y + 'px';
   }
   //删除重绘图像
   del();
   ogicalRela(w_familyTreeData,w_familyId);
   drag();
}

/*兼容firefox绑定mousewheel事件*/
function mouseWheel(){
   document.getElementById('visibleBox').style.height = document.documentElement.clientHeight + 'px';
   var o = document.getElementById('visibleBox');
   (/firefox/i).test(navigator.userAgent)?o.addEventListener("DOMMouseScroll",roll,false):o.onmousewheel = roll
}

//删除节点重绘图像
function del(){
   var x,y;

   //删除原图像容器
   var o = document.getElementById("visibleBox");
   var c = document.getElementById("drawBox");
   x = c.offsetLeft;
   y = c.offsetTop;
   c.innerHTML = "";
   o.removeChild(c);
   c = null;

   //重新创建图像容器
   var newO = document.createElement('div');
   newO.id = 'drawBox';
   newO.innerHTML = '<canvas id="lineCanvas" width="1000" height="1000"></canvas>';
   o.appendChild(newO);
   newO.style.left = x + 'px';
   newO.style.top = y + 'px';
}

var isAgent = false; // 是否編修登录

var addFirstPerson = false;

var isPartner = false;

var editParentSex = null;

//重置清空表单数据
function resetForm(){
      w_imgChoose = false;
      addFirstPerson = false;
      $("#personInfo")[0].reset();
      $("#fatherid").val("");
      $("#motherid").val("");
      $("#partnerid").val("");
      $('#deathBox').hide();
      $('#idAreaBox').show();
      $("input[name=gender]").attr("disabled", false);
      $("#save").attr("disabled",false);
      $('input[name=orders]').attr('disabled', false);
      $('input[name=partnerOrder]').attr('disabled', false);
      $('#ranking').html('<em>*</em>兄妹排行：');
      $('#headTitle').html('添加完再编辑');
      $('#headEdit').find('img').unbind('click');
      $('#orders').show();
      $('#partnerOrder').hide();
      isPartner = false;
      $('#chooseParent').hide();
      $('#parentList').html('');
      editParentSex = null;
      //$("#idArea").citySelect({nodata:"hidden"});
      //$("#locationArea").citySelect({nodata:"hidden"});
      $("#counter").text($("#descPrintting").val().length);
}

//添加编辑公用逻辑
function init(){
   //是否在世
   $('input[name="isLiving"]').eq(1).click(function(){
      $('#deathBox').slideDown();
      $('#idAreaBox').slideUp();
   });

   $('input[name="isLiving"]').eq(0).click(function(){
      $('#deathBox').slideUp();
      $('#idAreaBox').slideDown();
      $(".idArea").attr("disabled", false);
   });

   //textarea计算剩下字符数
   $("#descPrintting").keyup(function(){
      $("#counter").text($("#descPrintting").val().length);
   });

   //鼠标放到头像上提示‘编辑’效果
   $('#headEdit').hover(
      function(){
         $('#headTitle').show();
      },
      function(){
         $('#headTitle').hide();
      }
   );

   //关闭添加关系层效果
   $('#closeA').click(function(){
      $('#addBox').hide();
      $('#coverShadow').hide();
   });

   //提交表单动画
   function saveAnimate(){
      $('#infoBox').stop(true,true);
      $('#infoBox').animate({
        right:"-50%"}, 500, function(){
        $('#coverShadow').hide();
        $('#infoBox').hide();
      });
   }

   //点击取消按钮资料不保存
   $('#cancel').click(function(){
      saveAnimate();
      $("#save").attr("disabled",false);
   });

   //点击确定按钮保存信息
   $('#save').click(function(){
      var f1,f4,f5;
      f1 = $('input[name=gender]').attr('disabled');
      f4 = $(".idArea").attr("disabled");
      f5 = $("input[name=isLiving]").attr("disabled");

      $('input[name=gender]').attr('disabled', false);
      $(".idArea").attr("disabled", false);
      $("input[name=isLiving]").attr("disabled", false);
      if($("input[name=isLiving]").get(0).checked == true){
         $("input[name=deathDate]").val('');
      }

      //提交重置disabled属性值
      function bool(f){
         return f = (f == 'disabled')? f:false;
      }
      function resetBool(){
         $('input[name=gender]').attr('disabled', bool(f1));
         $(".idArea").attr("disabled", bool(f4));
         $("input[name=isLiving]").attr("disabled", bool(f5));
         $("#save").attr("disabled",false);
      }

      if($('#firstname').val() == '' || $('#lastname').val() == ''){
         layer.alert('姓名必填');
         resetBool();
         return
      }
      if(isPartner == false){
         $('input[name=orders]').attr('disabled', false);
         $('input[name=partnerOrder]').attr('disabled', true);
         if($('#orders').val() == ''){
            layer.alert('排行必填');
            resetBool();
            return
         }
      }else{
         $('input[name=orders]').attr('disabled', true);
         $('input[name=partnerOrder]').attr('disabled', false);
         if($('#partnerOrder').val() == ''){
            layer.alert('配偶排行必填');
            resetBool();
            return
         }
      }
      // if($('birthday').val() == ''){
      //    layer.alert('生日必填 ！');
      //    resetBool();
      //    return
      // }
      // /*if($('#idAreaDist').val() == 0 || $('#idAreaDist').val() == null){
      //    layer.alert('请输入籍贯至少精确到区县 ！');
      //    resetBool();
      //    return
      // }*/
      // if($('#locationAreaDist').val() == 0 || $('#locationAreaDist').val() == null){
      //    layer.alert('请输入所在地至少精确到区县 ！');
      //    resetBool();
      //    return
      // }

      if(editParentSex){ //修改父母
         if(editParentSex == 1){
            $('#motherid').val($('#parentList').val());
         }else{
            $('#fatherid').val($('#parentList').val());
         }
      }

      if($("#save").attr("disabled") == "disabled" || $("#save").attr("disabled") == true) return;
      $("#save").attr("disabled",true);
      $.ajax({
         url : "index.php?s=/forum/index/addUser",
         data : $("#personInfo").serialize(),
         type : "post",
         success : function(json) {
            var data = $.parseJSON(json);
            if (data.status == 2 || data.status == 3) {
               layer.alert('姓名输入有误！');
               resetBool();
            } else if (data.status == 4) {
               layer.alert('排行输入有误！');
               resetBool();
            } else if (data.status == 0) {
               layer.alert('保存失败！');
               resetBool();
            } else if (data.status == 5) {
        layer.alert('对不起，您的账户余额不足，请<a href="/index.php?s=/recharge/index/recharge" target="_black" style="color:green">点此进入充值</a>！');
               resetBool();

            } else if (data.status == 6) {
               layer.alert('对不起，兄妹不能重名！');
               resetBool();
            } else {
               //重载用户新头像（暂时留着）
               saveAnimate();
               $('#firstPerson').hide();
               layer.alert('保存信息成功！');
               getData(w_familyId,data.user_id,null,null,true);
            }
         }
      })
   })
}

//编辑资料
function editInfo(uid){
   w_useId = uid;
   resetForm();
   //添加界面显示
   $('#coverShadow').show();
   $('#infoBox').show();
   $('#infoBox').animate({
          right: "0%"
      }, 500);
   getInfoForUser(uid);
   $('input[name="userId"]').val(uid);
}

// 修改是用于查询用户表单数据
function getInfoForUser(uid) {
   $.ajax({
      url : 'index.php?s=/forum/index/ajaxPerson',
      data : "userId=" + uid + "&family_id=" + w_familyId,
      type : "post",
      dataType : "json",
      success : function(data) {
         fillFormWithData(uid,data);
         $('#headEdit').find('img').click(function(){Agent.openUpload(uid)});
      }
   });
}

//选择父母公用函数
function gPartnerChange(parentWrap,item,itemParent,word){
   if(item.level != w_level){
      for(var i = 0;i < w_familyTreeData.length;i++){
         if(w_familyTreeData[i].userId == item.fatherId || w_familyTreeData[i].userId == item.motherId){
            if(w_familyTreeData[i].isForeiner == false){
               itemParent = w_familyTreeData[i];
               if(itemParent.gender == 0){
                  editParentSex = 0;
               }else{
                  editParentSex = 1;
               }
            }
         }
      }

      for(var i = 0;i < w_familyTreeData.length;i++){
         if(w_familyTreeData[i].partnerId == itemParent.userId){
            parentWrap.push(w_familyTreeData[i]);
            if(w_familyTreeData[i].userId == item.fatherId || w_familyTreeData[i].userId == item.motherId){
               $('#parentList').append('<option value="' + w_familyTreeData[i].userId + '" selected = "selected">' + w_familyTreeData[i].firstname + w_familyTreeData[i].lastname +'</option>');
            }else{
               $('#parentList').append('<option value="' + w_familyTreeData[i].userId + '">' + w_familyTreeData[i].firstname + w_familyTreeData[i].lastname +'</option>');

            }
         }
      }

      if(parentWrap.length >=1){
         $('#chooseParent').show();
         if(editParentSex == 0){
            $('#choosePTit').text(word + '父亲：');
         }else{
            $('#choosePTit').text(word + '母亲：');
         }
      }
   }
}

// 修改时填充用户表单
function fillFormWithData(uid,data) {
   if (data != null) {
      $("#firstname").val(data.firstname);
      $("#lastname").val(data.lastname);
      $("#gname").val(data.gname);
      $("#header").attr('src',w_baseImgUrl + data.head);
      $('input[name="type"]').val('10');
      $('input[name="family.id"]').val(w_familyId);
      $("#level").attr("disabled", true);
      $("#headTitle").html('编辑头像');

      //修改父母亲
      if(data.isForeiner == false){
         var parentWrap = [];
         var item = null;
         var itemParent = null;
         var word = '修改';
         parentWrap.length = 0;
         for(var i = 0;i < w_familyTreeData.length;i++){
            if(w_familyTreeData[i].userId == uid){
               item = w_familyTreeData[i];
            }
         }
         gPartnerChange(parentWrap,item,itemParent,word);
      }

      // 设置出生日期类型
      if (data.birthdatetype == "1") {
         $("input[name=birthdayType]").get(0).checked = true;
      } else {
         $("input[name=birthdayType]").get(1).checked = true;
      }

      // 设置逝世日期类型
      if (data.deathType == "1") {
         $("input[name=deathType]").get(0).checked = true;
      } else {
         $("input[name=deathType]").get(1).checked = true;
      }
      $("#birthday").val(data.birthday); // 设置出生日期
      $("#deathDate").val(data.deathDate); // 设置逝世日期赋值

      // 设置性别
      if (data.gender == 1) {
         $("input[name=gender]").get(0).checked = true;
      } else {
         $("input[name=gender]").get(1).checked = true;
      }
      // 根据是否在世选择不同表单
      if (data.isLiving == false) {
         $("#deathBox").show(); // 显示逝世日期
         $('#idAreaBox').hide();
         $("input[name=isLiving]").get(1).checked = true;
      } else {
         $("input[name=isLiving]").get(0).checked = true;
      }

      //是否是直系
      if(data.isForeiner == false){
            w_isForeiner = false;
            $("#orders").val(data.orders);
      }else{
            w_isForeiner = true;
            $('#ranking').html('<em>*</em>配偶排行：');
            $('#orders').hide();
            $('#partnerOrder').show();
            isPartner = true;
            $('#partnerOrder').val(data.partnerOrder);
       }

      // 设置籍贯地址
    // if(data.idAreaIdpath)
    // {
    //    var area = data.idAreaIdpath.split(",");
    //    $("#idArea").citySelect({prov:area[0], city:area[1], dist:area[2], nodata:"hidden"});
    // }

    //   // 设置所在地地址
    // if(data.locationAreaIdpath)
    // {
    //     var area_l = data.locationAreaIdpath.split(",");
    //     $("#locationArea").citySelect({prov:area_l[0], city:area_l[1], dist:area_l[2], nodata:"hidden"});
    // }

    //设置qq 邮箱 手机
      $('#email').val(data.email);
      $('#QQ').val(data.qq);
      $('#phonenumber').val(data.mobile);

      // 设置简介
      $("#descPrintting").val(data.descPritting);
      $("#counter").text($("#descPrintting").val().length);
   }
}


// 获得当前日期的字符串
function getDateString() {
   var dt = new Date();
   return dt.getFullYear() + "-" + intToString((dt.getMonth() + 1));
}

// 将数字转为字符串，小于10的前面补零
function intToString(num) {
   if (num < 10) {
      return "0" + num;
   } else {
      return num;
   }
}

//添加成员入口
function addMember(data,isF){
   resetForm();
   //添加界面显示
   $('#addBox').show();
   $('#coverShadow').show();

   //添加所有值初始化
   $('input[name="family.id"]').val(w_familyId);
   $("#userid").val(data.userId);
   $(".idArea").attr("disabled", false);
   $("#level").attr("disabled", false);

   //是否在世默认值
   $('input[name="isLiving"]').get(0).checked = true;

   //添加时选择父母
   var fLength = w_familyTreeData.length;
   function chooseParent(data,t){
      if(data.isForeiner == false){
         var parentWrap = [];
         var item = data;
         var itemParent = null;
         var word = '选择';
         parentWrap.length = 0;
         if(t){
            gPartnerChange(parentWrap,item,itemParent,word);
         }else{
            for(var i = 0;i < fLength;i++){
               if(w_familyTreeData[i].partnerId == data.userId){
                  parentWrap.push(w_familyTreeData[i]);
                  if(w_familyTreeData[i].userId == data.partnerid){
                     $('#parentList').append('<option value="' + w_familyTreeData[i].userId + '" selected = "selected">' + w_familyTreeData[i].firstname + w_familyTreeData[i].lastname +'</option>');
                  }else{
                     $('#parentList').append('<option value="' + w_familyTreeData[i].userId + '">' + w_familyTreeData[i].firstname + w_familyTreeData[i].lastname +'</option>');

                  }
               }
            }
            if(parentWrap.length >=1){
               $('#chooseParent').show();
               if(data.gender == 1){
                   editParentSex = 1;
                  $('#choosePTit').text('选择母亲：');
               }else{
                  editParentSex = 0;
                  $('#choosePTit').text('选择父亲：');
               }
            }
         }
      }
   }

   //判断能添加的关系
   $('#addBox .goosip-btn').each(function(i){
      $(this).unbind();//解除事件绑定；
      if(data == ''){
         $(this).addClass('disabled');
         if($(this).attr('rela') == '9'){
            $(this).removeClass('disabled');
         }
         return;
      }
      if(data.isForeiner == true){
         if($(this).attr('rela') == '7' || $(this).attr('rela') == '8'){
            $(this).removeClass('disabled');
         }else{
            $(this).addClass('disabled');
         }
         return;
      }else{
         $(this).removeClass('disabled');
         if($(this).attr('rela') == '9'){
            $(this).remove();
         }
          if(data.level == w_level){
            if($(this).attr('rela') == '3' || $(this).attr('rela') == '4'){
               $(this).addClass('disabled');
            }
         }
         if($(this).attr('class') == 'firstPerson'){
            $(this).addClass('disabled');
         }
         if(data.fatherId > 0 || data.motherId > 0){
            if($(this).attr('rela') == '1' || $(this).attr('rela') == '2'){
               $(this).addClass('disabled');
            }
         }
         if(data.gender == 1){
            if($(this).attr('rela') == '5'){
               $(this).addClass('disabled');
            }
         }else{
            if($(this).attr('rela') == '6'){
               $(this).addClass('disabled');
            }
         }
      }
   });


   //绑定个人信息编辑弹出层
   $('#addBox .goosip-btn').bind('click',function(){
      var type = parseInt($(this).attr('rela'));
      $('input[name="type"]').val(type);
      $('#infoBox').show();
      $('#addBox').hide();
      $('#infoBox').animate({
          right: "0%"
      }, 500);

      //判断是否家族内的
      if(type == 5 || type == 6 || type == 2){
         w_isForeiner = true;
      }else{
         w_isForeiner = false;
         if(type != 9){
            $("#firstname").val(data.firstname);
            if(isF == true){
               for(var i = 0;i<w_familyTreeData.length;i++){
                  if(w_familyTreeData[i].userId == data.partnerId){
                     $("#firstname").val(w_familyTreeData[i].firstname);
                  }
               }
            }
         }
      }

      //判断填充性别
      if($(this).attr('sex') == 'male'){
         $('#header').attr('src',w_baseImgUrl + 'imgs/man.jpg');
      }else{
         $('#header').attr('src',w_baseImgUrl + 'imgs/woman.jpg');
      }

      //添加第一个人
      if(type == 9){
         $('input[name="gender"]').attr('disabled',false);
         $("input[name=gender]").get(0).checked = true;
         $("#level").val(0);
         addFirstPerson = true;
         return;
      }

      //获取用户地址信息(籍贯地址可以重复用)
      $.ajax({
         url : 'index.php?s=/forum/index/ajaxPerson',
         data : "userId=" + data.userId + "&family_id=" + w_familyId,
         type : "post",
         dataType : "json",
         success : function(data) {
            if(data['idAreaIdpath'])
            {
               var area = data['idAreaIdpath'].split(",");
               //$("#idArea").citySelect({prov:area[0], city:area[1], dist:area[2], nodata:"hidden"});
            }
         }
      });

      //确定层级性别,及默认头像
      switch (type) {
         case 1: // 添加父亲
            $("input[name=gender]").get(0).checked = true;
            $("#level").val(data.level - 1);
            break;
         case 2: // 添加母亲
            $("input[name=gender]").get(1).checked = true;
            $("#level").val(data.level - 1);
            break;
         case 3:// 添加兄弟
            $("input[name=gender]").get(0).checked = true;
            $("#fatherid").val(data.fatherId);
            $("#motherid").val(data.motherId);
            $("#level").val(data.level);
            chooseParent(data,true);
            break;
         case 4: // 添加姐妹
            $("input[name=gender]").get(1).checked = true;
            $("#fatherid").val(data.fatherId);
            $("#motherid").val(data.motherId);
            $("#level").val(data.level);
            chooseParent(data,true);
            break;
         case 5: // 添加男配偶
            $("input[name=gender]").get(0).checked = true;
            $("#partnerid").val(data.userId);
            $("#level").val(data.level);
            $('#ranking').html('<em>*</em>配偶排行：');
            $('#orders').hide();
            $('#partnerOrder').show();
            isPartner = true;
            break;
         case 6: // 添加女配偶
            $("input[name=gender]").get(1).checked = true;
            $("#partnerid").val(data.userId);
            $("#level").val(data.level);
            $('#ranking').html('<em>*</em>配偶排行：');
            $('#orders').hide();
            $('#partnerOrder').show();
            isPartner = true;
            break;
         case 7: // 添加儿子
            $("input[name=gender]").get(0).checked = true;
            $("#level").val(data.level + 1);
            if (data.gender == 1) {
               $("#fatherid").val(data.userId);
               $("#motherid").val(data.partnerId);
            } else {
               $("#fatherid").val(data.partnerId);
               $("#motherid").val(data.userId);
            }
            chooseParent(data);
            break;
         case 8: // 添加女儿
            $("input[name=gender]").get(1).checked = true;
            $("#level").val(data.level + 1);
            if (data.gender == 1) {
               $("#fatherid").val(data.userId);
               $("#motherid").val(data.partnerId);
            } else {
               $("#fatherid").val(data.partnerId);
               $("#motherid").val(data.userId);
            }
            chooseParent(data);
            break;
      }
   })
}

//用户操作权限(暂时不需要)
function operating(data){

}

//删除用户
function deletePerson(data){
   $.ajax({
         type : "post",
         url : window.CP + "?m=Home_Family_EditTree&do=del_user",
         dataType : "json",
         data : {
            user_id: data.userId,
            family_id: w_familyId
         },
         success : function(data) {
            if(data.type == 101){
               layer.alert("该成员有其他关联，请先删除其他关联成员！");
               return;
            }
            if(data.type == 102){
               layer.alert("该成员不存在，请刷新！");
               return;
            }
            if(data.type == 104){
               layer.alert("用户创建超过一个月不能删除！");
               return;
            }
            if(data.type == 500){
               layer.alert("对不起，用户删除失败！");
               return;
            }
            if(data.userId){
               getData(w_familyId,data.userId,null,null,true);

            }else{
               getData(w_familyId,null,null,null,true);
               console.log("删除失败");
            }
         }
   });
}

function getText(obj) {
   return  obj = !obj ? '': obj;
}

//初始化用户查询模块
function initSearchPerson() {
   //搜索用户绑定
   $('#search_input').keyup(function(){
        searchPerson($(this).val());
    });
    $('#search_btn').click(function(){
        searchPerson($('#search_input').val());
    });
}

//搜索用户
function searchPerson(name){
    if(name) {
        $.ajax({
            url: "index.php?s=/forum/index/searchPerson",
            type: 'post',
            dataType: 'json',
            data: {
                name: name,
                family_id: w_familyId
            },
            success: function (json) {
                //组织下拉列表
                if(json.length > 0){
                    var select_html = '';
                    $.each(json, function (i, info) {
                       var $sex_class = info.sex == '男' ? 'male' : 'female';
                       select_html += '<li class="' + $sex_class + '" rel="' + info.id + '" s_name="' + info.name + '" style="cursor:pointer;">';
                       select_html += '<div class="oh"><h3>' + info.name + '</h3> <span>' + info.sex + '</span><p>字辈：' + info.gname + '</p></div>';
                       select_html += '<p>所在地: ' +info.location_tip+ ' </p></li>';
                    });
                    $('#search-result').show().find('ul').html(select_html);
                } else {
                    $('#search-result').show().find('ul').html('<li>查无此人</li>');
                }
               //绑定事件
               $('#search_result_list').find('li').bind('click', function(){
                    $('#search-result').hide();
                    $('#search_input').val($(this).attr('s_name'));
                    getData(w_familyId,$(this).attr('rel'),null,null,true);
                });
            }
        });
    } else {
       $('#search-result').hide();
    }
}
//加载家族数据
function getData(fId,uId,x,y,t){
   $.ajax({
    url:"index.php?s=/forum/index/forums",
    type: 'post',
    dataType: 'json',
    data: {
      show_mod: w_showMod,
      family_id: fId,
      userId: uId
    },
    success: function(data) {
      del();
      ogicalRela(data,fId,uId,x,y,t);
      drag();
    }
   })
}

//事件绑定
if(w_showMod == 'edit') {
   window.addEventListener('load',init,false);
}
if(w_showMod == 'edit' || w_showMod == 'show_more') {
   window.addEventListener('load',mouseWheel,false);
   window.addEventListener('load',initSearchPerson,false);
}

