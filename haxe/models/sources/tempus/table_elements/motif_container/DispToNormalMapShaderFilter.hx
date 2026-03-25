package tempus.table_elements.motif_container;

import flash.display.Shader;
import flash.filters.ShaderFilter;
import flash.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class DispToNormalMapShaderFilter extends ShaderFilter
{
    public var amplitude(get, set) : Float;

    
    public function new(filterData : ByteArray)
    {
        super(new Shader(filterData));
    }
    
    private function get_amplitude() : Float
    {
        return shader.data.amplitude[0];
    }
    
    private function set_amplitude(value : Float) : Float
    {
        shader.data.amplitude = [value];
        return value;
    }
}

