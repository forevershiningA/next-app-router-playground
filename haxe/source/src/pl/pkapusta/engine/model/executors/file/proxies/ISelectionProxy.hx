package pl.pkapusta.engine.model.executors.file.proxies;


/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.file.proxies.ISelectionProxy")
interface ISelectionProxy extends IBaseProxy
{
    
    var active(get, never) : Bool;

    
    function activate() : Void
    ;
    function deactivate() : Void
    ;
}

