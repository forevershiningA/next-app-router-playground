package pl.pkapusta.engine.swc;

import away3d.core.pick.PickingColliderType;
import away3d.materials.lightpickers.StaticLightPicker;
import pl.pkapusta.engine.common.formats.font.FontLoader;
import pl.pkapusta.engine.common.utils.values.TextureValue;
import pl.pkapusta.engine.Engine3D;
import pl.pkapusta.engine.events.Engine3DModelEvent;
import pl.pkapusta.engine.model.events.Model3DEvent;
import pl.pkapusta.engine.utils.Model3DEditUtility;
import openfl.display.Sprite;

/**
	 * @author Przemysław Kapusta
	 */
class SWCMain extends Sprite
{
    
    private var engine : Engine3D;
    
    private var engine3dModelEvent : Engine3DModelEvent;
    private var model3DEvent : Model3DEvent;
    
    private var textureValue : TextureValue;
    
    private var pickingColliderType : PickingColliderType;
    
    private var model3dEditUtility : Model3DEditUtility;
    
    private var c1 : FontLoader;
    
    private var l1 : StaticLightPicker;

    public function new()
    {
        super();
    }
}

