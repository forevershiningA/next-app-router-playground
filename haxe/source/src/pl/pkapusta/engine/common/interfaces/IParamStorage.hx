package pl.pkapusta.engine.common.interfaces;


/**
	 * @author Przemysław Kapusta
	 */
@:expose("e3d.common.interfaces.IParamStorage")
interface IParamStorage
{

    function setParam(name : String, data : Dynamic) : Void
    ;
    function getParam(name : String) : Dynamic
    ;
    function clearParam(name : String) : Void
    ;
    function hasParam(name : String) : Bool
    ;
    function getParamNames() : Array<String>
    ;
}

