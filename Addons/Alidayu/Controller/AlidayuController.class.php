<?php
namespace Addons\Alidayu\Controller;
use Admin\Controller\AddonsController;

class AlidayuController extends AddonsController{

	public function resetCache($obj){
		if($obj=='signname'){
			$data=M("AlidayuSignname")->getField('id,name');
			F("ALIDAYU_SIGNNAME",$data);
		}else if($obj=='tpl'){
			$data=M("AlidayuTpl")->getField('template_id,template_name,template_content,tpl_type,show_type,voice_type');
			F("ALIDAYU_TPL",$data);
		}else if($obj=='url2config'){
			$data=M("AlidayuUrl2config")->getField('lower(url),signname_id,template_id');
			F("ALIDAYU_URL2CONFIG",$data);
		}
	}
	
	/* 模板 */
	public function addTpl(){
		$this->meta_title = '添加短信模板';
		$info=array('type'=>0,'tpl_type'=>1);
		if($_GET['showType']=='voice')$info['show_type']='voice';
		$this->assign('info',$info);
		$this->display(T('Addons://Alidayu@Alidayu/editTpl'));
	}

	public function editTpl(){
		$this->meta_title = '修改短信模板';
		$id     =   I('get.id','');
		$detail = D('Addons://Alidayu/AlidayuTpl')->detail($id);
		$this->assign('info',$detail);
		$this->display(T('Addons://Alidayu@Alidayu/editTpl'));
	}

	public function updateTpl(){
		$this->meta_title = '更新短信模板';
		if($_POST['type']==1&&$_POST['tpl_type']==2)$this->error("阿里大鱼的管理后台没有提供短信通知的系统模板");
		if(!$_POST['template_id'])$this->error("模板ID不能为空");
		$res = D('Addons://Alidayu/AlidayuTpl')->update();
		if($res===false){
			$this->error(D('Addons://Alidayu/AlidayuTpl')->getError());
		}else{
			$this->resetCache('tpl');
			if($res['id']){
				$this->success('更新成功',  Cookie('__forward__'));
			}else{
				$this->success('新增成功',  Cookie('__forward__'));
			}
		}
	}

	public function delTpl(){
		$this->meta_title = '删除短信模板';
		$id     =   I('get.id','');
		if(D('Addons://Alidayu/AlidayuTpl')->del($id)){
			$this->success('删除成功');
		}else{
			$this->error(D('Addons://Alidayu/AlidayuTpl')->getError());
		}
	}

	/* 签名 */
	public function addSignname(){
		$this->meta_title = '添加短信签名';
		$this->display(T('Addons://Alidayu@Alidayu/editSignname'));
	}

	public function editSignname(){
		$this->meta_title = '修改短信签名';
		$id     =   I('get.id','');
		$detail = D('Addons://Alidayu/AlidayuSignname')->detail($id);
		$this->assign('info',$detail);
		$this->display(T('Addons://Alidayu@Alidayu/editSignname'));
	}

	public function updateSignname(){
		$res = D('Addons://Alidayu/AlidayuSignname')->update();
		if($res===false){
			$this->error(D('Addons://Alidayu/AlidayuSignname')->getError());
		}else{
			$this->resetCache('signname');
			if($res['id']){
				$this->success('更新成功',  Cookie('__forward__'));
			}else{
				$this->success('新增成功',  Cookie('__forward__'));
			}
		}
	}

	public function delSignature(){
		$id     =   I('get.id','');
		if(D('Addons://Alidayu/AlidayuSignname')->del($id)){
			$this->success('删除成功', Cookie('__forward__'));
		}else{
			$this->error(D('Addons://Alidayu/AlidayuTpl')->getError());
		}
	}

	/* 路由 */
	public function addUrl2config(){
		$this->meta_title = '添加路由使用的短信';
		$info=array('type'=>0,'tpl_type'=>1);
		if($_GET['showType']=='voice')$info['show_type']='voice';
		$this->assign('info',$info);
		$this->display(T('Addons://Alidayu@Alidayu/editUrl2config'));
	}

	public function editUrl2config(){
		$this->meta_title = '修改路由使用短信';
		$id     =   I('get.id','');
		$detail = D('Addons://Alidayu/AlidayuUrl2config')->detail($id);
		$this->assign('info',$detail);
		$this->display(T('Addons://Alidayu@Alidayu/editUrl2config'));
	}

	public function updateUrl2config(){
		$this->meta_title = '更新路由使用的短信';
		$res = D('Addons://Alidayu/AlidayuUrl2config')->update();
		if($res===false){
			$this->error(D('Addons://Alidayu/AlidayuUrl2config')->getError());
		}else{
			F("ALIDAYU_URL2SMS",null);
			if($res['id']){
				$this->success('更新成功',  Cookie('__forward__'));
			}else{
				$this->success('新增成功',  Cookie('__forward__'));
			}
		}
	}

	public function delUrl2config(){
		$this->meta_title = '删除路由短信配置';
		$id     =   I('get.id','');
		if(D('Addons://Alidayu/AlidayuUrl2config')->del($id)){
			F("ALIDAYU_URL2SMS",null);
			$this->success('删除成功', Cookie('__forward__'));
		}else{
			$this->error(D('Addons://Alidayu/AlidayuTpl')->getError());
		}
	}


}
