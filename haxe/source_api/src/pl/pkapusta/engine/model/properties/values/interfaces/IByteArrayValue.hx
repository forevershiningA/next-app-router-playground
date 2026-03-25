package pl.pkapusta.engine.model.properties.values.interfaces;

@:native("Engine3D.values.interfaces.IByteArrayValue")
extern interface IByteArrayValue extends ICompositeValue {
	var data(get, never):Any;
}