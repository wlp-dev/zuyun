<?php


namespace Event\Controller;

use Think\Controller;

class IndexController extends Controller
{
    public function _initialize()
    {
        $tree = D('EventType')->where(array('status' => 1))->select();
        $this->assign('tree', $tree);

        $sub_menu =
            array(
                'left' =>
                    array(
                        array('tab' => 'myevent', 'title' => L('_MY_EVENT_'), 'href' => U('event/index/myevent')),
                        array('tab' => 'home', 'title' => L('_INDEX_'), 'href' => U('event/index/index')),
                    ),
            );
        $this->assign('sub_menu', $sub_menu);
        $this->assign('current', 'home');
    }

    /**
     * 活动首页
     * @param int $page
     * @param int $type_id
     * @param string $norh
     * autor:xjw129xjt
     */
    public function index($page = 1, $norh = 'new')
    {
        $map['type_id'] = 1;
        $map['status'] = 1;
        $order = 'create_time desc';
        $norh == 'hot' && $order = 'signCount desc';
        $content = D('Event')->where($map)->order($order)->page($page, 10)->select();

        $totalCount = D('Event')->where($map)->count();
        foreach ($content as &$v) {
            $v['user'] = query_user(array('id', 'username', 'nickname', 'space_url', 'space_link', 'avatar128', 'rank_html'), $v['uid']);
            $v['type'] = $this->getType($v['type_id']);
            $v['check_isSign'] = D('event_attend')->where(array('uid' => is_login(), 'event_id' => $v['id']))->select();
        }
        unset($v);
        $this->assign('type_id', $type_id);
        $this->assign('contents', $content);
        $this->assign('norh', $norh);
        $this->assign('totalPageCount', $totalCount);
        $this->getRecommend();
        $this->setTitle(L('_EVENT_HOME_PAGE_'));
        $this->setKeywords(L('_EVENT_'));
        $this->display();
    }


    public function kin()
    {
        if (IS_GET){
            $family_id = I('id');
            $post = M('event')->find($family_id);
            $titleTree = (string)$post['title'];
            $map = array(
                'family_id' => $family_id,  
                'foreiner' => 0
            );
            $userList = M("family_tree")->where($map)->order('level')->select();
            $level = $userList[0]['level']-1;
            foreach($userList as $user)
            {

                $ret[] = array(
                    "id" => $user['id'],
                    'level' =>num_r((string)($user['level']-$level)),
                    "order" => num_r($user['order']),
                    'name' => $user['name'],
                    'gname' => $user['gname'],
                    'code' => base64_encode($user['id']),
                    'user' => $user['uid']?query_user(array('id', 'username', 'nickname', 'space_url', 'space_link', 'avatar128', 'rank_html'), $user['uid']):'',
                    //'spouse' => get_spouse($user['id']),
                    'sex' => $user['sex'] == 1?'男':'女'

                    
                );
            }
            $this->assign('titleTree', $titleTree);
            $this->assign('userList', $ret);
            $this->display();
        }else{
             $this->error('非法请求');
        }
        
        
    }

    public function avatar()
    {
        $userId = I('userId');
        $this->assign('userId', $userId);
        $this->display();
        
    }

    public function avatarUp()
    {
        if (IS_POST){
            return $userId;
        }
    }

    

    /**
     * 获取推荐活动数据
     * autor:xjw129xjt
     */
    public function getRecommend()
    {
        $rec_event = D('Event')->where(array('is_recommend' => 1))->limit(2)->order('rand()')->select();
        foreach ($rec_event as &$v) {
            $v['user'] = query_user(array('id', 'username', 'nickname', 'space_url', 'space_link', 'avatar128', 'rank_html'), $v['uid']);
            $v['type'] = $this->getType($v['type_id']);
            $v['check_isSign'] = D('event_attend')->where(array('uid' => is_login(), 'event_id' => $v['id']))->select();
        }
        unset($v);

        $this->assign('rec_event', $rec_event);
    }

