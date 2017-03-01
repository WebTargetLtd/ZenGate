<?php

namespace ${namespace}\Model;
/**
 * -----------------------------------------------------------------------------
 * Class        : ${table}
 * Description  : Contains exchangeArray the ${table} table.
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

use ReflectionClass;
use ${namespace}\Model\Definitions\def${table} as defs;

class ${table}  {

 ${publics}

    public function exchangeArray(array $data) {

${exchangearray}
       
    }


    /**
     * -----------------------------------------------------------------------------
     * Method       : @method getArrayCopy
     * Description  : @description Generic reflection function.
     * Notes        :      
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 19 Dec 2015
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * 01 Mar 2017  NRSmith         Yoinked out of ancestor for OS compilation
     * _____________________________________________________________________________
     */
    public function getArrayCopy() {
        return get_object_vars($this);
    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method get_class_constants
     * Description  : @description Generic reflection function.
     * Notes        : I normally put these in an ancestor class. You could change the
     *                  template to derive all of class generated from this template 
     *                  to inherit from one with these functions built in. Or not.
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 19 Dec 2015
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * 01 Mar 2017  NRSmith         Yoinked out of ancestor for OS compilation
     * _____________________________________________________________________________
     */
    public function get_class_constants() {
        $reflect = new ReflectionClass(get_class($this));
        return $reflect->getConstants();
    }
}
