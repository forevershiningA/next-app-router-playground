package pl.pkapusta.engine;

import haxe.io.Bytes;
import pl.pkapusta.engine.view.container3d.controllers.modes.*;
import pl.pkapusta.engine.view.data.BaseEncoderOptions;
import pl.pkapusta.engine.view.data.RenderToImageParams;
import openfl.display.BitmapData;

/**
 * Main 3D View interface and camera control for Engine 3D. Rendering a scene to an image.
 * 
 * @author Przemysław Kapusta
 */
interface IEngine3DView
{
    
    
    var width(get, set) : Float;    
    
    var height(get, set) : Float;    
    
    var x(get, set) : Float;    
    
    var y(get, set) : Float;    
    
    var visible(get, set) : Bool;    
    
    var isRendering(get, never) : Bool;    
    
	/**
	 * An object specifying the current camera
	 */
    var camera(get, never) : IAbstractCamera;

	/**
	 * Stops rendering. The app will stop refreshing the 3d view.
	 */
    function renderStop() : Void
    ;
	
	/**
	 * Resumes rendering
	 */
    function renderResume() : Void
    ;
    
	/**
	 * Renders the scene to the image
	 * 
	 * @param	encoder	An object specifying how to encode the image.
	 * Possible codecs:
	 * - JPEG: see Engine3D.utils.JPEGEncoderOptions (pl.pkapusta.engine.view.data.JPEGEncoderOptions)
	 * - PNG: see Engine3D.utils.PNGEncoderOptions (pl.pkapusta.engine.view.data.PNGEncoderOptions)
	 * 
	 * @param	params	Rendering parameters, i.e. camera, height and width
	 * @param	output	Possible values: Uint8Array, Base64String, Bytes; see Engine3D.enums.IOFormat (pl.pkapusta.engine.common.enums.IOFormat)
	 * @return	Rendering result in selected format
	 */
    function renderToImage(encoder: BaseEncoderOptions, params: RenderToImageParams = null, output: String = "Uint8Array") : Dynamic
    ;
	
}

