package pl.pkapusta.engine.model.properties.writers;

import openfl.errors.Error;
import haxe.Constraints.Function;
import haxe.crypto.Crc32;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementAsyncReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;
import pl.pkapusta.engine.common.enums.EmbedType;
import pl.pkapusta.engine.common.utils.AsyncCall;
import pl.pkapusta.engine.model.properties.values.ByteArrayValue;
import pl.pkapusta.engine.project.data.IProjectContext;
import pl.pkapusta.engine.project.data.triggers.IResourceLoadTrigger;
import pl.pkapusta.engine.project.data.triggers.ResourceLoadTriggerType;
import pl.pkapusta.engine.project.data.triggers.utils.TriggerProcess;
import openfl.utils.ByteArray;
import openfl.utils.IDataInput;

/**
	 * @author Przemysław Kapusta
	 */
class ByteArrayValueWriter implements IProjectElementWriter implements IProjectElementAsyncReader
{
    public var value(get, never) : ByteArrayValue;

    
    private static var _instance : ByteArrayValueWriter = null;
    public static function getWriterInstance(value : ByteArrayValue) : ByteArrayValueWriter
    {
        if (_instance == null)
        {
            _instance = new ByteArrayValueWriter();
        }
        _instance._value = value;
        return _instance;
    }
    
    public static function getReaderInstance() : ByteArrayValueWriter
    {
        return new ByteArrayValueWriter();
    }
    
    private var _value : ByteArrayValue = null;
    
    public function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    {
        var xml : FastXML = FastXML.parse("<byteArrayValue />");
        if (_value.uniqueId != null && _value.uniqueId != null)
        {
            xml.setAttribute("uniqueid", _value.uniqueId);
        }
		var extraData : FastXML = FastXML.parse(_value.getExtraData().toString());
		xml.appendChild(extraData.x);
        if (EmbeddableWriter.isNeedWriteData(_value))
        {
            var crc32 : Int = Crc32.make(_value.data);
            EmbeddableWriter.writeEmbedData(_value, embedWriter, xml, crc32, _value.data);
        }
        return xml;
    }
    
    private var asyncComplete : Function = null;
    private var asyncCompleteParams : Array<Dynamic> = null;
    
    public function readProjectElement(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext, onComplete : Function, onCompleteParams : Array<Dynamic> = null) : Void
    {
        if (xml == null || !xml.hasNode.byteArrayValue)
        {
            trace("WARNING: Unable to read ByteArrayValue from project data");
            AsyncCall.callbackWithParams(onComplete, onCompleteParams);
            return;
        }
        _value = new ByteArrayValue(null);
        var xmlNode : FastXML = xml.nodes.byteArrayValue.get(0);
        if (xmlNode.has.uniqueid)
        {
            _value.uniqueId = xmlNode.att.uniqueid;
        }
        if (xmlNode.hasNode.resolve("extra-data"))
        {
            _value._extraData = FastXML.parse(xmlNode.node.resolve("extra-data").toString());
        }
        if (EmbeddableWriter.isNeedReadData(xmlNode))
        {
            //#AS3 _value.e3d::_data = EmbeddableWriter.readEmbedData(embedReader, xmlNode);
            _value.data = EmbeddableWriter.readEmbedData(embedReader, xmlNode);
            _value.setEmbedType(EmbedType.EMBEDDED);
        }
        else if (context != null)
        {
            var trigger : IResourceLoadTrigger = context.buildResourceLoadTrigger([
                    ResourceLoadTriggerType.BYTE_ARRAY_VALUE, 
                    ResourceLoadTriggerType.PROPERTY_VALUE, 
                    ResourceLoadTriggerType.BASE
            ]);
            if (trigger != null)
            {
                asyncComplete = onComplete;
                asyncCompleteParams = onCompleteParams;
                TriggerProcess.resourceLoadTriggerProcess(trigger, context, ResourceLoadTriggerType.BYTE_ARRAY_VALUE, _value, triggerLoadResponse, triggerLoadFail, [trigger]);
                return;
            }
        }
        if (asyncComplete == null)
        {
            AsyncCall.callbackWithParams(onComplete, onCompleteParams);
        }
    }
    
    private function triggerLoadResponse(data : Dynamic, trigger : IResourceLoadTrigger) : Void
    {
        if (data != null)
        {
            if (Std.is(data, IDataInput))
            {
                //#AS3 _value.e3d::_data = cast((data), ByteArray);
                _value.data = cast((data), ByteArray);
            }
            else
            {
                throw new Error("Unsupported trigger response object!");
            }
        }
        trigger.dispose();
        AsyncCall.callbackWithParams(asyncComplete, asyncCompleteParams);
        asyncComplete = null;
        asyncCompleteParams = null;
    }
    
    private function triggerLoadFail(message : String, trigger : IResourceLoadTrigger) : Void
    {
        trace("WARNING! Trigger " + trigger.resourceType + " failed when loading ByteArray. " + message);
        trigger.dispose();
        AsyncCall.callbackWithParams(asyncComplete, asyncCompleteParams);
        asyncComplete = null;
        asyncCompleteParams = null;
    }
    
    private function get_value() : ByteArrayValue
    {
        return _value;
    }

    public function new()
    {
    }
}

