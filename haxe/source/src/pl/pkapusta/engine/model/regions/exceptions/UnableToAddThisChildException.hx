package pl.pkapusta.engine.model.regions.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class UnableToAddThisChildException extends Exception
{
    
    public function new()
    {
        super("@/error_message_unable_to_add_this_child", Exception.TYPE_WARNING, [new OKExceptionControl()]);
    }
}

