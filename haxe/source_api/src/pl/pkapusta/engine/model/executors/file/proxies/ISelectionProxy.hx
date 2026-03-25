package pl.pkapusta.engine.model.executors.file.proxies;

@:native("Engine3D.model.executors.file.proxies.ISelectionProxy")
extern interface ISelectionProxy extends IBaseProxy {
	var active(get, never):Bool;
	function activate():Void;
	function deactivate():Void;
}