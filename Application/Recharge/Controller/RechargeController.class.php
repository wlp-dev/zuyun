<?php
namespace Admin\Controller;

use Admin\Builder\AdminConfigBuilder;
use Admin\Builder\AdminListBuilder;
use Admin\Builder\AdminTreeListBuilder;

require_once './Application/Recharge/Common/function.php';

class RechargeController extends AdminController
{
    public function _initialize()
    {
        parent::_initialize();
        import_lang('Recharge');
    }
    public function configCallback($config)
    {
        if (check_is_in_config('alipay',$config['METHOD'])) {
            require_once './Application/Recharge/Lib/Alipay/alipay.config.php';
            $content = file_get_contents('./Application/Recharge/Lib/Alipay/alipay.config.php');
            $content = preg_replace('/partner.*?;/', "partner']	= '".$config['ALIPAY_PARTNER']."';",$content);
            $content = preg_replace('/seller_email.*?;/',"seller_email']	= '".$config['ALIPAY_SELLER_EMAIL']."';",$content);
            $content = preg_replace("/'key'.*?;/","'key']= '".$config['ALIPAY_KEY']."';",$content);
            file_put_contents('./Application/Recharge/Lib/Alipay/alipay.config.php',$content);
        }
    }

    public function config()
    {

        $field = D('Ucenter/Score')->getTypeList(array('status' => 1));
        $configBuilder = new AdminConfigBuilder();
        $data = $configBuilder->callback('configCallback')->handleConfig();

        $param = array();
        $param['opt'] = $field;
        $de_data = $data['RE_FIELD'];
        $param['jsonData'] = $de_data;
        $param['data'] = json_decode($de_data, true);

        $param_w = array();
        $param_w['opt'] = $field;
        $w_data = $data['WITHDRAW_FIELD'];
        $param_w['jsonData'] = $w_data;
        $param_w['data'] = json_decode($w_data, true);
        $configBuilder->title(L('_RECHARGE_SETTINGS_'))->data($data)


            ->keyBool('OPEN_RECHARGE', L('_OPEN_UP_'))
            ->keyTextArea('RECHARGE_AMOUNT', L('_RECHARGE_FACE_'), L('_ONE_LINE_'))
            ->keyBool('CAN_INPUT', L('_ALLOW_FREE_RECHARGE_'))
            ->keyText('MIN_AMOUNT', L('_MINIMUM_MENTION_'))
            ->keyCheckBox('METHOD', L('_PAYMENT_METHOD_'), L('_CHOOSE_TO_PAY_TYPE_'), array('alipay' => L('_PAYPAL_')))

            ->keyUserDefined('RE_FIELD', L('_TYPE_SUPPORTED_'), L('_TYPE_SUPPORTED_VICE_'), T('Recharge@Recharge/config'), $param)
            ->keyDefault('METHOD', 'alipay')
            ->keyDefault('MIN_AMOUNT', 0)


            ->keyBool('OPEN_WITHDRAW', L('_OPEN_THE_PRESENT_'))
            ->keyTextArea('WITHDRAW_AMOUNT', L('_RAISE_THE_PRESENT_VALUE_'), L('_ONE_LINE_'))
            ->keyBool('WITHDRAW_CAN_INPUT', L('_FREE_TO_MENTION_NOW_'))
            ->keyText('WITHDRAW_MIN_AMOUNT', L('WITHDRAW_MIN_AMOUNT'))
            ->keyCheckBox('WITHDRAW_METHOD', L('_PAYMENT_METHOD_'), L('_CHOOSE_TO_PAY_TYPE_'), array('alipay' => L('_PAYPAL_')))
            ->keyUserDefined('WITHDRAW_FIELD', L('_SUPPORT_FOR_THE_INTEGRAL_TYPE_'), L('_SUPPORT_FOR_THE_INTEGRAL_TYPE_VICE_'), T('Recharge@Recharge/config'), $param_w)
            ->keyDefault('WITHDRAW_METHOD', 'alipay')
            ->keyDefault('WITHDRAW_MIN_AMOUNT', 0)


            ->group(L('_RECHARGE_SETTINGS_'), 'OPEN_RECHARGE,RECHARGE_AMOUNT,CAN_INPUT,MIN_AMOUNT,METHOD,RE_FIELD')
            ->group(L('_MENTION_SETTING_'), 'OPEN_WITHDRAW,WITHDRAW_AMOUNT,WITHDRAW_CAN_INPUT,WITHDRAW_MIN_AMOUNT,WITHDRAW_METHOD,WITHDRAW_FIELD');

        if (check_is_in_config('alipay', $data['METHOD'])) {
            $configBuilder->keyText('ALIPAY_PARTNER', L('_CO_IDENTITY_ID_'), L('_16_PURE_NUMBERS_AT_THE_BEGINNING_OF_2088_'))
                ->keyText('ALIPAY_SELLER_EMAIL', L('_PAYPAL_ACCOUNT_'))
                ->keyText('ALIPAY_KEY', L('_SAFETY_TEST_CODE_'), L('_32_CHARACTERS_IN_NUMBERS_AND_LETTERS_'))
                ->group(L('_ALIPAY_CONFIGURATION_'), 'ALIPAY_PARTNER,ALIPAY_SELLER_EMAIL,ALIPAY_KEY');
        }

        $configBuilder->buttonSubmit()
            ->buttonBack();
        $configBuilder->display();
    }



