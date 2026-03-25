package pl.pkapusta.engine.model.selection.controls.base3d;

import away3d.primitives.PrimitiveBase;
import away3d.primitives.SphereGeometry;

/**
	 * @author Przemysław Kapusta
	 */
class BaseSphere extends AbstractBase
{
    
    public function new(size : Float = 1, cursor : String = "auto", visible : Bool = true)
    {
        super(size, cursor, visible);
    }
    
    override private function buildGeom() : PrimitiveBase
    {
        return new SphereGeometry(_size / 2, 12, 8);
    }
    
    override private function updateSize() : Void
    {
        cast((geom), SphereGeometry).radius = _size / 2;
    }
}

