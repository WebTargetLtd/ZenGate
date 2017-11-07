    '${namespace}\Model\\${table}Table::class' => function($container) {
    $tableGateway = $container->get('${table}TableGateway');
    return new Model\\${table}Table($tableGateway);
    },
     '${table}TableGateway' => function ($container) {
    $dbAdapter = $container->get('db_adapter');
    $resultSetPrototype = new ResultSet();
    $resultSetPrototype->setArrayObjectPrototype(new Model\\${table}($container));
    return new TableGateway(def${table}::TABLENAME, $dbAdapter, null, $resultSetPrototype);
},
