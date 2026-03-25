package pl.pkapusta.engine.common.exteption.predefined;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class StaticClassException extends Exception
{
    
    public function new()
    {
        super("@/error_message_static_class", Exception.TYPE_FATAL, [new OKExceptionControl()]);
    }
}

