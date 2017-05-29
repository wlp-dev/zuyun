<?php

function get_pay_method($method){
    switch ($method) {
        case 'alipay':
            return '支付宝手机';
        case 'alipay_qr':
            return '支付宝扫码';
    }
}



function get_recharge_type($field){
    $fields_config = modC('RE_FIELD', "", 'recharge');
    $fields = json_decode($fields_config,true);
    $res = array_search_key($fields,'FIELD',$field);
    return $res;
}

function get_withdraw_type($field){
    $fields_config = modC('WITHDRAW_FIELD', "", 'recharge');
    $fields = json_decode($fields_config,true);
    $res = array_search_key($fields,'FIELD',$field);
    return $res;
}



function get_order_status_cn($order_id){
    $status = get_order_status($order_id);
     switch($status){
        case 1: return L('_PAYMENT_SUCCESS_WITH_EXCLAMATION_');
        case 2: return L('_THE_PAYMENT_IS_SUCCESSFUL_BUT_THE_DATABASE_FAILS_PLEASE_CONTACT_YOUR_ADMINISTRATOR_WITH_EXCLAMATION_');
        case 0:   return L('_NOT_PAID_');
    }
}


function get_order_status($order_id){
    $order = D('RechargeOrder')->getOrder($order_id);
    $record = D('Record')->getRecord($order['record_id'],$order['method']);

    if($record['trade_status'] == 'TRADE_FINISHED' || $record['trade_status'] == 'TRADE_SUCCESS'){
        if($order['payok']){
            return 1;
        }else{
            return 2;
        }
    }else{
        return 0;
    }
}