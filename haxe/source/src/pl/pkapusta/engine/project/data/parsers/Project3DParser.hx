package pl.pkapusta.engine.project.data.parsers;

import com.adobe.crypto.SHA1;
import com.adobe.utils.IntUtil;
import pl.pkapusta.engine.common.data.parsers.BasicHeaderParser;
import pl.pkapusta.engine.common.data.parsers.IParserReader;
import pl.pkapusta.engine.common.data.parsers.IParserWriter;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.FileChecksumException;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.NotLongerSupportedFileVersionException;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.UnknownFileFormatException;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.UnknownFileVersionException;
import pl.pkapusta.engine.project.data.parsers.project3d.Project3DEmbedModelsParser;
import pl.pkapusta.engine.project.data.parsers.project3d.Project3DHeaderParser;
import pl.pkapusta.engine.project.data.parsers.project3d.Project3DModelsTreeParser;
import pl.pkapusta.engine.project.data.ProjectContext;
import pl.pkapusta.engine.project.data.ProjectSaveCustomizator;
import pl.pkapusta.engine.project.Project3D;
import pl.pkapusta.engine.IEngine3DView;
import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class Project3DParser extends EventDispatcher implements IParserReader implements IParserWriter
{
    public var success(get, never) : Bool;

    
    public var version : Int = 2;
    public var isCompressed : Bool = true;
    
    
    public var writeCustomizator : ProjectSaveCustomizator = null;
    public var project : Project3D;
    public var context : ProjectContext;
    public var engineView : IEngine3DView;
    
    
    private var _success : Bool = false;
    
    public function readStream(data : ByteArray) : Void
    {
        var headerParser : BasicHeaderParser = new BasicHeaderParser();
        headerParser.readStream(data);
        if (!headerParser.isValid)
        {
            _success = false;
            ExceptionManager.Throw(new UnknownFileFormatException());return;
        }
        var modelHeaderParser : Project3DHeaderParser = new Project3DHeaderParser();
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
        
		//#WARN: old used by.blooddy.crypto.SHA1
        //var dataCheckSHA1 : String = by.blooddy.crypto.SHA1.hashBytes(dataCheck);
        var dataCheckSHA1 : String = SHA1.hashBytes(dataCheck);
        
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
        
        //trace("contentData.length: " + contentData.length);
        
        var embedDataParser : Project3DEmbedModelsParser = new Project3DEmbedModelsParser();
        
        var treeParser : Project3DModelsTreeParser = new Project3DModelsTreeParser();
        treeParser.addEventListener(Event.COMPLETE, dispatchEvent);
        treeParser.project = project;
        treeParser.context = context;
        treeParser.version = version;
        treeParser.embedDataReader = embedDataParser;
        treeParser.addEventListener(Project3DModelsTreeParser.EVENT_BYTES_READED, function(e : Event) : Void
                {
                    var embedDataLength : Int = contentData.readUnsignedInt();
                    //trace("embedDataLength: " + embedDataLength);
                    var embedData : ByteArray = new ByteArray();
                    contentData.readBytes(embedData, 0, embedDataLength);
                    //trace("embedData.length: " + embedData.length);
                    embedDataParser.readStream(embedData);
                });
        treeParser.readStream(contentData);
    }
    
    public function writeStream(data : ByteArray) : Void
    {
        var headerParser : BasicHeaderParser = new BasicHeaderParser();
        headerParser.writeStream(data);
        var modelHeaderParser : Project3DHeaderParser = new Project3DHeaderParser();
        modelHeaderParser.version = version;
        modelHeaderParser.isCompressed = isCompressed;
        modelHeaderParser.writeStream(data);
        
        switch (version)
        {
            case 2:writeV2(data);
            default:
                _success = false;
                ExceptionManager.Throw(new UnknownFileVersionException());return;
        }
        
        var sha1 : ByteArray = com.adobe.crypto.SHA1.hashBytes2(data);
        data.writeBytes(sha1);
    }
    
    private function writeV2(data : ByteArray) : Void
    {
        var contentData : ByteArray = new ByteArray();
        
        var embedData : ByteArray = new ByteArray();
        var embedDataParser : Project3DEmbedModelsParser = new Project3DEmbedModelsParser();
        embedDataParser.writeCustomizator = writeCustomizator;
        //embedDataParser.writeStream(embedData);
        
        var treeParser : Project3DModelsTreeParser = new Project3DModelsTreeParser();
        treeParser.project = project;
        treeParser.writeCustomizator = writeCustomizator;
        treeParser.version = version;
        treeParser.embedDataWriter = embedDataParser;
        treeParser.engineView = engineView;
        treeParser.writeStream(contentData);
        
        //write cached stream
        embedDataParser.writeStream(embedData);
        
        //add embed data
        contentData.writeUnsignedInt(embedData.length);
        contentData.writeBytes(embedData);
        
        if (isCompressed)
        {
            contentData.compress();
        }
        
        data.writeUnsignedInt(contentData.length);
        data.writeBytes(contentData);
        
        embedDataParser.dispose();
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

