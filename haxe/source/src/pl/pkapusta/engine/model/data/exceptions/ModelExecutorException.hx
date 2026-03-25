package pl.pkapusta.engine.model.data.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class ModelExecutorException extends Exception
{
    
    public function new()
    {
        super("@/error_message_model_executor", Exception.TYPE_FATAL, [new OKExceptionControl()]);
    }
}

