package pl.pkapusta.engine.model.properties.writers;

import openfl.display.JPEGEncoderOptions;
import openfl.errors.Error;
import haxe.Constraints.Function;
import haxe.crypto.Crc32;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementAsyncReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;
import pl.pkapusta.engine.common.enums.EmbedType;
import pl.pkapusta.engine.common.utils.AsyncCall;
import pl.pkapusta.engine.model.properties.values.ATFTextureValue;
import pl.pkapusta.engine.model.properties.values.BitmapTextureValue;
import pl.pkapusta.engine.model.properties.values.TextureValue;
import pl.pkapusta.engine.project.data.IProjectContext;
import pl.pkapusta.engine.project.data.triggers.IResourceLoadTrigger;
import pl.pkapusta.engine.project.data.triggers.ResourceLoadTriggerType;
import pl.pkapusta.engine.project.data.triggers.utils.TriggerProcess;
import openfl.display.Bitmap;
import openfl.display.BitmapData;
import openfl.display.Loader;
import openfl.events.Event;
import openfl.utils.IDataInput;
import openfl.utils.ByteArray;

/**
 * @author Przemysław Kapusta
 */
class TextureValueWriter implements IProjectElementWriter implements IProjectElementAsyncReader
{
    public var value(get, never) : TextureValue;

    
    private static var _instance : TextureValueWriter = null;
    public static function getWriterInstance(value : TextureValue) : TextureValueWriter
    {
        if (_instance == null)
        {
            _instance = new TextureValueWriter();
        }
        _instance._value = value;
        return _instance;
    }
    
    public static function getReaderInstance() : TextureValueWriter
    {
        return new TextureValueWriter();
    }
    
    private var _value : TextureValue = null;
    
    public function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    {
        var xml : FastXML = FastXML.parse("<textureValue />");
        xml.setAttribute("type", _value.textureType);
        if (_value.uniqueId != null && _value.uniqueId != null)
        {
            xml.setAttribute("uniqueid", _value.uniqueId);
        }
		var extraData : FastXML = FastXML.parse(_value.getExtraData().toString());
		xml.appendChild(extraData.x);
		xml.setAttribute("surface-coating-scale", Std.string(_value.surfaceCoatingScale));
        if (EmbeddableWriter.isNeedWriteData(_value))
        {
            if (Std.is(_value, BitmapTextureValue))
            {
				var bmp:BitmapData = cast((_value), BitmapTextureValue).texture;
                var byteArrayToCrc32 : ByteArray = bmp.getPixels(bmp.rect);
                var pixelsCrc32 : Int = Crc32.make(byteArrayToCrc32);
                byteArrayToCrc32.clear();
                var embedPointer : Int = embedWriter.embedPointerByUniqueObject(pixelsCrc32);
                if (embedPointer >= 0)
                {
                    EmbeddableWriter.writeEmbedPointer(xml, embedPointer);
                }
                else
                {
                    //#AS3 var bytes : ByteArray = JPEGEncoder.encode(cast((_value), BitmapTextureValue).texture, 90);
                    var bytes : ByteArray = bmp.encode(bmp.rect, new JPEGEncoderOptions(90));
                    EmbeddableWriter.writeEmbedData(_value, embedWriter, xml, pixelsCrc32, bytes);
                    bytes.clear();
                }
            }
            else if (Std.is(_value, ATFTextureValue))
            {
                var crc32 : Int = Crc32.make(cast((_value), ATFTextureValue).texture);
                EmbeddableWriter.writeEmbedData(_value, embedWriter, xml, crc32, cast((_value), ATFTextureValue).texture);
            }
            else
            {
                throw new Error("Not supported TextureValue type");
            }
        }
        return xml;
    }
    
    
    private var asyncBitmapLoader : Loader = null;
    private var asyncComplete : Function = null;
    private var asyncCompleteParams : Array<Dynamic> = null;
    private var asyncEmbedReader : IParserEmbedReader = null;
    private var asyncEmbedPointer : Int;
    
