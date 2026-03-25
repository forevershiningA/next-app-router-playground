package pl.pkapusta.engine.model.executors.file.asset;

import away3d.library.assets.IAsset;

@:native("Engine3D.model.executors.file.asset.IModel3DAssetExecutor")
extern interface IModel3DAssetExecutor {
	function setAssetLoaderContext(assetLoaderContext:Dynamic, loader3d:Dynamic, modelAssetId:String, modelSharedData:Dynamic):Void;
	function setupAsset(asset:IAsset, modelAssetId:String, modelSharedData:Dynamic):Void;
	function setupAllAssets(assetDictionaty:Map<String, Array<Dynamic>>, modelAssetId:String, modelSharedData:Dynamic):Void;
}