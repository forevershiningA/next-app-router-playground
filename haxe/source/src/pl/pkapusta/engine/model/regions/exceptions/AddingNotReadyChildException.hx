package pl.pkapusta.engine.model.regions.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class AddingNotReadyChildException extends Exception
{
    
    public function new()
    {
        super("@/error_message_adding_not_ready_child", Exception.TYPE_WARNING, [new OKExceptionControl()]);
    }
}

