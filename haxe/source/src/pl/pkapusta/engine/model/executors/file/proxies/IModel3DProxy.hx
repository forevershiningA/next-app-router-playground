package pl.pkapusta.engine.model.executors.file.proxies;


/**
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.model.executors.file.proxies.IModel3DProxy")
interface IModel3DProxy extends IBaseProxy {
    
    function getDescription() : FastXML;
    function getVersion() : Int;
    function isReady() : Bool;    
    function isContextReady() : Bool;    
    function getGeneralType() : String;
    function getHandlers() : IHandlerCollectionProxy;
    function getExtraData() : FastXML;
    function changeProperty(id : String, value : Dynamic) : Void;
    function getProperty(id : String) : Dynamic;
    function getInfo(type : String) : Dynamic;
    //function get regionPosition():IRegionProxy;
    //function getCollisionShape(name:String):AbstractCollisionShape;
    function getRegion(id : String) : IRegionProxy;
    function hasProperty(id : String) : Bool;
	function isSelected() : Bool;
    function setSelected(value : Bool) : Bool;
	function getSelectionObject() : ISelectionProxy;
	
}

