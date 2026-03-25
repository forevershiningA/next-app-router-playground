package pl.pkapusta.engine.model.regions.utils;

import haxe.Constraints.Function;
import away3d.containers.ObjectContainer3D;
import away3d.containers.View3D;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.regions.IRegion;
import pl.pkapusta.engine.utils.mouse.Mouse3DUtil;
import openfl.display.Stage;
import openfl.events.MouseEvent;
import openfl.geom.Point;
import openfl.geom.Vector3D;
import pl.pkapusta.engine.model.regions.position.SurfaceRegionPosition;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.SurfaceRegion;

/**
	 * @author Przemysław Kapusta
	 */
@:access(pl.pkapusta.engine.model.regions.AbstractRegion.getModelRegionPosition)
@:access(pl.pkapusta.engine.model.regions.AbstractRegion._regionContainer)
@:access(pl.pkapusta.engine.model.Model3D._freezeModelSelection)
class SurfaceRegionObjectMove
{
    
    private static var _surfaceRegion : SurfaceRegion;
    private static var _movementModel : Model3D;
    private static var _movementModelRegionPos : SurfaceRegionPosition;
    private static var _offsetRayPoint : Vector3D;
    private static var _view : View3D;
    private static var _stage : Stage;
    private static var _onComplete : Function;
    
    private static var _availableSurfaces : Array<SurfaceRegion>;
    
    public static function start(movementModel : Model3D, offsetRayPoint : Vector3D, view : View3D, stage : Stage, onComplete : Function) : Void
    {
        _movementModel = movementModel;
        _surfaceRegion = try cast(_movementModel.getParentRegion(), SurfaceRegion) catch(e:Dynamic) null;
        _movementModelRegionPos = try cast(_surfaceRegion.getModelRegionPosition(_movementModel), SurfaceRegionPosition) catch(e:Dynamic) null;
        _offsetRayPoint = offsetRayPoint;
        _view = view;
        _stage = stage;
        _onComplete = onComplete;
        
        //build list of available surfaces for current movement projekt tree
        _availableSurfaces = new Array<SurfaceRegion>();
        recursiveSurfaceRegionSearch(_movementModel.getProject().getRootModel());
        
        _stage.addEventListener(MouseEvent.MOUSE_MOVE, draggingMouseMove);
        _stage.addEventListener(MouseEvent.MOUSE_UP, draggingMouseUp);
    }
    
    private static function recursiveSurfaceRegionSearch(model : IModel3D) : Void
    {
        if (model == null)
        {
            return;
        }
        var i : Int = 0;
		var regions : Array<IRegion> = model.getRegionList();
        while (i < regions.length)
        {
            var region : IRegion = regions[i];
            if (Std.is(region, SurfaceRegion) && region.canAddChild(_movementModel))
            {
                _availableSurfaces.push(try cast(region, SurfaceRegion) catch(e:Dynamic) null);
            }
            var j : Int = 0;
            while (j < region.getChildList().length)
            {
                recursiveSurfaceRegionSearch(region.getChildList()[j]);
                j++;
            }
            i++;
        }
    }
    
    private static function draggingMouseUp(e : MouseEvent) : Void
    {
        _stage.removeEventListener(MouseEvent.MOUSE_MOVE, draggingMouseMove);
        _stage.removeEventListener(MouseEvent.MOUSE_UP, draggingMouseUp);
        if (_onComplete != null)
        {
            Reflect.callMethod(null, _onComplete, []);
        }
    }
    
    private static var _rayPoint : Vector3D = new Vector3D();
    private static var _boundedPoint : Vector3D = new Vector3D();
    private static var _currentStagePoint : Point = new Point();
    private static function draggingMouseMove(e : MouseEvent) : Void
    {
        _currentStagePoint.x = e.stageX;
        _currentStagePoint.y = e.stageY;
        if (Mouse3DUtil.stageTo3DPlanarPoint(_currentStagePoint, _view, _surfaceRegion._regionContainer.sceneTransform, Mouse3DUtil.AXIS_XZ, _rayPoint))
        {
            _rayPoint.x += _offsetRayPoint.x;
            _rayPoint.y += _offsetRayPoint.y;
            //rayPoint = rayPoint.add(offsetRayPoint);
            _surfaceRegion.getBoundsShape().pointToBound(_rayPoint, _boundedPoint);
            
            if (!(!_rayPoint.equals(_boundedPoint, false) && checkAvailableSurfacesAndChange()))
            {
                _movementModelRegionPos.x = _boundedPoint.x;
                _movementModelRegionPos.y = _boundedPoint.y;
            }
        }
    }
    
    private static var _checkBoundedPoint : Vector3D = new Vector3D();
    private static function checkAvailableSurfacesAndChange() : Bool
    {
        var currentCheckedDimension : Float = Math.POSITIVE_INFINITY;
        var newSurface : SurfaceRegion = null;
        var newSurfaceBoundedPoint : Vector3D = null;
        var i : Int = 0;
        while (i < _availableSurfaces.length)
        {
            var surface : SurfaceRegion = _availableSurfaces[i];
            if (_surfaceRegion == surface)
            {
                {i++;
                    continue;
                }
            }  //goto next surface if it is current surface  
            
            //check if mouse is on this surface
            if (Mouse3DUtil.stageTo3DPlanarPoint(_currentStagePoint, _view, surface._regionContainer.sceneTransform, Mouse3DUtil.AXIS_XZ, _rayPoint))
            {
                _rayPoint.x += _offsetRayPoint.x;
                _rayPoint.y += _offsetRayPoint.y;
                //surface.getBoundsShape().pointToBound(_rayPoint, _checkBoundedPoint);
                
                //if (_rayPoint.equals(_checkBoundedPoint, false)) {
                if (surface.getBoundsShape().pointInBound(_rayPoint))
                {
                    if (currentCheckedDimension > _rayPoint.w)
                    {
                        currentCheckedDimension = _rayPoint.w;
                        newSurface = surface;
                        surface.getBoundsShape().pointToBound(_rayPoint, _checkBoundedPoint);
                        newSurfaceBoundedPoint = _checkBoundedPoint.clone();
                    }
                }
            }
            i++;
        }
        if (newSurface != null) {
        
			//changing surface
            
            var modelAutoDispose : Bool = _movementModel.isAutoDisposeContext();
            _movementModel.setAutoDisposeContext(false);
            _movementModel._freezeModelSelection = true;
            _movementModel.removeFromParent();
            _surfaceRegion = newSurface;
            _surfaceRegion.addChild(_movementModel);
            _movementModel.setAutoDisposeContext(modelAutoDispose);
            _movementModel._freezeModelSelection = false;
            _movementModelRegionPos = try cast(_surfaceRegion.getModelRegionPosition(_movementModel), SurfaceRegionPosition) catch(e:Dynamic) null;
            _movementModelRegionPos.x = newSurfaceBoundedPoint.x;
            _movementModelRegionPos.y = newSurfaceBoundedPoint.y;
            return true;
        }
        return false;
    }

    public function new()
    {
    }
}

