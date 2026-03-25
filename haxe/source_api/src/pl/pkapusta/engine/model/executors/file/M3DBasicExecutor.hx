package pl.pkapusta.engine.model.executors.file;

import away3d.containers.ObjectContainer3D;
import pl.pkapusta.engine.model.executors.file.proxies.IModel3DProxy;
import pl.pkapusta.engine.common.interfaces.IParamStorage;
import pl.pkapusta.engine.model.data.IModel3DData;
import pl.pkapusta.engine.globals.IGlobals;
import pl.pkapusta.engine.model.executors.bridge.IM3DBridge;
import pl.pkapusta.engine.model.data.common.IObject3DAsset;
import pl.pkapusta.engine.model.data.common.ITextureAsset;
import pl.pkapusta.engine.model.data.common.IFlashObjectAsset;
import pl.pkapusta.engine.model.data.common.IUndefinedAsset;
import openfl.events.EventDispatcher;

@:native("Engine3D.model.executors.file.M3DBasicExecutor")
extern class M3DBasicExecutor extends EventDispatcher {
	public var definition(get, never):Any;
	public var version(get, never):Int;
	public var container(get, never):ObjectContainer3D;
	public var model(get, never):IModel3DProxy;
	public var sharedData(get, never):IParamStorage;
	private var DISPATCH_PROPERTY_TYPE_INIT(default, never):String;
	private var DISPATCH_PROPERTY_TYPE_INTERNAL(default, never):String;
	private var DISPATCH_PROPERTY_TYPE_EXTERNAL(default, never):String;
	public function initData(container:ObjectContainer3D, model:IModel3DProxy, data:IModel3DData, sharedData:IParamStorage, globals:IGlobals, bridge:IM3DBridge):Void;
	public function getObject3DAsset(id:String):IObject3DAsset;
	public function getTextureAsset(id:String):ITextureAsset;
	public function getFlashObjectAsset(id:String):IFlashObjectAsset;
	public function getUndefinedAsset(id:String):IUndefinedAsset;
	public function getGlobals():IGlobals;
	public function dispatchPropertyChange(id:String, data:Dynamic, type:String):Void;
	public function dispose():Void;
	public function new();
}