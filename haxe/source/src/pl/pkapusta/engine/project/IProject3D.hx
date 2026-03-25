package pl.pkapusta.engine.project;

import pl.pkapusta.engine.model.IModel3D;

/**
 * @author Przemysław Kapusta
 */
interface IProject3D {
    
    function getRootModel() : IModel3D;
    function getSelectedModel() : IModel3D;
	function setSelectedModel(value : IModel3D) : IModel3D;
    function loadRootModel(urlOrData : Dynamic) : IModel3D;
    function setRootModel(model : IModel3D) : Void;
	
}

