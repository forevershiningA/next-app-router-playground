package pl.pkapusta.engine.common.mvc.utils;

import openfl.display.DisplayObjectContainer;
import openfl.display.Sprite;
import pl.pkapusta.engine.common.mvc.AbstractView;
import pl.pkapusta.engine.common.mvc.IController;
import pl.pkapusta.engine.common.mvc.IModel;

/**
	 * Abstract View for Display on Stage
	 * @author Przemysław Kapusta; Realis | Interactive & Multimedia Agency (realis.pl)
	 */
class AbstractSpriteView extends AbstractView
{
    public var displaySprite(get, never) : Sprite;
    public var x(get, set) : Float;
    public var y(get, set) : Float;
    public var visible(get, set) : Bool;
    public var alpha(get, set) : Float;

    
    private var display : Sprite;
    
    public function new(model : IModel = null, controller : IController = null, parentDisplay : DisplayObjectContainer = null)
    {
        display = new Sprite();
        if (parentDisplay != null)
        {
            parentDisplay.addChild(display);
        }
        super(model, controller);
    }
    
    override public function destroy() : Void
    {
        if (display.parent != null)
        {
            display.parent.removeChild(display);
        }
        display = null;
        super.destroy();
    }
    
    private function get_displaySprite() : Sprite
    {
        return display;
    }
    
    private function get_x() : Float
    {
        return display.x;
    }
    private function set_x(value : Float) : Float
    {
        display.x = value;
        return value;
    }
    private function get_y() : Float
    {
        return display.y;
    }
    private function set_y(value : Float) : Float
    {
        display.y = value;
        return value;
    }
    
    private function get_visible() : Bool
    {
        return display.visible;
    }
    private function set_visible(value : Bool) : Bool
    {
        display.visible = value;
        return value;
    }
    
    private function get_alpha() : Float
    {
        return display.alpha;
    }
    private function set_alpha(value : Float) : Float
    {
        display.alpha = value;
        return value;
    }
}

