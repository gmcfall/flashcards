
// We have replaced '/' characters with '_' since it results in uid values that are valid
// firestore path elements
const _Rixits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+_";


// This cannot handle negative numbers and only works on the 
//     integer part, discarding the fractional part.
// Doing better means deciding on whether you're just representing
// the subset of javascript numbers of twos-complement 32-bit integers 
// or going with base-64 representations for the bit pattern of the
// underlying IEEE floating-point number, or representing the mantissae
// and exponents separately, or some other possibility. For now, bail
export function base64FromNumber(number: number) {
  var rixit; // like 'digit', only in some non-decimal radix 
  var residual = Math.floor(number);
  var result = '';
  while (true) {
      rixit = residual % 64
      result = _Rixits.charAt(rixit) + result;
      residual = Math.floor(residual / 64);

      if (residual === 0)
          break;
      }
  return result;
}

