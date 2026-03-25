package pl.pkapusta.engine.model.properties.values.interfaces;

@:native("Engine3D.values.interfaces.ITextureValue")
extern interface ITextureValue extends IMaterialValue {
	var surfaceCoatingScale(get, never):Float;
	var textureType(get, never):String;
}