    /**
     * 我的活动页面
     * @param int $page
     * @param int $type_id
     * @param string $norh
     * autor:xjw129xjt
     */
    public function myevent($page = 1, $type_id = 1, $lora = '')
    {
		if (get_login_role()==1) {
            $this->error(L('普通用户不能创建族谱'));
        }
        $map['type_id'] = 1;
        $map['status'] = 1;
        $order = 'create_time desc';
        if ($lora == 'attend') {
            $attend = D('event_attend')->where(array('uid' => is_login()))->select();
            $enentids = getSubByKey($attend, 'event_id');
            $map['id'] = array('in', $enentids);
        } else {
            $map['uid'] = is_login();
        }
        $content = D('Event')->where($map)->order($order)->page($page, 10)->select();

        $totalCount = D('Event')->where($map)->count();
        foreach ($content as &$v) {
            $v['user'] = query_user(array('id', 'username', 'nickname', 'space_url', 'space_link', 'avatar128', 'rank_html'), $v['uid']);
            $v['type'] = $this->getType($v['type_id']);

            $v['check_isSign'] = D('event_attend')->where(array('uid' => is_login(), 'event_id' => $v['id']))->select();
        }
        unset($v);
        $this->assign('type_id', $type_id);
        $this->assign('contents', $content);
        $this->assign('lora', $lora);
        $this->assign('totalPageCount', $totalCount);
        $this->getRecommend();
        $this->setTitle(L('_MY_EVENT_').L('_DASH_').L('_MODULE_'));
        $this->assign('current', 'myevent');
        $this->display();
    }

    /**
     * 获取活动类型
     * @param $type_id
     * @return mixed
     * autor:xjw129xjt
     */
    private function getType($type_id)
    {
        $type = D('EventType')->where('id=' . $type_id)->find();
        return $type;
    }

    /**
     * 发布活动
     * @param int $id
     * @param int $cover_id
     * @param string $title
     * @param string $explain
     * @param string $sTime
     * @param string $eTime
     * @param string $address
     * @param int $limitCount
     * @param string $deadline
     * autor:xjw129xjt
     */
    public function doPost($id = 0, $cover_id = 0, $title = '', $explain = '', $sTime = '', $eTime = '', $address = '', $limitCount = 0, $deadline = '', $type_id = 0)
    {
        if (!is_login()) {
            $this->error(L('_ERROR_LOGIN_'));
        }
        if (!$cover_id) {
            $this->error(L('_ERROR_COVER_'));
        }
        if (trim(op_t($title)) == '') {
            $this->error(L('_ERROR_TITLE_'));
        }
        if ($type_id == 0) {
            $this->error(L('_ERROR_CATEGORY_'));
        }
        if (trim(op_h($explain)) == '') {
            $this->error(L('_ERROR_CONTENT_'));
        }
        if (trim(op_h($address)) == '') {
            $this->error(L('_ERROR_SITE_'));
        }
        // if ($eTime < $deadline) {
        //     $this->error(L('_ERROR_TIME_DEADLINE_'));
        // }
        // if ($deadline == '') {
        //     $this->error(L('_ERROR_DEADLINE_'));
        // }
        // if ($sTime > $eTime) {
        //     $this->error(L('_ERROR_TIME_START_'));
        // }
        $content = D('Event')->create();
        $content['explain'] = filter_content($content['explain']);
        $content['title'] = op_t($content['title']);
        $content['sponsor'] = $content['sponsor'];//发起人
        $content['sTime'] = $content['sTime'];
        $content['eTime'] = $content['eTime'];
        //$content['deadline'] = $content['deadline'];
        $content['type_id'] = intval($type_id);
        if ($id) {
            $content_temp = D('Event')->find($id);
            $this->checkAuth('Event/Index/edit', $content_temp['uid'], L('_INFO_EVENT_EDIT_LIMIT_'));
            $this->checkActionLimit('add_event', 'event', $id, is_login(), true);
            $content['uid'] = $content_temp['uid']; //权限矫正，防止被改为管理员
            $rs = D('Event')->save($content);
            if (D('Common/Module')->isInstalled('Weibo')) { //安装了微博模块
                $postUrl = "http://$_SERVER[HTTP_HOST]" . U('Event/Index/detail', array('id' => $id));
                $weiboModel = D('Weibo/Weibo');
                $weiboModel->addWeibo(L('_EVENT_CHANGED_')."【" . $title . "】：" . $postUrl);
            }
            if ($rs) {
                action_log('add_event', 'event', $id, is_login());
                $this->success(L('_SUCCESS_DELETE_').L('_EXCLAMATION_'), U('detail', array('id' => $content['id'])));
            } else {
                $this->error(L('_ERROR_OPERATION_FAIL_').L('_EXCLAMATION_'),'');
            }
        } else {
            $this->checkAuth('Event/Index/add', -1, L('_EVENT_PRIORITY_START_NOT_').L('_EXCLAMATION_'));
            $this->checkActionLimit('add_event', 'event', 0, is_login(), true);
            if (modC('NEED_VERIFY', 0) && !is_administrator()) //需要审核且不是管理员
            {
                $content['status'] = 2;
                $tip = L('_PLEASE_WAIT_').L('_PERIOD_');
                $user = query_user(array('username', 'nickname'), is_login());
                D('Common/Message')->sendMessage(explode(',', C('USER_ADMINISTRATOR')), $title = L('_EVENT_SPONSOR_1_'), "{$user['nickname']}".L('_EVENT_SPONSOR_2_'), 'Admin/Event/verify', array(), is_login(), 2);
            }

            $content['attentionCount'] = 1;
            $content['signCount'] = 1;
            $rs = D('Event')->add($content);


            $data['uid'] = is_login();
            $data['event_id'] = $rs;
            $data['create_time'] = time();
            $data['status'] = 1;
            D('event_attend')->add($data);


            if (D('Common/Module')->isInstalled('Weibo')) { //安装了微博模块
                //同步到微博
                $postUrl = "http://$_SERVER[HTTP_HOST]" . U('Event/Index/detail', array('id' => $rs));

                $weiboModel = D('Weibo/Weibo');
                $weiboModel->addWeibo(L('_EVENT_I_SPONSOR_')."【" . $title . "】：" . $postUrl);
            }

            if ($rs) {
                action_log('add_event', 'event', $rs, is_login());
                $this->success(L('_SUCCESS_POST_').L('_EXCLAMATION_'). $tip, U('Event/Index/detail', array('id' => $rs)));
            } else {
                $this->error(L('_ERROR_OPERATION_FAIL_').L('_EXCLAMATION_'));
            }

        }
    }

