<?php
    use desktopd\SHA3\Sponge as SHA3;
    require __DIR__ . '/sha3/namespaced/desktopd/SHA3/Sponge.php';
	
	/* Function, that generates salt.
	   @param int $length - Salt length.
		
	   @return string.
	*/
	function generateSalt($length) {
		
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		
		$charactersLength = strlen($characters);
		$randomString = '';
		
		for ($i = 0; $i < $length;$i++) 
			$randomString .= $characters[rand(0, $charactersLength - 1)];
		
		return $randomString;
	}

	/* Function, that generates hash.
	   @param int $value - Value to hash.
		
	   @return string.
	*/
	function generateHash($value) {
		
		$sponge = SHA3::init (SHA3::SHA3_512);
		$sponge->absorb($value);
		return bin2hex ($sponge->squeeze ());
	}
?>