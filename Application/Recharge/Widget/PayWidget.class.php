<?php
namespace Recharge\Widget;

use Think\Controller;


class PayWidget extends Controller
{
  public function beforePayAlipay($order_id){
      $link = D('order_link')->where(array('order_id'=>$order_id,'method'=>'alipay'))->cache(60)->find();
      $order = D($link['model'])->where(array('id'=>$order_id))->find();
      $return['total_fee'] = $order['amount'];
      $return['out_trade_no'] = $order_id;

      return $return;
  }

    public function afterPayAlipay($record){

        $order_id = $record['out_trade_no'];

        //交易状态
        if (/*$record['trade_status'] == 'TRADE_FINISHED' ||*/ $record['trade_status'] == 'TRADE_SUCCESS') {
            $rechargeModel = D('RechargeOrder');
            $order = $rechargeModel->getOrder($order_id);
            if ($order['record_id'] == 0) {
                //未作处理
                if (!$order['amount'] == $record['total_fee']) {
                    return(L('_FAILURE__PAYMENT_ORDER_ERROR_THE_AMOUNT_AND_THE_ORDER_DOES_NOT_MATCH_THE_PAYMENT_FAILED._PLEASE_CONTACT_THE_ADMINISTRATOR_WITH_PERIOD_') . $order_id);
                    /*  $this->error(L('_PAYMENT_ORDERS_MAKE_MISTAKES_AND_THE_AMOUNT_AND_THE_ORDER_IS_NOT_IN_CONFORMITY_WITH_THE_PAYMENT._PLEASE_CONTACT_THE_ADMINISTRATOR_WITH_PERIOD_'));*/
                }
                if (!$rechargeModel->where(array('id' => $order_id))->setField('record_id', $record['record_id'])) {
                    return(L('_FAILURE__TO_CHANGE_THE_ORDER_STATUS_OF_FAILURE_WITH_PERIOD_') . $order_id);
                    /*   $this->error(L('_CHANGE_ORDER_STATUS_FAILED_WITH_PERIOD_'));*/
                };
                $rechargeType = $order['recharge_type'];
                if (!$order['recharge_type']) {
                    return(L('_FAILURE__THE_VALIDITY_OF_THE_RECHARGE_FIELD_VALIDATION_FAILED_PLEASE_CONTACT_THE_ADMINISTRATOR_WITH_PERIOD_') . $order_id);
                    /*  $this->error(L('_THE_VALIDITY_OF_THE_RECHARGE_FIELD_VALIDATION_FAILED_PLEASE_CONTACT_THE_ADMINISTRATOR_WITH_PERIOD_'));*/
                }
                $scoreType = $order['score_type'];
                $ratio = $rechargeType['UNIT'];
                $name = $scoreType['title'];
                $step = floor($order['amount'] * $ratio);

                if ( D('Ucenter/Score')->setUserScore($order['uid'],  $step, $order['field'], 'inc','recharge_order', $order_id,get_nickname( $order['uid']).'充值积分')) {
                    $rechargeModel->where(array('id' => $order_id))->setField('payok', 1);
                    S('recharge_order_' . $order_id, null);
                    return(L('_SUCCESS__SUCCESS__RECHARGE_PARAM_',array('nickname'=>get_nickname($order['uid']),'uid'=>$order['uid'],'name'=>$name)) . $step);
                    /*  $this->success(L('_RECHARGE_SUCCESS._YOUR_WITH_PERIOD_') . $name . L('_INCREASE_WITH_SPACE_') . $step . '。即将跳转回充值页面。', U('recharge/index/index'), 10);*/
                } else {
                    return(L('_FAILURE__TO_PAY_FOR_SUCCESS_BUT_THE_CHARGE_TO_THE_DATABASE_FAILED._PLEASE_CONTACT_THE_ADMINISTRATOR_WITH_PERIOD_') . $order_id);
                    /*  $this->error(L('_PAYMENT_IS_SUCCESSFUL_BUT_THE_CHARGE_TO_THE_DATABASE_FAILED._PLEASE_CONTACT_THE_ADMINISTRATOR_WITH_PERIOD_'));*/
                }

            } else {
                return(L('_FAILED__THE_ORDER_HAS_BEEN_PAID_PLEASE_DO_NOT_REPEAT_PAYMENT_WITH_PERIOD_') . $order_id);
                /*  $this->error(L('_THE_ORDER_HAS_BEEN_PAID_PLEASE_DO_NOT_REPEAT_THE_PAYMENT_WITH_PERIOD_'));*/
            }
            //判断该笔订单是否在商户网站中已经做过处理
            //如果没有做过处理，根据订单号（out_trade_no）在商户网站的订单系统中查到该笔订单的详细，并执行商户的业务程序
        } else {
            return(L('_FAILURE__THE_PAYMENT_OF_A_STATE_ERROR_WITH_PERIOD_') . $record['trade_status'] . $order_id);
            /* $this->error(L('_PAYMENT_STATUS_ERROR_WITH_PERIOD_') . $record['trade_status']);*/
        }

    }


}
