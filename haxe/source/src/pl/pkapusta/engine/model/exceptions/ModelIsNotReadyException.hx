package pl.pkapusta.engine.model.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class ModelIsNotReadyException extends Exception
{
    
    public function new()
    {
        super("@/error_message_model_is_not_ready", Exception.TYPE_WARNING, [new OKExceptionControl()]);
    }
}

