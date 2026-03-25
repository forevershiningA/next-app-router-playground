package pl.pkapusta.engine.common.exteption.predefined.data.parser;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class UnknownFileVersionException extends Exception
{
    
    public function new()
    {
        super("@/error_message_unknown_file_version", Exception.TYPE_FATAL, [new OKExceptionControl()]);
    }
}

