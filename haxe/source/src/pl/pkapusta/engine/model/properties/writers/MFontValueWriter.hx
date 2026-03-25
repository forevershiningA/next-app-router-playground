package pl.pkapusta.engine.model.properties.writers;

import openfl.errors.Error;
import haxe.Constraints.Function;
import haxe.crypto.Crc32;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementAsyncReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;
import pl.pkapusta.engine.common.enums.EmbedType;
import pl.pkapusta.engine.common.formats.font.FontLoader;
import pl.pkapusta.engine.common.formats.font.MFont;
import pl.pkapusta.engine.common.utils.AsyncCall;
import pl.pkapusta.engine.model.properties.values.MFontValue;
import pl.pkapusta.engine.project.data.IProjectContext;
import pl.pkapusta.engine.project.data.triggers.IResourceLoadTrigger;
import pl.pkapusta.engine.project.data.triggers.ResourceLoadTriggerType;
import pl.pkapusta.engine.project.data.triggers.utils.TriggerProcess;
import openfl.events.ErrorEvent;
import openfl.events.Event;
import openfl.events.IOErrorEvent;
import openfl.events.SecurityErrorEvent;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class MFontValueWriter implements IProjectElementWriter implements IProjectElementAsyncReader
{
    public var value(get, never) : MFontValue;

    
    private static var _instance : MFontValueWriter = null;
    public static function getWriterInstance(value : MFontValue) : MFontValueWriter
    {
        if (_instance == null)
        {
            _instance = new MFontValueWriter();
        }
        _instance._value = value;
        return _instance;
    }
    
    public static function getReaderInstance() : MFontValueWriter
    {
        return new MFontValueWriter();
    }
    
    private var _value : MFontValue = null;
    
    public function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    {
        var xml : FastXML = FastXML.parse("<mfontValue />");
        if (_value.uniqueId != null)
        {
            xml.setAttribute("uniqueid", _value.uniqueId);
        }
		var extraData : FastXML = FastXML.parse(_value.getExtraData().toString());
		xml.appendChild(extraData.x);
        if (EmbeddableWriter.isNeedWriteData(_value))
        {
            var crc32 : Int = Crc32.make(_value.font.bytes);
            EmbeddableWriter.writeEmbedData(_value, embedWriter, xml, crc32, _value.font.bytes);
        }
        return xml;
		
    }
    
    private var asyncFontLoader : FontLoader = null;
    private var asyncComplete : Function = null;
    private var asyncCompleteParams : Array<Dynamic> = null;
    private var asyncEmbedReader : IParserEmbedReader = null;
    private var asyncEmbedPointer : Int;
    
    public function readProjectElement(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext, onComplete : Function, onCompleteParams : Array<Dynamic> = null) : Void
    {
        if (xml == null || !xml.hasNode.mfontValue)
        {
            trace("WARNING: Unable to read MFontValue from project data");
            AsyncCall.callbackWithParams(onComplete, onCompleteParams);
            return;
        }
        _value = new MFontValue(null);
        var xmlNode : FastXML = xml.node.mfontValue;
        if (xmlNode.has.uniqueid) _value.uniqueId = xmlNode.att.uniqueid;
        if (xmlNode.hasNode.resolve("extra-data"))
        {
			_value._extraData = FastXML.parse(xmlNode.node.resolve("extra-data").toString());
        }
        if (EmbeddableWriter.isNeedReadData(xmlNode))
        {
            _value.setEmbedType(EmbedType.EMBEDDED);
            var embedPointer : Int = EmbeddableWriter.readEmbedPointer(xmlNode);
            if (embedReader.hasAllocatedObject(embedPointer))
            {
                //#AS3 old > _value.e3d::_font = try cast(embedReader.getAllocatedObject(embedPointer), MFont) catch(e:Dynamic) null;
                _value.font = try cast(embedReader.getAllocatedObject(embedPointer), MFont) catch(e:Dynamic) null;
            }
            else
            {
                var fontBytes : ByteArray = EmbeddableWriter.readEmbedData(embedReader, xmlNode);
                asyncComplete = onComplete;
                asyncCompleteParams = onCompleteParams;
                asyncEmbedReader = embedReader;
                asyncEmbedPointer = embedPointer;
                asyncFontLoader = new FontLoader();
                asyncFontLoader.addEventListener(Event.COMPLETE, asyncLoaderComplete);
                asyncFontLoader.addEventListener(IOErrorEvent.IO_ERROR, asyncLoaderError);
                asyncFontLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, asyncLoaderError);
                asyncFontLoader.loadBytes(fontBytes);
                return;
            }
        }
        else if (context != null)
        {
            var trigger : IResourceLoadTrigger = context.buildResourceLoadTrigger([
                    ResourceLoadTriggerType.MFONT_VALUE, 
                    ResourceLoadTriggerType.PROPERTY_VALUE, 
                    ResourceLoadTriggerType.BASE
            ]);
            if (trigger != null)
            {
                asyncComplete = onComplete;
                asyncCompleteParams = onCompleteParams;
                TriggerProcess.resourceLoadTriggerProcess(trigger, context, ResourceLoadTriggerType.MFONT_VALUE, _value, triggerLoadResponse, triggerLoadFail, [trigger]);
                return;
            }
        }
        if (asyncComplete == null)
        {
            AsyncCall.callbackWithParams(onComplete, onCompleteParams);
        }
    }
    
    private function asyncLoaderComplete(e : Event) : Void
    {
        //#AS3 old > _value.e3d::_font = asyncFontLoader.data;
        _value.font = asyncFontLoader.data;
        asyncEmbedReader.allocateObject(asyncEmbedPointer, asyncFontLoader.data);
        asyncFontLoader = null;
        asyncEmbedReader = null;
        AsyncCall.callbackWithParams(asyncComplete, asyncCompleteParams);
        asyncComplete = null;
        asyncCompleteParams = null;
    }
    
    private function asyncLoaderError(e : ErrorEvent) : Void
    {
        trace("WARNING! MFont embed load failed. " + e.text);
        asyncFontLoader = null;
        asyncEmbedReader = null;
        AsyncCall.callbackWithParams(asyncComplete, asyncCompleteParams);
        asyncComplete = null;
        asyncCompleteParams = null;
    }
    
    private function triggerLoadResponse(data : Dynamic, trigger : IResourceLoadTrigger) : Void
    {
        if (data != null)
        {
            if (Std.is(data, MFont))
            {
                //#AS3 old > _value.e3d::_font = cast((data), MFont);
                _value.font = cast((data), MFont);
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
        trace("WARNING! Trigger " + trigger.resourceType + " failed when loading MFont. " + message);
        trigger.dispose();
        AsyncCall.callbackWithParams(asyncComplete, asyncCompleteParams);
        asyncComplete = null;
        asyncCompleteParams = null;
    }
    
    private function get_value() : MFontValue
    {
        return _value;
    }

    public function new()
    {
    }
}

