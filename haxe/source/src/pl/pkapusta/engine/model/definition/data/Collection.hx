package pl.pkapusta.engine.model.definition.data;

/**
	 * @author Przemysław Kapusta
	 */
class Collection implements ICollection
{
    public var count(get, never) : Int;

    
    private var _dict : Map<String, Bool>;
    private var _list : Array<String>;
    
    public function new(data : FastXMLList = null)
    {
        _dict = new Map<String, Bool>();
        _list = new Array<String>();
        if (data != null && data != null)
        {
            var i : Int = 0;
            while (i < data.length())
            {
                if (data.get(i).att.value != null)
                {
                    var n : String = data.get(i).att.value;
                    _dict.set(n, true);
                    _list.push(n);
                }
                i++;
            }
        }
    }
    
    public function getAll() : Array<String>
    {
        return _list;
    }
    
    public function isEmpty() : Bool
    {
        return (_list.length == 0);
    }
    
    public function contains(name : String) : Bool
    {
        return _dict.exists(name);
    }
    
    private function get_count() : Int
    {
        return _list.length;
    }
}

