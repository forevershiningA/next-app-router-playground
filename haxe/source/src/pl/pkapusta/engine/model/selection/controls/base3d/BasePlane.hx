package pl.pkapusta.engine.model.selection.controls.base3d;

import away3d.primitives.PlaneGeometry;
import away3d.primitives.PrimitiveBase;

/**
	 * @author Przemysław Kapusta
	 */
class BasePlane extends AbstractBase
{
    
    public function new(size : Float = 1, cursor : String = "auto", visible : Bool = true)
    {
        super(size, cursor, visible);
    }
    
    override private function buildGeom() : PrimitiveBase
    {
        return new PlaneGeometry(_size, _size);
    }
    
    override private function updateSize() : Void
    {
        cast((geom), PlaneGeometry).width = cast((geom), PlaneGeometry).height = _size;
    }
}

