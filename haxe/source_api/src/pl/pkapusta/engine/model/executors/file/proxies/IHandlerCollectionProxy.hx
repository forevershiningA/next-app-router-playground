package pl.pkapusta.engine.model.executors.file.proxies;

@:native("Engine3D.model.executors.file.proxies.IHandlerCollectionProxy")
extern interface IHandlerCollectionProxy extends IBaseProxy {
	function getCount():Int;
	function getAll():Array<IHandlerProxy>;
	function isEmpty():Bool;
	function contains(id:String):Bool;
	function getById(id:String):IHandlerProxy;
}