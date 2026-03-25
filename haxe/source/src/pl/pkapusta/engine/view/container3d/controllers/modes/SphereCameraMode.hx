package pl.pkapusta.engine.view.container3d.controllers.modes;

import away3d.containers.View3D;
import pl.pkapusta.engine.view.container3d.controllers.modes.AbstractCameraMode;
import pl.pkapusta.engine.view.container3d.EngineContainer3D;
import openfl.events.MouseEvent;
import openfl.events.TouchEvent;
import openfl.geom.Matrix3D;
import openfl.geom.Point;
import openfl.geom.Vector3D;
import openfl.ui.Multitouch;
import openfl.ui.MultitouchInputMode;

/**
	 * @author Przemysław Kapusta
	 */
class SphereCameraMode extends AbstractCameraMode
{
    public var radius(get, set) : Float;
    public var angleA(get, set) : Float;
    public var angleB(get, set) : Float;

    
    private var VELOCITY(default, never) : Float = 0.2;
    
    private var _doRotate : Bool = true;
    private var _doZoom : Bool = true;
    
    private var _radius : Float = 230;
    private var _angleA : Float = 0.6;
    private var _angleB : Float = 0.3;
    
    private var _camRadius : Float;
    private var _camAngleA : Float;
    private var _camAngleB : Float;
    private var _camTarget : Vector3D;
    
    private var _leftMouseDown : Bool = false;
    private var _point : Point;
    
    private var _maxRadius : Float = 600;
    private var _minRadius : Float = 140;
    
    private var _maxCamAngleA : Float = Math.POSITIVE_INFINITY;
    private var _minCamAngleA : Float = Math.NEGATIVE_INFINITY;
    
    private var _maxCamAngleB : Float = Math.PI / 2 - 0.1;
    private var _minCamAngleB : Float = 0.1;
    
    private var _relative : Bool = false;
	
	private var _touchMap: Map<Int, Point>;
	private var _touchMapLength: Int;
	private var _touchZoomStartDistance: Float;
	private var _touchZoomDistance: Float;
    
    public function new(view : View3D, engineContainer : EngineContainer3D, settings : FastXML = null, relativeMatrix : Matrix3D = null)
    {
        _camTarget = new Vector3D();
        super(view, engineContainer, settings, relativeMatrix);
        _interface = new SphereCameraInterface(this);
        _mode = CameraMode.SPHERE;
		_touchMap = new Map<Int, Point>();
		_touchMapLength = 0;
		_touchZoomStartDistance = -1;
		_touchZoomDistance = -1;
    }
    
    override private function enable() : Void
    {
        _camRadius = _radius;
        _camAngleA = _angleA;
        _camAngleB = _angleB;
        _camTarget = _target.clone();
        
        view.addEventListener(MouseEvent.MOUSE_DOWN, mouseDownHandler);
        view.stage.addEventListener(MouseEvent.MOUSE_WHEEL, mouseWhellHandler);
		
		Multitouch.inputMode = MultitouchInputMode.GESTURE;
		view.stage.addEventListener(TouchEvent.TOUCH_BEGIN, onTouch);
		view.stage.addEventListener(TouchEvent.TOUCH_MOVE, onTouch);
		view.stage.addEventListener(TouchEvent.TOUCH_END, onTouch);
    }
    
    override private function parseSettingsXML(data : FastXML) : Void
    {
        super.parseSettingsXML(data);
        
        if (data.has.relative)
        {
            _relative = ((data.att.relative.toLowerCase() == "true")) ? true : false;
        }
        
        if (data.hasNode.target)
        {
            if (data.node.target.has.x)
            {
                _target.x = as3hx.Compat.parseFloat(data.node.target.att.x);
            }
            if (data.node.target.has.y)
            {
                _target.y = as3hx.Compat.parseFloat(data.node.target.att.y);
            }
            if (data.node.target.has.z)
            {
                _target.z = as3hx.Compat.parseFloat(data.node.target.att.z);
            }
        }
        if (data.hasNode.position)
        {
            if (data.node.position.has.angleA)
            {
                _angleA = _camAngleA = as3hx.Compat.parseFloat(data.node.position.att.angleA) / 180 * Math.PI;
            }
            if (data.node.position.has.angleB)
            {
                _angleB = _camAngleB = as3hx.Compat.parseFloat(data.node.position.att.angleB) / 180 * Math.PI;
            }
            if (data.node.position.has.radius)
            {
                _radius = _camRadius = as3hx.Compat.parseFloat(data.node.position.att.radius);
            }
        }
        _maxRadius = Math.POSITIVE_INFINITY;
        _minRadius = 0.001;
        _maxCamAngleA = Math.POSITIVE_INFINITY;
        _minCamAngleA = Math.NEGATIVE_INFINITY;
        _maxCamAngleB = Math.POSITIVE_INFINITY;
        _minCamAngleB = Math.NEGATIVE_INFINITY;
        if (data.hasNode.limits)
        {
            var limits : FastXML = data.node.limits;
            if (limits.hasNode.angleA)
            {
                if (limits.node.angleA.has.min)
                {
                    _minCamAngleA = as3hx.Compat.parseFloat(limits.node.angleA.att.min) / 180 * Math.PI;
                }
                if (limits.node.angleA.has.max)
                {
                    _maxCamAngleA = as3hx.Compat.parseFloat(limits.node.angleA.att.max) / 180 * Math.PI;
                }
            }
            if (limits.hasNode.angleB)
            {
                if (limits.node.angleB.has.min)
                {
                    _minCamAngleB = as3hx.Compat.parseFloat(limits.node.angleB.att.min) / 180 * Math.PI;
                }
                if (limits.node.angleB.has.max)
                {
                    _maxCamAngleB = as3hx.Compat.parseFloat(limits.node.angleB.att.max) / 180 * Math.PI;
                }
            }
            if (limits.hasNode.radius)
            {
                if (limits.node.radius.has.min != null)
                {
                    _minRadius = Math.max(0.001, as3hx.Compat.parseFloat(limits.node.radius.att.min));
                }
                if (limits.node.radius.has.max != null)
                {
                    _maxRadius = as3hx.Compat.parseFloat(limits.node.radius.att.max);
                }
            }
        }
        
        if (_relative && relativeMatrix != null)
        {
            _target = relativeMatrix.transformVector(_target);
        }
    }
    
