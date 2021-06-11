/**
 * Utils
 */

const HTTP_CODES = {
	success : 200,
	badrRequest : 400,
	unauthorized:401
}

function makeCall(httpMethod, url, data, callBack) {
	var req = new XMLHttpRequest(); 
	req.onreadystatechange = function() {
		callBack(req)
	}
    req.open(httpMethod, url)

	if (data == null)
		req.send();
	else
		req.send(new FormData(data));
}