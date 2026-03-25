package pl.pkapusta.engine.model.selection.events;

import openfl.events.Event;
import openfl.geom.Point;

/**
	 * @author Przemysław Kapusta
	 */
class PlanarTransformEvent extends Event
{
    
    public static inline var SELECTION_RESIZING : String = "selection.resizing";
    public static inline var SELECTION_ROTATING : String = "selection.rotating";
    
    public var resizingVector : Point = new Point();
    public var resizingPoint : Point = new Point();
    
    public function new(type : String, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
    }
    
    override public function clone() : Event
    {
        var e : PlanarTransformEvent = new PlanarTransformEvent(type, bubbles, cancelable);
        e.resizingVector = resizingVector.clone();
        e.resizingPoint = resizingPoint.clone();
        return e;
    }
    
    override public function toString() : String
    {
        return formatToString("PlanarResizingEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
}

