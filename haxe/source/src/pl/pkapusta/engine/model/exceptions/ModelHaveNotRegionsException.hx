package pl.pkapusta.engine.model.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class ModelHaveNotRegionsException extends Exception
{
    
    public function new()
    {
        super("@/error_message_model_have_not_regions", Exception.TYPE_WARNING, [new OKExceptionControl()]);
    }
}

