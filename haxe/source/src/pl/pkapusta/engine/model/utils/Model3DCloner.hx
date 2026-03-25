package pl.pkapusta.engine.model.utils;

import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.model.container.Model3DContainer;
import pl.pkapusta.engine.model.data.ExecutorJS;
import pl.pkapusta.engine.model.events.Model3DEvent;
import pl.pkapusta.engine.model.exceptions.ModelIsNotReadyException;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorDuplicator;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.Model3D;
import openfl.events.Event;
import openfl.events.EventDispatcher;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DCloner extends EventDispatcher
{
    public var cloned(get, never) : Bool;
    public var cloning(get, never) : Bool;

    
    public var extra : Dynamic;
    
    private var fromModel : Model3D;
    private var toModel : Model3D;
    
    private var _cloning : Bool = false;
    private var _cloned : Bool = false;
    
	@:access(pl.pkapusta.engine.model.Model3D.internalModelByteData)
    public function clone(from : IModel3D) : Void
    {
        if (_cloning || _cloned)
        {
            return;
        }
        if (!from.isReady())
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return;
        }
        _cloning = true;
        fromModel = try cast(from, Model3D) catch (e:Dynamic) null;
        toModel = new Model3D(fromModel.internalModelByteData, fromModel.getContext());
        toModel.addEventListener(Model3DEvent.IS_READY, cloningModelReady);
    }
    
	@:access(pl.pkapusta.engine.model.Model3D.modelData)
	@:access(pl.pkapusta.engine.model.Model3D._extraData)
	@:access(pl.pkapusta.engine.model.Model3D._proxy)
    private function cloningModelReady(e : Model3DEvent) : Void
    {
        toModel.removeEventListener(Model3DEvent.IS_READY, cloningModelReady);
        
        var execDuplicator : IM3DExecutorDuplicator = ExecutorJS.castTo(fromModel.modelData.executor, IM3DExecutorDuplicator);
        
        if (execDuplicator == null || execDuplicator.defaultPropertiesDuplicator) {
        
			//duplicate properties
            
            if (!fromModel.getDescription().hasNode.properties)
            {
                return;
            }
            if (!fromModel.getDescription().node.properties.hasNode.section)
            {
                return;
            }
            for (section in fromModel.getDescription().node.properties.nodes.section)
            {
                if (!section.hasNode.property) continue;
                for (property in section.nodes.property)
                {
                    var propertyId : String = property.att.id;
                    //trace("cloning property: " + propertyId);
                    toModel.changeProperty(propertyId, fromModel.getProperty(propertyId));
                }
            }
        }
        
        //duplicate extra params
        if (fromModel.getExtraData() != null)
        {
            toModel._extraData = FastXML.parse(fromModel.getExtraData().toString());
        }
        
        if (execDuplicator != null)
        {
            execDuplicator.duplicate(toModel._proxy);
        }
        
        _cloning = false;
        _cloned = true;
        dispatchEvent(new Event(Event.COMPLETE));
    }
    
    public function getOriginalModel() : Model3D
    {
        return fromModel;
    }
    
    public function getClonedModel() : Model3D
    {
        return toModel;
    }
    
    private function get_cloned() : Bool
    {
        return _cloned;
    }
    
    private function get_cloning() : Bool
    {
        return _cloning;
    }

    public function new()
    {
        super();
    }
}

