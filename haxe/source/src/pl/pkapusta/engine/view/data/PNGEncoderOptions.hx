package pl.pkapusta.engine.view.data;

import openfl.utils.Object;

/**
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.utils.PNGEncoderOptions")
@:final
class PNGEncoderOptions implements BaseEncoderOptions {
	
	/**
		Chooses compression speed over file size. Setting this property to true improves
		compression speed but creates larger files.
	*/
	public var fastCompression:Bool;

	/**
		Creates a PNGEncoderOptions object, optionally specifying compression settings.

		@param	fastCompression	The initial compression mode.
	*/
	public function new(fastCompression:Bool = false) {
		this.fastCompression = fastCompression;
	}
	
	@:dox(hide)
	public function _getInternal():Object {
		return new openfl.display.PNGEncoderOptions(fastCompression);
	}
	
}