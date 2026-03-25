package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.model.regions.AbstractRegion;
import pl.pkapusta.engine.model.regions.SurfaceRegion;

/**
	 * @author Przemysław Kapusta
	 */
class SurfaceRegionProxy extends RegionProxy implements ISurfaceRegionProxy
{
    
    private var _surfRegion : SurfaceRegion;
    
    public function new(region : AbstractRegion)
    {
        super(region);
        _surfRegion = try cast(region, SurfaceRegion) catch(e:Dynamic) null;
    }
    
    public function isMoving() : Bool
    {
        return _surfRegion.isMoving();
    }
    
    override public function dispose() : Void
    {
        _surfRegion = null;
        super.dispose();
    }
}

