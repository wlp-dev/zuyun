<?php

/**
 * 所属项目 WPYCMS.
 * 开发者: 神秘人
 * 创建日期: 3/25/14
 * 创建时间: 9:27 AM
 * 版权所有 优秀开发团队(www.testzy.com)
 */

/**
 * @param $content
 * @return mixed
 */
function match_users($content)
{
    $user_pattern = "/\@([^\#|\s]+)\s/"; //匹配用户
    preg_match_all($user_pattern, $content, $user_math);
    return $user_math;
}