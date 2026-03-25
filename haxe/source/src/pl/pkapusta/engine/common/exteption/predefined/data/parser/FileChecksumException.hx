package pl.pkapusta.engine.common.exteption.predefined.data.parser;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class FileChecksumException extends Exception
{
    
    public function new()
    {
        super("@/error_message_file_checksum", Exception.TYPE_FATAL, [new OKExceptionControl()]);
    }
}

