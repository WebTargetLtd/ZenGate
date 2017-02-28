    '${namespace}\Model\\${table}Table' => function($sm) {
    $tableGateway = $sm->get('${table}TableGateway');
    $table = new Model\\${table}Table($tableGateway);
    return $table;
    },
     '${table}TableGateway' => function ($sm) {
    $dbAdapter = $sm->get('db_adapter');
    $resultSetPrototype = new ResultSet();
    $resultSetPrototype->setArrayObjectPrototype(new Model\\${table}($sm));
    return new TableGateway("${tablename}", $dbAdapter, null, $resultSetPrototype);
},
