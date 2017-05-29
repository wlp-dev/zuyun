<?php


namespace Recharge\Controller;

use Think\Controller;


class IndexController extends Controller
{


    public function recharge()
    {
        if (modC('OPEN_RECHARGE', 0, 'recharge') == 0) {
            $this->error(L('_ERROR_404_'));
        }

        if (IS_POST) {
            $this->createOrder();
        } else {
            $fields_config = modC('RE_FIELD', "", 'recharge');
            $fields = json_decode($fields_config, true);
            foreach ($fields as &$v) {
                $v['scoreType'] = D('Ucenter/Score')->getType(array('status' => 1, 'id' => $v['FIELD']));
                $v['have'] = D('Member')->where(array('uid' => is_login()))->getField('score' . $v['FIELD']);
            }
            $rcAmount = modC('RECHARGE_AMOUNT', "", 'recharge');
            $rcAmount && $amount = explode("\n", str_replace("\r", '', $rcAmount));
            $method = modC('METHOD', 'alipay', 'recharge');
            $this->assign('fields', $fields);
            $this->assign('method', explode(',', $method));
            $this->assign('amount', $amount);
            $this->assign('tab', 'recharge');

            $this->display();
        }
    }

    public function index()
    {
        $rechargeOpen = modC('OPEN_RECHARGE', 0, 'recharge');
        if ($rechargeOpen) {
            $this->redirect('recharge');
        } else {
            $this->redirect('rechargeList');
        }

    }


    /**订单确认
     * @auth 陈一枭
     */
    public function order()
    {
        $aOrderId = I('get.id', 0);
        $order = D('RechargeOrder')->getOrder($aOrderId);
        if ($order['record_id']) {
            $record = D('Record')->getRecord($order['record_id'], $order['method']);
            $this->assign('record', $record);
        }

        $this->assign('order', $order);
        $this->assign('tab', 'rechargeList');
        $this->display('order' . $order['method']);
    }


    private function createOrder()
    {
        if (!is_login()) {
            $this->error(L('_PLEASE_LOG_IN_AGAIN_'));
        }


        $this->checkActionLimit('create_order', 'RechargeOrder', 0, is_login());

        $aAmount = I('post.amount', 0, 'floatval');
        $aMethod = I('post.method', '', 'op_t');
        $aField = I('post.field', '', 'intval');

        $aAmount = number_format($aAmount, 2, ".", "");
        $minAmount = modC('MIN_AMOUNT', 0, 'recharge');
        if ($aAmount <= 0) {
            $this->error('充值金额不能小于等于0。');
        }
        $canInput = modC('CAN_INPUT', 1, 'recharge');
        if ($aAmount <= $minAmount && $canInput && $minAmount != 0) {
            $this->error(L('_RECHARGE_AMOUNT_CAN_NOT_BE_LESS_THAN_') . $minAmount . '。');
        }
        $method = modC('METHOD', 'alipay', 'recharge');
        if (!check_is_in_config($aMethod, $method)) {
            $this->error(L('_DO_NOT_SUPPORT_THE_PAYMENT_METHOD_PLEASE_TRY_OTHER_WAYS_OF_PAYMENT_'));
        }

        $data['field'] = $aField;
        $data['amount'] = $aAmount;
        $data['method'] = $aMethod;
        $data['uid'] = is_login();
        $order_id = D('RechargeOrder')->addOrder($data);
        if ($order_id) {
            D('order_link')->add(array('order_id'=>$order_id,'model'=>'recharge_order','app'=>'recharge','method'=>$aMethod,'uid'=>is_login()));
            $this->redirect('order', array('id' => $order_id));
        }

    }

    public function rechargeList()
    {
        $aPage = I('get.page', 1, 'intval');
        $aPayOk = I('get.payok', 'all', 'intval');
        $r = 10;
        $model = D('RechargeOrder');
        $map = array('uid' => get_uid(), 'status' => 1);
        if ($aPayOk === 1) {
            $map['payok'] = array('neq', 0);
            $this->assign('payOk_1', 'active');
        } elseif ($aPayOk === 0) {
            $map['payok'] = 0;
            $this->assign('payOk_0', 'active');
        } else {
            $this->assign('payOk_all', 'active');
        }

        $list = $model->getList(array('where' => $map, 'page' => $aPage, 'count' => $r, 'order' => 'create_time desc'));

        foreach ($list as &$v) {
            $v = $model->getOrder($v);
        }
        unset($v);
        $this->assign('list', $list);
        $this->assign('totalCount', $model->where($map)->count());
        $this->assign('r', $r);
        $this->assign('tab', 'rechargeList');
        $this->display();
    }


    public function withdraw()
    {

        if (IS_POST) {
            $this->createWithdraw();
            $uids=get_auth_user('Admin/Recharge/doWithdraw');
            D("Common/Message")->sendMessageWithoutCheckSelf($uids,'用户提现通知','请到充值模块后台对该用户提现进行操作','Admin/Recharge/withdrawList','',is_login(),'Common_system','');
            $this->success('提现成功。即将跳转到提现列表页。', U('withdrawList'));

        } else {
            if (modC('OPEN_WITHDRAW', 0, 'recharge') == 0) {
                $this->error('404，提现未开启');
            }
            $this->assign('tab', 'withdraw');


            $fields_config = modC('WITHDRAW_FIELD', "", 'recharge');
            $fields = json_decode($fields_config, true);
            foreach ($fields as &$v) {
                $v['scoreType'] = D('Ucenter/Score')->getType(array('status' => 1, 'id' => $v['FIELD']));
                $v['have'] = D('Member')->where(array('uid' => is_login()))->getField('score' . $v['FIELD']);
            }

            $wdAmount = modC('WITHDRAW_AMOUNT', "", 'recharge');
            $wdAmount && $amount = explode("\n", str_replace("\r", '', $wdAmount));
            $method = modC('WITHDRAW_METHOD', 'alipay', 'recharge');
            $this->assign('fields', $fields);
            $this->assign('method', explode(',', $method));
            $this->assign('amount', $amount);

            $this->assign('fields', $fields);
            $this->assign('method', explode(',', $method));
            $this->assign('amount', $amount);
            $this->display();
        }

    }