    public function readProjectElement(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext, onComplete : Function, onCompleteParams : Array<Dynamic> = null) : Void
    {
        if (xml == null || !xml.hasNode.textureValue || !xml.node.textureValue.has.type || !xml.node.textureValue.has.resolve("surface-coating-scale"))
        {
            trace("WARNING: Unable to read TextureValue from project data");
            AsyncCall.callbackWithParams(onComplete, onCompleteParams);
            return;
        }
        var xmlNode : FastXML = xml.node.textureValue;
        var type : String = xmlNode.att.type;
        var trigger : IResourceLoadTrigger = null;
        var surfaceCoatingScale : Float = as3hx.Compat.parseFloat(xmlNode.att.resolve("surface-coating-scale"));
        switch (type)
        {
            case BitmapTextureValue.TEXTURE_TYPE:
                _value = new BitmapTextureValue(null, surfaceCoatingScale);
                readCommonData(xmlNode);
                if (EmbeddableWriter.isNeedReadData(xmlNode))
                {
                    _value.setEmbedType(EmbedType.EMBEDDED);
                    var embedPointer : Int = EmbeddableWriter.readEmbedPointer(xmlNode);
                    if (embedReader.hasAllocatedObject(embedPointer))
                    {
                        //#AS3 cast((_value), BitmapTextureValue).e3d::_texture = try cast(embedReader.getAllocatedObject(embedPointer), BitmapData) catch(e:Dynamic) null;
                        cast((_value), BitmapTextureValue).texture = try cast(embedReader.getAllocatedObject(embedPointer), BitmapData) catch(e:Dynamic) null;
                    }
                    else
                    {
                        var textureBytes : ByteArray = EmbeddableWriter.readEmbedData(embedReader, xmlNode);
                        asyncComplete = onComplete;
                        asyncCompleteParams = onCompleteParams;
                        asyncEmbedReader = embedReader;
                        asyncEmbedPointer = embedPointer;
                        asyncBitmapLoader = new Loader();
                        asyncBitmapLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, asyncBitmapLoadComplete);
                        asyncBitmapLoader.loadBytes(textureBytes);
                    }
                }
                else if (context != null)
                {
                    trigger = context.buildResourceLoadTrigger([
                                    ResourceLoadTriggerType.BITMAP_TEXTURE_VALUE, 
                                    ResourceLoadTriggerType.TEXTURE_VALUE, 
                                    ResourceLoadTriggerType.PROPERTY_VALUE, 
                                    ResourceLoadTriggerType.BASE
                    ]);
                    if (trigger != null)
                    {
                        asyncComplete = onComplete;
                        asyncCompleteParams = onCompleteParams;
                        TriggerProcess.resourceLoadTriggerProcess(trigger, context, ResourceLoadTriggerType.BITMAP_TEXTURE_VALUE, _value, triggerLoadResponse, triggerLoadFail, [trigger]);
                        return;
                    }
                }
            case ATFTextureValue.TEXTURE_TYPE:
                _value = new ATFTextureValue(null, surfaceCoatingScale);
                readCommonData(xmlNode);
                if (EmbeddableWriter.isNeedReadData(xmlNode))
                {
                    //#AS3 cast((_value), ATFTextureValue).e3d::_texture = EmbeddableWriter.readEmbedData(embedReader, xmlNode);
                    cast((_value), ATFTextureValue).texture = EmbeddableWriter.readEmbedData(embedReader, xmlNode);
                    _value.setEmbedType(EmbedType.EMBEDDED);
                }
                else if (context != null)
                {
                    trigger = context.buildResourceLoadTrigger([
                                    ResourceLoadTriggerType.ATF_TEXTURE_VALUE, 
                                    ResourceLoadTriggerType.TEXTURE_VALUE, 
                                    ResourceLoadTriggerType.PROPERTY_VALUE, 
                                    ResourceLoadTriggerType.BASE
                    ]);
                    if (trigger != null)
                    {
                        asyncComplete = onComplete;
                        asyncCompleteParams = onCompleteParams;
                        TriggerProcess.resourceLoadTriggerProcess(trigger, context, ResourceLoadTriggerType.ATF_TEXTURE_VALUE, _value, triggerLoadResponse, triggerLoadFail, [trigger]);
                        return;
                    }
                }
            default:
                throw new Error("Not supported TextureValue type");
        }
        if (asyncComplete == null)
        {
            AsyncCall.callbackWithParams(onComplete, onCompleteParams);
        }
    }
    
    private function readCommonData(xmlNode : FastXML) : Void
    {
        if (xmlNode.has.uniqueid)
        {
            _value.uniqueId = xmlNode.att.uniqueid;
        }
        if (xmlNode.hasNode.resolve("extra-data"))
        {
            _value._extraData = FastXML.parse(xmlNode.node.resolve("extra-data").toString());
        }
    }
    
    private function asyncBitmapLoadComplete(e : Event) : Void
    {
        if (Std.is(asyncBitmapLoader.content, Bitmap))
        {
            var texture : BitmapData = cast((asyncBitmapLoader.content), Bitmap).bitmapData;
            //#AS3 cast((_value), BitmapTextureValue).e3d::_texture = texture;
            cast((_value), BitmapTextureValue).texture = texture;
            asyncEmbedReader.allocateObject(asyncEmbedPointer, texture);
        }
        asyncBitmapLoader = null;
        asyncEmbedReader = null;
        AsyncCall.callbackWithParams(asyncComplete, asyncCompleteParams);
        asyncComplete = null;
        asyncCompleteParams = null;
    }
    
    private function triggerLoadResponse(data : Dynamic, trigger : IResourceLoadTrigger) : Void
    {
        if (data != null)
        {
            if (Std.is(_value, BitmapTextureValue) && Std.is(data, BitmapData))
            {
                //#AS3 cast((_value), BitmapTextureValue).e3d::_texture = cast((data), BitmapData);
                cast((_value), BitmapTextureValue).texture = cast((data), BitmapData);
            }
            else if (Std.is(_value, ATFTextureValue) && Std.is(data, IDataInput))
            {
                //#AS3 cast((_value), ATFTextureValue).e3d::_texture = cast((data), ByteArray);
                cast((_value), ATFTextureValue).texture = cast((data), ByteArray);
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
        trace("WARNING! Trigger " + trigger.resourceType + " failed when loading " + _value.textureType + " texture. " + message);
        trigger.dispose();
        AsyncCall.callbackWithParams(asyncComplete, asyncCompleteParams);
        asyncComplete = null;
        asyncCompleteParams = null;
    }
    
    private function get_value() : TextureValue
    {
        return _value;
    }

    public function new()
    {
    }
}

