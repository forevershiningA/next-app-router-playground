package pl.pkapusta.engine.model.definition;

import away3d.containers.ObjectContainer3D;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.model.collision.*;
import pl.pkapusta.engine.model.container.Model3DContainer;
import pl.pkapusta.engine.model.definition.data.Collection;
import pl.pkapusta.engine.model.definition.data.EditAttributes;
import pl.pkapusta.engine.model.definition.data.ICollection;
import pl.pkapusta.engine.model.definition.data.IEditAttributes;
import pl.pkapusta.engine.model.definition.data.InformationData;
import pl.pkapusta.engine.model.definition.data.Informations;
import pl.pkapusta.engine.model.definition.exceptions.DefinitionFileInvalidException;
import pl.pkapusta.engine.model.handlers.collection.HandlerCollection;
import pl.pkapusta.engine.model.handlers.collection.IHandlerCollection;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.*;
import pl.pkapusta.engine.model.selection.*;
/**
	 * @author Przemysław Kapusta
	 */
class DefinitionParser implements IDisposable
{
    public var regionList(get, never) : Array<IRegion>;
    public var type(get, never) : String;
    public var collisionShapes(get, never) : Array<AbstractCollisionShape>;
    public var cameraXML(get, never) : FastXML;
    public var selection(get, never) : AbstractSelection;
    public var editAttributes(get, never) : IEditAttributes;
    public var propertiesList(get, never) : Array<String>;
    public var informations(get, never) : Informations;
    public var collection(get, never) : ICollection;
    public var handlers(get, never) : IHandlerCollection;

    
    private var _definition : FastXML;
    
    private var _regionList : Array<IRegion>;
    private var _regionDict : Map<String, IRegion>;
    
    private var _collisionShapes : Array<AbstractCollisionShape>;
    private var _collisionShapesDict : Map<String, AbstractCollisionShape>;
    
    private var _selection : AbstractSelection = null;
    
    private var _type : String;
    private var _collection : ICollection;
    private var _handlers : IHandlerCollection;
    
    private var _model : Model3D;
    private var _container : Model3DContainer;
    
    private var _cameraXML : FastXML = null;
    
    private var _editAttributes : EditAttributes;
    private var _informations : Informations;
    
    private var _propertiesDict : Map<String, FastXML>;
    private var _propertiesList : Array<String>;
    
    public function new(definition : FastXML, model : Model3D, container : Model3DContainer)
    {
        _definition = definition;
        _model = model;
        _container = container;
        parseGeneralData();
        parseEditAttributes();
        parseInformations();
        parseProperties();
        parseRegions();
        parseHandlers();
        parseCollisionShapes();
        parseCamera();
        parseSelection();
    }
    
    private function parseEditAttributes() : Void
    {
        if (_definition.hasNode.resolve("edit-attributes"))
        {
            _editAttributes = new EditAttributes(_definition.node.resolve("edit-attributes"));
        }
        else
        {
            _editAttributes = new EditAttributes();
        }
    }
    
    private function parseInformations() : Void
    {
        if (_definition.hasNode.informations)
        {
            _informations = new Informations(_definition.node.informations);
        }
        else
        {
            _informations = new Informations();
        }
    }
    
    private function parseHandlers() : Void
    {
        if (_definition.hasNode.handlers && _definition.node.handlers.hasNode.handler)
        {
            _handlers = new HandlerCollection(_definition.node.handlers.nodes.handler);
        }
        else
        {
            _handlers = new HandlerCollection();
        }
    }
    
    private function parseGeneralData() : Void
    {
        if (!_definition.hasNode.general)
        {
            ExceptionManager.Throw(new DefinitionFileInvalidException());return;
        }
        if (!_definition.node.general.hasNode.type)
        {
            ExceptionManager.Throw(new DefinitionFileInvalidException());return;
        }
        if (!_definition.node.general.node.type.has.value)
        {
            ExceptionManager.Throw(new DefinitionFileInvalidException());return;
        }
        _type = _definition.node.general.node.type.att.value;
        _collection = new Collection(((_definition.node.general.hasNode.collection))?_definition.node.general.nodes.collection : null);
    }
    
