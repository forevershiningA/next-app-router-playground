package pl.pkapusta.engine.utils.filters;


/**
	 * @author Przemysław Kapusta
	 */
class AccessFilter
{
    
    private var filterOrder : Array<TypeFilterOrderItem>;
    
    public function new(data : Dynamic)
    {
        filterOrder = new Array<TypeFilterOrderItem>();
        if ((Std.is(data, FastXML)) || (Std.is(data, String)))
        {
            buildFromXML(data);
        }
    }
    
    private function buildFromXML(xml : FastXML) : Void
    {
        for (el in xml.elements)
        {
            var name : String = el.name;
            var value : String = el.att.value;
            if (name == "deny")
            {
                filterOrder.push(new TypeFilterOrderItem(TypeFilterOrderItem.DENY, value));
            }
            else if (name == "allow")
            {
                filterOrder.push(new TypeFilterOrderItem(TypeFilterOrderItem.ALLOW, value));
            }
        }
    }
    
    public function isValid(type : String) : Bool
    {
        var valid : Bool = false;
        var i : Int = 0;
        while (i < filterOrder.length)
        {
            var f : TypeFilterOrderItem = filterOrder[i];
            if (f.type == TypeFilterOrderItem.ALLOW)
            {
                if (f.value == "*" || f.value == type)
                {
                    valid = true;
                }
            }
            else if (f.value == "*" || f.value == type)
            {
                valid = false;
            }
            i++;
        }
        return valid;
    }
}



class TypeFilterOrderItem
{
    public var type(get, never) : Int;
    public var value(get, never) : String;

    public static inline var ALLOW : Int = 1;
    public static inline var DENY : Int = 0;
    
    private var _type : Int;
    private var _value : String;
    
    public function new(type : Int, value : String)
    {
        _type = type;
        _value = value;
    }
    
    private function get_type() : Int
    {
        return _type;
    }
    
    private function get_value() : String
    {
        return _value;
    }
}