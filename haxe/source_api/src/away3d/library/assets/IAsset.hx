package away3d.library.assets;

@:native("Engine3D.core.library.assets.IAsset")
extern interface IAsset {
	var name(get, set):String;
	var id(get, set):String;
	var assetNamespace(get, never):String;
	var assetType(get, never):String;
	var assetFullPath(get, never):Array<Dynamic>;
	function assetPathEquals(name:String, ns:String):Bool;
	function resetAssetPath(name:String, ns:String = null, overrideOriginal:Bool = true):Void;
	function dispose():Void;
}