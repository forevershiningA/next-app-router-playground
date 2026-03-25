package pl.pkapusta.engine.common.mvc;

import openfl.errors.Error;
import openfl.events.EventDispatcher;

/**
	 * Abstract Model class for MVC pattern
	 * @author Przemysław Kapusta; Realis | Interactive & Multimedia Agency (realis.pl)
	 */
class AbstractModel extends EventDispatcher implements IModel
{
    public var viewCount(get, never) : Int;

    
    public static function getBlankModel() : IModel
    {
        return new AbstractModel();
    }
    
    private var views : Map<IView, Bool>;
    
    private var _viewCount : Int = 0;
    
    
    public function new()
    {
        super();
        views = new Map<IView, Bool>();
    }
    
    
    
    /* INTERFACE pl.hypermedia.projects.source.dawnTrader.common.mvc.IModel */
    
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
        return (views.exists(view));
    }
    
    public function destroy() : Void
    {
        if (_viewCount != 0)
        {
            throw new Error("Can't destroy because views are connected now. Please disconnect all views or use function destroyWithAllViews to destroy all MVC views too.");
        }
        views = null;
    }
    
    public function destroyWithAllViews() : Void
    {
        for (view in views.keys())
        {
            view.destroy();
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
    
    
    
    /* GETTERS */
    
    private function get_viewCount() : Int
    {
        return _viewCount;
    }
}

