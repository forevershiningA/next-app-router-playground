package pl.pkapusta.engine.model.data.common;

@:native("Engine3D.model.data.common.ITextureAsset")
extern interface ITextureAsset extends IBaseAsset {
	var texture(get, never):Any;
}