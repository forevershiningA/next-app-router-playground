package pl.pkapusta.engine.model.properties.values.interfaces;

import pl.pkapusta.engine.common.formats.font.MFont;
import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;

/**
	 * @author Przemysław Kapusta
	 */
interface IMFontValue extends ICompositeValue extends IEmbeddable extends IUniqueIdHolder extends IExtraDataHolder
{
    
    var font(get, never) : MFont;

}