    public function alipayList($r = 15, $page = 1)
    {
        $aBuyerEmail = I('buyer_email', '', 'op_t');
        if ($aBuyerEmail != '') {
            $map['buyer_email'] = array('like', '%' . $aBuyerEmail . '%');
        }
        $listBuilder = new AdminListBuilder();
        $recordModel = D('recharge_record_alipay');
        $data = $recordModel->where($map)->order('notify_time desc')->page($page, $r)->select();
        $totalCount = $recordModel->where($map)->count();
        foreach ($data as &$v) {
            $v['is_success'] = $v['is_success'] == 'T' ? 1 : 0;

        }
        unset($v);
        $listBuilder->title(L('_ALIPAY_PREPAID_ORDERS_'));
        $listBuilder->keyId()->keyText('out_trade_no', L('_ORDER_NUMBER_'))->keyText('buyer_email', L('_THE_PAYER_PAYS_THE_TREASURE_'))->keyText('seller_email', L('_COLLECTION_ACCOUNT_'))
            ->keyText('total_fee', L('_RECHARGE_AMOUNT_'))->keyText('trade_no', L('_PO_PO_PO_'))->keyBool('is_success', L('_PAY_FOR_SUCCESS_'))->keyTime('notify_time', L('_TIME_OF_PAYMENT_'));
        $listBuilder->search(L('_THE_PAYER_PAYS_THE_TREASURE_'), 'buyer_email');
        $listBuilder->data($data)->pagination($totalCount, $r);
        $listBuilder->display();
    }


    public function rechargeList($r = 15, $page = 1)
    {
        $listBuilder = new AdminListBuilder();
        $recordModel = D('recharge_order');
        $data = $recordModel->order('create_time desc')->page($page, $r)->select();
        $totalCount = $recordModel->count();
        foreach ($data as &$v) {
            $type = D('Ucenter/Score')->getType(array('id' => $v['field'], 'status' => 1));
            $v['type_title'] = $type['title'];
            $v['method_name'] = get_pay_method($v['method']);
        }
        unset($v);
        $listBuilder->title(L('_RECHARGE_RECORDS_'));
        $listBuilder->keyId()->keyText('type_title', L('_RECHARGE_FIELD_'))->keyText('amount', L('_RECHARGE_AMOUNT_'))->keyText('method_name', L('_RECHARGE_MODE_'))
            ->keyUid()->keyCreateTime()->keyStatus()->keyText('record_id', L('_RELATED_PAYMENT_RECORDS_ID_'))->keyBool('payok', L('_PAYMENT_SUCCESS_'));
        $listBuilder->data($data)->pagination($totalCount, $r);
        $listBuilder->display();
    }

