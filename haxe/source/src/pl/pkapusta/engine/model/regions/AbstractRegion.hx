package pl.pkapusta.engine.model.regions;

import away3d.containers.ObjectContainer3D;
import away3d.events.MouseEvent3D;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import pl.pkapusta.engine.model.collision.AbstractCollisionShape;
import pl.pkapusta.engine.model.handlers.IHandler;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.exceptions.AddingNotReadyChildException;
import pl.pkapusta.engine.model.regions.exceptions.InvalidRegionTypeException;
import pl.pkapusta.engine.model.regions.exceptions.UnableToAddThisChildException;
import pl.pkapusta.engine.model.regions.IRegion;
import pl.pkapusta.engine.model.regions.LineRegion;
import pl.pkapusta.engine.model.regions.PointRegion;
import pl.pkapusta.engine.model.regions.position.AbstractRegionPosition;
import pl.pkapusta.engine.model.regions.SurfaceRegion;
import pl.pkapusta.engine.project.Project3D;
import pl.pkapusta.engine.utils.filters.AccessFilter;
import openfl.events.EventDispatcher;
import openfl.geom.Vector3D;

/**
 * @author Przemysław Kapusta
 */
@:keepSub
class AbstractRegion extends EventDispatcher implements IRegion
{   
    public static inline var TYPE_POINT : String = "point";
    public static inline var TYPE_LINE : String = "line";
    public static inline var TYPE_SURFACE : String = "surface";
    
    public static function builRegion(model: IModel3D, data: Dynamic) : AbstractRegion
    {
        if (Std.is(data, FastXML) || Std.is(data, String))
        {
            var d : FastXML;
            if (Std.is(data, String))
            {
                d = new FastXML(data);
            }
            else
            {
                d = data;
            }
            return buildFromXML(model, d);
        }
        return null;
    }
    private static function buildFromXML(model: IModel3D, data: FastXML) : AbstractRegion
    {
        var type : String = data.att.type;
		var region: AbstractRegion = null;
        switch (type)
        {
            case TYPE_POINT:
                region = new PointRegion(data);
            case TYPE_LINE:
                region = new LineRegion(data);
            case TYPE_SURFACE:
                region = new SurfaceRegion(data);
            default:
                ExceptionManager.Throw(new InvalidRegionTypeException());
                return null;
        }
		if (region != null) {
			region._parent = model;
		}
        return region;
    }
    
    
    private var _regionContainer : ObjectContainer3D;
    private var _id : String;
    private var _typeFilter : AccessFilter = null;
    private var _collectionFilter : AccessFilter = null;
    private var _handlerFilter : AccessFilter = null;
    private var _childDict : Map<IModel3D, Bool>;
    private var _numChild : Int = 0;
    private var _parent : IModel3D;
    
    private var _childLimit : UInt;
    
    private var _position : Vector3D;
    private var _rotation : Vector3D;
    
    public function new(data : Dynamic)
    {
        super();
        _regionContainer = new ObjectContainer3D();
        _childDict = new Map<IModel3D, Bool>();
        if (Std.is(data, FastXML) || Std.is(data, FastXML))
        {
            parseFromXML(data);
        }
    }
    
    public function canAddChild(child : IModel3D, checkChildLimit : Bool = true) : Bool
    {
        if (checkChildLimit)
        {
            if (_numChild >= _childLimit)
            {
                return false;
            }
        }
        var i : Int;
        var typeCheck : Bool = true;
        if (_collectionFilter != null)
        {
            typeCheck = false;
            var collections : Array<String> = child.getGeneralCollection().getAll();
            if (collections != null && collections.length > 0)
            {
                i = 0;
                while (i < collections.length)
                {
                    typeCheck = _collectionFilter.isValid(collections[i]);
                    if (typeCheck)
                    {
                        break;
                    }
                    i++;
                }
            }
        }
        if (typeCheck && _typeFilter != null)
        {
            typeCheck = _typeFilter.isValid(child.getGeneralType());
        }
        if (typeCheck && _handlerFilter != null)
        {
            typeCheck = false;
            var handlers : Array<IHandler> = child.getHandlers().getAll();
            if (handlers != null && handlers.length > 0)
            {
                i = 0;
                while (i < handlers.length)
                {
                    typeCheck = _handlerFilter.isValid(handlers[i].id);
                    if (typeCheck)
                    {
                        break;
                    }
                    i++;
                }
            }
        }
        if (!typeCheck)
        {
            return false;
        }
        return true;
    }
    
    public function addChild(child : IModel3D) : Void
    {
        if (!child.isReady())
        {
            ExceptionManager.Throw(new AddingNotReadyChildException());return;
        }
        if (!canAddChild(child))
        {
            ExceptionManager.Throw(new UnableToAddThisChildException());return;
        }
        if (cast((child), Model3D).getParentRegion() == this)
        {
            return;
        }
        if (cast((child), Model3D).getParentRegion() != null)
        {
            cast((child), Model3D).getParentRegion().removeChild(child);
        }
		_childDict.set(child, true);
        _numChild++;
        
        var usingHandler : IHandler = null;
        if (_handlerFilter != null)
        {
            var handlers : Array<IHandler> = child.getHandlers().getAll();
            if (handlers != null && handlers.length > 0)
            {
                var i : Int = 0;
                while (i < handlers.length)
                {
                    if (_handlerFilter.isValid(handlers[i].id))
                    {
                        usingHandler = handlers[i];
                        break;
                    }
                    i++;
                }
            }
        }
        
        cast((child), Model3D).registerModelForParent(cast((_parent.getProject()), Project3D), cast((_parent), Model3D), this, usingHandler);
        
        var regionPos : AbstractRegionPosition = buildRegionPosition(cast((child), Model3D));
        if (regionPos != null)
        {
            cast((child), Model3D).registerRegionPosition(regionPos);
        }
        setCollisionShapes(cast((child), Model3D).getCollisionShapesList());
    }
    
