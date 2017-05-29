<?php
namespace Addons\Alidayu\Model;
use Think\Model;

/**
 * 分类模型
 */
class AlidayuSignnameModel extends Model{

	/* 用户模型自动验证 */
    protected $_validate = array(
        array('name', '', -3, self::EXISTS_VALIDATE, 'unique'), //签名唯一
    );

	protected function _after_find(&$result,$options) {
		$result['create_time'] = date('Y-m-d H:i:s', $result['create_time']);
	}

	protected function _after_select(&$result,$options){
		foreach($result as &$record){
			$this->_after_find($record,$options);
		}
	}
	
	/* 获取编辑数据 */
	public function detail($id){
		$data = $this->find($id);
		return $data;
	}

	
	/* 删除 */
	public function del($id){
		return $this->delete($id);
	}
	
	/**
	 * 新增或更新一个文档
	 * @return boolean fasle 失败 ， int  成功 返回完整的数据
	 * @author qmit <tan@qmit.cn>
	 */
	public function update(){
		/* 获取数据对象 */
		$data = $this->create();
		if(empty($data)){
			return false;
		}
		/* 添加或新增基础内容 */
		if(empty($data['id'])){ //新增数据
			$id = $this->add(); //添加基础内容
			if(!$id){
				$this->error = '新增出错！';
				return false;
			}
		} else { //更新数据
			$status = $this->save(); //更新基础内容
			if(false === $status){
				$this->error = '更新出错！';
				return false;
			}
		}
	
		//内容添加或更新完成
		return $data;
	
	}
	
}