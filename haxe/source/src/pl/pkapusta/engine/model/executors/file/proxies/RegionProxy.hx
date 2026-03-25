package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.model.regions.*;
import openfl.geom.Vector3D;

/**
 * @author Przemysław Kapusta
 */
class RegionProxy implements IRegionProxy
{
    
    public static function factory(region : AbstractRegion) : IRegionProxy
    {
        if (region == null)
        {
            return null;
        }
        if (Std.is(region, PointRegion))
        {
            return new PointRegionProxy(region);
        }
        if (Std.is(region, LineRegion))
        {
            return new LineRegionProxy(region);
        }
        if (Std.is(region, SurfaceRegion))
        {
            return new SurfaceRegionProxy(region);
        }
        return new RegionProxy(region);
    }
    
    private var _region : AbstractRegion;
    
    public function new(region : AbstractRegion)
    {
        _region = region;
    }
    
    public function getId() : String
    {
        return _region.getId();
    }
    
    public function getType() : String
    {
        return _region.getType();
    }
    
    public function getChildLimit() : Int
    {
        return _region.getChildLimit();
    }
    
    public function getPosition() : Vector3D
    {
        return _region.getPosition();
    }
    
    public function getRotation() : Vector3D
    {
        return _region.getRotation();
    }
    
    public function moveTo(x : Float, y : Float, z : Float) : Void
    {
        _region.moveTo(x, y, z);
    }
    
    public function rotateTo(x : Float, y : Float, z : Float) : Void
    {
        _region.rotateTo(x, y, z);
    }
    
    public function getBaseInstance() : Dynamic
    {
        return _region;
    }
    
    public function dispose() : Void
    {
        _region = null;
    }
}

