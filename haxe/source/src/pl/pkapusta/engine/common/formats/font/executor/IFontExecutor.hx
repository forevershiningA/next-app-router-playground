package pl.pkapusta.engine.common.formats.font.executor;

import openfl.text.Font;

/**
	 * @author Przemysław Kapusta
	 */
interface IFontExecutor
{
    
    var registered(get, never) : Bool;

    function registerFont() : Void
    ;
    function getFont() : Font
    ;
}

