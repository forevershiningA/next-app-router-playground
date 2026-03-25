/**
* comment
**/

 package some.pkg;

import foo.bar.Xxx;
import foo.bar.Yyy;
import foo.bar.somes.*;
import foo.impl.Impl1;
import foo.impl.Impl2;
import openfl.display.Sprite;
import openfl.events.Event;

/**
 * Some comment 1
 *
 * @eventType foo.bar.Zzz
 */
@:meta(Event(name="event.first",type="foo.bar.Zzz"))

/**
 * Some comment 2
 *
 * @eventType foo.bar.Zzz
 */
@:meta(Event(name="event.second",type="foo.bar.Zzz"))

/**
 * @author Przemysław Kapusta
 */
@:expose("foo.Main")
class Main extends Sprite implements Impl1
{

	public var someReadProperty(get, never) : String ;

	private var xxx: Xxx;
	var yyy: Yyy;
	var str: String = "textStr" ;
	var str2:String="textStr";
	private var _vector:Vector<String>;

	public function new ()
	{
		super();
		stage.addEventListener(Event.RESIZE, resizeHandler);
	}

	public function func1(e:Event):Void {
		var xxx = 0;
		var yyy = 0;
	}

	public static function func2():Bool {
		trace("some text");
		return false;
	}

	private function priv_func1(arg1:Event -> Void, arg2:Yyy = null):Void {

	}

}

import after.main.class;

@:test()class SubMain<T> implements Impl1<T> implements Impl2 {

}final abstract class Tree{}

@:test2 final abstract class with.dots.Com extends with.dots.Base<T> {}

interface Impl1 {
	function func1(e:Event):Void;
}

interface Impl2 extends BaseImplA extends BaseImplB {
	public function func1(e:Event):Void;
}

import end.source;