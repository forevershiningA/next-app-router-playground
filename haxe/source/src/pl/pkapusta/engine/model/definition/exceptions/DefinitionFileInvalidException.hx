package pl.pkapusta.engine.model.definition.exceptions;

import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;
import pl.pkapusta.engine.common.exteption.Exception;

/**
	 * @author Przemysław Kapusta
	 */
class DefinitionFileInvalidException extends Exception
{
    
    public function new()
    {
        super("@/error_message_definition_file_invalid", Exception.TYPE_FATAL, [new OKExceptionControl()]);
    }
}

