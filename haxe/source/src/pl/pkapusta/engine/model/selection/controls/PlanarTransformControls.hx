package pl.pkapusta.engine.model.selection.controls;

import away3d.cameras.Camera3D;
import away3d.cameras.lenses.PerspectiveLens;
import away3d.containers.ObjectContainer3D;
import away3d.containers.View3D;
import away3d.events.MouseEvent3D;
import pl.pkapusta.engine.Engine3DModel;
import pl.pkapusta.engine.events.Engine3DCameraEvent;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.selection.AbstractSelection;
import pl.pkapusta.engine.model.selection.controls.base3d.AbstractBase;
import pl.pkapusta.engine.model.selection.events.PlanarTransformEvent;
import pl.pkapusta.engine.project.Project3D;
import pl.pkapusta.engine.utils.mouse.Mouse3DUtil;
import pl.pkapusta.engine.utils.mouse.MouseCursorUtil;
import pl.pkapusta.engine.utils.mouse.MouseUtil;
import pl.pkapusta.engine.view.events.ViewRenderEvent;
import openfl.events.Event;
import openfl.events.MouseEvent;
import openfl.geom.Point;
import openfl.geom.Rectangle;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
class PlanarTransformControls extends ObjectContainer3D
{
    public var area(get, never) : Rectangle;

    
    private var controlSize : Float = 1;
    private var controlType : Int = 0;
    private var hasInnerControls : Bool = true;
    private var hasRotationControls : Bool = false;
    
    private var TL : AbstractBase;
    private var TR : AbstractBase;
    private var BL : AbstractBase;
    private var BR : AbstractBase;
    private var ML : AbstractBase;
    private var MT : AbstractBase;
    private var MR : AbstractBase;
    private var MB : AbstractBase;
    
    private var RTL : AbstractBase;
    private var RTR : AbstractBase;
    private var RBL : AbstractBase;
    private var RBR : AbstractBase;
    
    private var controls : Array<AbstractBase>;
    
    private var _area : Rectangle;
    
    private var controlMoving : Bool = false;
    
    private var model : Model3D;
    private var selection : AbstractSelection;
    
    private var downOnView : View3D;
    private var downMVCModel : Engine3DModel;
    private var downControl : AbstractBase;
    private var downControlOffset : Vector3D = new Vector3D();
    private var transformEvent : PlanarTransformEvent;
    
    public function new(model : Model3D, selection : AbstractSelection, area : Rectangle, controlSize : Float = 1, controlType : Int = 0, hasInnerControls : Bool = true, hasRotationControls : Bool = false)
    {
        super();
        this.controlSize = controlSize;
        this.controlType = controlType;
        this.hasInnerControls = hasInnerControls;
        this.hasRotationControls = hasRotationControls;
        this.selection = selection;
        this.model = model;
        _area = area;
        createControls();
        updateControlPositions();
    }
    
    private function createControls() : Void
    {
        TL = AbstractBase.factory(controlType, controlSize, MouseCursorUtil.CURSOR_NESW);
        TR = AbstractBase.factory(controlType, controlSize, MouseCursorUtil.CURSOR_NWSE);
        BL = AbstractBase.factory(controlType, controlSize, MouseCursorUtil.CURSOR_NWSE);
        BR = AbstractBase.factory(controlType, controlSize, MouseCursorUtil.CURSOR_NESW);
        if (hasInnerControls)
        {
            ML = AbstractBase.factory(controlType, controlSize, MouseCursorUtil.CURSOR_EW);
            MT = AbstractBase.factory(controlType, controlSize, MouseCursorUtil.CURSOR_NS);
            MR = AbstractBase.factory(controlType, controlSize, MouseCursorUtil.CURSOR_EW);
            MB = AbstractBase.factory(controlType, controlSize, MouseCursorUtil.CURSOR_NS);
        }
        if (hasRotationControls)
        {
            RTL = AbstractBase.factory(TransformControlsType.PLANE, controlSize * 3, MouseCursorUtil.CURSOR_ROTATION_TR, false);
            RTR = AbstractBase.factory(TransformControlsType.PLANE, controlSize * 3, MouseCursorUtil.CURSOR_ROTATION_TL, false);
            RBL = AbstractBase.factory(TransformControlsType.PLANE, controlSize * 3, MouseCursorUtil.CURSOR_ROTATION_BR, false);
            RBR = AbstractBase.factory(TransformControlsType.PLANE, controlSize * 3, MouseCursorUtil.CURSOR_ROTATION_BL, false);
        }
        
        controls = new Array<AbstractBase>();
        controls.push(TL);
        controls.push(TR);
        controls.push(BL);
        controls.push(BR);
        
        if (hasInnerControls)
        {
            controls.push(ML);
            controls.push(MT);
            controls.push(MR);
            controls.push(MB);
            
        }
        if (hasRotationControls)
        {
            controls.push(RTL);
            controls.push(RTR);
            controls.push(RBL);
            controls.push(RBR);
            
        }
        
        var i : Int = 0;
        while (i < controls.length)
        {
            addChild(controls[i]);
            controls[i].addEventListener(MouseEvent3D.MOUSE_DOWN, controlMouseDownHandler);
            i++;
        }
        
        model.addEventListener(ViewRenderEvent.BEFORE_RENDER, beforeRenderHandler);
    }
    