    /**
     * 活动详情
     * @param int $id
     * autor:xjw129xjt
     */

    public function detail()
    {
        $family_id = I('id'); 
        $post = M('event')->find($family_id);
        $title = $post['title'];
        $people_id = M("family_tree")->where(array('family_id' => $family_id))->find();
        $user_id = $people_id['id']?$people_id['id']:0;
        $this->assign('family_id',$family_id);
        $this->assign('user_id',$user_id);
        $this->assign('title',$title);
        $this->display();
    }

    public function ebook()
    {
        $family_id = I('id'); 
        $map = array(
            'family_id' => $family_id,  
            'foreiner' => 0
        );
        $arrTemp = M("family_tree")->where($map)->order('level')->select();
        $level = $arrTemp[0]['level']-1;
        foreach($arrTemp as $user)
        {

            $arr[] = array(
                "id" => $user['id'],
                'level' =>num_r((string)($user['level']-$level)),
                "order" => num_r($user['order']),
                'name' => $user['name'],
                'gname' => $user['gname'],
                'last_name' => $user['last_name'],
                'spouse' => ebook_spouse($user['id']),
                'sex' => $user['sex'] == 1?'子':'女'

                
            );
        }
        $userList=array();
        $i=0;
        $c=0;
        foreach($arr as $team1){
            $userList[$i][$c] = $team1;
            $c++;

            if($c==5){

                $i++;

                $c=0;

            }
        }
        $post = M('event')->find($family_id);
        $title = $post['title'];
        $people_id = M("family_tree")->where(array('family_id' => $family_id))->find();
        $user_id = $people_id['id']?$people_id['id']:0;
        $this->assign('userList',$userList);
        $this->assign('family_id',$family_id);
        $this->assign('user_id',$user_id);
        $this->assign('title',$title);
        $this->assign('count',$count);
        $this->display();
    }

    /**
     * 活动成员
     * @param int $id
     * @param string $tip
     * autor:xjw129xjt
     */



    public function tree()
    {
        if (IS_POST){
            $family_id = I('id');
            $map = array(
                'family_id' => $family_id,  
                'foreiner' => 0
            );
            $userList = M("family_tree")->where($map)->select();

            foreach($userList as $user)
            {
                $ret[] = array(
                    "id" => $user['id'],
                    "pId" => $user['pid'],
                    'name' => $user['name'].get_spouse($user['id']),
                    'icon' => getUserIcon($user['sex'])
                    
                );
            }
            if (sizeof($ret)>0) {
                $this->ajaxReturn($ret);
            }
            else{
                
                $this->ajaxReturn(array());
            }
        }else{
             $this->error('非法请求');
        }
    }