    public function withdrawList($r = 15, $page = 1)
    {
        $listBuilder = new AdminListBuilder();
        $recordModel = D('recharge_withdraw');
        $data = $recordModel->order('create_time desc')->page($p, $r)->select();
        $totalCount = $recordModel->count();
        foreach ($data as &$v) {
            $type = D('Ucenter/Score')->getType(array('id' => $v['field'], 'status' => 1));
            $v['type_title'] = $type['title'];
            $v['method_name'] = get_pay_method($v['method']);
            $v['pay_condition'] = $this->getConditionText($v['payok']);
            if ($v['pay_uid'] != 0) {
                $user = query_user(array('space_link'), $v['pay_uid']);
                $v['operator'] = $user['space_link'];
            } else {
                $v['operator'] = '-';
            }
            $v['pay_time'] = $v['pay_time'] == 0 ? '-' : $v['pay_time'];
            $url = U('Action/scoreLog', array('uid' => $v['uid']));
            $nickname = get_nickname($v['uid']);
            $v['user'] = <<<str
[{$v['uid']}] <a href="$url" target="_blank">$nickname</a>
str;
        }
        unset($v);
        $listBuilder->title(L('_MENTION_THE_RECORD_'));
        $listBuilder->keyId()
            ->keyHtml('user', '用户')
            ->keyText('type_title', L('_MENTION_FIELD_'))->keyText('amount', L('_RAISE_CASH_'))->keyText('frozen_amount', L('_FREEZING_POINTS_'))->keyText('method_name', L('_RAISE_THE_WAY_'))
            ->keyCreateTime()->keyText('pay_condition', L('_PAYMENT_STATUS_'))->keyText('operator', L('_OPERATOR_'))->keyTime('pay_time', L('_PROPOSED_OPERATION_TIME_'))->keyText('account_info', L('_COLLECTION_ACCOUNT_INFORMATION_'));
        $listBuilder->data($data)->pagination($totalCount, $r);


        $listBuilder->ajaxButton(U('recharge/doWithdraw'), null, L('_MENTION_'));
        $listBuilder->ajaxButton(U('recharge/cancelWithdraw'), null, L('_CLOSING_THE_PRESENT_'));
        $listBuilder->display();
    }


    public function doWithdraw($ids = array())
    {
        if (empty($ids)) {
            $this->error(L('_CHOOSE_THE_OPTION_TO_OPERATE_'));
        }
        $withdrawModel = D('Recharge/Withdraw');
        foreach ($ids as $id) {
            $withdraw = $withdrawModel->getWithdraw($id);
            if (empty($withdraw) || $id <= 0) {
                continue;
            }
            if ($withdraw['payok'] != 0) {
                continue;
            }
            $withdraw['payok'] = 1;
            $withdraw['pay_uid'] = get_uid();
            $withdraw['pay_time'] = time();
            $rs = $withdrawModel->save($withdraw);
            if (!$rs) {
                continue;
            }
            S('withdraw_order_' . $withdraw['id'], null);
            //提现成功，向用户发送消息
            D("Common/Message")->sendMessageWithoutCheckSelf($withdraw['uid'], L('_YOUR_CASH_HAS_BEEN_ACCEPTED_PLEASE_NOTE_THAT_CHECK_WITH_PERIOD_'), L('_INFO_MENTION_OVER_'), 'recharge/index/withdrawList',array(), is_login());
        }

        $this->success(L('_MENTION_IS_SUCCESSFUL_WITH_PERIOD_'));
    }


    public function cancelWithdraw($ids = array())
    {
        if (empty($ids)) {
            $this->error(L('_CHOOSE_THE_OPTION_TO_OPERATE_'));
        }
        $withdrawModel = D('Recharge/Withdraw');
        foreach ($ids as $id) {
            $withdraw = $withdrawModel->getWithdraw($id);
            if (empty($withdraw) || $id <= 0) {
                continue;
            }

            if ($withdraw['payok'] != 0) {
                continue;
            }

            //取消订单
            $rs = $withdrawModel->where(array('id' => $withdraw['id']))->setField('payok', -1);
            S('withdraw_order_' . $withdraw['id'], null);
            //返还现金

            D('Ucenter/Score')->setUserScore($withdraw['uid'],  $withdraw['frozen_amount'], $withdraw['field'], 'inc','recharge_withdraw', $withdraw['id'],get_nickname( is_login()).L('_CLOSE_THE_MENTION_OF_THE_ORDER_'));

            if (!$rs) {
                $withdrawModel->where(array('id' => $withdraw['id']))->setField('payok', 2); //待返还状态
                continue;
            }
            D("Common/Message")->sendMessageWithoutCheckSelf($withdraw['uid'],L('_INFO_MENTION_CLOSE_'),  L('_YOUR_MENTION_IS_NOW_CLOSED_') . $withdraw['score_type']['title'] . $withdraw['frozen_amount'] . $withdraw['score_type']['unit'] . L('_HAS_BEEN_RETURNED_TO_YOUR_ACCOUNT_WITH_PERIOD_'), 'recharge/index/withdrawList');
        }
        $this->success(L('_OFF_ORDER_SUCCESS_WITH_PERIOD_'));

    }


    private function getConditionText($payok)
    {
        switch ($payok) {
            case 0:
                return L('_IN_THE_PRESENT_');
            case 1:
                return L('_FINISH_');
            case 2:
                return L('_EXCEPTION_NO_REFUND_');
            case -1:
                return L('_HAS_BEEN_CANCELED_');
        }

    }
}
