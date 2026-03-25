package pl.pkapusta.engine.project.data.structure.context;

import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.project.data.IProjectContext;

/**
	 * @author Przemysław Kapusta
	 * @abstract
	 */
class BaseResourceContext
{
    public var type(get, never) : String;

    
    private static var resourceTypeDict : Map<String, Class<Dynamic>> = new Map<String, Class<Dynamic>>();
    public static function registerNewResourceContext(contextClass : Class<Dynamic>, type : String) : Void
    {
		resourceTypeDict.set(type, contextClass);
    }
    
    private static function buildContextFromXML(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext) : IResourceContext
    {
        if (xml == null || !xml.has.type) {
            return null;
        }
        var type : String = xml.att.type;
        if (!(resourceTypeDict.exists(type))) {
            return null;
        }
        var cl : Class<Dynamic> = resourceTypeDict.get(type);
        var resContext : IResourceContext = try cast(Type.createInstance(cl, []), IResourceContext) catch(e:Dynamic) null;
        if (resContext != null)
        {
            resContext.readProjectElement(xml, embedReader, context);
        }
        else
        {
            trace("WARNING! ResourceContext must be IResourceContext object!");
        }
        return resContext;
    }
    
    private var _type : String;
    
    public function new(type : String)
    {
        _type = type;
    }
    
    private function get_type() : String
    {
        return _type;
    }
    
    private function buildBaseXML() : FastXML
    {
        var xml : FastXML = FastXML.parse("<context />");
        xml.setAttribute("type", type);
        return xml;
    }
}

