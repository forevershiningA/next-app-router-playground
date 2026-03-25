package pl.pkapusta.engine.project.exceptions;

import pl.pkapusta.engine.common.exteption.control.action.ActionController;
import pl.pkapusta.engine.common.exteption.control.mainControls.CancelExceptionControl;
import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.control.mainControls.RetryExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class ProjectLoadedWithErrorException extends Exception
{
    
    public function new()
    {
        super("@/error_message_project_loaded_with_error", Exception.TYPE_WARNING);
    }
}

