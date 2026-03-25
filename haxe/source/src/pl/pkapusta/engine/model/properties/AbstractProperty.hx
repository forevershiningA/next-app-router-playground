package pl.pkapusta.engine.model.properties;

import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;
import pl.pkapusta.engine.common.data.parsers.xml.IXMLReader;
import pl.pkapusta.engine.model.IModel3D;

/**
	 * @author Przemysław Kapusta
	 */
@:keepSub
class AbstractProperty implements IProperty implements IXMLReader implements IProjectElementWriter
{
    public var id(get, never) : String;
    public var label(get, never) : String;
    public var type(get, never) : String;
    public var section(get, never) : ISection;
    public var rawXMLNode(get, never) : FastXML;

    
    public static function factory(xml : FastXML, section : ISection, model : IModel3D) : IProperty
    {
        var type : String = xml.att.type;
        var property : AbstractProperty;
        switch (type)
        {
            case PropertyType.FONT:property = new FontProperty(section, model);
            case PropertyType.TEXTURE:property = new TextureProperty(section, model);
            case PropertyType.FILE:property = new FileProperty(section, model);
            case PropertyType.DISPLAY:property = new DisplayProperty(section, model);
            case PropertyType.SWITCH:property = new SwitchProperty(section, model);
            default:property = new BaseProperty(section, model);
        }
        property.fromXML(xml);
        return property;
    }
    
    private var _id : String;
    private var _label : String;
    private var _type : String;
    private var _section : ISection;
    private var _model : IModel3D;
    private var _rawXMLNode : FastXML;
    
    public function new(section : ISection, model : IModel3D)
    {
        _section = section;
        _model = model;
    }
    
    public function fromXML(xml : FastXML) : Void
    {
        _rawXMLNode = xml;
        _id = xml.att.id;
        _label = xml.att.label;
        _type = xml.att.type;
    }
    
    public function changeProperty(data : Dynamic) : Void
    {
        _model.changeProperty(_id, data);
    }
    
    public function getProperty() : Dynamic
    {
        return _model.getProperty(_id);
    }
    
    private function get_id() : String
    {
        return _id;
    }
    
    private function get_label() : String
    {
        return _label;
    }
    
    private function get_type() : String
    {
        return _type;
    }
    
    private function get_section() : ISection
    {
        return _section;
    }
    
    private function get_rawXMLNode() : FastXML
    {
        return _rawXMLNode;
    }
    
    public function toString() : String
    {
        return "[object BaseProperty | id: " + _id + " | type: " + _type + " | label: " + _label + "]";
    }
    
    public function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    {
        var _value : Dynamic = getProperty();
        var xml : FastXML = basicPropertyTag();
        if (_value != null && _value != null)
        {
            xml.setAttribute("value", Std.string(_value));
        }
        return xml;
    }
    
    private function basicPropertyTag() : FastXML
    {
        var xml : FastXML = FastXML.parse("<property />");
        xml.setAttribute("id", _id);
        xml.setAttribute("type", _type);
        return xml;
    }
}

