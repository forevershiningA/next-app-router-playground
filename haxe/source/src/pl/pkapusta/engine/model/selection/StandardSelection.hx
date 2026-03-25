package pl.pkapusta.engine.model.selection;

import away3d.containers.ObjectContainer3D;
import away3d.entities.Mesh;
import away3d.entities.SegmentSet;
import away3d.primitives.LineSegment;
import away3d.primitives.WireframeCube;
import away3d.primitives.WireframePlane;
import away3d.primitives.WireframePrimitiveBase;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.selection.AbstractSelection;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.StandardSelection")
class StandardSelection extends AbstractSelection
{
    public var width(get, set) : Float;
    public var height(get, set) : Float;
    public var depth(get, set) : Float;
    public var x(get, set) : Float;
    public var y(get, set) : Float;
    public var z(get, set) : Float;

    
    private var _color : Int = 0xFFFFFF;
    
    private var _offset : Float = 1;
    
    private var _cornerLineLength : Float = 20;
    
    private var _width : Float = 100;
    private var _height : Float = 100;
    private var _depth : Float = 100;
    
    private var _x : Float = 0;
    private var _y : Float = 0;
    private var _z : Float = 0;
    
    private var selectBase : WireframePrimitiveBase;
    
    public function new(model : Model3D, container : ObjectContainer3D, settings : FastXML = null)
    {
        super(model, container, settings);
        build();
        update();
    }
	
	override public function getType() : String {
		return AbstractSelection.TYPE_STANDARD;
	}
    
    private function build() : Void
    {
        if (_depth == 0)
        {
            selectBase = new WireframePlane(_width, _height, 1, 1, _color, 0.5, WireframePlane.ORIENTATION_XZ);
        }
        else
        {
            selectBase = new WireframeCube(_width, _depth, _height, _color, 0.5);
        }
        selectBase.mouseEnabled = false;
        selectBase.mouseChildren = false;
        //selectBase.castsShadows = false;
        selectBase.x = _x;
        selectBase.y = _z;
        selectBase.z = _y;
    }
    
    private function update() : Void
    //if (active) doDeactivate();
    {
        
        if (_depth == 0)
        {
            if (!(Std.is(selectBase, WireframePlane)))
            {
                if (active)
                {
                    container.removeChild(selectBase);
                }
                selectBase = new WireframePlane(_width, _height, 1, 1, _color, 0.5, WireframePlane.ORIENTATION_XZ);
                if (active)
                {
                    container.addChild(selectBase);
                }
            }
            cast((selectBase), WireframePlane).width = _width + _offset * 2;
            cast((selectBase), WireframePlane).height = _height + _offset * 2;
        }
        else
        {
            if (!(Std.is(selectBase, WireframeCube)))
            {
                if (active)
                {
                    container.removeChild(selectBase);
                }
                selectBase = new WireframeCube(_width, _depth, _height, _color, 0.5);
                if (active)
                {
                    container.addChild(selectBase);
                }
            }
            cast((selectBase), WireframeCube).width = _width + _offset * 2;
            cast((selectBase), WireframeCube).height = _depth + _offset * 2;
            cast((selectBase), WireframeCube).depth = _height + _offset * 2;
        }
        selectBase.x = _x;
        selectBase.y = _z;
        selectBase.z = _y;
    }
    
    override private function parseSettings(data : FastXML) : Void
    {
        if (data.has.width)
        {
            _width = as3hx.Compat.parseFloat(data.att.width);
        }
        if (data.has.height)
        {
            _height = as3hx.Compat.parseFloat(data.att.height);
        }
        if (data.has.depth)
        {
            _depth = as3hx.Compat.parseFloat(data.att.depth);
        }
        if (data.has.x)
        {
            _x = as3hx.Compat.parseFloat(data.att.x);
        }
        if (data.has.y)
        {
            _y = as3hx.Compat.parseFloat(data.att.y);
        }
        if (data.has.z)
        {
            _z = as3hx.Compat.parseFloat(data.att.z);
        }
    }
    
    override private function doActivate() : Void
    {
        container.addChild(selectBase);
    }
    
    override private function doDeactivate() : Void
    {
        container.removeChild(selectBase);
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
        update();
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
        update();
        return value;
    }
    
    private function get_depth() : Float
    {
        return _depth;
    }
    
    private function set_depth(value : Float) : Float
    {
        if (_depth == value)
        {
            return value;
        }
        _depth = value;
        update();
        return value;
    }
    
    private function get_x() : Float
    {
        return _x;
    }
    
    private function set_x(value : Float) : Float
    {
        if (_x == value)
        {
            return value;
        }
        _x = value;
        update();
        return value;
    }
    
    private function get_y() : Float
    {
        return _y;
    }
    
    private function set_y(value : Float) : Float
    {
        if (_y == value)
        {
            return value;
        }
        _y = value;
        update();
        return value;
    }
    
    private function get_z() : Float
    {
        return _z;
    }
    
    private function set_z(value : Float) : Float
    {
        if (_z == value)
        {
            return value;
        }
        _z = value;
        update();
        return value;
    }
    
    public function moveTo(x : Float, y : Float, z : Float) : Void
    {
        if (_x == x && _y == y && _z == z)
        {
            return;
        }
        _x = x;
        _y = y;
        _z = z;
        update();
    }
    
    public function resizeTo(width : Float, height : Float, depth : Float) : Void
    {
        if (_width == width && _height == height && _depth == depth)
        {
            return;
        }
        _width = width;
        _height = height;
        _depth = depth;
        update();
    }
    
    override public function dispose() : Void
    {
        if (selectBase != null)
        {
            selectBase.disposeWithChildren();
            selectBase = null;
        }
        super.dispose();
    }
}