    public function member()
    {
        if (IS_POST){
            if (I('userId')==0) {
                $this->ajaxReturn(array());
                exit();
            }
            $userList1 =array();
            $userList2 =array();
            $userList3 =array();
            $userList4 =array();
            $userId2 = I('userId');
            $people2 = M("family_tree")->find($userId2);
            if ($people2['foreiner']) {
                $userId = $people2['partner_id'];
                $people = M("family_tree")->find($userId);
                
            }else{
                $userId = $userId2;
                $people = M("family_tree")->find($userId);
            }
            $level = $people['level'];
            $family_id = $people['family_id'];
            $map = array(
                'family_id' => $family_id,
                'foreiner'  => flase,
                'id'   =>  $people['pid']
            );
            $map2 = array(
                'family_id' => $family_id,
                'foreiner'  => flase,  
                'pid'   =>  $people['pid']
            );

            $map3 = array(
                'family_id' => $family_id, 
                'foreiner'  => flase, 
                'pid'   =>  $userId
            );
            if ($people['pid']) {
                $userList1 = M("family_tree")->where($map)->select();
            }
            
            $userList2 = M("family_tree")->where($map2)->select();
            $userList3 = M("family_tree")->where($map3)->select();
        
            $user = array_merge((array)$userList1, (array)$userList2, (array)$userList3);

            foreach ($user as $key=>$value) {
                if ($key == 0) {
                    $partners = $value['id'];
                }else{
                    $partners = $value['id'].','.$partners;
                }
            }

            $map4 = array(
                'family_id' => $family_id,
                'foreiner'  => true,  
                'partner_id'   =>   array('in',$partners)
            );

            $userList4 = M("family_tree")->where($map4)->select();
            $userList = array_merge((array)$user, (array)$userList4);
            
            foreach($userList as $user)
            {
                $ret[] = array(
                    //"createTime" =>  getDateStr($user['reg_time']),
                    "fatherId" => (int)$user['father_id'],
                    "firstname" => $user['first_name'],
                    "gender" => (int)$user['sex'],
                    "gname" => $user['gname'],
                    "head" => $user['img']?getImg($user['img']):getUserPic($user['sex']),
                    //"head_big" => Home_User_Helper::getUserPic($user['id'], 'big', $user['sex']),
                    "isForeiner" =>(bool)$user['foreiner'],
                    "isMarry" => (int)$user['is_marry'],
                    "isliving" => (int)$user['is_live'],
                    "lastname" => $user['last_name'],
                    "level" => (int)$user['level'],
                    "motherId" => (int)$user['mother_id'],
                    "orders" => (int)$user['order'],
                    "partnerId" =>  (int)$user['partner_id'],
                    "partnerOrder" => (int)$user['partner_order'],
                    //"submitTime" => '',
                    "userId" => $user['id']
                );
            }
            if (sizeof($ret)>0) {
                $this->ajaxReturn($ret);
            }
            else{
                
                $this->ajaxReturn(array());
            }
        }else{
             $this->error('非法请求');
        }
    }

    /**
     * 编辑活动
     * @param $id
     * autor:xjw129xjt
     */
    public function edit($id)
    {
        $event_content = D('Event')->where(array('status' => 1, 'id' => $id))->find();
        if (!$event_content) {
            $this->error('404 not found');
        }
        $this->checkAuth('Event/Index/edit', $event_content['uid'], L('_INFO_EVENT_EDIT_LIMIT_').L('_EXCLAMATION_'));
        $event_content['user'] = query_user(array('id', 'username', 'nickname', 'space_url', 'space_link', 'avatar64', 'rank_html', 'signature'), $event_content['uid']);
        $this->assign('content', $event_content);
        $this->setTitle(L('_EVENT_EDIT_') . L('_DASH_').L('_MODULE_'));
        $this->setKeywords(L('_EDIT_') . L('_COMMA_').L('_MODULE_'));
        $this->display();
    }

