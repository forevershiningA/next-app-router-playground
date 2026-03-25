package pl.pkapusta.engine.project.exceptions;

import pl.pkapusta.engine.common.exteption.control.action.ActionController;
import pl.pkapusta.engine.common.exteption.control.mainControls.CancelExceptionControl;
import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.control.mainControls.RetryExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class ProjectLoaderErrorException extends Exception
{
    
    public function new(retryAction : ActionController, cancelAction : ActionController)
    {
        super("@/error_message_project_loader_error", Exception.TYPE_WARNING, [new RetryExceptionControl(retryAction), new CancelExceptionControl(cancelAction)]);
    }
}

