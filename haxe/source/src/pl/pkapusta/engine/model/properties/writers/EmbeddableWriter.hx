package pl.pkapusta.engine.model.properties.writers;

import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.enums.EmbedType;
import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.common.StringUtils;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class EmbeddableWriter
{
    
    public static function writeEmbedData(embeddable : IEmbeddable, parserWriter : IParserEmbedWriter, xmlNode : FastXML, uniqueObject : Dynamic, data : ByteArray) : Void
    {
        if (isNeedWriteData(embeddable))
        {
            var embedPointer : Int = parserWriter.writeEmbedObject(uniqueObject, data);
            writeEmbedPointer(xmlNode, embedPointer);
        }
    }
    
    public static function writeEmbedPointer(xmlNode : FastXML, embedPointer : Int) : Void
    {
        xmlNode.setAttribute("embed-pointer", StringUtils.IntToHexString(embedPointer));
    }
    
    public static function isNeedWriteData(embeddable : IEmbeddable) : Bool
    {
        return (embeddable.getEmbedType() == EmbedType.EMBEDDED || (embeddable.getDefaultEmbed() && embeddable.getEmbedType() == EmbedType.DEFAULT));
    }
    
    public static function isNeedReadData(xmlNode : FastXML) : Bool
    {
        return xmlNode.has.resolve("embed-pointer");
    }
    
    public static function readEmbedData(parserReader : IParserEmbedReader, xmlNode : FastXML) : ByteArray
    {
        if (isNeedReadData(xmlNode))
        {
            return parserReader.readEmbedObject(readEmbedPointer(xmlNode));
        }
        return null;
    }
    
    public static function readEmbedPointer(xmlNode : FastXML) : Int
    {
        if (isNeedReadData(xmlNode))
        {
            return StringUtils.HexStringToInt(xmlNode.att.resolve("embed-pointer"));
        }
        return -1;
    }

    public function new()
    {
    }
}

