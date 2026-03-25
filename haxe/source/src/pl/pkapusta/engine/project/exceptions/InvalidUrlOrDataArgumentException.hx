package pl.pkapusta.engine.project.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class InvalidUrlOrDataArgumentException extends Exception
{
    
    public function new()
    {
        super("@/error_message_invalid_urlordata_argument", Exception.TYPE_FATAL, [new OKExceptionControl()]);
    }
}