    /**
     * 添加用户
     */
    function addUser(){
        $mapUserId = is_login();
		$Umap['uid'] = $mapUserId;
        $addUser = M("member")->where($Umap)->find();
        if ($addUser['score4']>9) {
            $user      = array();
            $type          = I('type');
            $partner_id    = I('partner_id');
            $partner_order = I('partnerOrder');
            $user_id = I('userId');//所点击节点用户ID
            $ret = array('id'=> null, 'user_id'=>$user_id, 'status' => 99);
            $user['family_id']     = (int)I('family_id');
            $user['level']     = (int)I('level');
            $user['birthdate_type'] = I('birthdayType');
            $user['birthdate'] = I('birthday');
            $user['deathdate_type'] = I('deathType');
            $user['deathdate'] = I('deathDate');
            $user['summary'] = I('descPrintting');
            $user['first_name'] = I('firstname');
            $user['last_name'] = I('lastname');
            $user['partner_id'] = I('partner_id');
            $user['name'] = I('firstname').I('lastname');
            $user['gname']     = I('gname');
            $user['img']     = I('imgId');
            $user['is_live']     = I('isLiving');
            $user['sex'] = I('gender');
            
            
            // $user['family_id'] = I('family.id');
            // $user['father_id'] = I('father.id');
            // $user['mother_id'] = I('mother.id');
            switch($type)
            {
                case 10: //修改
                    $user10['id'] = $user_id;
                    $user10['birthdate_type'] = I('birthdayType');
                    $user10['birthdate'] = I('birthday');
                    $user10['deathdate_type'] = I('deathType');
                    $user10['deathdate'] = I('deathDate');
                    $user10['summary'] = I('descPrintting');
                    $user10['first_name'] = I('firstname');
                    $user10['last_name'] = I('lastname');
                    $user10['name'] = I('firstname').I('lastname');
                    $user10['gname']     = I('gname');
                    $user10['is_live']     = I('isLiving');
                    $user10['sex'] = I('gender');
                    $user10['img']     = I('imgId');
                    if (I('mother_id')) {
                        $user10['mother_id'] = I('mother_id');
                    }
                    if (I('father_id')) {
                        $user10['father_id'] = I('father_id');
                    }

                    
                    M('family_tree')->save($user10);
                    M("member")->where('uid='.$mapUserId)->setDec('score4',10);
                    break;
                case 9: //第一人
                    $lastId=M('family_tree')->add($user);
					M("member")->where('uid='.$mapUserId)->setDec('score4',10);
                    $ret['user_id'] = $lastId;
                    break;
                case ($type == 5 || $type == 6): //配偶
                    
                    $user['foreiner']     = 1;
                    M('family_tree')->add($user);
                    M("member")->where('uid='.$mapUserId)->setDec('score4',10);
                    
                    break;
                case ($type == 7 || $type == 8): //儿子女儿

                    $user['father_id'] = I('father_id');
                    $user['mother_id'] = I('mother_id');
                    if ($user['father_id'] && !$user['mother_id']) {
                        $user['pid'] = I('father_id');
                    }elseif (!$user['father_id'] && $user['mother_id']) {
                        $user['pid'] = I('mother_id');
                    }else{
                        $ifo = M('family_tree')->find($user['father_id']);
                        if ($ifo['foreiner']) {
                            $user['pid'] = I('mother_id');
                        }else{
                            $user['pid'] = I('father_id');
                        }
                    }
                    M('family_tree')->add($user);
                    M("member")->where('uid='.$mapUserId)->setDec('score4',10);
                    break;
                case ($type == 3 || $type == 4): //兄弟姐妹
                    $user['father_id'] = I('father_id');
                    $user['mother_id'] = I('mother_id');
                    $butUser=M('family_tree')->find($user_id);
                    $user['pid'] = $butUser['pid'];
                    M('family_tree')->add($user);
                    M("member")->where('uid='.$mapUserId)->setDec('score4',10);
                    break;
                case ($type == 1 || $type == 2): //父母
                    $last_id=M('family_tree')->add($user);
                    $saveData['id'] = $user_id;
                    $saveData['pid'] = $last_id;
                    if($type == 1)
                    {
                        $saveData['father_id'] = $last_id;
                        M('family_tree')->save($saveData);
                        M("member")->where('uid='.$mapUserId)->setDec('score4',10);
                    } else {
                        $saveData['mother_id'] = $last_id;
                        M('family_tree')->save($saveData);
                        M("member")->where('uid='.$mapUserId)->setDec('score4',10);
                       
                    }

                    break;
            };
        }else {
            $ret = array('id'=> null, 'user_id'=>$user_id, 'status' => 5);
        }


        
        exit(json_encode($ret));
        
        
    }


