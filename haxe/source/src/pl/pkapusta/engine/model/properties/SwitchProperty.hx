package pl.pkapusta.engine.model.properties;

import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;
import pl.pkapusta.engine.common.data.parsers.xml.IXMLReader;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.project.data.IProjectContext;

/**
	 * @author Przemysław Kapusta
	 */
class SwitchProperty extends AbstractProperty implements IProperty implements IXMLReader implements IProjectElementWriter implements IProjectElementReader
{
    
    public function new(section : ISection, model : IModel3D)
    {
        super(section, model);
    }
    
    override public function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    {
        var _value : Dynamic = getProperty();
        var xml : FastXML = basicPropertyTag();
        xml.setAttribute("value", Std.string(_value));
        return xml;
    }
    
    public function readProjectElement(xml : FastXML, embedWriter : IParserEmbedReader, context : IProjectContext) : Void
    {
        if (xml.has.value)
        {
            var val : String = xml.att.value;
            if (val.toLowerCase() == "true" || val == "1")
            {
                changeProperty(true);
            }
            else
            {
                changeProperty(false);
            }
        }
    }
}

