package pl.pkapusta.engine.model.controllers;

import away3d.containers.ObjectContainer3D;
import away3d.events.MouseEvent3D;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.model.events.Model3DEvent;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.*;
import pl.pkapusta.engine.project.Project3D;
import pl.pkapusta.engine.utils.mouse.MouseUtil;
import openfl.display.Stage;
import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DMouseController implements IDisposable
{
    
    private var container : ObjectContainer3D;
    private var model : Model3D;
    
    private var stage : Stage;
    
    private var _mouseOver : Bool = false;
    private var _currentClicked : Bool = false;
    private var _currentMouseDown : Bool = false;
    
    public function new(model : Model3D)
    {
        this.model = model;
        model.addEventListener(Model3DEvent.ADDED_TO_PROJECT, modelAddedToProject);
        model.addEventListener(Model3DEvent.REMOVED_FROM_PROJECT, modelRemovedFromProject);
    }
    
    public function registerContainer(container : ObjectContainer3D) : Void
    {
        unregisterContainer();
        this.container = container;
        container.addEventListener(MouseEvent3D.CLICK, model3DMouseClickHandler);
        container.addEventListener(MouseEvent3D.MOUSE_DOWN, model3DMouseDownHandler);
        container.addEventListener(MouseEvent3D.MOUSE_OVER, model3DMouseOverHandler);
        container.addEventListener(MouseEvent3D.MOUSE_OUT, model3DMouseOutHandler);
    }
    
    private function unregisterContainer() : Void
    {
        if (container != null)
        {
            container.removeEventListener(MouseEvent3D.CLICK, model3DMouseClickHandler);
            container.removeEventListener(MouseEvent3D.MOUSE_DOWN, model3DMouseDownHandler);
            container.removeEventListener(MouseEvent3D.MOUSE_OVER, model3DMouseOverHandler);
            container.removeEventListener(MouseEvent3D.MOUSE_OUT, model3DMouseOutHandler);
        }
    }
    
    private function modelAddedToProject(e : Model3DEvent) : Void
    {
        stage = cast((model.getProject()), Project3D).model.stage;
    }
    
    private function modelRemovedFromProject(e : Model3DEvent) : Void
    {
        if (stage != null)
        {
            stage = null;
        }
    }
    
    private function model3DMouseDownHandler(e : MouseEvent3D) : Void
    {
        if (!_currentMouseDown && !checkChildCurrentMouseDown())
        {
            _currentMouseDown = true;
            if (model.isSelected())
            {
                if (model.getParentRegion() != null)
                {
                    cast((model.getParentRegion()), AbstractRegion).notifySelectedMouseDown(e, model);
                }
            }
            as3hx.Compat.setTimeout(function()
                    {
                        _currentMouseDown = false;
                    }, 0);
        }
    }
    private function checkChildCurrentMouseDown() : Bool
    {
        var regions : Array<IRegion> = model.getRegionList();
        var i : Int = 0;
        while (i < regions.length)
        {
            var childs : Array<IModel3D> = regions[i].getChildList();
            var j : Int = 0;
            while (j < childs.length)
            {
                if (cast((childs[j]), Model3D).mouseController._currentMouseDown == true)
                {
                    return true;
                }
                if (cast((childs[j]), Model3D).mouseController.checkChildCurrentMouseDown())
                {
                    return true;
                }
                j++;
            }
            i++;
        }
        return false;
    }
    
    private function model3DMouseClickHandler(e : MouseEvent3D) : Void
    {
        if (!_currentClicked && !checkChildCurrentClicked())
        {
            _currentClicked = true;
            as3hx.Compat.setTimeout(function()
                    {
                        _currentClicked = false;
                    }, 0);
            if (model.getProject() != null)
            {
                cast((model.getProject()), Project3D).handleModelClick(model);
            }
            if (model.isSelected())
            {  //trace("isSelected!");  
                
            }
            else
            {
                if (MouseUtil.checkForMouseDragged())
                {
                    return;
                }
                if (model.getProject() != null)
                {
                    cast((model.getProject()), Project3D).handleSelectModel(model);
                }
            }
        }
    }
    private function checkChildCurrentClicked() : Bool
    {
        var regions : Array<IRegion> = model.getRegionList();
        var i : Int = 0;
        while (i < regions.length)
        {
            var childs : Array<IModel3D> = regions[i].getChildList();
            var j : Int = 0;
            while (j < childs.length)
            {
                if (cast((childs[j]), Model3D).mouseController._currentClicked == true)
                {
                    return true;
                }
                if (cast((childs[j]), Model3D).mouseController.checkChildCurrentClicked())
                {
                    return true;
                }
                j++;
            }
            i++;
        }
        return false;
    }
    
    private function model3DMouseOverHandler(e : MouseEvent3D) : Void
    {
        if (!_mouseOver && !checkChildMouseOver(true))
        {
            _mouseOver = true;
            model.dispatchEvent(new Event(Model3D.EVENT_INTERNAL_MOUSE_OVER));
        }
    }
    
    private function model3DMouseOutHandler(e : MouseEvent3D) : Void
    {
        if (_mouseOver)
        {
            _mouseOver = false;
            model.dispatchEvent(new Event(Model3D.EVENT_INTERNAL_MOUSE_OUT));
        }
    }
    
    private function checkChildMouseOver(value : Bool) : Bool
    {
        var regions : Array<IRegion> = model.getRegionList();
        var i : Int = 0;
        while (i < regions.length)
        {
            var childs : Array<IModel3D> = regions[i].getChildList();
            var j : Int = 0;
            while (j < childs.length)
            {
                if (cast((childs[j]), Model3D).mouseController._mouseOver == value)
                {
                    return true;
                }
                if (cast((childs[j]), Model3D).mouseController.checkChildMouseOver(value))
                {
                    return true;
                }
                j++;
            }
            i++;
        }
        return false;
    }
    
    public function dispose() : Void
    {
        unregisterContainer();
        model.removeEventListener(Model3DEvent.ADDED_TO_PROJECT, modelAddedToProject);
        model.removeEventListener(Model3DEvent.REMOVED_FROM_PROJECT, modelRemovedFromProject);
        model = null;
        container = null;
    }
}

