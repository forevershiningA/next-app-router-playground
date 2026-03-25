package pl.pkapusta.engine.common.mvc;

import openfl.errors.Error;
import openfl.events.EventDispatcher;

/**
	 * Abstract Controller class for MVC pattern
	 * @author Przemysław Kapusta; Realis | Interactive & Multimedia Agency (realis.pl)
	 */
class AbstractController extends EventDispatcher implements IController
{
    private var model : IModel;
    
    private var views : Map<IView, Bool>;
    
    private var _viewCount : Int = 0;
    
    public function new(model : IModel)
    {
        super();
        if (model == null)
        {
            throw new Error("You must define model in constructor");
        }
        this.model = model;
        registerModelListeners(this.model);
        views = new Map<IView, Bool>();
    }
    
    /* INTERFACE pl.hypermedia.projects.source.dawnTrader.common.mvc.IController */
    
    public function registerView(view : IView) : Void
    {
        if (views.exists(view))
        {
            throw new Error("This view was registered earlier");
        }
        registerViewListeners(view);
		views.set(view, true);
        _viewCount++;
    }
    
    public function unregisterView(view : IView) : Void
    {
        if (!views.exists(view))
        {
            throw new Error("This view wasn't registered in this model");
        }
        views.remove(view);
        _viewCount--;
        unregisterViewListeners(view);
    }
    
    public function hasRegisteredView(view : IView) : Bool
    {
        return views.exists(view);
    }
    
    public function setModel(model : IModel) : Void
    {
        unregisterModelListeners(this.model);
        this.model = model;
        registerModelListeners(this.model);
    }
    
    public function getModel() : IModel
    {
        return model;
    }
    
    public function destroy() : Void
    {
        if (_viewCount != 0)
        {
            throw new Error("Can't destroy because views are connected now. Please disconnect all views or use function destroyAllMvc to destroy all MVC objects.");
        }
        unregisterModelListeners(model);
        model = null;
        views = null;
    }
    
    public function destroyAllMvc(withModel : Bool = true) : Void
    {
        for (view in views.keys())
        {
            view.destroy();
        }
        if (withModel)
        {
            model.destroyWithAllViews();
        }
        destroy();
    }
    
    
    /* PROTECTED function to override */
    
    private function registerViewListeners(view : IView) : Void
    {
    }
    private function unregisterViewListeners(view : IView) : Void
    {
    }
    
    private function registerModelListeners(model : IModel) : Void
    {
    }
    private function unregisterModelListeners(model : IModel) : Void
    {
    }
}

