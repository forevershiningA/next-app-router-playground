package pl.pkapusta.engine.common.formats.font.parser;

import com.adobe.crypto.SHA1;
import pl.pkapusta.engine.common.data.parsers.*;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.FileChecksumException;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.UnknownFileFormatException;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.UnknownFileVersionException;
import pl.pkapusta.engine.common.formats.font.parser.base.FontClassParser;
import pl.pkapusta.engine.common.formats.font.parser.base.FontHeaderParser;
import pl.pkapusta.engine.model.data.common.ParserModel3DAsset;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class FontParser extends AbstractParser
{
    public var success(get, never) : Bool;

    
    public var version : Int = 1;
    public var isCompressed : Bool = true;
    public var classExecutor : ByteArray = null;
    
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
        var fontHeaderParser : FontHeaderParser = new FontHeaderParser();
        fontHeaderParser.readStream(data);
        if (!fontHeaderParser.isValid)
        {
            _success = false;
            ExceptionManager.Throw(new UnknownFileFormatException());return;
        }
        version = fontHeaderParser.version;
        isCompressed = fontHeaderParser.isCompressed;
        
        var postHeaderPos : Int = data.position;
        data.position = 0;
        var dataCheck : ByteArray = new ByteArray();
        dataCheck.writeBytes(data, 0, data.length - 20);
        var dataCheckSHA1 : ByteArray = SHA1.hashBytes2(dataCheck);
        dataCheckSHA1.position = 0;
        data.position = data.length - 20;
        
        var sha1True : Bool = true;
        for (i in 0...5)
        {
            if (data.readUnsignedInt() != dataCheckSHA1.readUnsignedInt())
            {
                sha1True = false;
                break;
            }
        }
        
        if (!sha1True)
        {
            _success = false;
            ExceptionManager.Throw(new FileChecksumException());return;
        }
        
        data.position = postHeaderPos;
        
        switch (version)
        {
            case 1:
                readV1(data);
                _success = true;
            default:
                _success = false;
                ExceptionManager.Throw(new UnknownFileVersionException());return;
        }
    }
    
    private function readV1(data : ByteArray) : Void
    {
        var contentDataLength : Int = data.readUnsignedInt();
        var contentData : ByteArray = new ByteArray();
        data.readBytes(contentData, 0, contentDataLength);
        if (isCompressed)
        {
            contentData.uncompress();
        }
        
        var classParser : FontClassParser = new FontClassParser();
        classParser.readStream(contentData);
        classExecutor = classParser.classExecutor;
    }
    
    //#if PARSER::doWrite
    override public function writeStream(data : ByteArray) : Void
    {
        var headerParser : BasicHeaderParser = new BasicHeaderParser();
        headerParser.writeStream(data);
        var fontHeaderParser : FontHeaderParser = new FontHeaderParser();
        fontHeaderParser.version = version;
        fontHeaderParser.isCompressed = isCompressed;
        fontHeaderParser.writeStream(data);
        switch (version)
        {
            case 1:writeV1(data);
            default:
                _success = false;
                ExceptionManager.Throw(new UnknownFileVersionException());return;
        }
        
        var sha1 : ByteArray = SHA1.hashBytes2(data);
        data.writeBytes(sha1);
    }
    
    //#if PARSER::doWrite
    private function writeV1(data : ByteArray) : Void
    {
        var contentData : ByteArray = new ByteArray();
        
        var classParser : FontClassParser = new FontClassParser();
        classParser.classExecutor = classExecutor;
        classParser.writeStream(contentData);
        
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

    public function new()
    {
        super();
    }
}

