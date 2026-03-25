package pl.pkapusta.engine.model.executors.file.proxies;


/**
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.model.executors.file.proxies.ISurfaceRegionProxy")
interface ISurfaceRegionProxy extends IRegionProxy
{
    
    
    function isMoving() : Bool;

}

