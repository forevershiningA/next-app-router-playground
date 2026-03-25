package pl.pkapusta.engine.project.data.structure;

import pl.pkapusta.engine.project.data.IProjectContext;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;

/**
	 * @author Przemysław Kapusta
	 */
class ElementDataHolder implements IExtraDataHolder implements IUniqueIdHolder
{
    public var uniqueId(get, set) : String;
    public var context(get, never) : IProjectContext;

    
    public static function factory(obj : Dynamic, context : IProjectContext) : ElementDataHolder
    {
        var holder : ElementDataHolder = new ElementDataHolder();
        holder._context = context;
        if (Std.is(obj, IExtraDataHolder))
        {
            holder._extraData = cast((obj), IExtraDataHolder).getExtraData();
        }
        if (Std.is(obj, IUniqueIdHolder))
        {
            holder._uniqueId = cast((obj), IUniqueIdHolder).uniqueId;
        }
        return holder;
    }
    
    private var _extraData : FastXML;
    private var _uniqueId : String;
    private var _context : IProjectContext;
    
    public function getExtraData() : FastXML
    {
        return _extraData;
    }
    
    private function get_uniqueId() : String
    {
        return _uniqueId;
    }
    private function set_uniqueId(value : String) : String
    {
        _uniqueId = value;
        return value;
    }
    
    private function get_context() : IProjectContext
    {
        return _context;
    }

    public function new()
    {
    }
}

