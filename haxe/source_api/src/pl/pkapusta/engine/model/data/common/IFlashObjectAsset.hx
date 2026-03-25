package pl.pkapusta.engine.model.data.common;

@:native("Engine3D.model.data.common.IFlashObjectAsset")
extern interface IFlashObjectAsset extends IBaseAsset {
	var content(get, never):Any;
}