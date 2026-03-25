package pl.pkapusta.engine.project.utils;

import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.regions.IRegion;
import pl.pkapusta.engine.project.IProject3D;

/**
 * @author Przemysław Kapusta
 */
class Project3DModelsIterator {
	
    private var _project : IProject3D;
    
    private var _modelsList : Array<IModel3D>;
    private var _position : Int = -1;
    
    public function new(project : IProject3D)
    {
        _project = project;
        _modelsList = new Array<IModel3D>();
        if (_project.getRootModel() != null)
        {
            _writeModelAndChilds(_project.getRootModel());
        }
    }
    
    private function _writeModelAndChilds(model : IModel3D) : Void
    {
        _modelsList.push(model);
        var regions : Array<IRegion> = model.getRegionList();
        var i : Int = 0;
        while (i < regions.length)
        {
            var region : IRegion = regions[i];
            var childs : Array<IModel3D> = region.getChildList();
            var j : Int = 0;
            while (j < childs.length)
            {
                _writeModelAndChilds(childs[i]);
                j++;
            }
            i++;
        }
    }
    
    public function next() : IModel3D
    {
        _position++;
        if (_position < _modelsList.length)
        {
            return _modelsList[_position];
        }
        return null;
    }
    
    public function getList() : Array<IModel3D>
    {
        return _modelsList;
    }
}

