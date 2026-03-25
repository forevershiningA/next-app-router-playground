package pl.pkapusta.engine.model.handlers.collection;

import pl.pkapusta.engine.model.handlers.*;

class HandlerCollection implements IHandlerCollection
{
    public var count(get, never) : Int;

    
    private var _dict : Map<String, IHandler>;
    private var _list : Array<IHandler>;
    
    public function new(data : FastXMLList = null)
    {
        _dict = new Map<String, IHandler>();
        _list = new Array<IHandler>();
        if (data != null && data != null)
        {
            var i : Int = 0;
            while (i < data.length())
            {
                var handler : IHandler = AbstractHandler.buildHandler(data.get(i));
                _dict.set(handler.id, handler);
                _list.push(handler);
                i++;
            }
        }
    }
    
    public function getAll() : Array<IHandler>
    {
        return _list;
    }
    
    public function isEmpty() : Bool
    {
        return (_list.length == 0);
    }
    
    public function contains(id : String) : Bool
    {
        return _dict.exists(id);
    }
    
    public function getById(id : String) : IHandler
    {
        if (contains(id))
        {
            return _dict.get(id);
        }
        return null;
    }
    
    private function get_count() : Int
    {
        return _list.length;
    }
}

