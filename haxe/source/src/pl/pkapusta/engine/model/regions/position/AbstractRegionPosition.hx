package pl.pkapusta.engine.model.regions.position;

import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.*;
import openfl.events.EventDispatcher;

/**
	 * @author Przemysław Kapusta
	 */
class AbstractRegionPosition extends EventDispatcher
{
    
    private var model : Model3D;
    private var region : AbstractRegion;
    
    public function new(model : Model3D, region : AbstractRegion)
    {
        super();
        this.model = model;
        this.region = region;
    }
    
    private function verifyPositionOnRegion() : Void
    {
        region.verifyPositionOnRegion(this, model);
    }
    
    public function destroy() : Void
    {
        model = null;
        region = null;
    }
    
    private function toXML() : FastXML
    {
        return null;
    }
    
    private function fromXML(xml : FastXML) : Void
    {
    }
}