    private function parseProperties() : Void
    {
        _propertiesDict = new Map<String, FastXML>();
        _propertiesList = new Array<String>();
        if (!_definition.hasNode.properties) return;
        if (!_definition.node.properties.hasNode.section) return;
        for (section in _definition.node.properties.nodes.section.iterator())
        {
            if (!section.hasNode.property) continue;
            for (property in section.nodes.property.iterator())
            {
                var propertyId : String = property.att.id;
                _propertiesDict.set(propertyId, property);
                _propertiesList.push(propertyId);
            }
        }
    }
    
    private function parseRegions() : Void
    {
        _regionList = new Array<IRegion>();
        _regionDict = new Map<String, IRegion>();
        if (!_definition.hasNode.regions) return;
        if (!_definition.node.regions.hasNode.region) return;
        for (regionXML in _definition.node.regions.nodes.region.iterator())
        {
            var region : AbstractRegion = AbstractRegion.builRegion(_model, regionXML);
            if (region != null)
            {
                _container.regionsContainer.addChild(region.getRegionContainer());
                _regionList.push(region);
                _regionDict.set(region.getId(), region);
                region.onAfterInit();
            }
        }
    }
    
    private function parseCollisionShapes() : Void
    {
        _collisionShapes = new Array<AbstractCollisionShape>();
        _collisionShapesDict = new Map<String, AbstractCollisionShape>();
        if (!_definition.hasNode.resolve("collision-shapes")) return;
        if (!_definition.node.resolve("collision-shapes").hasNode.resolve("collision-shape")) return;
        for (shapeXML in _definition.node.resolve("collision-shapes").nodes.resolve("collision-shape").iterator())
        {
            var collisionShape : AbstractCollisionShape = AbstractCollisionShape.factoryXML(_model, shapeXML);
            if (collisionShape != null)
            {
                _collisionShapes.push(collisionShape);
                _collisionShapesDict.set(collisionShape.name, collisionShape);
            }
        }
    }
    
    private function parseCamera() : Void
    {
        if (!_definition.hasNode.camera)
        {
            return;
        }
        _cameraXML = _definition.node.camera;
    }
    
    private function parseSelection() : Void
    {
        if (!_definition.hasNode.selection)
        {
            return;
        }
        _selection = AbstractSelection.factory(_model, _container.controlsContainer, _definition.node.selection);
    }
    
    public function getRegion(id : String) : IRegion
    {
        if (_regionDict.exists(id))
        {
            return _regionDict.get(id);
        }
        return null;
    }
    
    public function getCollisionShape(name : String) : AbstractCollisionShape
    {
        if (_collisionShapesDict.exists(name))
        {
            return _collisionShapesDict.get(name);
        }
        return null;
    }
    
    private function get_regionList() : Array<IRegion>
    {
        return _regionList;
    }
    
    private function get_type() : String
    {
        return _type;
    }
    
    private function get_collisionShapes() : Array<AbstractCollisionShape>
    {
        return _collisionShapes;
    }
    
    private function get_cameraXML() : FastXML
    {
        return _cameraXML;
    }
    
    private function get_selection() : AbstractSelection
    {
        return _selection;
    }
    
    private function get_editAttributes() : IEditAttributes
    {
        return _editAttributes;
    }
    
    private function get_propertiesList() : Array<String>
    {
        return _propertiesList;
    }
    
    private function get_informations() : Informations
    {
        return _informations;
    }
    
    private function get_collection() : ICollection
    {
        return _collection;
    }
    
    private function get_handlers() : IHandlerCollection
    {
        return _handlers;
    }
    
    public function hasProperty(id : String) : Bool
    {
        return _propertiesDict.exists(id);
    }
    
    public function dispose() : Void
    {
        _definition = null;
        _regionList = null;
        _regionDict = null;
        _collisionShapes = null;
        _collisionShapesDict = null;
        if (_selection != null)
        {
            _selection.dispose();
            _selection = null;
        }
        _type = null;
        _collection = null;
        _handlers = null;
        _model = null;
        _container = null;
        _cameraXML = null;
        _editAttributes = null;
        _informations = null;
        _propertiesDict = null;
        _propertiesList = null;
    }
}

