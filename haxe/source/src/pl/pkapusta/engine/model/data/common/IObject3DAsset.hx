package pl.pkapusta.engine.model.data.common;

import away3d.loaders.Loader3D;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.data.common.IObject3DAsset")
interface IObject3DAsset extends IBaseAsset
{
    
    var assets(get, never) : Map<String, Array<Dynamic>>;
    var loader(get, never) : Loader3D;

}

