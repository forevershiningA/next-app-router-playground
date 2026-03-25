package pl.pkapusta.engine.model.executors.bridge;


/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.bridge.IM3DBridge")
interface IM3DBridge
{

    function dispatchPropertyChange(id : String, data : Dynamic, type : String) : Void
    ;
}

