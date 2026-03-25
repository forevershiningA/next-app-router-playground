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
import pl.pkapusta.engine.model.properties.values.DisplayObjectValue;
import pl.pkapusta.engine.model.properties.writers.data.DisplayObjectTriggerResponse;
import pl.pkapusta.engine.project.data.IProjectContext;
import pl.pkapusta.engine.project.data.triggers.IResourceLoadTrigger;
import pl.pkapusta.engine.project.data.triggers.ResourceLoadTriggerType;
import pl.pkapusta.engine.project.data.triggers.utils.TriggerProcess;
import openfl.display.Bitmap;
import openfl.display.BitmapData;
import openfl.display.DisplayObject;
import openfl.display.PNGEncoderOptions;
import openfl.display.Loader;
import openfl.events.Event;
import openfl.utils.ByteArray;
import openfl.utils.IDataInput;

/**
	 * @author Przemysław Kapusta
	 */
class DisplayObjectValueWriter implements IProjectElementWriter implements IProjectElementAsyncReader
{
    public var value(get, never) : DisplayObjectValue;

    
    private static var _instance : DisplayObjectValueWriter = null;
    public static function getWriterInstance(value : DisplayObjectValue) : DisplayObjectValueWriter
    {
        if (_instance == null)
        {
            _instance = new DisplayObjectValueWriter();
        }
        _instance._value = value;
        return _instance;
    }
    
    public static function getReaderInstance() : DisplayObjectValueWriter
    {
        return new DisplayObjectValueWriter();
    }
    
    private var _value : DisplayObjectValue = null;
    
    public function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    {
        var xml : FastXML = FastXML.parse("<displayObjectValue />");
        if (_value.uniqueId != null && _value.uniqueId != null)
        {
            xml.setAttribute("uniqueid", _value.uniqueId);
        }
		var extraData : FastXML = FastXML.parse(_value.getExtraData().toString());
		xml.appendChild(extraData.x);
        if (EmbeddableWriter.isNeedWriteData(_value))
        {
			if (_value.bytes != null) {
				var crc32 : Int = Crc32.make(_value.bytes);
				EmbeddableWriter.writeEmbedData(_value, embedWriter, xml, crc32, _value.bytes);
			} else if (Std.is(_value.display, Bitmap) || Std.is(_value.display, BitmapData)) {
				var bmp:BitmapData = Std.is(_value.display, Bitmap)?cast (_value.display, Bitmap).bitmapData:cast (_value.display, BitmapData);
				var byteArrayToCrc32 : ByteArray = bmp.getPixels(bmp.rect);
                var pixelsCrc32 : Int = Crc32.make(byteArrayToCrc32);
                byteArrayToCrc32.clear();
                var embedPointer : Int = embedWriter.embedPointerByUniqueObject(pixelsCrc32);
                if (embedPointer >= 0) {
                    EmbeddableWriter.writeEmbedPointer(xml, embedPointer);
                } else {
                    var bytes : ByteArray = bmp.encode(bmp.rect, new PNGEncoderOptions());
                    EmbeddableWriter.writeEmbedData(_value, embedWriter, xml, pixelsCrc32, bytes);
                    bytes.clear();
                }
			}
        }
        return xml;
    }
    
    private var asyncComplete : Function = null;
    private var asyncCompleteParams : Array<Dynamic> = null;
    private var asyncDisplayLoader : Loader = null;
    private var asyncEmbedReader : IParserEmbedReader = null;
    private var asyncEmbedPointer : Int;
    
