package away3d.library.assets;

@:native("Engine3D.core.library.assets.NamedAssetBase")
extern class NamedAssetBase {
	public var originalName(get, never):String;
	public var id(get, set):String;
	public var name(get, set):String;
	public var assetNamespace(get, never):String;
	public var assetFullPath(get, never):Array<Dynamic>;
	public function new(name:String = null);
	public function assetPathEquals(name:String, ns:String):Bool;
	public function resetAssetPath(name:String, ns:String = null, overrideOriginal:Bool = true):Void;
	private function get_originalName():String;
	private function get_id():String;
	private function set_id(newID:String):String;
	private function get_name():String;
	private function set_name(val:String):String;
	private function get_assetNamespace():String;
	private function get_assetFullPath():Array<Dynamic>;
}