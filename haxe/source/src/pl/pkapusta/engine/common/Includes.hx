package pl.pkapusta.engine.common;

import away3d.core.pick.PickingColliderType;
import pl.pkapusta.engine.common.utils.loaders.BitmapLoader;
import pl.pkapusta.engine.common.utils.loaders.DisplayObjectLoader;
import pl.pkapusta.engine.model.ModelInfoType;
import pl.pkapusta.engine.model.properties.values.ATFTextureValue;
import pl.pkapusta.engine.model.properties.values.BitmapTextureValue;
import pl.pkapusta.engine.model.properties.values.ByteArrayValue;
import pl.pkapusta.engine.model.properties.values.DisplayObjectValue;
import pl.pkapusta.engine.project.data.triggers.BaseUrlLoadTrigger;
import pl.pkapusta.engine.utils.Model3DEditUtility;
import pl.pkapusta.engine.utils.texture.TextureDimensionUtil;
import pl.pkapusta.engine.view.data.JPEGEncoderOptions;
import pl.pkapusta.engine.view.data.PNGEncoderOptions;

/**
 * @author Przemysław Kapusta
 */
class Includes
{
    
    private var modelInfoType : ModelInfoType;
	private var model3DEditUtility : Model3DEditUtility;
    
    //utils
    private var textureDimensionUtil : TextureDimensionUtil;
    
    //property values
    private var atfTextureValue : ATFTextureValue;
    private var bitmapTextureValue : BitmapTextureValue;
    private var byteArrayValue : ByteArrayValue;
    private var displayObjectValue : DisplayObjectValue;
    
    //base triggers
    private var baseUrlLoadTrigger : BaseUrlLoadTrigger;
    
    //picking collider
    private var pc : PickingColliderType;
	
	//utils
	private var bitmapLoader:BitmapLoader;
	private var displayObjectLoader:DisplayObjectLoader;
	private var jpegEncoderOptions:JPEGEncoderOptions;
	private var pngEncoderOptions:PNGEncoderOptions;

    public function new()
    {
    }
}

