package pl.pkapusta.engine.model.executors.file.asset;
import away3d.library.assets.IAsset;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.file.asset.IModel3DAssetExecutor")
interface IModel3DAssetExecutor
{

    function setAssetLoaderContext(assetLoaderContext : Dynamic, loader3d : Dynamic, modelAssetId : String, modelSharedData : Dynamic) : Void;
    function setupAsset(asset : IAsset, modelAssetId : String, modelSharedData : Dynamic) : Void;
    function setupAllAssets(assetDictionaty : Map<String, Array<Dynamic>>, modelAssetId : String, modelSharedData : Dynamic) : Void;
}

