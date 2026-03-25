package pl.pkapusta.engine.model.executors.file.proxies;


/**
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.model.executors.file.proxies.ILineRegionProxy")
interface ILineRegionProxy extends IRegionProxy
{
	
	function getLineOrientation() : String;
	function getWidthLimit() : Float;
	function setWidthLimit(value : Float) : Float;

}

