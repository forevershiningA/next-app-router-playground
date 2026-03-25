package pl.pkapusta.engine.model.data.common;

@:native("Engine3D.model.data.common.IObject3DAsset")
extern interface IObject3DAsset extends IBaseAsset {
	var assets(get, never):Map<String, Array<Dynamic>>;
	var loader(get, never):Any;
}