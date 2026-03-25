package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.model.regions.AbstractRegion;
import pl.pkapusta.engine.model.regions.LineRegion;
import openfl.geom.Vector3D;

/**
 * @author Przemysław Kapusta
 */
class LineRegionProxy extends RegionProxy implements ILineRegionProxy
{   
    private var _lineRegion : LineRegion;
    
    public function new(region : AbstractRegion)
    {
        super(region);
        _lineRegion = try cast(region, LineRegion) catch(e:Dynamic) null;
    }
    
    public function getLineOrientation() : String
    {
        return _lineRegion.getLineOrientation();
    }
    
    public function getWidthLimit() : Float
    {
        return _lineRegion.getWidthLimit();
    }
    
    public function setWidthLimit(value : Float) : Float
    {
        _lineRegion.setWidthLimit(value);
        return value;
    }
    
    override public function dispose() : Void
    {
        _lineRegion = null;
        super.dispose();
    }
}

