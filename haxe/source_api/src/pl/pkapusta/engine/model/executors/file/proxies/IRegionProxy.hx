package pl.pkapusta.engine.model.executors.file.proxies;

import openfl.geom.Vector3D;

@:native("Engine3D.model.executors.file.proxies.IRegionProxy")
extern interface IRegionProxy extends IBaseProxy {
	function getId():String;
	function getType():String;
	function getChildLimit():Int;
	function getPosition():Vector3D;
	function getRotation():Vector3D;
	function moveTo(x:Float, y:Float, z:Float):Void;
	function rotateTo(x:Float, y:Float, z:Float):Void;
}