package pl.pkapusta.engine.model.properties;


/**
	 * @author Przemysław Kapusta
	 */
interface IProperty
{
    
    var id(get, never) : String;    
    var label(get, never) : String;    
    var type(get, never) : String;    
    var section(get, never) : ISection;    
    var rawXMLNode(get, never) : FastXML;

    
    function changeProperty(data : Dynamic) : Void
    ;
    function getProperty() : Dynamic
    ;
}

