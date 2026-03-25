package pl.pkapusta.engine.model.regions;

import pl.pkapusta.engine.model.regions.AbstractRegion;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
class PointRegion extends AbstractRegion implements IRegion
{
    
    public function new(data : Dynamic)
    {
        super(data);
    }
    
    override private function parseFromXML(data : FastXML) : Void
    {
        super.parseFromXML(data);
        
        if (data.hasNode.resolve("child-limit"))
        {
            _childLimit = as3hx.Compat.parseInt(data.node.resolve("child-limit").att.value);
        }
        else
        {
            _childLimit = 1;
        }
    }
    
    override public function getType() : String
    {
        return AbstractRegion.TYPE_POINT;
    }
}

