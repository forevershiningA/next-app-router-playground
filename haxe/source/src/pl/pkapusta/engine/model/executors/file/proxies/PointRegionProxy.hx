package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.model.regions.AbstractRegion;

/**
 * @author Przemysław Kapusta
 */
class PointRegionProxy extends RegionProxy implements IPointRegionProxy
{
    
    public function new(region : AbstractRegion)
    {
        super(region);
    }
}

