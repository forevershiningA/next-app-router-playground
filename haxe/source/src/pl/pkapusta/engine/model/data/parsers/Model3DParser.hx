package pl.pkapusta.engine.model.data.parsers;

import haxe.crypto.Sha1;
import com.adobe.utils.IntUtil;
import pl.pkapusta.engine.common.data.parsers.*;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.FileChecksumException;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.NotLongerSupportedFileVersionException;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.UnknownFileFormatException;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.UnknownFileVersionException;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.model.data.common.ParserModel3DAsset;
import pl.pkapusta.engine.model.data.parsers.model3d.Model3DAssetsParser;
import pl.pkapusta.engine.model.data.parsers.model3d.Model3DDefinitionParser;
import pl.pkapusta.engine.model.data.parsers.model3d.Model3DExecutorParser;
import pl.pkapusta.engine.model.data.parsers.model3d.Model3DHeaderParser;
import openfl.utils.ByteArray;
import openfl.utils.Endian;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DParser extends AbstractParser implements IDisposable
{
    public var success(get, never) : Bool;

    
    public var version : Int = 1;
    public var isCompressed : Bool = true;
    public var definition : FastXML;
    public var assets : Array<ParserModel3DAsset>;
    public var executor : ByteArray = null;
    
    private var _success : Bool = false;
    
    override public function readStream(data : ByteArray) : Void
    {
        var headerParser : BasicHeaderParser = new BasicHeaderParser();
        headerParser.readStream(data);
        if (!headerParser.isValid)
        {
            _success = false;
            ExceptionManager.Throw(new UnknownFileFormatException());return;
        }
        var modelHeaderParser : Model3DHeaderParser = new Model3DHeaderParser();
        modelHeaderParser.readStream(data);
        if (!modelHeaderParser.isValid)
        {
            _success = false;
            ExceptionManager.Throw(new UnknownFileFormatException());return;
        }
        version = modelHeaderParser.version;
        isCompressed = modelHeaderParser.isCompressed;
        
        var postHeaderPos : Int = data.position;
        data.position = 0;
        var dataCheck : ByteArray = new ByteArray();
        dataCheck.writeBytes(data, 0, data.length - 20);
        var dataCheckSHA1Bytes : ByteArray = ByteArray.fromBytes(Sha1.make(dataCheck));
		dataCheckSHA1Bytes.position = 0;
		dataCheckSHA1Bytes.endian = Endian.BIG_ENDIAN;
		var dataCheckSHA1 : String = IntUtil.toHex(dataCheckSHA1Bytes.readInt(), true)
        + IntUtil.toHex(dataCheckSHA1Bytes.readInt(), true)
        + IntUtil.toHex(dataCheckSHA1Bytes.readInt(), true)
        + IntUtil.toHex(dataCheckSHA1Bytes.readInt(), true)
        + IntUtil.toHex(dataCheckSHA1Bytes.readInt(), true);
        
        data.position = data.length - 20;
        var fileSHA1 : String = IntUtil.toHex(data.readInt(), true)
        + IntUtil.toHex(data.readInt(), true)
        + IntUtil.toHex(data.readInt(), true)
        + IntUtil.toHex(data.readInt(), true)
        + IntUtil.toHex(data.readInt(), true);
        
        if (fileSHA1 != dataCheckSHA1)
        {
            _success = false;
            ExceptionManager.Throw(new FileChecksumException());return;
        }
        
        data.position = postHeaderPos;
        
        switch (version)
        {
			case 1:
                _success = false;
                ExceptionManager.Throw(new NotLongerSupportedFileVersionException());return;
            case 2:
                readV2(data);
                _success = true;
            default:
                _success = false;
                ExceptionManager.Throw(new UnknownFileVersionException());return;
        }
    }
    
    private function readV2(data : ByteArray) : Void
    {
        var contentDataLength : Int = data.readUnsignedInt();
        var contentData : ByteArray = new ByteArray();
        data.readBytes(contentData, 0, contentDataLength);
        if (isCompressed)
        {
            contentData.uncompress();
        }
        
		contentData.endian = Endian.BIG_ENDIAN;
		
        var definitionParser : Model3DDefinitionParser = new Model3DDefinitionParser();
        definitionParser.readStream(contentData);
        definition = definitionParser.definition;
        
        var assetParser : Model3DAssetsParser = new Model3DAssetsParser();
        assetParser.readStream(contentData);
        assets = assetParser.assets;
        
        var executorParser : Model3DExecutorParser = new Model3DExecutorParser();
        executorParser.readStream(contentData);
        executor = executorParser.executor;
    }
    
    //#if PARSER::doWrite
    override public function writeStream(data : ByteArray) : Void
    {
        var headerParser : BasicHeaderParser = new BasicHeaderParser();
        headerParser.writeStream(data);
        var modelHeaderParser : Model3DHeaderParser = new Model3DHeaderParser();
        modelHeaderParser.version = version;
        modelHeaderParser.isCompressed = isCompressed;
        modelHeaderParser.writeStream(data);
        switch (version)
        {
            case 1:writeV1(data);
            default:
                _success = false;
                ExceptionManager.Throw(new UnknownFileVersionException());return;
        }
        
        var sha1 : ByteArray = ByteArray.fromBytes(Sha1.make(data));
        data.writeBytes(sha1);
    }
    
    //#if PARSER::doWrite
    private function writeV1(data : ByteArray) : Void
    {
        var contentData : ByteArray = new ByteArray();
        var definitionParser : Model3DDefinitionParser = new Model3DDefinitionParser();
        definitionParser.definition = definition;
        definitionParser.writeStream(contentData);
        var assetParser : Model3DAssetsParser = new Model3DAssetsParser();
        assetParser.assets = assets;
        assetParser.writeStream(contentData);
        var executorParser : Model3DExecutorParser = new Model3DExecutorParser();
        executorParser.executor = executor;
        executorParser.writeStream(contentData);
        
        if (isCompressed)
        {
            contentData.compress();
        }
        
        data.writeUnsignedInt(contentData.length);
        data.writeBytes(contentData);
    }
    
    private function get_success() : Bool
    {
        return _success;
    }
    
    public function dispose() : Void
    {
        if (executor != null)
        {
            executor.clear();
            executor = null;
        }
        definition = null;
        if (assets != null)
        {
            var i : Int = 0;
            while (i < assets.length)
            {
                var asset : ParserModel3DAsset = assets[i];
                if (asset.data != null)
                {
                    asset.data.clear();
                    asset.data = null;
                }
                if (asset.executor != null)
                {
                    asset.executor.clear();
                    asset.executor = null;
                }
                asset.id = null;
                asset.type = 0;
                i++;
            }
            assets = null;
        }
    }

    public function new()
    {
        super();
    }
}

