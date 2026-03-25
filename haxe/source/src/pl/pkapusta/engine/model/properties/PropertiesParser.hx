package pl.pkapusta.engine.model.properties;

import pl.pkapusta.engine.model.IModel3D;

/**
	 * @author Przemysław Kapusta
	 */
class PropertiesParser
{
    public var properties(get, never) : Array<IProperty>;
    public var sections(get, never) : Array<ISection>;
	
	@:allow(pl.pkapusta.engine.model.Model3D)
    private var hiddenProperties(get, never) : Array<IProperty>;

    
    private var _sections : Array<ISection>;
    private var _properties : Array<IProperty>;
    private var _hiddenProperties : Array<IProperty>;
    
    private var _popertyById : Map<String, IProperty>;
    
    public function new(model : IModel3D)
    {
        var j : Int;
        
        _sections = new Array<ISection>();
        _properties = new Array<IProperty>();
        _popertyById = new Map<String, IProperty>();
        
        if (model.getDescription() != null && model.getDescription().hasNode.properties && model.getDescription().node.properties.hasNode.section)
        {
            for (sectionXML in model.getDescription().node.properties.nodes.section.iterator())
            {
                var section : ISection = BaseSection.factory(sectionXML, model);
                j = 0;
                while (j < section.properties.length)
                {
                    _properties.push(section.properties[j]);
                    _popertyById.set(section.properties[j].id, section.properties[j]);
                    j++;
                }
                _sections.push(section);
            }
        }
        
		if (model.getDescription() != null && model.getDescription().hasNode.properties && model.getDescription().node.properties.hasNode.hidden)
        {
            var hiddenSection : ISection = BaseSection.factory(model.getDescription().node.properties.node.hidden, model);
            if (hiddenSection.properties.length > 0)
            {
                _hiddenProperties = new Array<IProperty>();
                j = 0;
                while (j < hiddenSection.properties.length)
                {
                    _hiddenProperties.push(hiddenSection.properties[j]);
                    j++;
                }
            }
        }
    }
    
    private function get_properties() : Array<IProperty>
    {
        return _properties;
    }
    
    private function get_hiddenProperties() : Array<IProperty>
    {
        return _hiddenProperties;
    }
    
    private function get_sections() : Array<ISection>
    {
        return _sections;
    }
    
    public function propertyById(id : String) : IProperty
    {
        if (!hasProperty(id))
        {
            return null;
        }
        return _popertyById.get(id);
    }
    
    public function hasProperty(id : String) : Bool
    {
        return _popertyById.exists(id);
    }
}