    private function buildRegionPosition(model : Model3D) : AbstractRegionPosition
    {
        return null;
    }
    private function setCollisionShapes(collisionShapes : Array<AbstractCollisionShape>) : Void
    {
    }
    private function resetCollisionShapes(collisionShapes : Array<AbstractCollisionShape>) : Void
    {
    }
    
    private function getModelRegionPosition(model : Model3D) : AbstractRegionPosition
    {
        return model.getRegionPosition();
    }
    
    public function hasChild(child : IModel3D) : Bool
    {
        return _childDict.exists(child);
    }
    
    public function removeChild(child : IModel3D) : Void
    {
        if (!hasChild(child))
        {
            return;
        }
        _childDict.remove(child);
        _numChild--;
        //Model3D(child)._regionPosition = null;
        resetCollisionShapes(cast((child), Model3D).getCollisionShapesList());
        
        var regionPos : AbstractRegionPosition = cast((child), Model3D).getRegionPosition();
        if (regionPos != null)
        {
            regionPos.destroy();
            regionPos = null;
        }
        cast((child), Model3D).unregisterRegionPosition();
        cast((child), Model3D).unregisterModelFromParent();
    }
    
    private function parseFromXML(data : FastXML) : Void
    {
        _id = data.att.id;
        
        _position = getVector3DFromXMLArrtibutes(data.hasNode.position?data.node.position:null);
        _rotation = getVector3DFromXMLArrtibutes(data.hasNode.rotation?data.node.rotation:null);
        _regionContainer.moveTo(_position.x, _position.y, _position.z);
        _regionContainer.rotateTo(_rotation.x, _rotation.y, _rotation.z);
        
        if (data.hasNode.resolve("collection-filter"))
        {
            _collectionFilter = new AccessFilter(data.node.resolve("collection-filter"));
        }
        if (data.hasNode.resolve("type-filter"))
        {
            _typeFilter = new AccessFilter(data.node.resolve("type-filter"));
        }
        if (data.hasNode.resolve("handler-filter"))
        {
            _handlerFilter = new AccessFilter(data.node.resolve("handler-filter"));
        }
        
        if (data.hasNode.resolve("child-limit"))
        {
            _childLimit = as3hx.Compat.parseInt(data.node.resolve("child-limit").att.value);
        }
        else
        {
            _childLimit = 0xFFFFFFFF;
        }
    }
    
    private function getVector3DFromXMLArrtibutes(xmlNode : FastXML, def : Vector3D = null) : Vector3D
    {
        if (def == null)
        {
            def = new Vector3D(0, 0, 0, 0);
        }
        if (xmlNode == null)
        {
            return def.clone();
        }
        return new Vector3D(
        ((xmlNode.has.x)) ? as3hx.Compat.parseFloat(xmlNode.att.x) : def.x, 
        ((xmlNode.has.y)) ? as3hx.Compat.parseFloat(xmlNode.att.y) : def.y, 
        ((xmlNode.has.z)) ? as3hx.Compat.parseFloat(xmlNode.att.z) : def.z, 
        ((xmlNode.has.w)) ? as3hx.Compat.parseFloat(xmlNode.att.w) : def.w);
    }
    
	@:allow(pl.pkapusta.engine.model.definition.DefinitionParser)
    private function onAfterInit() : Void {}
	
	@:allow(pl.pkapusta.engine.model.Model3D)
    private function dispatchLimitEvents() : Void {}
	
	@:allow(pl.pkapusta.engine.model.regions.position.AbstractRegionPosition)
    private function verifyPositionOnRegion(rp : AbstractRegionPosition, model : Model3D) : Void {}
	
	@:allow(pl.pkapusta.engine.model.controllers.Model3DMouseController)
    private function notifySelectedMouseDown(e : MouseEvent3D, model : Model3D) : Void {}
    
    public function getId() : String
    {
        return _id;
    }
    
    public function getType() : String
    {
        throw new AbstractMethodException();
        return null;
    }
    
    public function getRegionContainer() : ObjectContainer3D
    {
        return _regionContainer;
    }
    
    public function getChildLimit() : UInt
    {
        return _childLimit;
    }
    
    public function getParent() : IModel3D
    {
        return _parent;
    }
    
    public function getPosition() : Vector3D
    {
        return _position;
    }
    
    public function getRotation() : Vector3D
    {
        return _rotation;
    }
    
    public function getChildList() : Array<IModel3D>
    {
        var list : Array<IModel3D> = new Array<IModel3D>();
        for (n in _childDict.keys()) {
        
			//trace("pp: " + Model3D(_childDict[n]).getProperty("text"));
            
            list.push(n);
        }
			//trace("childList: " + list);
        return list;
    }
    
    public function moveTo(x : Float, y : Float, z : Float) : Void
    {
        _position.x = x;
        _position.y = y;
        _position.z = z;
        _regionContainer.moveTo(_position.x, _position.y, _position.z);
    }
    
    public function rotateTo(x : Float, y : Float, z : Float) : Void
    {
        _rotation.x = x;
        _rotation.y = y;
        _rotation.z = z;
        _regionContainer.rotateTo(_rotation.x, _rotation.y, _rotation.z);
    }
}