    private function beforeRenderHandler(e : ViewRenderEvent) : Void
    //compute control sizes
    {
        
        
        var control : AbstractBase;
        
        var view : View3D = e.view;
        var camera : Camera3D = view.camera;
        var focalLength : Float = 1;
        if (Std.is(camera.lens, PerspectiveLens))
        {
            focalLength = cast((camera.lens), PerspectiveLens).focalLength;
        }
        
        //var normSize:Number = d / l.focalLength * 50 / view.width;
        var normSize : Float = controlSize / view.width * 5;
        
        var length : Int = ((!hasRotationControls)) ? controls.length : controls.length - 4;
        for (i in 0...length)
        {
            control = controls[i];
            control.size = Vector3D.distance(control.scenePosition, camera.scenePosition) / focalLength * normSize;
        }
        if (hasRotationControls)
        {
            var i : Int = as3hx.Compat.parseInt(controls.length - 4);
            while (i < controls.length)
            {
                control = controls[i];
                control.size = Vector3D.distance(control.scenePosition, camera.scenePosition) / focalLength * normSize * 3;
                i++;
            }
            RTL.x = _area.left - TL.size * 1.25;
            RTL.z = _area.top - TL.size * 1.25;
            RTR.x = _area.right + TR.size * 1.25;
            RTR.z = _area.top - TR.size * 1.25;
            RBL.x = _area.left - BL.size * 1.25;
            RBL.z = _area.bottom + BL.size * 1.25;
            RBR.x = _area.right + BR.size * 1.25;
            RBR.z = _area.bottom + BR.size * 1.25;
        }
    }
    
	@:access(pl.pkapusta.engine.project.Project3D.view)
    private function controlMouseDownHandler(e : MouseEvent3D) : Void
    {
        MouseUtil.stage.addEventListener(MouseEvent.MOUSE_UP, controlMouseUpHandler);
        MouseUtil.stage.addEventListener(MouseEvent.MOUSE_MOVE, controlMouseMoveHandler);
        controlMoving = true;
        downOnView = cast((model.getProject()), Project3D).view;
        downControl = try cast(e.currentTarget, AbstractBase) catch(e:Dynamic) null;
        downMVCModel = cast((model.getProject()), Project3D).model;
        
        downMVCModel.dispatchEvent(new Engine3DCameraEvent(Engine3DCameraEvent.LOCK_CAMERA));
        
        transformEvent = new PlanarTransformEvent(
                ((downControl == RTL || downControl == RTR || downControl == RBL || downControl == RBR)) ? 
                PlanarTransformEvent.SELECTION_ROTATING : PlanarTransformEvent.SELECTION_RESIZING);
        if (downControl == TL || downControl == BL || downControl == ML || downControl == RTL || downControl == RBL)
        {
            transformEvent.resizingVector.x = -1;
        }
        if (downControl == TR || downControl == BR || downControl == MR || downControl == RTR || downControl == RBR)
        {
            transformEvent.resizingVector.x = 1;
        }
        if (downControl == TL || downControl == MT || downControl == TR || downControl == RTL || downControl == RTR)
        {
            transformEvent.resizingVector.y = -1;
        }
        if (downControl == BL || downControl == MB || downControl == BR || downControl == RBL || downControl == RBR)
        {
            transformEvent.resizingVector.y = 1;
        }
        
        var localPoint : Point = new Point(downOnView.width * (e.screenX / 100), downOnView.height * (e.screenY / 100));
        var stagePoint : Point = downOnView.localToGlobal(localPoint);
        if (Mouse3DUtil.stageTo3DPlanarPoint(stagePoint, downOnView, parent.sceneTransform, Mouse3DUtil.AXIS_XZ, downControlOffset))
        {
            downControlOffset.x -= downControl.x;
            downControlOffset.y -= downControl.z;
        }
    }
    
