package pl.pkapusta.engine.project.data.structure.storage;

import pl.pkapusta.engine.project.data.IProjectContext;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class XMLProjectStorageObject implements IProjectStorageObject implements IProjectElementWriter implements IProjectElementReader
{
    
    private var PARAM_TYPE_STRING(default, never) : String = "string";
    private var PARAM_TYPE_NUMBER(default, never) : String = "number";
    private var PARAM_TYPE_INT(default, never) : String = "int";
    
    private var _xmlNode : FastXML;
    private var _paramsCache : Map<String, Map<String, String>>;
    
    private var _embedReader : IParserEmbedReader;
    
    public function new()
    {
        clear();
    }
    
    public function clear() : Void
    {
        _paramsCache = null;
        _xmlNode = FastXML.parse("<storageObject />");
    }
    
    public function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    {
        return _xmlNode;
    }
    
    public function readProjectElement(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext) : Void
    {
        _xmlNode = xml;
        _embedReader = embedReader;
    }
    
    private function writeParam(key : String, type : String, value : String) : Void
    {
        var paramNode : FastXML = FastXML.parse("<param />");
        paramNode.setAttribute("key", key);
        paramNode.setAttribute("type", type);
        paramNode.setAttribute("value", value);
        _xmlNode.appendChild(paramNode);
    }
    
    private function readParam(key : String, type : String, def : Dynamic = null) : String
    {
        if (_paramsCache == null)
        {
            cacheParams();
        }
        if (_paramsCache.exists(type))
        {
            var dictByType : Map<String, String> = _paramsCache.get(type);
            if (dictByType.exists(key))
            {
                return dictByType.get(key);
            }
        }
        return def;
    }
    
    private function cacheParams() : Void
    {
        _paramsCache = new Map<String, Map<String, String>>();
        if (_xmlNode.hasNode.param)
        {
            for (paramNode in _xmlNode.nodes.param)
            {
                if (!paramNode.has.type || !paramNode.has.key || !paramNode.has.value) continue;
                var key : String = paramNode.att.key;
                var type : String = paramNode.att.type;
                var value : String = paramNode.att.value;
                var dictByType : Map<String, String> = null;
                if (_paramsCache.exists(type))
                {
                    dictByType = _paramsCache.get(type);
                }
                else
                {
                    dictByType = new Map<String, String>();
					_paramsCache.set(type, dictByType);
                }
                dictByType.set(key, value);
            }
        }
    }
    
    public function createStorageObject() : IProjectStorageObject
    {
        return new XMLProjectStorageObject();
    }
    
    public function readString(key : String, def : String = null) : String
    {
        return readParam(key, PARAM_TYPE_STRING, def);
    }
    
    public function readNumber(key : String, def : Null<Float> = null) : Null<Float>
    {
        return as3hx.Compat.parseFloat(readParam(key, PARAM_TYPE_NUMBER, Std.string(def)));
    }
    
    public function readInt(key : String, def : Int = 0) : Int
    {
        return as3hx.Compat.parseInt(readParam(key, PARAM_TYPE_INT, Std.string(def)));
    }
    
    public function readByteArray(key : String) : ByteArray
    {
        return null;
    }
    
    public function readSubAdapter(key : String) : IProjectStorageObject
    {
        return null;
    }
    
    public function writeString(key : String, value : String) : Void
    {
        writeParam(key, PARAM_TYPE_STRING, value);
    }
    
    public function writeNumber(key : String, value : Float) : Void
    {
        writeParam(key, PARAM_TYPE_NUMBER, Std.string(value));
    }
    
    public function writeInt(key : String, value : Int) : Void
    {
        writeParam(key, PARAM_TYPE_INT, Std.string(value));
    }
    
    public function writeByteArray(key : String, value : ByteArray) : Void
    {
    }
    
    public function writeSubAdapter(key : String, value : IProjectStorageObject) : Void
    {
    }
}

