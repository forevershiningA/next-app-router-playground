package pl.pkapusta.engine.model.executors.utils.properties;

@:keep
@:native("Engine3D.model.executors.utils.properties.IM3DProperty")
extern interface IM3DProperty {
	var propertyId(get, never):String;
	function change(data:Dynamic):Bool;
}