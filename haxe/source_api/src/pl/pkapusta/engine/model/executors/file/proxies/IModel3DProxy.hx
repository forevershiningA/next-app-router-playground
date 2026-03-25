package pl.pkapusta.engine.model.executors.file.proxies;

@:native("Engine3D.model.executors.file.proxies.IModel3DProxy")
extern interface IModel3DProxy extends IBaseProxy {
	function getDescription():Any;
	function getVersion():Int;
	function isReady():Bool;
	function isContextReady():Bool;
	function getGeneralType():String;
	function getHandlers():IHandlerCollectionProxy;
	function getExtraData():Any;
	function changeProperty(id:String, value:Dynamic):Void;
	function getProperty(id:String):Dynamic;
	function getInfo(type:String):Dynamic;
	function getRegion(id:String):IRegionProxy;
	function hasProperty(id:String):Bool;
	function isSelected():Bool;
	function setSelected(value:Bool):Bool;
	function getSelectionObject():ISelectionProxy;
}