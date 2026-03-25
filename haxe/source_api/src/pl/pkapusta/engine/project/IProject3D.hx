package pl.pkapusta.engine.project;

extern interface IProject3D {
	function getRootModel():Any;
	function getSelectedModel():Any;
	function setSelectedModel(value:Any):Any;
	function loadRootModel(urlOrData:Dynamic):Any;
	function setRootModel(model:Any):Void;
}