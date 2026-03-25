package tempus.table_elements.motif_container;


class HSL
{
    
    public var h : Float;
    public var s : Float;
    public var l : Float;
    
    public function new(h : Float, s : Float, l : Float)
    {
        this.h = h;
        this.s = s;
        this.l = l;
    }
    
    public static function generateColorFromHex(color : Int) : HSL
    {
        var r : Float = as3hx.Compat.parseInt(color >> 16) & 0xFF;
        var g : Float = as3hx.Compat.parseInt(color >> 8) & 0xFF;
        var b : Float = color & 0xFF;
        
        r /= 255;g /= 255;b /= 255;
        var max : Float = Math.max(Math.max(r, g), b);
        var min : Float = Math.min(Math.min(r, g), b);
        var h : Float;
        var s : Float;
        var l : Float;
        
        h = s = l = (max + min) / 2;
        
        if (max == min)
        {
            h = s = 0;
        }
        else
        {
            var d : Float = max - min;
            s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);
            switch (max)
            {
                case r:
                    h = (g - b) / d + ((g < b) ? 6 : 0);
                case g:
                    h = (b - r) / d + 2;
                case b:
                    h = (r - g) / d + 4;
            }
            h /= 6;
        }
        
        h *= Math.PI * 2;
        
        return new HSL(h, s, l);
    }
    
    public static function generateColorFromHSL(hue : Float, saturation : Float, lightness : Float) : Int
    {
        hue /= 360;
        saturation /= 100;
        lightness /= 100;
        
        var r : Float;
        var g : Float;
        var b : Float;
        
        if (saturation == 0)
        {
            r = g = b = lightness;
        }
        else
        {
            function hue2rgb(p : Float, q : Float, t : Float) : Float
            {
                if (t < 0)
                {
                    t += 1;
                }
                if (t > 1)
                {
                    t -= 1;
                }
                if (t < 1 / 6)
                {
                    return p + (q - p) * 6 * t;
                }
                if (t < 1 / 2)
                {
                    return q;
                }
                if (t < 2 / 3)
                {
                    return p + (q - p) * (2 / 3 - t) * 6;
                }
                
                return p;
            };
            
            var q : Float = (lightness < 0.5) ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
            var p : Float = 2 * lightness - q;
            r = hue2rgb(p, q, hue + 1 / 3);
            g = hue2rgb(p, q, hue);
            b = hue2rgb(p, q, hue - 1 / 3);
        }
        
        r = Math.floor(r * 255);
        g = Math.floor(g * 255);
        b = Math.floor(b * 255);
        
        return as3hx.Compat.parseInt(r << 16 ^ g << 8 ^ b);
    }
}
