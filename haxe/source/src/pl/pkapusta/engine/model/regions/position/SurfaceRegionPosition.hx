package pl.pkapusta.engine.model.regions.position;

import pl.pkapusta.engine.model.events.Model3DEvent;
import pl.pkapusta.engine.model.executors.file.events.RegionPositionEvent;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.AbstractRegion;
import pl.pkapusta.engine.model.regions.position.AbstractRegionPosition;
import pl.pkapusta.engine.model.regions.position.events.RegionInnerPositionEvent;
import pl.pkapusta.engine.model.regions.position.implementations.IRegionPosition2DPos;
import pl.pkapusta.engine.model.regions.position.implementations.IRegionPosition2DRotation;
import pl.pkapusta.engine.model.regions.SurfaceRegion;
import pl.pkapusta.engine.utils.mouse.MouseCursorUtil;
import openfl.events.Event;
import openfl.ui.Mouse;
import openfl.ui.MouseCursor;

/**
	 * @author Przemysław Kapusta
	 */
@:access(pl.pkapusta.engine.model.Model3D.modelData)
class SurfaceRegionPosition extends AbstractRegionPosition implements IRegionPosition2DPos implements IRegionPosition2DRotation
{
    public var x(get, set) : Float;
    public var y(get, set) : Float;
    public var rotation(get, set) : Float;

    
    private var _x : Float = 0;
    private var _y : Float = 0;
    private var _rotation : Float = 0;
    
    private var modelExecutor : IM3DExecutor;
    
    private var mouseOver : Bool = false;
    
    public function new(model : Model3D, region : AbstractRegion)
    {
        super(model, region);
        modelExecutor = model.modelData.executor;
        
        addEventListener(RegionInnerPositionEvent.CHANGE_INNER_X, changeInnerXHandler);
        addEventListener(RegionInnerPositionEvent.CHANGE_INNER_Y, changeInnerYHandler);
        
        if (modelExecutor != null)
        {
            modelExecutor.addEventListener(RegionPositionEvent.UPDATE_ROTATION, updateRotationHandler);
            modelExecutor.addEventListener(RegionPositionEvent.UPDATE_ROTATION_BY_INCREASE, updateRotationByIncreaseHandler);
        }
        
        model.addEventListener(Model3D.EVENT_INTERNAL_MOUSE_OVER, modelInnerMouseOver);
        model.addEventListener(Model3D.EVENT_INTERNAL_MOUSE_OUT, modelInnerMouseOut);
        model.addEventListener(Model3D.EVENT_INTERNAL_MODEL_SELECTED, modelInnerSelected);
    }
    
    private function updateRotationByIncreaseHandler(e : RegionPositionEvent) : Void
    {
        rotation += e.value;
    }
    
    private function updateRotationHandler(e : RegionPositionEvent) : Void
    {
        rotation = e.value;
    }
    
    private var _cursorHanged : Bool = false;
    private function setDragCursor() : Void
    {
        if (!_cursorHanged)
        {
            Mouse.cursor = MouseCursorUtil.CURSOR_MOVE;
            _cursorHanged = true;
        }
    }
    private function unsetDragCursor() : Void
    {
        if (_cursorHanged)
        {
            Mouse.cursor = MouseCursor.AUTO;
            _cursorHanged = false;
        }
    }
    
    private function modelInnerMouseOver(e : Event) : Void
    {
        mouseOver = true;
        
        if (modelMoving() && model.isSelected())
        {
            setDragCursor();
        }
    }
    private function modelInnerMouseOut(e : Event) : Void
    {
        unsetDragCursor();
        
        mouseOver = false;
    }
    
    private function modelInnerSelected(e : Event) : Void
    {
        if (mouseOver && modelMoving())
        {
            setDragCursor();
        }
    }
    
    private function modelMoving() : Bool
    {
        var moving : Bool = false;
        if (Std.is(region, SurfaceRegion))
        {
            moving = cast((region), SurfaceRegion).isMoving();
        }
        return moving;
    }
    
    private function changeInnerXHandler(e : RegionInnerPositionEvent) : Void
    {
        _x = e.value;
    }
    
    private function changeInnerYHandler(e : RegionInnerPositionEvent) : Void
    {
        _y = e.value;
    }
    
    private function get_x() : Float
    {
        return _x;
    }
    
    private function set_x(value : Float) : Float
    //if (_x == value) return;
    {
        
        _x = value;
        verifyPositionOnRegion();
        model.getContainer().getRoot().x = _x;
        return value;
    }
    
    private function get_y() : Float
    {
        return _y;
    }
    
    private function set_y(value : Float) : Float
    //if (_y == value) return;
    {
        
        _y = value;
        verifyPositionOnRegion();
        model.getContainer().getRoot().z = _y;
        return value;
    }
    
    private function get_rotation() : Float
    {
        return _rotation;
    }
    
    private function set_rotation(value : Float) : Float
    {
        if (_rotation == value)
        {
            return value;
        }
        _rotation = value;
        verifyPositionOnRegion();
        model.getContainer().getRoot().rotationY = _rotation;
        return value;
    }
    
    
    
    override private function toXML() : FastXML
    {
        var xml : FastXML = FastXML.parse("<regionPosition />");
        xml.setAttribute("x", Std.string(_x));
        xml.setAttribute("y", Std.string(_y));
        xml.setAttribute("rotation", Std.string(_rotation));
        return xml;
    }
    
    override private function fromXML(xml : FastXML) : Void
    {
        if (xml.has.x)
        {
            x = as3hx.Compat.parseFloat(xml.att.x);
        }
        if (xml.has.y)
        {
            y = as3hx.Compat.parseFloat(xml.att.y);
        }
        if (xml.has.rotation)
        {
            rotation = as3hx.Compat.parseFloat(xml.att.rotation);
        }
    }
    
    
    override public function destroy() : Void
    {
        model.removeEventListener(Model3D.EVENT_INTERNAL_MOUSE_OVER, modelInnerMouseOver);
        model.removeEventListener(Model3D.EVENT_INTERNAL_MOUSE_OUT, modelInnerMouseOut);
        model.removeEventListener(Model3D.EVENT_INTERNAL_MODEL_SELECTED, modelInnerSelected);
        if (modelExecutor != null)
        {
            modelExecutor.removeEventListener(RegionPositionEvent.UPDATE_ROTATION_BY_INCREASE, updateRotationByIncreaseHandler);
            modelExecutor.removeEventListener(RegionPositionEvent.UPDATE_ROTATION, updateRotationHandler);
        }
        removeEventListener(RegionInnerPositionEvent.CHANGE_INNER_X, changeInnerXHandler);
        removeEventListener(RegionInnerPositionEvent.CHANGE_INNER_Y, changeInnerYHandler);
        super.destroy();
    }
}

