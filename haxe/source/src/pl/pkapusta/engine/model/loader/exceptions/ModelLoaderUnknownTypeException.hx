package pl.pkapusta.engine.model.loader.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class ModelLoaderUnknownTypeException extends Exception
{
    
    public function new()
    {
        super("@/error_message_model_loader_unknown_data_exception", Exception.TYPE_FATAL, [new OKExceptionControl()]);
    }
}

