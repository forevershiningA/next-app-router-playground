package pl.pkapusta.engine.model.definition.data;

/**
	 * @author Przemysław Kapusta
	 */
class Informations
{
    public var list(get, never) : Array<InformationData>;

    
    private var _list : Array<InformationData>;
    private var _dict : Map<String, InformationData>;
    
    public function new(data : FastXML = null)
    {
        _dict = new Map<String, InformationData>();
        _list = new Array<InformationData>();
        if (data != null && data.hasNode.information)
        {
            for (itemXML in data.nodes.information.iterator())
            {
                var item : InformationData = new InformationData(itemXML);
                if (item.type != null && item.type != "" && !(_dict.exists(item.type)))
                {
                    _list.push(item);
                    _dict.set(item.type, item);
                }
            }
        }
    }
    
    public function getByType(type : String) : InformationData
    {
        if (!_dict.exists(type))
        {
            return null;
        }
        return _dict.get(type);
    }
    
    public function dispose() : Void
    {
        _dict = null;
        _list = null;
    }
    
    private function get_list() : Array<InformationData>
    {
        return _list;
    }
}

