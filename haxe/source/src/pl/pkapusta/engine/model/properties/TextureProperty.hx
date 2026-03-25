package pl.pkapusta.engine.model.properties;

import haxe.Constraints.Function;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementAsyncReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;
import pl.pkapusta.engine.common.data.parsers.xml.IXMLReader;
import pl.pkapusta.engine.common.utils.AsyncCall;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.properties.values.BitmapTextureValue;
import pl.pkapusta.engine.model.properties.values.TextureValue;
import pl.pkapusta.engine.model.properties.writers.TextureValueWriter;
import pl.pkapusta.engine.project.data.IProjectContext;

/**
	 * @author Przemysław Kapusta
	 */
class TextureProperty extends AbstractProperty implements IProperty implements IXMLReader implements IProjectElementWriter implements IProjectElementAsyncReader
{
    
    public function new(section : ISection, model : IModel3D)
    {
        super(section, model);
    }
    
    override public function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    {
        var _value : Dynamic = getProperty();
        var xml : FastXML = basicPropertyTag();
        if (_value != null && _value != null)
        {
            var writer : IProjectElementWriter = null;
            if (Std.is(_value, TextureValue))
            {
                writer = TextureValueWriter.getWriterInstance(try cast(_value, TextureValue) catch(e:Dynamic) null);
                xml.appendChild(writer.writeProjectElement(embedWriter));
            }
        }
        return xml;
    }
    
    public function readProjectElement(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext, onComplete : Function, onCompleteParams : Array<Dynamic> = null) : Void
    {
        var reader : TextureValueWriter = TextureValueWriter.getReaderInstance();
        reader.readProjectElement(xml, embedReader, context, asyncReadProjectElementComplete, [reader, onComplete, onCompleteParams]);
    }
    
    private function asyncReadProjectElementComplete(reader : TextureValueWriter, onComplete : Function, onCompleteParams : Array<Dynamic>) : Void
    {
        if (reader.value != null)
        {
            changeProperty(reader.value);
        }
        AsyncCall.callbackWithParams(onComplete, onCompleteParams);
    }
}

