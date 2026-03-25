package pl.pkapusta.engine.view.data;

import away3d.cameras.Camera3D;

/**
 * An object that defines the parameters of the scene to be drawn on the saved image.
 * 
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.utils.RenderToImageParams")
@:final
class RenderToImageParams
{
    
    public var camera : Camera3D;
    public var width : Int;
    public var height : Int;
    
    public function new(camera : Camera3D = null, width : Int = -1, height : Int = -1)
    {
        this.camera = camera;
        this.width = width;
        this.height = height;
    }
}

