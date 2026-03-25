package pl.pkapusta.engine.view.container3d.controllers.modes;

import away3d.containers.ObjectContainer3D;
import away3d.containers.View3D;
import away3d.events.Object3DEvent;
import away3d.tools.utils.Bounds;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.AbstractRegion;
import pl.pkapusta.engine.model.regions.IRegion;
import pl.pkapusta.engine.view.container3d.EngineContainer3D;
import openfl.events.Event;
import openfl.events.MouseEvent;
import openfl.geom.Matrix3D;

/**
	 * @author Przemysław Kapusta
	 */
class AutoZoomSphereCameraMode extends SphereCameraMode
{
    public var linearDistance(get, set) : Float;

    
    private var _targetObject : ObjectContainer3D = null;
    private var _model3d : IModel3D;
    private var _autoZoomEnabled : Bool = false;
    
    private var _tbMaxX : Float;
    private var _tbMaxY : Float;
    private var _tbMaxZ : Float;
    private var _tbMinX : Float;
    private var _tbMinY : Float;
    private var _tbMinZ : Float;
    private var _tbWidth : Float;
    private var _tbHeight : Float;
    private var _tbDepth : Float;
    
    private var _linearDistance : Float = 1.5;
    
    private var _maxLinearDistance : Float;
    private var _minLinearDistance : Float;
    
    private var _distance : Float;
    
    public function new(view : View3D, engineContainer : EngineContainer3D, settings : FastXML = null, relativeMatrix : Matrix3D = null, model3d : IModel3D = null)
    {
        _model3d = model3d;
        super(view, engineContainer, settings, relativeMatrix);
        _distance = radius;
        _interface = new AutoZoomSphereCameraInterface(this);
        _mode = CameraMode.AUTO_ZOOM_SPHERE;
    }
    
    public function setTargetObject(target : ObjectContainer3D) : Void
    {
        if (_targetObject == target)
        {
            return;
        }
        _targetObject = target;
    }
    
    override private function parseSettingsXML(data : FastXML) : Void
    {
        super.parseSettingsXML(data);
        
        if (data.hasNode.target)
        {
            if (data.node.target.has.object)
            {
                setTargetObject(_parseTargetObject(data.node.target.att.object));
            }
        }
        
        if (data.hasNode.position)
        {
            if (data.node.position.has.resolve("linear-distance"))
            {
                _linearDistance = as3hx.Compat.parseFloat(data.node.position.att.resolve("linear-distance"));
            }
        }
        
        _maxLinearDistance = Math.POSITIVE_INFINITY;
        _minLinearDistance = 0.001;
        if (data.hasNode.limits)
        {
            var limits : FastXML = data.node.limits;
            if (limits.hasNode.resolve("linear-distance"))
            {
                if (limits.node.resolve("linear-distance").has.min)
                {
                    _minLinearDistance = Math.max(0.001, as3hx.Compat.parseFloat(limits.node.resolve("linear-distance").att.min));
                }
                if (limits.node.resolve("linear-distance").has.max)
                {
                    _maxLinearDistance = as3hx.Compat.parseFloat(limits.node.resolve("linear-distance").att.max);
                }
            }
        }
    }
    
    override public function update() : Void
    {
        _targetObjectUpdate();
        super.update();
    }
    
    private function _parseTargetObject(id : String) : ObjectContainer3D
    {
        var idParts : Array<Dynamic> = id.split(":");
        switch (idParts[0].toLowerCase())
        {
            case "this":
            //target to "this" container
            if (Std.is(_model3d, Model3D))
            {
                return cast((_model3d), Model3D).getContainer().contextContainer;
            }
            case "region":
            //target to specified region container
            if (Std.is(_model3d, Model3D))
            {
                var r : IRegion = _model3d.getRegion(idParts[1]);
                if (r != null && Std.is(r, AbstractRegion))
                {
                    return cast((r), AbstractRegion).getRegionContainer();
                }
            }
        }
        return null;
    }
    
    private function _targetObjectUpdate() : Void
    {
        if (_targetObject != null && _targetObject.numChildren > 0)
        {
            if (!_autoZoomEnabled)
            {
                _autoZoomEnabled = true;
            }
            Bounds.getObjectContainerBounds(_targetObject);
            
            //in case where target is empty
            if (Bounds.width <= 0 || Bounds.height <= 0 || Bounds.depth <= 0)
            {
                _nullTargetObjectUpdate();
                return;
            }
            
            if (
                Bounds.maxX != _tbMaxX || Bounds.maxY != _tbMaxY || Bounds.maxZ != _tbMaxZ ||
                Bounds.minX != _tbMinX || Bounds.minY != _tbMinY || Bounds.minZ != _tbMinZ ||
                Bounds.width != _tbWidth || Bounds.height != _tbHeight || Bounds.depth != _tbDepth)
            {
                _tbMaxX = Bounds.maxX;
                _tbMaxY = Bounds.maxY;
                _tbMaxZ = Bounds.maxZ;
                _tbMinX = Bounds.minX;
                _tbMinY = Bounds.minY;
                _tbMinZ = Bounds.minZ;
                _tbWidth = Bounds.width;
                _tbHeight = Bounds.height;
                _tbDepth = Bounds.depth;
                _updateBounds();
            }
        }
        else
        {
            _nullTargetObjectUpdate();
        }
    }
    
    private function _nullTargetObjectUpdate() : Void
    {
        if (_autoZoomEnabled)
        {
            _target.x = target.x;
            _target.y = target.y;
            _target.z = target.z;
            _autoZoomEnabled = false;
        }
    }
    
    
    
    
    
    private static var w : Float;
    private static var h : Float;
    private static var d : Float;
    private static inline var x1 : Float = 400;
    private static inline var x2 : Float = 1200;
    private static inline var y1 : Float = 540;
    private static inline var y2 : Float = 1560;
    private static var a : Float;
    private static var b : Float;
    
    private function _updateBounds() : Void
    {
        w = _targetObject.maxX - _targetObject.minX;
        h = _targetObject.maxY - _targetObject.minY;
        d = _targetObject.maxZ - _targetObject.minZ;
        
        _target.x = _tbMinX + _tbWidth * 0.5;
        _target.y = _tbMinY + _tbHeight * 0.5;
        _target.z = _tbMinZ + _tbDepth * 0.5;
        
        /*var x1:Number = 400;
			var x2:Number = 1200;
			var y1:Number = 540;
			var y2:Number = 1560;*/
        
        a = (y1 - y2) / (x1 - x2);
        b = y2 - a * x2;
        
        _distance = a * Math.max(Math.max(_tbWidth, _tbHeight), _tbDepth) + b;
        radius = _distance * _linearDistance;
    }
    
    
    
    
    
    override private function onZoom(delta:Float) : Void
    {
        linearDistance -= delta * 0.002;
    }
    
    override public function dispose() : Void
    {
        setTargetObject(null);
        super.dispose();
    }
    
    private function get_linearDistance() : Float
    {
        return _linearDistance;
    }
    
    private function set_linearDistance(value : Float) : Float
    {
        if (_linearDistance == value)
        {
            return value;
        }
        _linearDistance = Math.min(_maxLinearDistance, Math.max(_minLinearDistance, value));
        radius = _distance * _linearDistance;
        return value;
    }
}

