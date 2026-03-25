package pl.pkapusta.engine.model.properties.values.interfaces;

import openfl.display.DisplayObject;

@:native("Engine3D.values.interfaces.IDisplayObjectValue")
extern interface IDisplayObjectValue extends ICompositeValue {
	var display(get, never):DisplayObject;
	var bytes(get, never):Any;
}