    function delUser(){
        
        $ret = array('type' => 100);
        $user_id = I('user_id');
        $user_info = M("family_tree")->find($user_id);

        if(!$user_info['id'])
        {
            $this->ajaxReturn(array('type' => 102));
            exit();
        }
        // if((time() - $user_info['reg_time']) > 31*86400){
        //     $this->ajaxReturn(array('type' => 103));
        //     exit();
        // }
        if (!$user_info['foreiner']) {
            $son = M("family_tree")->where(array('pid' => $user_id ))->select();

            if(count($son)>0){
                $this->ajaxReturn(array('type' => 101));
                exit();
            }
        }
        if ($user_info['foreiner'] && $user_info['sex']) {
            $son = M("family_tree")->where(array('father_id' => $user_id ))->select();

            if(count($son)>0){
                $this->ajaxReturn(array('type' => 101));
                exit();
            }
        }

        if ($user_info['foreiner'] && !$user_info['sex']) {
            $son = M("family_tree")->where(array('mother_id' => $user_id ))->select();

            if(count($son)>0){
                $this->ajaxReturn(array('type' => 101));
                exit();
            }
        }
        $ret['userId'] =$user_info['pid'];
        M("family_tree")->where('id='. $user_id)->delete();
        $this->ajaxReturn($ret);
        
    }

    public function ajaxPerson(){
        $userId = I('userId'); 
        $user = M("family_tree")->find($userId);
        $ret = array(
            "fatherId" => (int)$user['father_id'],
            "firstname" => $user['first_name'],
            "gender" => (int)$user['sex'],
            "gname" => $user['gname'],
            "head" => $user['img']?getImg($user['img']):getUserPic($user['sex']),
            "imgId" => $user['img'],
            //"head_big" => Home_User_Helper::getUserPic($user['id'], 'big', $user['sex']),
            "isForeiner" =>(bool)$user['foreiner'],
            "isMarry" => (int)$user['is_marry'],
            "isliving" => (int)$user['is_live'],
            "lastname" => $user['last_name'],
            "level" => (int)$user['level'],
            "motherId" => (int)$user['mother_id'],
            "orders" => (int)$user['order'],
            "partnerId" =>  (int)$user['partner_id'],
            "partnerOrder" => (int)$user['partner_order'],
            "userId" => $user['id']
        );
        exit(json_encode($ret));

    }       

    public function searchPerson(){ 
        $name = I('name');
        $family_id = I('family_id');
        $where['name'] = array('like','%'.$name.'%');//封装模糊查询 赋值到数组  
        $where['family_id'] = $family_id;
        $person = M("family_tree")->where($where)->limit(10)->select();

        foreach($person as $user)
        {
            $ret[] = array(
                "name" => $user['first_name'].$user['last_name'],
                "sex" => (int)$user['sex']?'男':'女',
                "gname" => $user['gname'],
                "is_live" => (int)$user['is_live'],
                "location_tip" => $user['location_tip'],
                "location" => (int)$user['location'],
                "id" => $user['id']
            );
        }
        if (sizeof($ret)>0) {
            exit(json_encode($ret));
        }else{
            $this->ajaxReturn(array());
        }
        
    } 

    public function add()
    {
        $this->checkAuth('Event/Index/add', -1, L('_EVENT_PRIORITY_START_NOT_').L('_PERIOD_'));
        $this->setTitle(L('_EVENT_ADD_') . L('_DASH_').L('_MODULE_'));
        $this->setKeywords(L('_MODULE_') . L('_COMMA_').L('_MODULE_'));
        $this->display();
    }

