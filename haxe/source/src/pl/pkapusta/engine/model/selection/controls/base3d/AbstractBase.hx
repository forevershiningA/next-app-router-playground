package pl.pkapusta.engine.model.selection.controls.base3d;

import away3d.entities.Mesh;
import away3d.events.MouseEvent3D;
import away3d.materials.ColorMaterial;
import away3d.primitives.CubeGeometry;
import away3d.primitives.PrimitiveBase;
import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import pl.pkapusta.engine.model.selection.controls.TransformControlsType;
import pl.pkapusta.engine.utils.mouse.MouseCursorUtil;
import pl.pkapusta.engine.utils.mouse.MouseUtil;
import openfl.display.Stage;
import openfl.events.MouseEvent;
import openfl.ui.Mouse;
import openfl.ui.MouseCursor;

/**
	 * @author Przemysław Kapusta
	 */
class AbstractBase extends Mesh
{
    public var size(get, set) : Float;

    
    public static function factory(type : Int, size : Float = 1, cursor : String = "auto", visible : Bool = true) : AbstractBase
    {
        switch (type)
        {
            case TransformControlsType.RECTANGLE:return new BaseRectangle(size, cursor, visible);
            case TransformControlsType.SPHERE:return new BaseSphere(size, cursor, visible);
            case TransformControlsType.PLANE:return new BasePlane(size, cursor, visible);
        }
        return null;
    }
    
    private var COLOR(default, never) : Int = 0xFFFFFF;
    
    private var _size : Float;
    private var _cursor : String;
    
    private var geom : PrimitiveBase;
    private var mat : ColorMaterial;
    
    private var mouseDown : Bool = false;
    private var mouseOver : Bool = false;
    
    public function new(size : Float = 1, cursor : String = "auto", visible : Bool = true)
    {
        _size = size;
        _cursor = cursor;
        geom = buildGeom();
        mat = ((visible)) ? new ColorMaterial(COLOR, 1) : new ColorMaterial(COLOR, 0);
        super(geom, mat);
        mouseEnabled = true;
        castsShadows = false;
        
        addEventListener(MouseEvent3D.MOUSE_DOWN, mouseDownHandler);
        addEventListener(MouseEvent3D.MOUSE_OVER, mouseOverHandler);
        addEventListener(MouseEvent3D.MOUSE_OUT, mouseOutHandler);
    }
    
    /** @abstract */
    private function buildGeom() : PrimitiveBase
    {
        throw new AbstractMethodException();
        return null;
    }
    
    /** @abstract */
    private function updateSize() : Void
    {
        throw new AbstractMethodException();
    }
    
    private function mouseOverHandler(e : MouseEvent3D) : Void
    {
        mouseOver = true;
        Mouse.cursor = _cursor;
    }
    
    private function mouseOutHandler(e : MouseEvent3D) : Void
    {
        if (!mouseDown)
        {
            Mouse.cursor = MouseCursor.AUTO;
        }
        mouseOver = false;
    }
    
    private function mouseDownHandler(e : MouseEvent3D) : Void
    {
        MouseUtil.stage.addEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);
        mouseDown = true;
    }
    
    private function mouseUpHandler(e : MouseEvent) : Void
    {
        var stage : Stage = try cast(e.currentTarget, Stage) catch(e:Dynamic) null;
        stage.removeEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);
        if (!mouseOver)
        {
            Mouse.cursor = MouseCursor.AUTO;
        }
        mouseDown = false;
    }
    
    private function get_size() : Float
    {
        return _size;
    }
    
    private function set_size(value : Float) : Float
    {
        if (_size == value)
        {
            return value;
        }
        _size = value;
        updateSize();
        return value;
    }
}

