package pl.pkapusta.engine.common.mvc.data;

import pl.pkapusta.engine.common.mvc.IController;
import pl.pkapusta.engine.common.mvc.IModel;
import pl.pkapusta.engine.common.mvc.input.IInputListener;
import pl.pkapusta.engine.common.mvc.IView;

class MvcModuleData
{
    
    public var mainController : IController;
    public var model : IModel;
    
    public var views : Array<IView>;
    public var inputs : Array<IInputListener>;
    
    public function new()
    {
        views = new Array<IView>();
        inputs = new Array<IInputListener>();
    }
}

