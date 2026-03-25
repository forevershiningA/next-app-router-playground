package pl.pkapusta.engine.common.exteption.control.mainControls;

import pl.pkapusta.engine.common.exteption.control.action.ActionController;
import pl.pkapusta.engine.common.exteption.control.ExceptionControl;

/**
	 * @author Przemysław Kapusta
	 */
class OKExceptionControl extends ExceptionControl
{
    
    public function new(action : ActionController = null)
    {
        super("ok", "@/ok_button", action);
    }
}

