/**
 * Utils
 */

const HTTP_CODES = {
	success			: 200,
	badRequest		: 400,
	unauthorized	: 401,
	forbidden		: 403
}

const ENTER_KEY_CODE = "Enter";

const SESSIONE_UTENTE = "utente";

const COOKIE_VALORI_SEP = "-";
const COOKIE_PRODOTTI_SEP = "_";
const COOKIE_DELETE = "=; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

const DEFAULT_PAGE = "login.html";


function makeCall(httpMethod, url, data, responseTag, callBack, json) {
	var req = new XMLHttpRequest();
	
	req.onreadystatechange = function() {
		if(req.readyState == XMLHttpRequest.DONE) {
			if(req.status == HTTP_CODES.success) 
				callBack(req);
			else if (req.status == HTTP_CODES.unauthorized || req.status == HTTP_CODES.forbidden) {
				window.sessionStorage.removeItem(SESSIONE_UTENTE);
          		window.location.href = DEFAULT_PAGE;
			}
			else
				responseTag.textContent = req.responseText;
		}
	};
	
	req.open(httpMethod, url);
	
	if(json)
		req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

	if (data == null)
		req.send();
	else
		req.send(data);
}

function infoUtente() {
	return JSON.parse(window.sessionStorage.getItem(SESSIONE_UTENTE));
}

function caricaLista(self, httpMethod, url, data, responseTag, json) {
	makeCall(httpMethod, url, data, responseTag, function(req) {
		var elementi = JSON.parse(req.responseText);
		if (elementi.length == 0)
			return;
		self.update(elementi);
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

function aggiungiCookie(idUtente, idFornitore, idProdotto, quantita) {
    var tempo = 60 * 60 * 1000;
	var data = new Date();
	data = new Date(data.getTime() + tempo);
	
	var prodotti = getCookie(idUtente, idFornitore);
	var aggiunto = false;
	
	// Aggiungo id utente e fornitore
	var cookie = idUtente + COOKIE_VALORI_SEP + idFornitore + "=";
	if(prodotti)
		for(var i = 0; i < prodotti.length; i++) {
			if(i != 0)
				cookie += COOKIE_PRODOTTI_SEP;
			cookie += prodotti[i].ID + COOKIE_VALORI_SEP;
			var q = Number(prodotti[i].quantita);
			// Se il prodotto c'è già ne incremento la quantità
			if(prodotti[i].ID == idProdotto) {
				q += Number(quantita);
				aggiunto = true;
			}
			cookie += q;
		}
	// Se il prodotto non è già stato aggiunto al passo precedente
	if(!aggiunto) {
		if(prodotti)
			cookie += COOKIE_PRODOTTI_SEP;
		cookie += idProdotto + COOKIE_VALORI_SEP + quantita;
	}
	// Aggiungo la data di scadenza
	cookie += "; expires=" + data.toUTCString();
	// Aggiungo dati per same site
	cookie += "; SameSite=Lax";
	
    document.cookie = cookie;
}

function getCookie(idUtente, idFornitore) {
	var nome = idUtente + COOKIE_VALORI_SEP + idFornitore + "=";
  	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	// Estrapolazione del valore
  	for(var i = 0; i < ca.length; i++) {
    	var c = ca[i];
    	while (c.charAt(0) == ' ')
     		 c = c.substring(1);
    	if (c.indexOf(nome) == 0) {
			var valore = c.substring(nome.length, c.length);
			var va = valore.split(COOKIE_PRODOTTI_SEP);
			var prodotti = new Array();
			// Estrapolazione dei prodotti
			for(var j = 0; j < va.length; j++) {
				var v = va[j];
				var pa = v.split(COOKIE_VALORI_SEP);
				// Formato del prodotto da aggiungere al cookie
				prodotti.push({
					"ID": pa[0], 
					"quantita": pa[1]
				});
			}
			return prodotti;
		}
  	}
 	return null;
}

function ritornaCarrello(idUtente) {
	var nome = idUtente + COOKIE_VALORI_SEP;
  	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	var carrello = new Array();
	// Estrapolazione di tutti i carrelli per ogni fornitore
  	for(var i = 0; i < ca.length; i++) {
    	var c = ca[i];
    	while (c.charAt(0) == ' ')
     		 c = c.substring(1);
    	if (c.indexOf(nome) == 0) {
			var idFornitore = Number(c.split(COOKIE_VALORI_SEP)[1].split("=")[0]);
			var prodotti = getCookie(idUtente, idFornitore);
			// Formato del carrello da aggiungere alla lista
			if(prodotti)
				carrello.push({
					"fornitore": {
						"ID": idFornitore
					},
					"prodotti": prodotti
				});
		}
  	}
 	return JSON.stringify(carrello);
}

function ritornaCarrelloDaFornitore(idUtente, idFornitore) {
	var carrello = new Array();
	var prodotti = getCookie(idUtente, idFornitore);
	if(prodotti)
		carrello.push({
			"fornitore": {
				"ID": idFornitore
			},
			"prodotti": prodotti
		});
 	return JSON.stringify(carrello);
}

function numeroProdottiDaFornitore(idUtente, idFornitore) {
	var prodotti = getCookie(idUtente, idFornitore);
	var n = 0;
	if(prodotti)
		prodotti.forEach((prodotto) => {
			n += Number(prodotto.quantita);
		});
	return n;
}

function cancellaCarrello(idUtente, idFornitore) {
	 document.cookie = idUtente + COOKIE_VALORI_SEP + idFornitore + COOKIE_DELETE;
}

function indirizzo(indirizzo) {
	return 	"Via " + indirizzo.via + " " + 
			indirizzo.numero + ", " + 
			indirizzo.citta + ", " + 
			indirizzo.cap;
}
