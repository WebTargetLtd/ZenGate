<?php

namespace ${namespace}\Model;

${WebTarget}

/**
 * -----------------------------------------------------------------------------
 * Class        : ${table}Table
 * Description  : Contains implementation of AbstractTableGateway for ${table}.
 * Parameters   :
 * Usage        :
 * Notes        :
 * Created      : @author ${author}
 * Created Date : ${created}
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */

${WebTarget}


use Zend\Db\TableGateway\TableGateway;
use Zend\ServiceManager\ServiceLocatorAwareInterface; 
use ${namespace}\Model\Definitions\def${table} as defs;

class ${table}Table extends \Zend\Db\TableGateway\AbstractTableGateway 
implements ServiceLocatorAwareInterface {

    protected $serviceLocator;

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method setServiceLocator
     * Description  : @description Simple Get/Set method
     * Notes        :      
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 16 Oct 2015
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * 01 Mar 2017  NRSmith         Yoinked out of ancestor for OS compilation
     * _____________________________________________________________________________
     */
    public function setServiceLocator(ServiceLocatorInterface $serviceLocator) {
        $this->serviceLocator = $serviceLocator;
    }

}
