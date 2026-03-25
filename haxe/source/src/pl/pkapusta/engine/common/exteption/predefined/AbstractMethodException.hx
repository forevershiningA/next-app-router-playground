package pl.pkapusta.engine.common.exteption.predefined;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class AbstractMethodException extends Exception
{
    
    public function new()
    {
        super("@/error_message_abstract_method", Exception.TYPE_FATAL, [new OKExceptionControl()]);
    }
}

