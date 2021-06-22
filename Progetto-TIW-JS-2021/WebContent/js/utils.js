/**
 * Utils
 */

const HTTP_CODES = {
	success			: 200,
	badrRequest		: 400,
	unauthorized	: 401
}

const ENTER_KEY_CODE = 13;

const SESSIONE_NOME_UTENTE = "utente";

function makeCall(httpMethod, url, data, callBack) {
	var req = new XMLHttpRequest(); 
	req.onreadystatechange = function() {
		callBack(req);
	};
	req.open(httpMethod, url);

	if (data == null)
		req.send();
	else
		req.send(new FormData(data));
}

function caricaLista(self, httpMethod, url, data) {
	makeCall(httpMethod, url, data, function(req) {
		if (req.readyState == 4) {
			if (req.status == 200) {
  				var elementi = JSON.parse(req.responseText);
  				if (elementi.length == 0)
    				return;
				self.update(elementi);
			}
			else if (req.status == 403) {
				//TODO
          		window.location.href = req.getResponseHeader("Location");
          		window.sessionStorage.removeItem('username');
			}
			else 
				self.alert.textContent = message;
		}
	});
}

function indirizzo(indirizzo) {
	return 	"Via " + indirizzo.via + " " + 
			indirizzo.numero + ", " + 
			indirizzo.citta + ", " + 
			indirizzo.cap;
}