    override private function disable() : Void
    {
        view.removeEventListener(MouseEvent.MOUSE_DOWN, mouseDownHandler);
        view.stage.removeEventListener(MouseEvent.MOUSE_WHEEL, mouseWhellHandler);
    }
	
	private function onTouch(e : TouchEvent) : Void
	{
		//trace("touch type: " + e.type + ", id: " + e.touchPointID);
		
		if (e.type == TouchEvent.TOUCH_BEGIN) {
			_touchMap.set(e.touchPointID, new Point(e.stageX, e.stageY));
			++_touchMapLength;
		} else if (e.type == TouchEvent.TOUCH_MOVE) {
			var p:Point = _touchMap.get(e.touchPointID);
			if (p != null) {
				p.x = e.stageX;
				p.y = e.stageY;
			} else {
				_touchMap.set(e.touchPointID, new Point(e.stageX, e.stageY));
				++_touchMapLength;
			}
		} else if (e.type == TouchEvent.TOUCH_END) {
			_touchMap.remove(e.touchPointID);
			--_touchMapLength;
		}
		
		if (_touchMapLength >= 2) {
			var it:Iterator<Point> = _touchMap.iterator();
			var p1:Point = it.next();
			var p2:Point = it.next();
			var dist:Float = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
			if (_touchZoomStartDistance < 0) {
				_touchZoomStartDistance = _touchZoomDistance = dist;
			} else {
				_touchZoomStartDistance = _touchZoomDistance;
				_touchZoomDistance = dist;
				onZoom((-_touchZoomStartDistance + _touchZoomDistance)*4);
			}
		} else {
			_touchZoomStartDistance = -1;
			_touchZoomDistance = -1;
		}
		
	}
    
    private function mouseWhellHandler(e : MouseEvent) : Void
    {
        onZoom(e.delta);
    }
	
	private function onZoom(delta:Float) : Void {
		radius -= delta * 0.1;
	}
    
    private function mouseDownHandler(e : MouseEvent) : Void
    {
        view.stage.addEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);
        view.stage.addEventListener(MouseEvent.MOUSE_MOVE, mouseMoveHandler);
        _leftMouseDown = true;
        _point = new Point(e.stageX, e.stageY);
    }
    
    private function mouseUpHandler(e : MouseEvent) : Void
    {
        view.stage.removeEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);
        view.stage.removeEventListener(MouseEvent.MOUSE_MOVE, mouseMoveHandler);
        _leftMouseDown = false;
        _point = null;
    }
    
    private function mouseMoveHandler(e : MouseEvent) : Void
    {
        if (locked)
        {
            return;
        }
        if (!_doRotate)
        {
            return;
        }
		if (_touchZoomStartDistance > 0)
		{
			_point = new Point(e.stageX, e.stageY);
			return;
		}
        var rX : Float = e.stageX - _point.x;
        var rY : Float = e.stageY - _point.y;
        _point.x = e.stageX;
        _point.y = e.stageY;
        
        //angleA += (rX / _radius) * 0.8;
        //angleB += (rY / _radius) * 0.8;
        
        angleA += rX * 0.0035;
        angleB += rY * 0.0035;
    }
    
    private static var rP : Float;
    override public function update() : Void
    {
        _camRadius += (radius * engineContainer.getProjectScale() - _camRadius) * VELOCITY;
        _camAngleA += (angleA - _camAngleA) * VELOCITY;
        _camAngleB += (angleB - _camAngleB) * VELOCITY;
        
        _camTarget.x += (_target.x - _camTarget.x) * VELOCITY;
        _camTarget.y += (_target.y - _camTarget.y) * VELOCITY;
        _camTarget.z += (_target.z - _camTarget.z) * VELOCITY;
        
        rP = _camRadius * Math.cos(_camAngleB);
        _position.x = rP * Math.sin(_camAngleA);
        _position.y = _camRadius * Math.sin(_camAngleB);
        _position.z = rP * Math.cos(_camAngleA);
        
        _position.incrementBy(_camTarget);
    }
    
    private function get_radius() : Float
    {
        return _radius;
    }
    
    private function set_radius(value : Float) : Float
    {
        if (_radius == value)
        {
            return value;
        }
        _radius = Math.min(_maxRadius, Math.max(_minRadius, value));
        return value;
    }
    
    private function get_angleA() : Float
    {
        return _angleA;
    }
    
    private function set_angleA(value : Float) : Float
    {
        if (_angleA == value)
        {
            return value;
        }
        _angleA = Math.min(_maxCamAngleA, Math.max(_minCamAngleA, value));
        return value;
    }
    
    private function get_angleB() : Float
    {
        return _angleB;
    }
    
    private function set_angleB(value : Float) : Float
    {
        if (_angleB == value)
        {
            return value;
        }
        _angleB = Math.min(_maxCamAngleB, Math.max(_minCamAngleB, value));
        return value;
    }
    
    override private function get_target() : Vector3D
    {
        return _camTarget;
    }
}

