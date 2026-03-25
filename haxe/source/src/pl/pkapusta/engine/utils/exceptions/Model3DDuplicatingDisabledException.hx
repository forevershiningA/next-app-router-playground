package pl.pkapusta.engine.utils.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DDuplicatingDisabledException extends Exception
{
    
    public function new()
    {
        super("@/error_message_model3d_duplicating_disabled", Exception.TYPE_WARNING, [new OKExceptionControl()]);
    }
}