    /**
     * 报名参加活动
     * @param $event_id
     * @param $name
     * @param $phone
     * autor:xjw129xjt
     */
    public function doSign($event_id, $name, $phone)
    {
        if (!is_login()) {
            $this->error(L('_ERROR_REGISTER_AFTER_LOGIN_').L('_PERIOD_'));
        }
        if (!$event_id) {
            $this->error(L('_ERROR_PARAM_').L('_PERIOD_'));
        }
        if (trim(op_t($name)) == '') {
            $this->error(L('_ERROR_NAME_').L('_PERIOD_'));
        }
        if (trim($phone) == '') {
            $this->error(L('_ERROR_PHONE_').L('_PERIOD_'));
        }
        $check = D('event_attend')->where(array('uid' => is_login(), 'event_id' => $event_id))->select();
        $event_content = D('Event')->where(array('status' => 1, 'id' => $event_id))->find();
        $this->checkAuth('Event/Index/doSign', $event_content['uid'], L('_INFO_LIMIT_').L('_EXCLAMATION_'));
        $this->checkActionLimit('event_do_sign', 'event', $event_id, is_login());
        if (!$event_content) {
            $this->error(L('_EVENT_NOT_EXIST_').L('_EXCLAMATION_'));
        }
        /*      if ($event_content['attentionCount'] + 1 > $event_content['limitCount']) {
                  $this->error('超过限制人数，报名失败');
              }*/
        // if (time() > $event_content['deadline']) {
        //     $this->error(L('_REGISTRATION_HAS_OVER_'));
        // }
        if (!$check) {
            $data['uid'] = is_login();
            $data['event_id'] = $event_id;
            $data['name'] = $name;
            $data['phone'] = $phone;
            $data['create_time'] = time();
            $res = D('event_attend')->add($data);
            if ($res) {
                D('Message')->sendMessageWithoutCheckSelf($event_content['uid'], L('_TOAST_SIGN_1_'), get_nickname(is_login()) . L('_TOAST_SIGN_2_') . $event_content['title'] . L('_TOAST_SIGN_3_'), 'Event/Index/member', array('id' => $event_id));

                D('Event')->where(array('id' => $event_id))->setInc('signCount');
                action_log('event_do_sign', 'event', $event_id, is_login());
                $this->success(L('_SUCCESS_SIGN_').L('_PERIOD_'), 'refresh');
            } else {
                $this->error(L('_FAIL_SIGN_').L('_PERIOD_'), '');
            }
        } else {
            $this->error(L('_SIGN_ED_').L('_PERIOD_'), '');
        }
    }

    /**
     * 审核
     * @param $uid
     * @param $event_id
     * @param $tip
     * autor:xjw129xjt
     */
    public function shenhe($uid, $event_id, $tip)
    {
        $event_content = D('Event')->where(array('status' => 1, 'id' => $event_id))->find();
        if (!$event_content || $event_content['deadline'] < time()) {
            $this->error(L('_LIMIT_YOU_AUDIT_NOT_').L('_EXCLAMATION_'));
        }
        $this->checkAuth('Event/Index/shenhe', $event_content['uid'], L('_EVENT_NOT_EXIST_OR_OVER_').L('_EXCLAMATION_'));
        $res = D('event_attend')->where(array('uid' => $uid, 'event_id' => $event_id))->setField('status', $tip);
        if ($tip) {
            if ($event_content['attentionCount'] + 1 == $event_content['limitCount']) {
                $data['deadline'] = time();
                $data['attentionCount'] = $event_content['limitCount'];
                D('Event')->where(array('id' => $event_id))->setField($data);
            } else {
                D('Event')->where(array('id' => $event_id))->setInc('attentionCount');
            }
            D('Message')->sendMessageWithoutCheckSelf($uid, L('_MESSAGE_AUDIT_APPLY_1_'), get_nickname( is_login()) . L('_MESSAGE_AUDIT_APPLY_2_') . $event_content['title'] . L('_MESSAGE_AUDIT_APPLY_3_'), 'Event/Index/detail', array('id' => $event_id));
        } else {
            D('Event')->where(array('id' => $event_id))->setDec('attentionCount');
            D('Message')->sendMessageWithoutCheckSelf($uid, L('_MESSAGE_AUDIT_CANCEL_1_'), get_nickname( is_login()) . L('_MESSAGE_AUDIT_CANCEL_2_') . $event_content['title'] . L('_MESSAGE_AUDIT_CANCEL_3_'), 'Event/Index/member', array('id' => $event_id));
        }
        if ($res) {
            $this->success(L('_SUCCESS_DELETE_').L('_EXCLAMATION_'));
        } else {
            $this->error(L('_ERROR_OPERATION_FAIL_').L('_EXCLAMATION_'));
        }
    }

