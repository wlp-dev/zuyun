<?php
/**
 * 所属项目 110.
 * 开发者: 陈一枭
 * 创建日期: 2014-11-18
 * 创建时间: 10:14
 * 版权所有 优秀开发团队(www.testzy.com)
 */

return array(
    //模块名
    'name' => 'Ucenter',
    //别名
    'alias' => '用户中心',
    //版本号
    'version' => '2.0.0',
    //是否商业模块,1是，0，否
    'is_com' => 0,
    //是否显示在导航栏内？  1是，0否
    'show_nav' => 1,
    //模块描述
    'summary' => '用户中心模块，系统核心模块',
    //开发者
    'developer' => '优秀开发团队',
    //开发者网站
    'website' => 'http://www.testzy.com',
    //前台入口，可用U函数
    'entry' => 'Ucenter/index/index',

   'admin_entry' => 'Admin/User/index',

    'icon'=>'user',

    'can_uninstall' => 0
);