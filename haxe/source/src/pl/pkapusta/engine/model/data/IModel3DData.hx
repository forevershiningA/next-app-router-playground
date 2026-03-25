package pl.pkapusta.engine.model.data;

import pl.pkapusta.engine.model.data.common.IFlashObjectAsset;
import pl.pkapusta.engine.model.data.common.IObject3DAsset;
import pl.pkapusta.engine.model.data.common.ITextureAsset;
import pl.pkapusta.engine.model.data.common.IUndefinedAsset;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.data.IModel3DData")
interface IModel3DData
{
    
    var definition(get, never) : FastXML;    
    var version(get, never) : Int;    
    var object3DAssetsList(get, never) : Array<IObject3DAsset>;    
    var textureAssetsList(get, never) : Array<ITextureAsset>;    
    var flashObjectAssetsList(get, never) : Array<IFlashObjectAsset>;    
    var undefinedAssetsList(get, never) : Array<IUndefinedAsset>;

    function getObject3DAsset(id : String) : IObject3DAsset
    ;
    function getTextureAsset(id : String) : ITextureAsset
    ;
    function getFlashObjectAsset(id : String) : IFlashObjectAsset
    ;
    function getUndefinedAsset(id : String) : IUndefinedAsset
    ;
}

