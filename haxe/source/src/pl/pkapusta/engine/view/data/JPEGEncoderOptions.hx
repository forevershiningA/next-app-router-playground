package pl.pkapusta.engine.view.data;

import openfl.utils.Object;

/**
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.utils.JPEGEncoderOptions")
@:final
class JPEGEncoderOptions implements BaseEncoderOptions {

	/**
		A value between 1 and 100, where 1 means the lowest quality and 100 means the
		highest quality. The higher the value, the larger the size of the output of the
		compression, and the smaller the compression ratio.
	*/
	public var quality:Int;

	/**
		Creates a JPEGEncoderOptions object with the specified setting.

		@param	quality	The initial quality value.
	*/
	public function new(quality:Int = 80) {
		this.quality = quality;
	}
	
	@:dox(hide)
	public function _getInternal():Object {
		return new openfl.display.JPEGEncoderOptions(quality);
	}
	
}