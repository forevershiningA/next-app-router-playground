package pl.pkapusta.engine.common.exteption.control.mainControls;

import pl.pkapusta.engine.common.exteption.control.action.ActionController;
import pl.pkapusta.engine.common.exteption.control.ExceptionControl;

/**
	 * @author Przemysław Kapusta
	 */
class CancelExceptionControl extends ExceptionControl
{
    
    public function new(action : ActionController = null)
    {
        super("cancel", "@/cancel_button", action);
    }
}

