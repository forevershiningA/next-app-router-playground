package pl.pkapusta.engine.model.definition.data;


/**
	 * @author Przemysław Kapusta
	 */
class EditAttributes implements IEditAttributes
{
    public var duplicate(get, never) : Bool;
    public var erase(get, never) : Bool;

    
    private var _duplicate : Bool = false;
    private var _erase : Bool = false;
    
    public function new(data : FastXML = null)
    {
        if (data != null)
        {
            if (data.node.duplicate.innerData != null)
            {
                _duplicate = (isPositive(data.node.duplicate.innerData)) ? true : false;
            }
            if (data.node.erase.innerData != null)
            {
                _erase = (isPositive(data.node.erase.innerData)) ? true : false;
            }
        }
    }
    
    private function isPositive(value : String) : Bool
    {
        return (value.toLowerCase() == "on" || value.toLowerCase() == "true" || value == "1");
    }
    
    private function get_duplicate() : Bool
    {
        return _duplicate;
    }
    
    private function get_erase() : Bool
    {
        return _erase;
    }
}

