<?php
return array(
    'switch'=>array(
        'title'=>'启用',
        'type'=>'radio',
        'options'=>array(
            '0'=>'否',
            '1'=>'是'
        ),
        'value'=>'1'
    ),
	'appkey'=>array(               //配置在表单中的键名 ,这个会是config[recommendUser]
        'title'=>'App key:',           //表单的文字
        'type'=>'text',                   //表单的类型：text、textarea、checkbox、radio、select等
        'value'=>'',
        'tip'=>'阿里大鱼的App key(在"阿里大鱼管理中心->应用管理->应用列表"中获取)',                     //表单的默认值
    ),
	'appsecret'=>array(               //配置在表单中的键名 ,这个会是config[recommendUser]
        'title'=>'App secret:',           //表单的文字
        'type'=>'text',                   //表单的类型：text、textarea、checkbox、radio、select等
        'value'=>'',
        'tip'=>'阿里大鱼的App secret(App key对应的App secret)',                     //表单的默认值
    ),
    'calledShowNum'=>array(
        'title'=>'语音号码:',
        'type'=>'text',
        'value'=>'057126883075',
        'tip'=>'057126883075~057126883076以及051482043260~051482043269均可用',
    ),
);
					