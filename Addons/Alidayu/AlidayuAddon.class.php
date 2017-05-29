<?php
namespace Addons\Alidayu;
use Common\Controller\Addon;

/**
 * 阿里大鱼短信发送插件
 * @author tan@qmit.cn
 */
class AlidayuAddon extends Addon
{
    public $info = array(
        'name' => 'Alidayu',
        'title' => '阿里大鱼',
        'description' => '阿里大鱼短信发送插件',
        'status' => 1,
        'author' => '武汉华大启明信息技术有限公司',
        'version' => '1.3'
    );
    public $addon_path = './Addons/Alidayu/';
    public $admin_list = array(
        'listKey' => array(
            'name' => '签名',
			'type'=>'类型',
        ),
        'model' => 'AlidayuSignname',
        'order' => 'type desc,id asc'
    );
    public $custom_adminlist = 'adminlist_signname.html';

    function __construct() {
        parent::__construct();
        if($_GET['dir']=='tpl'){
            $tplModel=array(
                'listKey' => array(
                    'tpl_type'=>'用途',
                    'show_type'=>'显示类型',
                    'template_name' => '模板名称',
                    'template_id' => '模板ID',
                ),
                'model' => 'AlidayuTpl',
                'order' => 'type desc,id asc'
            );
            if($_GET['showType']){
                $map['show_type']=$_GET['showType'];
                $tplModel['map']=$map;
            }
            $this->admin_list=$tplModel;

            $this->custom_adminlist='adminlist_tpl.html';
        }else if($_GET['dir']=='url2config'){
            $model3=array(
                'listKey' => array(
                    'url'=>'路由',
                    'show_type'=>'显示类型',
                    'content' => '内容',
		            'create_time' => '时间',
                ),
                'model' => 'AlidayuUrl2config',
                'order' => 'id asc'
            );
            $this->admin_list=$model3;
            $this->custom_adminlist='adminlist_url2config.html';

            if(!F('ALIDAYU_SIGNNAME'))A('Addons://Alidayu/Alidayu')->resetCache('signname');
            if(!F('ALIDAYU_TPL'))A('Addons://Alidayu/Alidayu')->resetCache('tpl');
            if(!F('ALIDAYU_URL2CONFIG'))A('Addons://Alidayu/Alidayu')->resetCache('url2config');
        }
    }

    public function install()
    {

        //读取插件sql文件
        $sqldata = file_get_contents('http://' . $_SERVER['HTTP_HOST'] . __ROOT__ . '/Addons/' . $this->info['name'] . '/install.sql');
        $sqlFormat = $this->sql_split($sqldata, C('DB_PREFIX'));

        $counts = count($sqlFormat);
        for ($i = 0; $i < $counts; $i++) {
            $sql = trim($sqlFormat[$i]);
            if (strstr($sql, 'CREATE TABLE')) {
                preg_match('/CREATE TABLE `([^ ]*)`/', $sql, $matches);
                mysql_query("DROP TABLE IF EXISTS `$matches[1]");
                
            }
	    D()->execute($sql);
        }
        return true;
    }

        public function uninstall(){
            //读取插件sql文件
            $sqldata = file_get_contents('http://'.$_SERVER['HTTP_HOST'].__ROOT__.'/Addons/'.$this->info['name'].'/uninstall.sql');

            $sqlFormat = $this->sql_split($sqldata, C('DB_PREFIX'));
            $counts = count($sqlFormat);
             
            for ($i = 0; $i < $counts; $i++) {
                $sql = trim($sqlFormat[$i]);
                D()->execute($sql);
            }
            return true;
        }


    //实现的sms钩子方法
    public function sms($param)
    {
        return true;
    }

	public function sendSms($mobile,$paramArr)
    {
        $ALIDAYU_SIGNNAME = F("ALIDAYU_SIGNNAME");
        $ALIDAYU_TPL = F("ALIDAYU_TPL");
        $ALIDAYU_URL2SMS = F("ALIDAYU_URL2CONFIG");

        $curURL = MODULE_NAME . '/' . CONTROLLER_NAME . '/' . ACTION_NAME;
        $urlItem = $ALIDAYU_URL2SMS[strtolower($curURL)];
        if (!$urlItem) return "路由为：" . $curURL . '的后台模板没有配置';

        $tplConfig=$ALIDAYU_TPL[$urlItem['template_id']];
        $config = $this->getConfig();
        include "sdk/TopSdk.php";
        $smsParam = json_encode($paramArr);
        $c = new \TopClient;
        $c->appkey = $config['appkey'];
        $c->secretKey = $config['appsecret'];
        $c->format = "json";

        if ($tplConfig['show_type'] == 'sms'){ //使用短信，验证码和通知的接口是一样的；
            $smsFreeSignName = $ALIDAYU_SIGNNAME[$urlItem['signname_id']];

            $req = new \AlibabaAliqinFcSmsNumSendRequest;
            $req->setExtend('demo');
            $req->setSmsType("normal");
            $req->setSmsFreeSignName($smsFreeSignName);
            $req->setSmsParam($smsParam);
            $req->setSmsTemplateCode($tplConfig['template_id']);

            $req->setRecNum($mobile);//注意$mobile的长度不能超过200个，中间逗号间隔
        }else{
            if($tplConfig['voice_type']=='tts'){
                $req = new \AlibabaAliqinFcTtsNumSinglecallRequest;
                $req ->setTtsParam($smsParam);
                $req ->setTtsCode($tplConfig['template_id']);
            }else{
                $req = new \AlibabaAliqinFcVoiceNumSinglecallRequest;
                $req ->setVoiceCode($tplConfig['template_id']);
            }
            $req ->setCalledNum($mobile);
            $req ->setCalledShowNum($config['calledShowNum']);
        }

        $resp = $c->execute($req);
		if($resp->code){
			return '提示:'.$resp->msg.'('.$resp->sub_msg.')';
        }else{
            return true;
        }
    }

    /**
     * 解析数据库语句函数
     * @param string $sql sql语句   带默认前缀的
     * @param string $tablepre 自己的前缀
     * @return multitype:string 返回最终需要的sql语句
     */
    public function sql_split($sql, $tablepre)
    {
        if ($tablepre != "onethink_")$sql = str_replace("onethink_", $tablepre, $sql);
        $sql = preg_replace("/TYPE=(InnoDB|MyISAM|MEMORY)( DEFAULT CHARSET=[^; ]+)?/", "ENGINE=\\1 DEFAULT CHARSET=utf8", $sql);

        $sql = str_replace("\r", "\n", $sql);
        $ret = array();

        $num = 0;
        $queriesarray = explode(";\n", trim($sql));
        unset($sql);

        foreach ($queriesarray as $query) {
                $ret[$num] = '';
                $queries = explode("\n", trim($query));
                $queries = array_filter($queries);
                foreach ($queries as $query) {
                    $str1 = substr($query, 0, 1);
                    if ($str1 != '#' && $str1 != '-')$ret[$num] .= $query;
                }
                $num++;
        }
        return $ret;
    }
}