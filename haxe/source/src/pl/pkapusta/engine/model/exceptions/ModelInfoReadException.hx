package pl.pkapusta.engine.model.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class ModelInfoReadException extends Exception
{
    
    public function new()
    {
        super("@/error_message_model_info_read", Exception.TYPE_WARNING, [new OKExceptionControl()]);
    }
}

