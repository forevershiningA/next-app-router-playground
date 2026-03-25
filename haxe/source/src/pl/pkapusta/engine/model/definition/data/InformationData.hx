package pl.pkapusta.engine.model.definition.data;


/**
	 * @author Przemysław Kapusta
	 */
class InformationData
{
    
    public var type : String;
    public var executableGet : String = null;
    public var executableCall : String = null;
    
    public function new(data : FastXML = null)
    {
        if (data != null)
        {
            type = data.att.type;
            if (data.has.resolve("executable-get"))
            {
                executableGet = data.att.resolve("executable-get");
            }
            if (data.has.resolve("executable-call"))
            {
                executableCall = data.att.resolve("executable-call");
            }
        }
    }
}

