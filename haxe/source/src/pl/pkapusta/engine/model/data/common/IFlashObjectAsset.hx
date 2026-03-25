package pl.pkapusta.engine.model.data.common;

import openfl.display.DisplayObject;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.data.common.IFlashObjectAsset")
interface IFlashObjectAsset extends IBaseAsset
{
    
    var content(get, never) : DisplayObject;

}

