/* Generate a hash.
   @constructor  
   @param {string} value - String to hash.
  
   @return {string}. 
*/
function generateHash(value) {	
	
	return sha3_512(value);
}