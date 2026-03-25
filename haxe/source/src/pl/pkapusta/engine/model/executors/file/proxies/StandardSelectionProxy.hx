package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.model.selection.AbstractSelection;
import pl.pkapusta.engine.model.selection.StandardSelection;

/**
	 * @author Przemysław Kapusta
	 */
class StandardSelectionProxy extends SelectionProxy implements IStandardSelectionProxy
{
    public var width(get, set) : Float;
    public var height(get, set) : Float;
    public var depth(get, set) : Float;
    public var x(get, set) : Float;
    public var y(get, set) : Float;
    public var z(get, set) : Float;

    
    private var _stdSelection : StandardSelection;
    
    public function new(selection : AbstractSelection)
    {
        super(selection);
        _stdSelection = try cast(selection, StandardSelection) catch(e:Dynamic) null;
    }
    
    private function get_width() : Float
    {
        return _stdSelection.width;
    }
    
    private function set_width(value : Float) : Float
    {
        _stdSelection.width = value;
        return value;
    }
    
    private function get_height() : Float
    {
        return _stdSelection.height;
    }
    
    private function set_height(value : Float) : Float
    {
        _stdSelection.height = value;
        return value;
    }
    
    private function get_depth() : Float
    {
        return _stdSelection.depth;
    }
    
    private function set_depth(value : Float) : Float
    {
        _stdSelection.depth = value;
        return value;
    }
    
    private function get_x() : Float
    {
        return _stdSelection.x;
    }
    
    private function set_x(value : Float) : Float
    {
        _stdSelection.x = value;
        return value;
    }
    
    private function get_y() : Float
    {
        return _stdSelection.y;
    }
    
    private function set_y(value : Float) : Float
    {
        _stdSelection.y = value;
        return value;
    }
    
    private function get_z() : Float
    {
        return _stdSelection.z;
    }
    
    private function set_z(value : Float) : Float
    {
        _stdSelection.z = value;
        return value;
    }
    
    public function moveTo(x : Float, y : Float, z : Float) : Void
    {
        _stdSelection.moveTo(x, y, z);
    }
    
    public function resizeTo(width : Float, height : Float, depth : Float) : Void
    {
        _stdSelection.resizeTo(width, height, depth);
    }
    
    override public function dispose() : Void
    {
        _stdSelection = null;
        super.dispose();
    }
}

