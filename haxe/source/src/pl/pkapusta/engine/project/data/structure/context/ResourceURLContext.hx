package pl.pkapusta.engine.project.data.structure.context;

import pl.pkapusta.engine.project.data.IProjectContext;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;
import openfl.net.URLRequest;

/**
	 * @author Przemysław Kapusta
	 */
class ResourceURLContext extends BaseResourceContext implements IResourceContext implements IProjectElementWriter implements IProjectElementReader
{
    public var url(get, set) : URLRequest;

    
    public static inline var TYPE : String = "resourceURLContext";
    
    
    private var _url : URLRequest;
    
    public function new(url : URLRequest = null)
    {
        super(TYPE);
        _url = url;
    }
    
    public function writeProjectElement(embedWriter : IParserEmbedWriter) : FastXML
    {
        var xml : FastXML = buildBaseXML();
        xml.setAttribute("url", _url.url);
        xml.setAttribute("method", _url.method);
        return xml;
    }
    
    public function readProjectElement(xml : FastXML, embedReader : IParserEmbedReader, context : IProjectContext) : Void
    {
        _url = new URLRequest();
        if (xml.has.url)
        {
            _url.url = xml.att.url;
        }
        if (xml.has.method)
        {
            _url.method = xml.att.method;
        }
    }
    
    private function get_url() : URLRequest
    {
        return _url;
    }
    
    private function set_url(value : URLRequest) : URLRequest
    {
        _url = value;
        return value;
    }
    private static var ResourceURLContext_static_initializer = {
        BaseResourceContext.registerNewResourceContext(ResourceURLContext, TYPE);
        true;
    }

}

