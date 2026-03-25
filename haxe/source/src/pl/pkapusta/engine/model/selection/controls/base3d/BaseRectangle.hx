package pl.pkapusta.engine.model.selection.controls.base3d;

import away3d.primitives.CubeGeometry;
import away3d.primitives.PrimitiveBase;

/**
	 * @author Przemysław Kapusta
	 */
class BaseRectangle extends AbstractBase
{
    
    public function new(size : Float = 1, cursor : String = "auto", visible : Bool = true)
    {
        super(size, cursor, visible);
    }
    
    override private function buildGeom() : PrimitiveBase
    {
        return new CubeGeometry(_size, _size, _size);
    }
    
    override private function updateSize() : Void
    {
        cast((geom), CubeGeometry).width = cast((geom), CubeGeometry).height = cast((geom), CubeGeometry).depth = _size;
    }
}