    public function readProjectElement(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext, onComplete : Function, onCompleteParams : Array<Dynamic> = null) : Void
    {
        if (xml == null || !xml.hasNode.displayObjectValue)
        {
            trace("WARNING: Unable to read DisplayObjectValue from project data");
            AsyncCall.callbackWithParams(onComplete, onCompleteParams);
            return;
        }
        _value = new DisplayObjectValue(null);
        var xmlNode : FastXML = xml.nodes.displayObjectValue.get(0);
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
            _value.setEmbedType(EmbedType.EMBEDDED);
            var embedPointer : Int = EmbeddableWriter.readEmbedPointer(xmlNode);
            if (embedReader.hasAllocatedObject(embedPointer))
            {
                //#AS3 _value.e3d::_display = try cast(embedReader.getAllocatedObject(embedPointer), DisplayObject) catch(e:Dynamic) null;
                _value.display = try cast(embedReader.getAllocatedObject(embedPointer), DisplayObject) catch(e:Dynamic) null;
                //#AS3 _value.e3d::_bytes = embedReader.readEmbedObject(embedPointer);
                _value.bytes = embedReader.readEmbedObject(embedPointer);
            }
            else
            {
                var displayBytes : ByteArray = EmbeddableWriter.readEmbedData(embedReader, xmlNode);
                asyncComplete = onComplete;
                asyncCompleteParams = onCompleteParams;
                asyncEmbedReader = embedReader;
                asyncEmbedPointer = embedPointer;
                asyncDisplayLoader = new Loader();
                asyncDisplayLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, asyncDisplayLoadComplete);
                asyncDisplayLoader.loadBytes(displayBytes);
            }
        }
        else if (context != null)
        {
            var trigger : IResourceLoadTrigger = context.buildResourceLoadTrigger([
                    ResourceLoadTriggerType.DISPLAY_OBJECT_VALUE, 
                    ResourceLoadTriggerType.PROPERTY_VALUE, 
                    ResourceLoadTriggerType.BASE
            ]);
            if (trigger != null)
            {
                asyncComplete = onComplete;
                asyncCompleteParams = onCompleteParams;
                TriggerProcess.resourceLoadTriggerProcess(trigger, context, ResourceLoadTriggerType.DISPLAY_OBJECT_VALUE, _value, triggerLoadResponse, triggerLoadFail, [trigger]);
                return;
            }
        }
        if (asyncComplete == null)
        {
            AsyncCall.callbackWithParams(onComplete, onCompleteParams);
        }
    }
    
    private function asyncDisplayLoadComplete(e : Event) : Void
    {
        asyncDisplayLoader.contentLoaderInfo.removeEventListener(Event.COMPLETE, asyncDisplayLoadComplete);
        if (asyncDisplayLoader.content != null)
        {
            //#AS3 _value.e3d::_display = asyncDisplayLoader.content;
            _value.display = asyncDisplayLoader.content;
            //#AS3 _value.e3d::_bytes = asyncEmbedReader.readEmbedObject(asyncEmbedPointer);
            _value.bytes = asyncEmbedReader.readEmbedObject(asyncEmbedPointer);
            asyncEmbedReader.allocateObject(asyncEmbedPointer, asyncDisplayLoader.content);
        }
        asyncDisplayLoader = null;
        asyncEmbedReader = null;
        AsyncCall.callbackWithParams(asyncComplete, asyncCompleteParams);
        asyncComplete = null;
        asyncCompleteParams = null;
    }
    
    private function triggerLoadResponse(data : Dynamic, trigger : IResourceLoadTrigger) : Void
    {
        if (data != null)
        {
            if (Std.is(data, DisplayObject))
            {
                //#AS3 _value.e3d::_display = cast((data), DisplayObject);
                _value.display = cast((data), DisplayObject);
            }
            else if (Std.is(data, IDataInput))
            {
                //#AS3 _value.e3d::_bytes = cast((data), ByteArray);
                _value.bytes = cast((data), ByteArray);
            }
            else if (Std.is(data, DisplayObjectTriggerResponse))
            {
                //#AS3 _value.e3d::_display = cast((data), DisplayObjectTriggerResponse).display;
                _value.display = cast((data), DisplayObjectTriggerResponse).display;
                //#AS3 _value.e3d::_bytes = cast((data), DisplayObjectTriggerResponse).bytes;
                _value.bytes = cast((data), DisplayObjectTriggerResponse).bytes;
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
        trace("WARNING! Trigger " + trigger.resourceType + " failed when loading DisplayObject. " + message);
        trigger.dispose();
        AsyncCall.callbackWithParams(asyncComplete, asyncCompleteParams);
        asyncComplete = null;
        asyncCompleteParams = null;
    }
    
    private function get_value() : DisplayObjectValue
    {
        return _value;
    }

    public function new()
    {
    }
}

