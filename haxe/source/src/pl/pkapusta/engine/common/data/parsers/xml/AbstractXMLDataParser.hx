package pl.pkapusta.engine.common.data.parsers.xml;

import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import pl.pkapusta.engine.E3d;

class AbstractXMLDataParser
{
    
    private function toXML() : FastXML
    {
        ExceptionManager.Throw(new AbstractMethodException());
        return null;
    }
    
    private function fromXML(data : FastXML) : Void
    {
        ExceptionManager.Throw(new AbstractMethodException());
    }

    public function new()
    {
    }
}

