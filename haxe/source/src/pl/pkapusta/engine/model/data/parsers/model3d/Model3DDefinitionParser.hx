package pl.pkapusta.engine.model.data.parsers.model3d;

import pl.pkapusta.engine.common.data.parsers.*;
import pl.pkapusta.engine.common.exteption.Exception;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DDefinitionParser extends AbstractParser
{
    
    public var definition : FastXML;
    
    override public function readStream(data : ByteArray) : Void
    {
        var str : String = data.readUTF();
		var xml : Xml = Xml.parse(str);
		for (e in xml.iterator()) {
			if (e.nodeType != Xml.Document && e.nodeType != Xml.Element) continue;
			definition = new FastXML(e);
		}
        if (definition == null) throw "Invalid xml definition";
    }
    
    //#if PARSER::doWrite
    override public function writeStream(data : ByteArray) : Void
    {
        if (definition == null)
        {
            ExceptionManager.Throw(new Exception("Write Stream -> Definition XML is null!!!"));return;
        }
        var str : String = definition.toString();
        data.writeUTF(str);
    }

    public function new()
    {
        super();
    }
}

