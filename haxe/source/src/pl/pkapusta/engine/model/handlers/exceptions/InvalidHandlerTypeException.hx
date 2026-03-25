package pl.pkapusta.engine.model.handlers.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class InvalidHandlerTypeException extends Exception
{
    
    public function new()
    {
        super("@/error_message_invalid_handler_type", Exception.TYPE_WARNING, [new OKExceptionControl()]);
    }
}

