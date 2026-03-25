package forevershining.urns.happy_heart;

import away3d.entities.Mesh;
import away3d.library.assets.IAsset;
import pl.pkapusta.engine.model.executors.file.asset.IModel3DAssetExecutor;

/**
 * @author Przemysław Kapusta
 */
@:expose("Executor")
class ModelAssetExecutor implements IModel3DAssetExecutor {
    
    public function setAssetLoaderContext(assetLoaderContext : Dynamic, loader3d : Dynamic, modelAssetId : String, modelSharedData : Dynamic) : Void {}
    
    public function setupAsset(asset : IAsset, modelAssetId : String, modelSharedData : Dynamic) : Void {
        if (asset.assetType == "mesh") {
        
        //trace("->mesh: " + asset.name);
		
			cast(asset, Mesh).mouseEnabled = true;
            var _sw0_ = (asset.name);            

            switch (_sw0_)
            {
                case "border":
                    modelSharedData.setParam("borderMesh", asset);
                case "front":
                    modelSharedData.setParam("frontMesh", asset);
            }
        }
    }
    
	public function setupAllAssets(assetDictionaty : Map<String, Array<Dynamic>>, modelAssetId : String, modelSharedData : Dynamic) : Void {}

    public function new() {}
	
}

