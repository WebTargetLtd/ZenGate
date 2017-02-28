    'Auth\Model\SettingsTable' => function($sm) {
    $tableGateway = $sm->get('SettingsTableGateway');
    $table = new Model\SettingsTable($tableGateway);
    return $table;
    },
     'SettingsTableGateway' => function ($sm) {
    $dbAdapter = $sm->get('db_adapter');
    $resultSetPrototype = new ResultSet();
    $resultSetPrototype->setArrayObjectPrototype(new Model\Settings($sm));
    return new TableGateway("ap_settings", $dbAdapter, null, $resultSetPrototype);
},
