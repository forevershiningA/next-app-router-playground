package pl.pkapusta.engine.utils.mouse;

import pl.pkapusta.engine.common.exteption.predefined.StaticClassException;
import openfl.display.Bitmap;
import openfl.display.BitmapData;
import openfl.geom.Point;
import openfl.ui.Mouse;
//import openfl.ui.MouseCursorData;

/**
	 * @author Przemysław Kapusta
	 */
class MouseCursorUtil
{
    /*
    @:meta(Embed(source="../../../../../../../../lib/engine_gfx/cursors/engine_move.png"))

    private var img_move : Class<Dynamic>;
    
    @:meta(Embed(source="../../../../../../../../lib/engine_gfx/cursors/engine_ew.png"))

    private var img_ew : Class<Dynamic>;
    
    @:meta(Embed(source="../../../../../../../../lib/engine_gfx/cursors/engine_ns.png"))

    private var img_ns : Class<Dynamic>;
    
    @:meta(Embed(source="../../../../../../../../lib/engine_gfx/cursors/engine_nesw.png"))

    private var img_nesw : Class<Dynamic>;
    
    @:meta(Embed(source="../../../../../../../../lib/engine_gfx/cursors/engine_nwse.png"))

    private var img_nwse : Class<Dynamic>;
    
    @:meta(Embed(source="../../../../../../../../lib/engine_gfx/cursors/engine_rotate_tl.png"))

    private var img_rotation_tl : Class<Dynamic>;
    
    @:meta(Embed(source="../../../../../../../../lib/engine_gfx/cursors/engine_rotate_tr.png"))

    private var img_rotation_tr : Class<Dynamic>;
    
    @:meta(Embed(source="../../../../../../../../lib/engine_gfx/cursors/engine_rotate_bl.png"))

    private var img_rotation_bl : Class<Dynamic>;
    
    @:meta(Embed(source="../../../../../../../../lib/engine_gfx/cursors/engine_rotate_br.png"))

    private var img_rotation_br : Class<Dynamic>;
	*/
    
    public static inline var CURSOR_MOVE : String = "engine_move";
    public static inline var CURSOR_EW : String = "engine_ew";
    public static inline var CURSOR_NS : String = "engine_ns";
    public static inline var CURSOR_NESW : String = "engine_nesw";
    public static inline var CURSOR_NWSE : String = "engine_nwse";
    public static inline var CURSOR_ROTATION_TL : String = "engine_rotation_tl";
    public static inline var CURSOR_ROTATION_TR : String = "engine_rotation_tr";
    public static inline var CURSOR_ROTATION_BL : String = "engine_rotation_bl";
    public static inline var CURSOR_ROTATION_BR : String = "engine_rotation_br";
    
    private static var _inited : Bool = false;
    
    public static function init() : Void
    {
        if (_inited)
        {
            return;
        }
        _inited = true;
        
        var instance : MouseCursorUtil = new MouseCursorUtil();
        
		//#WARN not supporting maybe
		
        //registerCursor(CURSOR_MOVE, bitmapVector(new instance.ImgMove()), new Point(11, 11));
        //registerCursor(CURSOR_EW, bitmapVector(new instance.ImgEw()), new Point(11, 4));
        //registerCursor(CURSOR_NS, bitmapVector(new instance.ImgNs()), new Point(4, 11));
        //registerCursor(CURSOR_NESW, bitmapVector(new instance.ImgNesw()), new Point(8, 8));
        //registerCursor(CURSOR_NWSE, bitmapVector(new instance.ImgNwse()), new Point(8, 8));
        //registerCursor(CURSOR_ROTATION_TL, bitmapVector(new instance.ImgRotationTl()), new Point(10, 10));
        //registerCursor(CURSOR_ROTATION_TR, bitmapVector(new instance.ImgRotationTr()), new Point(10, 10));
        //registerCursor(CURSOR_ROTATION_BL, bitmapVector(new instance.ImgRotationBl()), new Point(10, 10));
        //registerCursor(CURSOR_ROTATION_BR, bitmapVector(new instance.ImgRotationBr()), new Point(10, 10));
    }
    
    private static function registerCursor(name : String, data : Array<BitmapData>, hotSpot : Point) : Void
    {
		//#WARN not supporting maybe
		
        //var cursorData : MouseCursorData = new MouseCursorData();
        //cursorData.hotSpot = hotSpot;
        //cursorData.data = data;
        //cursorData.frameRate = 15;
        //Mouse.registerCursor(name, cursorData);
    }
    
    private static function bitmapVector(bitmaps : Array<Dynamic> = null) : Array<BitmapData>
    {
        var v : Array<BitmapData> = new Array<BitmapData>();
        var i : Int = 0;
        while (i < bitmaps.length)
        {
            v[i] = bitmaps[i].bitmapData;
            i++;
        }
        return v;
    }
    
    public function new()
    {  //throw new StaticClassException();  
        
    }
}

