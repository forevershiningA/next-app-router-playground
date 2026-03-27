import {Data} from './Data.js';

const TO_FRACTION_64 = 0.015625;
const TO_FRACTION_16 = 0.0625;
const MM_TO_INCH = 25.4;
const INCH_TO_FEET = 12;

export class Metrics extends Data {
	constructor(data = {}) {
        super(data);
    }

    getMMtoInch() {
        return MM_TO_INCH;
    }

    simplifyFraction(numerator, _denominator, sup) {
        var denominator = _denominator || 16
        // if there is no denominator then there is no fraction

        if (numerator < 1) {
            return ''
        }
        // fraction can't be broken further down:
        if (
            // a) if numerator is 1
            numerator === 1 ||
            // b) if numerator is prime number
            !((numerator % 2 === 0) || Math.sqrt(numerator) % 1 === 0)
        ) {
            if (sup) {
                return numerator + '&frasl;' + denominator;
            } else {
                return '<sup>' + numerator + '</sup>' + '&frasl;' + '<sub>' + denominator + '</sub>';
            }
        }

        var newNumerator = numerator / 2;
        var newDenominator = denominator / 2;

        return this.simplifyFraction(newNumerator, newDenominator, sup)
    }

    toInchPlain(_input, sup) {

        var rawInches = Number(_input) / MM_TO_INCH
        return Number(rawInches.toFixed(2));

    }

    toInch(_input, sup) {
        var rawInches = Number(_input) / MM_TO_INCH;

        // integers
        var integers = Math.floor(rawInches)
        // limit to 6 decimals to avoid conflicts
        var decimals = Number((rawInches % 1).toFixed(6))
        // fractionize for denominator 64
        var fraction64 = Math.round(decimals / TO_FRACTION_16)

        var simplifiedFraction = this.simplifyFraction(fraction64, 0, sup)

        //if (decimals < 0.025) {
        //    decimals = 0;
        //    fraction64 = Math.round(decimals / TO_FRACTION_16)
        //}

        if (sup != true) {

            if (simplifiedFraction == '1&frasl;1') {
                //simplifiedFraction = '<span style="color:#ffffff"><sup>1</sup>&frasl;<sub>1</sub></span>';
                simplifiedFraction = '1';
            }

            if (simplifiedFraction == '<sup>1</sup>&frasl;<sub>1</sub>') {
                //simplifiedFraction = '<span style="color:#ffffff"><sup>1</sup>&frasl;<sub>1</sub></span>';
                simplifiedFraction = '';
            }

            if (simplifiedFraction == '') {
                //simplifiedFraction = '<span style="color:#ffffff"><sup>1</sup>&frasl;<sub>1</sub></span>';
                simplifiedFraction = '';
            }

        } 

        if (sup) {
            if (simplifiedFraction == '1&frasl;1') {
                simplifiedFraction = '';
            }
        }

        let integer = integers;
        if (decimals == 1) {
            integer = integers + decimals;
        }

        var result = [integer, simplifiedFraction]

        var output = result.filter(function (r) { return r }).join(' ');

        if (output.indexOf('″ ') == -1) {
            output += '″ ';
        }

        return output;
    }
    
    toMM(_input) {
        // should take numbers or strings
        var stringifiedInput = _input + '';
        var fragments = stringifiedInput.split(' ');
        var inchesAndDecimals = fragments.map(function (fragment) {
          var broken = fragment.split('/')
            if (broken.length === 2) {
                // Strip the leading 0
                var decimals = (Number(broken[0]) / Number(broken[1])).toFixed(6)
                return decimals.slice(1)
            }
            return Number(broken[0])
        }).join('');

        // convert to mm
        var mm = Number(inchesAndDecimals) * MM_TO_INCH

        if (mm % MM_TO_INCH === 0) {
            return (Math.round(mm * 10) / 10) + ''
        }
        return mm  + ''
    }
    
    toFeet () {
        // parse to MM
        var mm = toMM();
        var inches = Math.round(mm / MM_TO_INCH);
        var feet = Math.floor(inches / INCH_TO_FEET);
        var stringFeet = feet + ' ft';
        var residualInches = Math.round(inches % INCH_TO_FEET);
        var stringInches = residualInches === 0 ? '' :
        ' ' + residualInches + ' in'

        if (!feet) {
            return stringFeet + ' ' + toInch(inches || 1) + ' in'
        }
        return stringFeet + stringInches
    }

    convertToInches(input) {
        return Number(Math.round(input / MM_TO_INCH) * MM_TO_INCH);
    }

}