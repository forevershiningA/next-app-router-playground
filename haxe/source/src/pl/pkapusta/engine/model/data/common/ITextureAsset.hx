package pl.pkapusta.engine.model.data.common;

import openfl.display.BitmapData;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.data.common.ITextureAsset")
interface ITextureAsset extends IBaseAsset
{
    
    var texture(get, never) : BitmapData;

}

