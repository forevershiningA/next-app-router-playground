package pl.pkapusta.engine.utils.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DHaventOnSceneException extends Exception
{
    
    public function new()
    {
        super("@/error_message_model3d_havent_on_scene", Exception.TYPE_WARNING, [new OKExceptionControl()]);
    }
}