    private function createWithdraw()
    {

        $loginUid = is_login();
        $this->checkActionLimit('create_withdraw', 'RechargeWithdraw', 0, $loginUid);

        if (!$loginUid) {
            $this->error(L('_PLEASE_LOG_IN_AGAIN_'));
        }
        $aAmount = I('post.amount', 0, 'floatval');
        $aMethod = I('post.method', '', 'op_t');
        $aField = I('post.field', '', 'intval');
        $aAccountInfo = I('post.account_info', '', 'op_t');

        if (strlen($aAccountInfo) <= 0) {
            $this->error(L('_PLEASE_FILL_IN_THE_COMPLETE_COLLECTION_WITH_PERIOD_'));
        }

        $method = modC('WITHDRAW_METHOD', 'alipay', 'recharge');
        if (!check_is_in_config($aMethod, $method)) {
            $this->error(L('_DO_NOT_SUPPORT_THE_PAYMENT_METHOD_PLEASE_TRY_OTHER_WAYS_OF_PAYMENT_'));
        }


        $aAmount = number_format($aAmount, 2, ".", "");
        $minAmount = modC('WITHDRAW_MIN_AMOUNT', 0, 'recharge');
        if ($aAmount <= 0) {
            $this->error('提现金额不能小于等于0。');
        }
        $canInput = modC('WITHDRAW_CAN_INPUT', 1, 'recharge');
        if ($canInput && $aAmount < $minAmount && $minAmount != 0) {
            $this->error(L('_MINIMUM_AMOUNT_CAN_NOT_BE_LESS_THAN_') . $minAmount . '。');
        }
        $type = get_withdraw_type($aField);
        $memberModel = D('Member');
        $score = $memberModel->where(array('uid' => $loginUid))->getField('score' . $aField);
        $forzen_count = $type['UNIT'] * $aAmount;

        if ($score - $forzen_count < 0) {
            $this->error('余额不足，无法提现。提现需' . $forzen_count . '，账户余额' . $score);
        }



        $data['field'] = $aField;
        $data['amount'] = $aAmount;
        $data['method'] = $aMethod;
        $data['uid'] = $loginUid;
        $data['account_info'] = $aAccountInfo;
        $data['frozen_amount'] = $forzen_count;
        $withdraw_id = D('Withdraw')->addWithdraw($data);

        D('Ucenter/Score')->setUserScore($loginUid, $forzen_count, $aField, 'dec','recharge_withdraw',$withdraw_id,get_nickname($loginUid).L('_MENTION_'));

        return $withdraw_id;
    }


    public function withdrawList()
    {
        $aPage = I('get.page', 1, 'intval');

        $aPayOk = I('get.payok', 'all', 'intval');

        $r = 10;
        $map = array('uid' => get_uid(), 'status' => 1);

        if ($aPayOk === 1) {
            $map['payok'] = 1;
            $this->assign('payOk_1', 'active');
        } elseif ($aPayOk === 0) {
            $map['payok'] = 0;
            $this->assign('payOk_0', 'active');
        } elseif ($aPayOk === 2) {
            $map['payok'] = array('in', array(-1, 2));
            $this->assign('payOk_2', 'active');
        } else {
            $this->assign('payOk_all', 'active');
        }

        $model = D('Withdraw');
        $list = $model->getList(array('where' => $map, 'order' => 'create_time desc', 'page' => $aPage, 'count' => $r));
        foreach ($list as &$v) {
            $v = $model->getWithdraw($v);
        }

        unset($v);
        $this->assign('list', $list);
        $this->assign('tab', 'withdrawList');
        $this->assign('totalCount', $model->where($map)->count());
        $this->assign('r', $r);
        $this->display();
    }

    public function cancelWithdraw()
    {
        $aId = I('post.id', 0, 'intval');
        //取消提现，可以是管理员或者当事人
        $withdrawModel = D('Withdraw');
        $withdraw = $withdrawModel->getWithdraw($aId);
        if (empty($withdraw) || $aId <= 0) {
            $this->error(L('_THERE_IS_NO_WITH_PERIOD_'));
        }
        $this->checkAuth(null, $withdraw['uid']);


        if ($withdraw['payok'] != 0) {
            $this->error(L('_IT_CANT_BE_CANCELED_'));
        }
        //取消订单
        $rs = $withdrawModel->where(array('id' => $withdraw['id']))->setField('payok', -1);
        S('withdraw_order_' . $withdraw['id'], null);
        //返还现金



        D('Ucenter/Score')->setUserScore($withdraw['uid'],  $withdraw['frozen_amount'], $withdraw['field'], 'inc','recharge_withdraw', $withdraw['id'],get_nickname( $withdraw['uid']).L('_CANCEL_THE_ORDER_'));




        if (!$rs) {
            $withdrawModel->where(array('id' => $withdraw['id']))->setField('payok', 2); //待返还状态
            $this->error('返还金额失败。请联系管理员。');
        }
        $this->success('取消订单成功。冻结' . $withdraw['score_type']['title'] . $withdraw['frozen_amount'] . $withdraw['score_type']['unit'] . L('_HAS_BEEN_RETURNED_TO_YOUR_DESIGNATED_ACCOUNT_WITH_PERIOD_'));
    }


}