package pl.pkapusta.engine.utils;

import haxe.Constraints.Function;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.model.exceptions.ModelIsNotReadyException;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.regions.IRegion;
import pl.pkapusta.engine.model.utils.Model3DCloner;
import pl.pkapusta.engine.utils.exceptions.Model3DCantReplaceException;
import pl.pkapusta.engine.utils.exceptions.Model3DDuplicatingDisabledException;
import pl.pkapusta.engine.utils.exceptions.Model3DErasingDisabledException;
import pl.pkapusta.engine.utils.exceptions.Model3DHaventOnSceneException;
import openfl.events.Event;

/**
 * Auxiliary tools for managing Model3d objects.
 * 
 * @author Przemysław Kapusta
 */
@:keep
@:expose("Engine3D.Model3DEditUtility")
class Model3DEditUtility
{
    
	/**
	 * Operation execution fault
	 */
    public static var CODE_FAULT : Int = -1;
	
	/**
	 * Operation execution fully success
	 */
    public static inline var CODE_SUCCESS : Int = 0;
	
	/**
	 * Operation execution success but some childs can't be erased
	 */
    public static inline var CODE_CANT_ERASE_CHILDS : Int = 1;
	
	/**
	 * Operation execution success but some childs can't be mounted because region child limit
	 */
    public static inline var CODE_DUPLICATE_REGION_LIMIT : Int = 2;
	
	/**
	 * Operation execution success but some childs can't be mounted in replacement model3d
	 */
    public static inline var CODE_CANT_REPLACE_WITH_ALL_CHILDS : Int = 3;
    
	/**
	 * Returns whether 3d model duplication is enabled
	 * @param	model	model3d instance
	 * @return	true or false
	 */
    public static function duplicateEnabled(model : IModel3D) : Bool
    {
        if (!model.isReady())
        {
            ExceptionManager.Throw(new ModelIsNotReadyException()); return false;
        }
        return model.getEditAttributes().duplicate;
    }
    
