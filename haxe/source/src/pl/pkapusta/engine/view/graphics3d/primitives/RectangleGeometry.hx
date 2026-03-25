package pl.pkapusta.engine.view.graphics3d.primitives;

import away3d.core.base.CompactSubGeometry;
import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePath;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.graphics.path.NormalsDirection;
import openfl.geom.Rectangle;

@:expose("Engine3D.view.graphics3d.primitives.RectangleGeometry")
class RectangleGeometry extends PathGeometry
{
    public var width(get, set) : Float;
    public var height(get, set) : Float;

    
    private var _ptl : DiscreteCornerPoint;
    private var _ptr : DiscreteCornerPoint;
    private var _pbr : DiscreteCornerPoint;
    private var _pbl : DiscreteCornerPoint;
    
    private var _width : Float;
    private var _height : Float;
    
    public function new(width : Float, height : Float, thickness : Float, cornerRound : Float = 0, hasFront : Bool = true, hasBack : Bool = true, hasSide : Bool = true, uvMappingRect : Rectangle = null)
    {
        _width = width;
        _height = height;
        super(initPath(), thickness, cornerRound, hasFront, hasBack, hasSide, uvMappingRect);
    }
    
    private function initPath() : DiscretePath
    {
        _ptl = new DiscreteCornerPoint(0, 0);
        _ptr = new DiscreteCornerPoint(0, 0);
        _pbr = new DiscreteCornerPoint(0, 0);
        _pbl = new DiscreteCornerPoint(0, 0);
        updatePoints();
        var points : Array<DiscretePoint> = new Array<DiscretePoint>();
        points.push(_ptl);
        points.push(_ptr);
        points.push(_pbr);
        points.push(_pbl);
        
        return new DiscretePath(points, false, false, NormalsDirection.CLOCKWISE, true);
    }
    
    private function updatePoints() : Void
    {
        _ptl.x = -_width * 0.5;
        _ptl.y = -_height * 0.5;
        _ptr.x = _width * 0.5;
        _ptr.y = -_height * 0.5;
        _pbr.x = _width * 0.5;
        _pbr.y = _height * 0.5;
        _pbl.x = -_width * 0.5;
        _pbl.y = _height * 0.5;
    }
    
    override private function buildGeometry(target : CompactSubGeometry) : Void
    {
        updatePoints();
        super.buildGeometry(target);
    }
    
    private function get_width() : Float
    {
        return _width;
    }
    
    private function set_width(value : Float) : Float
    {
        if (_width == value)
        {
            return value;
        }
        _width = value;
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
    
    private function get_height() : Float
    {
        return _height;
    }
    
    private function set_height(value : Float) : Float
    {
        if (_height == value)
        {
            return value;
        }
        _height = value;
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
}

