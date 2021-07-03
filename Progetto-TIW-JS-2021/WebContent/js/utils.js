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

function makeCall(httpMethod, url, data, callBack, json) {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		callBack(req);
	};
	req.open(httpMethod, url);
	if(json)
		req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

	if (data == null)
		req.send();
	else
		req.send(data);
}

function caricaLista(self, httpMethod, url, data, json) {
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
	}, json);
}

function aggiungiVisualizzato(id) {
	var listaVisualizzati = window.sessionStorage.getItem("listaVisualizzati");
	// Se nella sessione non è presente la lista viene creato e aggiunto un array vuoto
	if(listaVisualizzati === null || listaVisualizzati === undefined) {
		listaVisualizzati = new Array();
		listaVisualizzati.push(id);
	}
	else {
		listaVisualizzati = JSON.parse(listaVisualizzati);
		// Controlla se l'elemento è già presente nella lista
		if(listaVisualizzati.includes(id)) {
			// Controlla se l'ultimo elemento non sia quello appena selezionato,
			// se non lo è viene aggiornato
			if(listaVisualizzati[listaVisualizzati.length - 1] == id)
				return;
			listaVisualizzati.splice(listaVisualizzati.indexOf(id), 1);
		}
		if(listaVisualizzati.length >= 5) 
			listaVisualizzati.shift();
		listaVisualizzati.push(id);
	}
	window.sessionStorage.setItem(	"listaVisualizzati", 
									JSON.stringify(listaVisualizzati));
}

function caricaVisualizzati() {
	var listaVisualizzati = window.sessionStorage.getItem("listaVisualizzati");
	// Se nella sessione non è presente la lista viene creato e aggiunto un array vuoto
	if(listaVisualizzati === null || listaVisualizzati === undefined) {
		listaVisualizzati = new Array();
		window.sessionStorage.setItem(	"listaVisualizzati", 
										JSON.stringify(listaVisualizzati));
		listaVisualizzati = JSON.stringify(listaVisualizzati);
	}
	return listaVisualizzati;
}

function indirizzo(indirizzo) {
	return 	"Via " + indirizzo.via + " " + 
			indirizzo.numero + ", " + 
			indirizzo.citta + ", " + 
			indirizzo.cap;
}