    /**
     * 取消报名
     * @param $event_id
     * autor:xjw129xjt
     */
    public function unSign($event_id)
    {

        $event_content = D('Event')->where(array('status' => 1, 'id' => $event_id))->find();
        if (!$event_content) {
            $this->error(L('_EVENT_NOT_EXIST_').L('_EXCLAMATION_'));
        }

        $check = D('event_attend')->where(array('uid' => is_login(), 'event_id' => $event_id))->find();

        $res = D('event_attend')->where(array('uid' => is_login(), 'event_id' => $event_id))->delete();
        if ($res) {
            if ($check['status']) {
                D('Event')->where(array('id' => $event_id))->setDec('attentionCount');
            }
            D('Event')->where(array('id' => $event_id))->setDec('signCount');

            D('Message')->sendMessageWithoutCheckSelf($event_content['uid'], L('_TOAST_CANCEL_1_'), get_nickname(is_login()) . L('_TOAST_CANCEL_2_') . $event_content['title'] . L('_TOAST_CANCEL_3_'), 'Event/Index/detail', array('id' => $event_id));

            $this->success(L('_SUCCESS_SIGN_CANCEL_'));
        } else {
            $this->error(L('_ERROR_OPERATION_FAIL_'));
        }
    }

    /**
     * 报名弹出框页面
     * @param $event_id
     * autor:xjw129xjt
     */
    public function ajax_sign($event_id)
    {

        $event_content = D('Event')->where(array('status' => 1, 'id' => $event_id))->find();
        if (!$event_content) {
            $this->error(L('_EVENT_NOT_EXIST_').L('_EXCLAMATION_'));
        }
        $this->checkAuth('Event/Index/doSign', $event_content['uid'], L('_INFO_LIMIT_').L('_EXCLAMATION_'));
        D('Event')->where(array('id' => $event_id))->setInc('view_count');
        $event_content['user'] = query_user(array('id', 'username', 'nickname', 'space_url', 'space_link', 'avatar64', 'rank_html', 'signature'), $event_content['uid']);
        $event_content['type'] = $this->getType($event_content['type_id']);

        $menber = D('event_attend')->where(array('event_id' => $event_id, 'status' => 1))->select();
        foreach ($menber as $k => $v) {
            $event_content['member'][$k] = query_user(array('id', 'username', 'nickname', 'space_url', 'space_link', 'avatar64', 'rank_html', 'signature'), $v['uid']);

        }

        $this->assign('content', $event_content);
        $this->display();
    }

    /**
     * ajax删除活动
     * @param $event_id
     * autor:xjw129xjt
     */
    public function doDelEvent($event_id)
    {

        $event_content = D('Event')->where(array('status' => 1, 'id' => $event_id))->find();
        if (!$event_content) {
            $this->error(L('_EVENT_NOT_EXIST_').L('_EXCLAMATION_'));
        }
        $this->checkAuth('Event/Index/doDelEvent', $event_content['uid'],L('_INFO_DELETE_LIMIT_').L('_EXCLAMATION_'));
        $res = D('Event')->where(array('status' => 1, 'id' => $event_id))->setField('status', 0);
        if ($res) {
            $this->success(L('_SUCCESS_DELETE_').L('_EXCLAMATION_'), U('Event/Index/index'));
        } else {
            $this->error(L('_ERROR_OPERATION_FAIL_').L('_EXCLAMATION_'));
        }
    }

    /**
     * ajax提前结束活动
     * @param $event_id
     * autor:xjw129xjt
     */
    public function doEndEvent($event_id)
    {

        $event_content = D('Event')->where(array('status' => 1, 'id' => $event_id))->find();
        if (!$event_content) {
            $this->error(L('_EVENT_NOT_EXIST_').L('_EXCLAMATION_'));
        }
        $this->checkAuth('Event/Index/doEndEvent', $event_content['uid'], L('_INFO_OVER_LIMIT_').L('_EXCLAMATION_'));
        $data['eTime'] = time();
        $data['deadline'] = time();
        $res = D('Event')->where(array('status' => 1, 'id' => $event_id))->setField($data);
        if ($res) {
            $this->success(L('_SUCCESS_DELETE_').L('_EXCLAMATION_'));
        } else {
            $this->error(L('_ERROR_OPERATION_FAIL_').L('_EXCLAMATION_'));
        }

    }

}