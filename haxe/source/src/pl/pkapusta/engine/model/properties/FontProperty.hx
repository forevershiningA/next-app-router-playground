package pl.pkapusta.engine.model.properties;

import haxe.Constraints.Function;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementAsyncReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;
import pl.pkapusta.engine.common.data.parsers.xml.IXMLReader;
import pl.pkapusta.engine.common.formats.font.MFont;
import pl.pkapusta.engine.common.utils.AsyncCall;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.properties.values.MFontValue;
import pl.pkapusta.engine.model.properties.writers.MFontValueWriter;
import pl.pkapusta.engine.project.data.IProjectContext;

/**
	 * @author Przemysław Kapusta
	 */
class FontProperty extends AbstractProperty implements IProperty implements IXMLReader implements IProjectElementWriter implements IProjectElementAsyncReader
{
    
    public function new(section : ISection, model : IModel3D)
    {
        super(section, model);
    }
    
    override public function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    {
        var _value : Dynamic = getProperty();
        var xml : FastXML = basicPropertyTag();
        
        var writer : IProjectElementWriter = null;
        
        if (as3hx.Compat.typeof((_value)) == "string")
        {
            xml.setAttribute("system", "true");
            xml.setAttribute("font", Std.string(_value));
        }
        else
        {
            xml.setAttribute("system", "false");
            if (Std.is(_value, MFontValue))
            {
                writer = MFontValueWriter.getWriterInstance(try cast(_value, MFontValue) catch(e:Dynamic) null);
                xml.appendChild(writer.writeProjectElement(embedWriter));
            }
        }
        
        return xml;
    }
    
    public function readProjectElement(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext, onComplete : Function, onCompleteParams : Array<Dynamic> = null) : Void
    {
        if (xml.has.system && xml.att.system.toLowerCase() == "true")
        {
            if (xml.has.font) {
                changeProperty(Std.string(xml.att.font));
            }
            AsyncCall.callbackWithParams(onComplete, onCompleteParams);
        }
        else
        {
            var reader : MFontValueWriter = MFontValueWriter.getReaderInstance();
            reader.readProjectElement(xml, embedReader, context, asyncReadProjectElementComplete, [reader, onComplete, onCompleteParams]);
        }
    }
    
    private function asyncReadProjectElementComplete(reader : MFontValueWriter, onComplete : Function, onCompleteParams : Array<Dynamic>) : Void
    {
        if (reader.value != null)
        {
            changeProperty(reader.value);
        }
        AsyncCall.callbackWithParams(onComplete, onCompleteParams);
    }
}