	/**
	 * Returns whether 3d model removal is enabled
	 * @param	model	model3d instance
	 * @return	true or false
	 */
    public static function eraseEnabled(model : IModel3D) : Bool
    {
        if (!model.isReady())
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return false;
        }
        return model.getEditAttributes().erase;
    }
    
	/**
	 * Removes the model from the scene while performing additional operations, i.e. inserting children in place of the parent (if possible), checking whether it can be safely removed.
	 * @param	model	model3d instance
	 * @param	tryPlaceChildsOnParent	If true, it tries to put children in place of the parent
	 * @param	forceErase	Forces deletion even if it is not a safe deletion (e.g. if children cannot be replaced by parent)
	 * @return	Execution code: -1: FAULT, 0: SUCCESS, 1: CANT ERACE CHILDS
	 */
    public static function erase(model : IModel3D, tryPlaceChildsOnParent : Bool = true, forceErase : Bool = false) : Int
    {
        if (!model.isReady())
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return CODE_FAULT;
        }
        if (!eraseEnabled(model))
        {
            ExceptionManager.Throw(new Model3DErasingDisabledException());return CODE_FAULT;
        }
        
        var parent : IModel3D = model.getParent();
        if (parent == null)
        {
            ExceptionManager.Throw(new Model3DHaventOnSceneException());return CODE_FAULT;
        }
        var parentRegion : IRegion = model.getParentRegion();
        
        var modelChildsList : Array<IModel3D> = getModelChilds(model);
        
        var modelChildsDictCount : Int = modelChildsList.length;
        var modelChildsDict : Map<IModel3D, Bool> = new Map<IModel3D, Bool>();
        var i : Int = 0;
        while (i < modelChildsList.length)
        {
            modelChildsDict.set(modelChildsList[i], true);
            i++;
        }
        
        var childsToReplace : Array<IModel3D> = new Array<IModel3D>();
        
        var modelChildsRegionDict : Map<IModel3D, Dynamic> = null;
        if (tryPlaceChildsOnParent)
        {
            modelChildsRegionDict = new Map<IModel3D, Dynamic>();
            var j : Int = 0;
            while (j < modelChildsList.length)
            {
                var tryModel : IModel3D = modelChildsList[j];
                if (parent.canAddChild(tryModel, null, false))
                {
                    modelChildsRegionDict.set(tryModel, {
                        region : tryModel.getParentRegion().getId(),
                        autoDisposeContext : tryModel.isAutoDisposeContext()
                    });
                    tryModel.setAutoDisposeContext(false);
                    tryModel.removeFromParent();
                    childsToReplace.push(tryModel);
                    modelChildsDict.remove(tryModel);
                    modelChildsDictCount--;
                }
                j++;
            }
        }
        
        if (modelChildsDictCount > 0 && !forceErase)
        {
            return CODE_CANT_ERASE_CHILDS;
        }
        
        parentRegion.removeChild(model);
        
        if (tryPlaceChildsOnParent)
        {
            var k : Int = 0;
            while (k < childsToReplace.length)
            {
                var replacedModel : IModel3D = childsToReplace[k];
                //var regionId:String = replacedModel.parentRegion.id;
                var regionId : String = modelChildsRegionDict.get(replacedModel).region;
                var mAutoDisposeContext : Bool = modelChildsRegionDict.get(replacedModel).autoDisposeContext;
                if (parent.canAddChild(replacedModel, regionId))
                {
                    parent.addChild(replacedModel, regionId);
                }
                else
                {
                    parent.addChild(replacedModel);
                }
                replacedModel.setAutoDisposeContext(mAutoDisposeContext);
                k++;
            }
        }
        
        return CODE_SUCCESS;
    }
    
	/**
	 * Performs a copy of the 3d model by inserting a new copy in the same region as the original.
	 * @param	model	model3d instance
	 * @param	onComplete	callbacks when complete
	 * @return	Execution code: -1: FAULT, 0: SUCCESS, 2: DUPLICATE REGION LIMIT
	 */
    public static function duplicate(model : IModel3D, onComplete : Function = null) : Int
    {
        if (!model.isReady())
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return CODE_FAULT;
        }
        if (!duplicateEnabled(model))
        {
            ExceptionManager.Throw(new Model3DDuplicatingDisabledException());return CODE_FAULT;
        }
        var parent : IModel3D = model.getParent();
        if (parent == null)
        {
            ExceptionManager.Throw(new Model3DHaventOnSceneException());return CODE_FAULT;
        }
        var parentRegion : IRegion = model.getParentRegion();
        if (!parentRegion.canAddChild(model))
        {
            return CODE_DUPLICATE_REGION_LIMIT;
        }
        var cloner : Model3DCloner = new Model3DCloner();
        cloner.addEventListener(Event.COMPLETE, duplicateCompleteHandler);
        cloner.extra = {
                    onComplete : onComplete
                };
        cloner.clone(model);
        return CODE_SUCCESS;
    }
    
    private static function duplicateCompleteHandler(e : Event) : Void
    {
        var cloner : Model3DCloner = try cast(e.currentTarget, Model3DCloner) catch(e:Dynamic) null;
        var originalModel : IModel3D = cloner.getOriginalModel();
        var clonedModel : IModel3D = cloner.getClonedModel();
        originalModel.getParentRegion().addChild(clonedModel);
        if (cloner.extra != null && cloner.extra.onComplete != null)
        {
            var f : Function = cloner.extra.onComplete;
			Reflect.callMethod(null, f, [clonedModel]);
			
			//#old as3hx.Compat.getFunctionLength > not function error
			/*
            if (as3hx.Compat.getFunctionLength(f) == 0)
            {
                Reflect.callMethod(null, f, []);
            }
            else if (as3hx.Compat.getFunctionLength(f) == 1)
            {
                Reflect.callMethod(null, f, [clonedModel]);
            }
			*/
        }
    }
    
    private static function getModelChilds(model : IModel3D) : Array<IModel3D>
    {
        var modelChildsList : Array<IModel3D> = new Array<IModel3D>();
        var regions : Array<IRegion> = model.getRegionList();
        var i : Int = 0;
        while (i < regions.length)
        {
            var childs : Array<IModel3D> = regions[i].getChildList();
            var j : Int = 0;
            while (j < childs.length)
            {
                modelChildsList.push(childs[j]);
                j++;
            }
            i++;
        }
        return modelChildsList;
    }
    
	/**
	 * It replaces the model with another one that can replace it in the same place, e.g. inscriptions on a board above other inscriptions or a motif. It tries to set the same childs and properties i.e. size and position if the new model supports them.
	 * @param	currentModel	current model3d instance
	 * @param	newModel		new model3d instance
	 * @param	forceReplace	forces replacement even if inconsistencies are detected between one model and another
	 * @param	cloneProperties	if true, it also clones the properties
	 * @return	Execution code: -1: FAULT, 0: SUCCESS, 3: CANT REPLACE WITH ALL CHILDS
	 */
    public static function replace(currentModel : IModel3D, newModel : IModel3D, forceReplace : Bool = false, cloneProperties : Bool = false) : Int
    /**
			 * TODO: Usprawnić!
			 */
    {
        
        if (!currentModel.isReady())
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return CODE_FAULT;
        }
        if (!newModel.isReady())
        {
            ExceptionManager.Throw(new ModelIsNotReadyException());return CODE_FAULT;
        }
        
        var parent : IModel3D = currentModel.getParent();
        if (parent == null)
        {
            ExceptionManager.Throw(new Model3DHaventOnSceneException());return CODE_FAULT;
        }
        var parentRegion : IRegion = currentModel.getParentRegion();
        if (!parentRegion.canAddChild(newModel, false))
        {
            ExceptionManager.Throw(new Model3DCantReplaceException());return CODE_FAULT;
        }
        
        var modelChildsList : Array<IModel3D> = getModelChilds(currentModel);
        var modelChildsDictCount : Int = modelChildsList.length;
        var modelChildsDict : Map<IModel3D, Bool> = new Map<IModel3D, Bool>();
        var i : Int = 0;
        while (i < modelChildsList.length)
        {
            modelChildsDict.set(modelChildsList[i], true);
            i++;
        }
        
        var childsToReplace : Array<IModel3D> = new Array<IModel3D>();
        
        var modelChildsRegionDict : Map<IModel3D, Dynamic> = new Map<IModel3D, Dynamic>();
        var j : Int = 0;
        while (j < modelChildsList.length)
        {
            var tryModel : IModel3D = modelChildsList[j];
            if (newModel.canAddChild(tryModel, null))
            {
                modelChildsRegionDict.set(tryModel, {
                    region : tryModel.getParentRegion().getId(),
                    autoDisposeContext : tryModel.isAutoDisposeContext()
                });
                tryModel.setAutoDisposeContext(false);
                tryModel.removeFromParent();
                childsToReplace.push(tryModel);
                modelChildsDict.remove(tryModel);
                modelChildsDictCount--;
            }
            j++;
        }
        
        if (modelChildsDictCount > 0 && !forceReplace)
        {
            return CODE_CANT_REPLACE_WITH_ALL_CHILDS;
        }
        
        parentRegion.removeChild(currentModel);
        parentRegion.addChild(newModel);
        
        var k : Int = 0;
        while (k < childsToReplace.length)
        {
            var replacedModel : IModel3D = childsToReplace[k];
            //var regionId:String = replacedModel.parentRegion.id;
            var regionId : String = modelChildsRegionDict.get(replacedModel).region;
            var mAutoDisposeContext : Bool = modelChildsRegionDict.get(replacedModel).autoDisposeContext;
            if (newModel.canAddChild(replacedModel, regionId))
            {
                newModel.addChild(replacedModel, regionId);
            }
            else
            {
                newModel.addChild(replacedModel);
            }
            replacedModel.setAutoDisposeContext(mAutoDisposeContext);
            k++;
        }
        
        if (cloneProperties)
        {
            doCloneProperties(currentModel, newModel);
        }
        
        return CODE_SUCCESS;
    }
    
    private static function doCloneProperties(from : IModel3D, to : IModel3D) : Void {
		for (property in from.getProperties()) {
			to.changeProperty(property.id, from.getProperty(property.id));
		}
    }
	
}

