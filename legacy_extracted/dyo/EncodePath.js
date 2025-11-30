const MAX_CHAR2 = 204.7;
const BASE_64 = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','+','/'];

export class EncodePath {
	
    constructor(...args) {
        this._x = 0;
        this._y = 0;
        this.code = '';
    }

	encodeMethod(methodInt, numChars) {
		return BASE_64[(methodInt<<3) | ((numChars===3?1:0)<<2)];
	}
	
	encodeNum2(num) {
		const val = Math.round(Math.abs(num)*10) | ((num>=0?0:1)<<11);
		return BASE_64[val>>6] + BASE_64[val & 63];
	}
	
	encodeNum3(num) {
		const val = Math.round(Math.abs(num)*10) | ((num>=0?0:1)<<17);
		return BASE_64[(val>>12)&63] + BASE_64[(val>>6)&63] + BASE_64[val & 63];
	}
	
	moveTo(x, y) {
		
		if (Math.abs(x)<=MAX_CHAR2 && Math.abs(y)<=MAX_CHAR2){
			this.code += this.encodeMethod(0, 2) + this.encodeNum2(x) + this.encodeNum2(y);
		} else {
			this.code += this.encodeMethod(0, 3) + this.encodeNum3(x) + this.encodeNum3(y);
		}
		
		this._x = x;
		this._y = y;
		
		return this;
	}
	
	lineTo(x, y) {
        let numChars;
        let encodeNum;

        if (Math.abs(x-this._x)<=MAX_CHAR2 && Math.abs(y-this._y)<=MAX_CHAR2)
		{
           numChars = 2;
			encodeNum = this.encodeNum2;
		}else {
			numChars = 3;
			encodeNum = this.encodeNum3;
		}

        this.code += this.encodeMethod(1, numChars) + encodeNum(x-this._x) + encodeNum(y-this._y);

        this._x = x;
        this._y = y;

        return this;
    };
		
	quadraticCurveTo(x1, y1, x2, y2) {
        let numChars;
        let encodeNum;

        if (Math.abs(x1-this._x)<=MAX_CHAR2 && Math.abs(y1-this._y)<=MAX_CHAR2 &&
			 Math.abs(x2-x1)<=MAX_CHAR2 && Math.abs(y2-y1)<=MAX_CHAR2)
		{
			numChars = 2;
			encodeNum = this.encodeNum2;
		}else {
			numChars = 3;
			encodeNum = this.encodeNum3;
		}

        this.code += this.encodeMethod(2, numChars) + encodeNum(x1-this._x) + encodeNum(y1-this._y) +
                     encodeNum(x2-x1) + encodeNum(y2-y1);

        this._x = x2;
        this._y = y2;

        return this;
    }
		
	bezierCurveTo(x1, y1, x2, y2, x3, y3) {
        let numChars;
        let encodeNum;

        if(Math.abs(x1-this._x)<=MAX_CHAR2 && Math.abs(y1-this._y)<=MAX_CHAR2 &&
			Math.abs(x2-x1)<=MAX_CHAR2 && Math.abs(y2-y1)<=MAX_CHAR2 &&
			Math.abs(x3-x2)<=MAX_CHAR2 && Math.abs(y3-y2)<=MAX_CHAR2)
		{
			numChars = 2;
			encodeNum = encodeNum2;
		}else {
			numChars = 3;
			encodeNum = encodeNum3;
		}

        this.code += this.encodeMethod(3, numChars) + encodeNum(x1-this._x) + encodeNum(y1-this._y) +
                     encodeNum(x2-x1) + encodeNum(y2-y1) +
                     encodeNum(x3-x2) + encodeNum(y3-y2);

        this._x = x3;
        this._y = y3;

        return this;
    }
	
	clear() {
		this.code = '';
		this._x = this._y = 0;
		return this;
	}
    
}