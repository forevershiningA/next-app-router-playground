package pl.pkapusta.engine.model.loader.exceptions;

import pl.pkapusta.engine.common.exteption.control.action.ActionController;
import pl.pkapusta.engine.common.exteption.control.mainControls.CancelExceptionControl;
import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.control.mainControls.RetryExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class ModelLoaderIOErrorException extends Exception
{
    
    public function new(retryAction : ActionController, cancelAction : ActionController)
    {
        super("@/error_message_model_loader_io_error", Exception.TYPE_WARNING, [new RetryExceptionControl(retryAction), new CancelExceptionControl(cancelAction)]);
    }
}

