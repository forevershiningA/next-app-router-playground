package pl.pkapusta.engine.model.data.parsers.model3d;

import pl.pkapusta.engine.common.data.parsers.*;
import pl.pkapusta.engine.common.exteption.Exception;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.model.data.common.ParserModel3DAsset;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DAssetsParser extends AbstractParser
{
    
    public var assets : Array<ParserModel3DAsset>;
    
    override public function readStream(data : ByteArray) : Void
    {
        assets = new Array<ParserModel3DAsset>();
        var length : Int = data.readShort();
        for (i in 0...length)
        {
            var asset : ParserModel3DAsset = new ParserModel3DAsset();
            asset.id = data.readUTF();
            asset.type = data.readByte();
            var dataLength : Int = data.readUnsignedInt();
            asset.data = new ByteArray();
            data.readBytes(asset.data, 0, dataLength);
            if (data.readBoolean())
            {
                var execLength : Int = data.readUnsignedInt();
                asset.executor = new ByteArray();
                data.readBytes(asset.executor, 0, execLength);
            }
            assets.push(asset);
        }
    }
    
    //#if PARSER::doWrite
    override public function writeStream(data : ByteArray) : Void
    {
        if (assets == null)
        {
            ExceptionManager.Throw(new Exception("Write Stream -> Asset list is null!!!"));return;
        }
        data.writeShort(assets.length);
        var i : Int = 0;
        while (i < assets.length)
        {
            data.writeUTF(assets[i].id);
            data.writeByte(assets[i].type);
            data.writeUnsignedInt(assets[i].data.length);
            data.writeBytes(assets[i].data);
            if (assets[i].executor != null)
            {
                data.writeBoolean(true);
                data.writeUnsignedInt(assets[i].executor.length);
                data.writeBytes(assets[i].executor);
            }
            else
            {
                data.writeBoolean(false);
            }
            i++;
        }
    }

    public function new()
    {
        super();
    }
}