    private var rayPosition : Vector3D = new Vector3D();
    private function controlMouseMoveHandler(e : MouseEvent) : Void
    {
        if (Mouse3DUtil.stageTo3DPlanarPoint(new Point(e.stageX, e.stageY), downOnView, parent.sceneTransform, Mouse3DUtil.AXIS_XZ, rayPosition))
        {
            rayPosition.x -= downControlOffset.x;
            rayPosition.y -= downControlOffset.y;
            //rayPosition = rayPosition.subtract(downControlOffset);
            transformEvent.resizingPoint = new Point(rayPosition.x, rayPosition.y);
            selection.dispatchEvent(transformEvent);
        }
    }
    
    private function controlMouseUpHandler(e : MouseEvent) : Void
    {
        MouseUtil.stage.removeEventListener(MouseEvent.MOUSE_UP, controlMouseUpHandler);
        MouseUtil.stage.removeEventListener(MouseEvent.MOUSE_MOVE, controlMouseMoveHandler);
        
        downMVCModel.dispatchEvent(new Engine3DCameraEvent(Engine3DCameraEvent.UNLOCK_CAMERA));
        
        transformEvent = null;
        downMVCModel = null;
        downControl = null;
        downOnView = null;
        controlMoving = false;
    }
    
    private function updateControlPositions() : Void
    {
        TL.x = _area.left;
        TL.z = _area.top;
        TR.x = _area.right;
        TR.z = _area.top;
        BL.x = _area.left;
        BL.z = _area.bottom;
        BR.x = _area.right;
        BR.z = _area.bottom;
        if (hasInnerControls)
        {
            ML.x = _area.left;
            ML.z = _area.top + _area.height / 2;
            MT.x = _area.left + _area.width / 2;
            MT.z = _area.top;
            MR.x = _area.right;
            MR.z = _area.top + _area.height / 2;
            MB.x = _area.left + _area.width / 2;
            MB.z = _area.bottom;
        }
        if (hasRotationControls)
        {
            RTL.x = _area.left - TL.size * 1.25;
            RTL.z = _area.top - TL.size * 1.25;
            RTR.x = _area.right + TR.size * 1.25;
            RTR.z = _area.top - TR.size * 1.25;
            RBL.x = _area.left - BL.size * 1.25;
            RBL.z = _area.bottom + BL.size * 1.25;
            RBR.x = _area.right + BR.size * 1.25;
            RBR.z = _area.bottom + BR.size * 1.25;
        }
    }
    
    public function setArea(area : Rectangle) : Void
    {
        if (area.equals(_area))
        {
            return;
        }
        _area = area;
        updateControlPositions();
    }
    
    public function destroy() : Void
    {
        model.removeEventListener(ViewRenderEvent.BEFORE_RENDER, beforeRenderHandler);
        
        var i : Int = 0;
        while (i < controls.length)
        {
            controls[i].removeEventListener(MouseEvent3D.MOUSE_DOWN, controlMouseDownHandler);
            removeChild(controls[i]);
            i++;
        }
        
        TL = null;
        TR = null;
        BL = null;
        BR = null;
        ML = null;
        MT = null;
        MR = null;
        MB = null;
        RTL = null;
        RTR = null;
        RBL = null;
        RBR = null;
        
        controls = null;
        _area = null;
    }
    
    private function get_area() : Rectangle
    {
        return _area;
    }
}

