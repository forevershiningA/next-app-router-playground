package pl.pkapusta.engine.model.properties.values.interfaces;

import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.values.interfaces.ITextureValue")
interface ITextureValue extends IMaterialValue extends IEmbeddable extends IUniqueIdHolder extends IExtraDataHolder
{
    
    var surfaceCoatingScale(get, never) : Float;    
    var textureType(get, never) : String;

}

