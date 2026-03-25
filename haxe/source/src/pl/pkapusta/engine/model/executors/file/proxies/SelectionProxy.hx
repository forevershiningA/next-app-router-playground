package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.model.selection.AbstractSelection;
import pl.pkapusta.engine.model.selection.StandardSelection;
import pl.pkapusta.engine.model.selection.SurfaceSelection;

/**
	 * @author Przemysław Kapusta
	 */
class SelectionProxy implements ISelectionProxy
{
    public var active(get, never) : Bool;
    
    public static function factory(selection : AbstractSelection) : ISelectionProxy
    {
        if (Std.is(selection, StandardSelection))
        {
            return new StandardSelectionProxy(selection);
        }
        if (Std.is(selection, SurfaceSelection))
        {
            return new SurfaceSelectionProxy(selection);
        }
        return new SelectionProxy(selection);
    }
    
    private var _selection : AbstractSelection;
    
    public function new(selection : AbstractSelection)
    {
        _selection = selection;
    }
    
    public function activate() : Void
    {
        _selection.activate();
    }
    
    public function deactivate() : Void
    {
        _selection.deactivate();
    }
    
    private function get_active() : Bool
    {
        return _selection.active;
    }
    
    public function getBaseInstance() : Dynamic
    {
        return _selection;
    }
    
    public function dispose() : Void
    {
        _selection = null;
    }
}

