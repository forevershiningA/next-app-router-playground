package pl.pkapusta.engine.project.data;

import pl.pkapusta.engine.view.data.BaseEncoderOptions;
import pl.pkapusta.engine.view.data.PNGEncoderOptions;

/**
 * An object used to define the parameters of the saved scene.
 * 
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.project.ProjectSaveCustomizator")
class ProjectSaveCustomizator {
    
	/**
	 * Is it to take screenshots and save in the project
	 */
	public var buildScreens: Bool;
	
	/**
	 * In the case of taking screenshots, this parameter defines in which codec to save the screenshots.
	 * 
	 * @see Engine3D.utils.JPEGEncoderOptions (pl.pkapusta.engine.view.data.JPEGEncoderOptions)
	 * @see Engine3D.utils.PNGEncoderOptions (pl.pkapusta.engine.view.data.PNGEncoderOptions)
	 */
	public var imageEncoder: BaseEncoderOptions;
    
	/**
	 * Creates an object that describes the save options for the project
	 * @param	buildScreens	Is it to take screenshots and save in the project
	 * @param	imageEncoder	In the case of taking screenshots, this parameter defines in which codec to save the screenshots.
	 * 
	 * @see Engine3D.utils.JPEGEncoderOptions (pl.pkapusta.engine.view.data.JPEGEncoderOptions)
	 * @see Engine3D.utils.PNGEncoderOptions (pl.pkapusta.engine.view.data.PNGEncoderOptions)
	 */
    public function new(buildScreens: Bool = false, imageEncoder: BaseEncoderOptions = null) {
		this.buildScreens = buildScreens;
        this.imageEncoder = imageEncoder;
		if (this.imageEncoder == null) {
			this.imageEncoder = new PNGEncoderOptions();
		}
    }
	
}

