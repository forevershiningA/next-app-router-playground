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
import pl.pkapusta.engine.model.selection.controls.PlanarTransformControls;
import pl.pkapusta.engine.model.selection.controls.TransformControlsType;
import openfl.geom.Rectangle;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.SurfaceSelection")
class SurfaceSelection extends AbstractSelection
{
    public var area(get, never) : Rectangle;

    
    private var _color : Int = 0xFFFFFF;
    private var _offset : Float = 1;
    private var _controlSize : Float = 1;
    private var _controlType : Int = 0;
    private var _hasInnerControls : Bool = true;
    private var _hasRotationControls : Bool = false;
    
    private var _area : Rectangle;
    private var selectBase : WireframePlane;
    
    private var _resizable : Bool = false;
    
    private var controls : PlanarTransformControls;
    
    public function new(model : Model3D, container : ObjectContainer3D, settings : FastXML = null)
    {
        _area = new Rectangle(-50, -50, 100, 100);
        super(model, container, settings);
        build();
        update();
    }
	
	override public function getType() : String {
		return AbstractSelection.TYPE_SURFACE;
	}
    
    private function build() : Void
    {
        selectBase = new WireframePlane(_area.width, _area.height, 1, 1, _color, 0.5, WireframePlane.ORIENTATION_XZ);
        selectBase.x = _area.x + _area.width / 2;
        selectBase.z = _area.y + _area.height / 2;
        selectBase.y = 0.15;
        selectBase.mouseEnabled = false;
        selectBase.mouseChildren = false;
    }
    
    private function update() : Void
    //if (active) doDeactivate();
    {
        
        selectBase.width = _area.width;
        selectBase.height = _area.height;
        selectBase.x = _area.x + _area.width / 2;
        selectBase.z = _area.y + _area.height / 2;
    }
    
    override private function parseSettings(data : FastXML) : Void
    {
        if (data.has.x)
        {
            _area.x = as3hx.Compat.parseFloat(data.att.x);
        }
        if (data.has.y)
        {
            _area.y = as3hx.Compat.parseFloat(data.att.y);
        }
        if (data.has.width)
        {
            _area.width = as3hx.Compat.parseFloat(data.att.width);
        }
        if (data.has.height)
        {
            _area.height = as3hx.Compat.parseFloat(data.att.height);
        }
        if (data.has.resolve("control-size"))
        {
            _controlSize = as3hx.Compat.parseFloat(data.att.resolve("control-size"));
        }
        if (data.has.resolve("control-type"))
        {
            _controlType = TransformControlsType.fromString(data.att.resolve("control-type"));
        }
        if (data.has.resolve("has-inner-controls"))
        {
            _hasInnerControls = ((data.att.resolve("has-inner-controls").toLowerCase() == "false" || data.att.resolve("has-inner-controls") == "0")) ? false : true;
        }
        if (data.has.resolve("has-rotation-controls"))
        {
            _hasRotationControls = ((data.att.resolve("has-rotation-controls").toLowerCase() == "true" || data.att.resolve("has-rotation-controls") == "1")) ? true : false;
        }
        if (data.has.resizable)
        {
            setResizable( ((data.att.resizable.toLowerCase() == "true" || data.att.resizable == "1")) ? true : false );
        }
    }
    
    override private function doActivate() : Void
    {
        container.addChild(selectBase);
        if (controls != null)
        {
            container.addChild(controls);
        }
    }
    
    override private function doDeactivate() : Void
    {
        container.removeChild(selectBase);
        if (controls != null)
        {
            container.removeChild(controls);
        }
    }
    
    
    
    private function initResizingControls() : Void
    {
        if (controls != null)
        {
            return;
        }
        controls = new PlanarTransformControls(model, this, _area, _controlSize, _controlType, _hasInnerControls, _hasRotationControls);
        controls.y = 0.05;
        if (active)
        {
            container.addChild(controls);
        }
    }
    
    private function removeResizingControls() : Void
    {
        if (controls == null)
        {
            return;
        }
        if (active)
        {
            container.removeChild(controls);
        }
        controls.destroy();
        controls = null;
    }
    
    
    
    public function setArea(area : Rectangle) : Void
    {
        if (area.equals(_area))
        {
            return;
        }
        _area = area;
        update();
        if (controls != null)
        {
            controls.setArea(_area);
        }
    }
    
    public function setRotation(rotation : Float) : Void
    {
        selectBase.rotationY = rotation;
        if (controls != null)
        {
            controls.rotationY = rotation;
        }
    }
    
    private function get_area() : Rectangle
    {
        return _area;
    }
    
    public function isResizable() : Bool
    {
        return _resizable;
    }
    
    public function setResizable(value : Bool) : Bool
    {
        if (_resizable == value)
        {
            return value;
        }
        _resizable = value;
        if (_resizable)
        {
            initResizingControls();
        }
        else
        {
            removeResizingControls();
        }
        return value;
    }
	
	public function getRotatable():Bool {
		return _hasRotationControls;
	}
	
	public function setRotatable(value: Bool):Bool {
		if (_hasRotationControls == value) {
			return value;
		}
		_hasRotationControls = value;
		removeResizingControls();
		if (_resizable) initResizingControls();
		return value;
	}
    
    override public function dispose() : Void
    {
        if (selectBase != null)
        {
            selectBase.disposeWithChildren();
            selectBase = null;
        }
        controls = null;
        super.dispose();
    }
}

