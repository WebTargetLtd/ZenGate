    'Auth\Model\UserTable' => function($sm) {
    $tableGateway = $sm->get('UserTableGateway');
    $table = new Model\UserTable($tableGateway);
    return $table;
    },
     'UserTableGateway' => function ($sm) {
    $dbAdapter = $sm->get('db_adapter');
    $resultSetPrototype = new ResultSet();
    $resultSetPrototype->setArrayObjectPrototype(new Model\User($sm));
    return new TableGateway("t_user", $dbAdapter, null, $resultSetPrototype);
},
