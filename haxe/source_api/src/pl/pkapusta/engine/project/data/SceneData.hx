package pl.pkapusta.engine.project.data;

import pl.pkapusta.engine.common.interfaces.IParamStorage;

extern class SceneData implements IParamStorage {
	public function new();
	public function setParam(name:String, data:Dynamic):Void;
	public function getParam(name:String):Dynamic;
	public function hasParam(name:String):Bool;
	public function clearParam(name:String):Void;
	public function getParamNames():Array<String>;
	public function dispatchDataChange():Void;
	public function dispose():Void;
}