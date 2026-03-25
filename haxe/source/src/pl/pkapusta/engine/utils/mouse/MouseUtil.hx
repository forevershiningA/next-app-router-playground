package pl.pkapusta.engine.utils.mouse;

import pl.pkapusta.engine.common.exteption.predefined.StaticClassException;
import openfl.display.Stage;
import openfl.events.MouseEvent;
import openfl.geom.Point;

/**
	 * @author Przemysław Kapusta
	 */
class MouseUtil
{
    public static var active(get, never) : Bool;
    public static var stage(get, never) : Stage;

    
    private static inline var MOUSE_CHECK_DISTANCE : Float = 7;
    
    private static var _active : Bool = false;
    private static var _stage : Stage;
    
    private static var downPoint : Point = null;
    private static var upPoint : Point = null;
    
    public static function activate(stage : Stage) : Void
    {
        if (_active)
        {
            return;
        }
        _active = true;
        _stage = stage;
        _stage.addEventListener(MouseEvent.MOUSE_DOWN, stageMouseDownListener);
        _stage.addEventListener(MouseEvent.MOUSE_UP, stageMouseUpListener);
    }
    
    public static function deactivate() : Void
    {
        if (!_active)
        {
            return;
        }
        _active = false;
        _stage = null;
        _stage.removeEventListener(MouseEvent.MOUSE_DOWN, stageMouseDownListener);
        _stage.removeEventListener(MouseEvent.MOUSE_UP, stageMouseUpListener);
    }
    
    private static function stageMouseDownListener(e : MouseEvent) : Void
    {
        downPoint = new Point(e.stageX, e.stageY);
        upPoint = downPoint.clone();
        _stage.addEventListener(MouseEvent.MOUSE_MOVE, stageMouseMoveListener);
    }
    
    private static function stageMouseMoveListener(e : MouseEvent) : Void
    {
        upPoint.x = e.stageX;
        upPoint.y = e.stageY;
    }
    
    private static function stageMouseUpListener(e : MouseEvent) : Void
    {
        _stage.removeEventListener(MouseEvent.MOUSE_MOVE, stageMouseMoveListener);
        upPoint.x = e.stageX;
        upPoint.y = e.stageY;
    }
    
    public static function checkForMouseDragged() : Bool
    {
        if (downPoint == null || upPoint == null)
        {
            return false;
        }
        return (Point.distance(downPoint, upPoint) > MOUSE_CHECK_DISTANCE);
    }
    
    public function new()
    {
        throw new StaticClassException();
    }
    
    private static function get_active() : Bool
    {
        return _active;
    }
    
    private static function get_stage() : Stage
    {
        return _stage;
    }
}

