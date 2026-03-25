package pl.pkapusta.engine.model.data.common;

@:native("Engine3D.model.data.common.IUndefinedAsset")
extern interface IUndefinedAsset extends IBaseAsset {
	var data(get, never):Any;
}