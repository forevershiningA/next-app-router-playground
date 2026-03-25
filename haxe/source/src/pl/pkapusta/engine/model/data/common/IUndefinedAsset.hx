package pl.pkapusta.engine.model.data.common;

import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.data.common.IUndefinedAsset")
interface IUndefinedAsset extends IBaseAsset
{
    
    var data(get, never) : ByteArray;

}

