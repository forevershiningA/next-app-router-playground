package pl.pkapusta.engine.model.utils.iterators;

import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.properties.IProperty;
import pl.pkapusta.engine.model.regions.IRegion;
import pl.pkapusta.engine.project.IProject3D;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DPropertyIterator
{
    public var list(get, never) : Array<IProperty>;

    
    private var _model : IModel3D;
    
    private var _propertyList : Array<IProperty>;
    private var _position : Int = -1;
    
	@:access(pl.pkapusta.engine.model.Model3D.getHiddenProperties)
    public function new(model : IModel3D, withHidden : Bool = false)
    {
        _model = model;
        if (!withHidden)
        {
            _propertyList = model.getProperties();
        }
        else
        {
            _propertyList = new Array<IProperty>();
            var i : Int;
            var props : Array<IProperty> = model.getProperties();
            i = 0;
            while (i < props.length)
            {
                _propertyList.push(props[i]);
                i++;
            }
			
            props = cast((model), Model3D).getHiddenProperties();
            if (props != null)
            {
                i = 0;
                while (i < props.length)
                {
                    _propertyList.push(props[i]);
                    i++;
                }
            }
        }
    }
    
    public function next() : IProperty
    {
        _position++;
        if (_position < _propertyList.length)
        {
            return _propertyList[_position];
        }
        return null;
    }
    
    private function get_list() : Array<IProperty>
    {
        return _propertyList;
    }
    
    public function dispose() : Void
    {
        _propertyList = null;
    }
}

