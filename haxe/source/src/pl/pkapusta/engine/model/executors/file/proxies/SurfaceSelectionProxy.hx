package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.model.selection.AbstractSelection;
import pl.pkapusta.engine.model.selection.SurfaceSelection;
import openfl.geom.Rectangle;

/**
	 * @author Przemysław Kapusta
	 */
class SurfaceSelectionProxy extends SelectionProxy implements ISurfaceSelectionProxy
{
    public var area(get, never) : Rectangle;
    
    private var _surfSelection : SurfaceSelection;
    
    public function new(selection : AbstractSelection)
    {
        super(selection);
        _surfSelection = try cast(selection, SurfaceSelection) catch(e:Dynamic) null;
    }
    
    public function setArea(area : Rectangle) : Void
    {
        _surfSelection.setArea(area);
    }
    
    public function setRotation(rotation : Float) : Void
    {
        _surfSelection.setRotation(rotation);
    }
    
    private function get_area() : Rectangle
    {
        return _surfSelection.area;
    }
    
    public function isResizable() : Bool
    {
        return _surfSelection.isResizable();
    }
    
    public function setResizable(value : Bool) : Bool
    {
        return _surfSelection.setResizable(value);
    }
    
    override public function dispose() : Void
    {
        _surfSelection = null;
        super.dispose();
    }
}

