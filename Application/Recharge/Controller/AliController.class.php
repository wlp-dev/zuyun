<?php
namespace Recharge\Controller;

use Think\Controller;


class AliController extends Controller
{

    public function notify()
    {
        require_once('./Application/Recharge/Lib/Alipay/alipay.config.php');
        require_once('./Application/Recharge/Lib/Alipay/lib/alipay_notify.class.php');
        $alipayNotify = new \AlipayNotify($alipay_config);
        $verify_result = $alipayNotify->verifyNotify();
        if ($verify_result) { //验证成功

            $record['body'] = I('post.body', L('_NOT_ACQUIRED_'), 'op_t');
            $record['buyer_email'] = I('post.buyer_email', L('_NOT_ACQUIRED_'), 'op_t');
            $record['buyer_id'] = I('post.buyer_id', L('_NOT_ACQUIRED_'), 'op_t');
            $record['exterface'] = I('post.exterface', L('_NOT_ACQUIRED_'), 'op_t');
            $record['is_success'] = I('post.is_success', L('_NOT_ACQUIRED_'), 'op_t');
            $record['notify_id'] = I('post.notify_id', L('_NOT_ACQUIRED_'), 'op_t');
            $record['notify_time'] = I('post.notify_time', '0', 'strtotime');
            $record['notify_type'] = I('post.notify_type', L('_NOT_ACQUIRED_'), 'op_t');
            $record['out_trade_no'] = I('post.out_trade_no', L('_NOT_ACQUIRED_'), 'op_t');
            $record['payment_type'] = I('post.payment_type', L('_NOT_ACQUIRED_'), 'op_t');
            $record['seller_email'] = I('post.seller_email', L('_NOT_ACQUIRED_'), 'op_t');
            $record['seller_id'] = I('post.seller_id', L('_NOT_ACQUIRED_'), 'op_t');
            $record['subject'] = I('post.subject', L('_NOT_ACQUIRED_'), 'op_t');
            $record['total_fee'] = I('post.total_fee', L('_NOT_ACQUIRED_'), 'op_t');
            $record['trade_no'] = I('post.trade_no', L('_NOT_ACQUIRED_'), 'op_t');
            $record['trade_status'] = I('post.trade_status', L('_NOT_ACQUIRED_'), 'op_t');
            $record['sign'] = I('post.sign', L('_NOT_ACQUIRED_'), 'op_t');
            $record['sign_type'] = I('post.sign', L('_NOT_ACQUIRED_'), 'op_t');
            //商户订单号
            $order_id = $record['out_trade_no'];

            if ($record['trade_status'] == 'TRADE_FINISHED') {
                exit('trade finished');
            }
            $alipayRecordModel = D('recharge_record_alipay');
            if (!$rs = $alipayRecordModel->add($record)) {
                return ('失败——保存支付结果失败。请联系管理员。');
                /*                $this->error('保存支付结果失败。请联系管理员。');*/
            };

            $record['record_id'] = $rs;
            $link = D('order_link')->where(array('order_id' => $order_id))->find();
            if (empty($link)) {
                exit ('No Order');
            }

            $result = R(ucfirst($link['app']) . '/Pay/afterPayAlipay', array('record' => $record), 'Widget');
            if ($result) {
                D('order_link')->where(array('order_id' => $order_id))->setField('method', 'alipay');
                exit($result);
            } else {
                exit('error');
            }
        } else {
            exit('error');
        }
    }


    public function beforePay()
    {
        if (!is_login()) {
            //  exit(L('_PLEASE_GO_AND_TRY_'));
        }
        $order_id = I('post.out_trade_no', L('_NOT_ACQUIRED_'), 'op_t');
        $link = D('order_link')->where(array('order_id' => $order_id))->cache(60)->find();
        $return = R(ucfirst($link['app']) . '/Pay/beforePayAlipay', array('order_id' => $order_id), 'Widget');
        exit(json_encode($return));
    }

}