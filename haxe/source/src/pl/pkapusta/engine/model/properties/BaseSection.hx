package pl.pkapusta.engine.model.properties;

import pl.pkapusta.engine.common.data.parsers.xml.IXMLReader;
import pl.pkapusta.engine.common.data.parsers.xml.IXMLWriter;
import pl.pkapusta.engine.model.IModel3D;

/**
	 * @author Przemysław Kapusta
	 */
class BaseSection implements ISection implements IXMLReader
{
    public var properties(get, never) : Array<IProperty>;
    public var label(get, never) : String;
    public var id(get, never) : String;

    
    public static function factory(xml : FastXML, model : IModel3D) : ISection
    {
        var section : BaseSection = new BaseSection(model);
        section.fromXML(xml);
        return section;
    }
    
    private var _id : String;
    private var _label : String;
    private var _properties : Array<IProperty>;
    
    private var _model : IModel3D;
    
    public function new(model : IModel3D)
    {
        _model = model;
    }
    
    public function fromXML(xml : FastXML) : Void
    {
        _id = xml.att.id;
        _label = xml.att.label;
        _properties = new Array<IProperty>();
        
        if (xml.hasNode.property)
        {
            for (prop in xml.nodes.property.iterator()) {
                _properties.push(AbstractProperty.factory(prop, this, _model));
            }
        }
    }
    
    private function get_properties() : Array<IProperty>
    {
        return _properties;
    }
    
    private function get_label() : String
    {
        return _label;
    }
    
    private function get_id() : String
    {
        return _id;
    }
    
    public function toString() : String
    {
        return "[object BaseSection | id: " + _id + " | label: " + _label + "]";
    }
}

