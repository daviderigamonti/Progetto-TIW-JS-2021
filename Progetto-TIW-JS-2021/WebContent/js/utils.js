/**
 * Utils: Funzioni di utilità generale utilizzate per Progetto-TIW-JS-2021
 */

const HTTP_CODES = {
	success			: 200,
	badRequest		: 400,
	unauthorized	: 401,
	forbidden		: 403,
	unavailable		: 404
}

const ENTER_KEY_CODE = "Enter";

const SESSIONE_UTENTE = "utente";

const COOKIE_VALORI_SEP = "-";
const COOKIE_PRODOTTI_SEP = "_";
const COOKIE_DELETE = "=; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

const DEFAULT_PAGE = "login.html";


/**
 * Makes a call to the server, utilizing the XMLHttpRequest object
 * @param {String} httpMethod Metodo HTTP da utilizzare per la chiamata
 * @param {String} url Url da utilizzare per la chiamata
 * @param {Object} data Eventuali dati aggiuntivi da inserire nella chiamata
 * @param {Node} responseTag Nodo da utilizzare per visualizzare il messaggio di risposta
 * @param {Function} callBack Funzione da chiamare una volta ottenuta una risposta
 * 							  positiva dal server
 * @param {Boolean} json Flag utilizzato per indicare se i dati aggiuntivi specificati nel
 * 						 parametro "data" siano di tipo JSON
 * @param {Boolean} login Flag utilizzato per indicare se la chiamata arriva da una richiesta
 * 						  di autenticazione (per la gestione di HTTP_CODES.unauthorized)
 */
function makeCall(httpMethod, url, data, responseTag, callBack, json, login) {
	
	var req = new XMLHttpRequest();
	
	req.onreadystatechange = function() {
		if(req.readyState == XMLHttpRequest.DONE) {
			if(req.status == HTTP_CODES.success) 
				callBack(req);
			else if(req.status == HTTP_CODES.unauthorized && !login || 
				req.status == HTTP_CODES.forbidden) {
					// Nel caso l'utente non abbia effettuato l'accesso o non possieda i privilegi
					// per visualizzare una determinata risorsa, viene rispedito alla pagina 
					// di default (a meno che l'utente non stia tentando di autenticarsi)
					window.sessionStorage.removeItem(SESSIONE_UTENTE);
	          		window.location.href = DEFAULT_PAGE;
			}
			else {
				responseTag.className = "messaggioErrore";
				if(req.status == HTTP_CODES.unavailable && !req.responseText)	
					// Nel caso avvenga un errore durante l'inizializzazione della servlet
					responseTag.textContent = "Errore: " + req.status + 
						" - Risorsa non disponibile";
				else
					responseTag.textContent = "Errore: " + req.status + " - " + req.responseText;
			}
		}
	};
	
	req.open(httpMethod, url);
	
	// Se i dati sono di tipo JSON viene specificato il Content-Type all'interno della richiesta
	if(json)
		req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

	if (data == null)
		req.send();
	else
		req.send(data);
}

/**
 * Funzione utilizzata per caricare una lista di elementi
 * @param {ListaOggetti} self Riferimento alla lista di oggetti
 * @param {String} httpMethod Metodo HTTP da utilizzare per la chiamata
 * @param {String} url Url da utilizzare per la chiamata
 * @param {Object} data Eventuali dati aggiuntivi da inserire nella chiamata
 * @param {Node} responseTag Nodo da utilizzare per visualizzare il messaggio di risposta
 * @param {Boolean} json Flag utilizzato per indicare se i dati aggiuntivi specificati nel
 * 						 parametro "data" siano di tipo JSON
 * @param {String} emptyMessage Messaggio da visualizzare nel caso la lista sia vuota
 */
function caricaLista(self, httpMethod, url, data, responseTag, json, emptyMessage) {
	makeCall(httpMethod, url, data, responseTag, function(req) {
		var elementi = JSON.parse(req.responseText);
		if(elementi.length == 0) {
			if(emptyMessage) {
				responseTag.className = "messaggioNotifica";
				responseTag.textContent = emptyMessage; 
			}
			return;
		}
		self.update(elementi);
	}, json);
}

/**
 * Recupera le informazioni dell'utente dalla sessione
 */
function infoUtente() {
	return JSON.parse(window.sessionStorage.getItem(SESSIONE_UTENTE));
}

/**
 * Aggiunge il riferimento alla visualizzazione di un determinato prodotto da parte 
 * dell'utente all'interno della sessione
 * @param {Number} id Id del prodotto visualizzato dall'utente
 */
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
	window.sessionStorage.setItem("listaVisualizzati", JSON.stringify(listaVisualizzati));
}

/**
 * Carica tutti i prodotti visualizzati presenti all'interno della sessione corrente
 */
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

/**
 * Aggiunge un prodotto all'interno del carrello tramite cookie
 * @param {Number} idUtente Codice identificativo dell'utente
 * @param {Number} idFornitore Codice identificativo del fornitore
 * @param {Number} idProdotto Codice identificativo del prodotto
 * @param {Number} quantita Quantità dei prodotti selezionati
 */
function aggiungiCookieProdotto(idUtente, idFornitore, idProdotto, quantita) {
    var tempo = 60 * 60 * 1000;
	var data = new Date();
	data = new Date(data.getTime() + tempo);
	
	var prodotti = ritornaCookieProdotti(idUtente, idFornitore);
	var aggiunto = false;
	
	// Aggiungo id utente e fornitore
	var cookie = idUtente + COOKIE_VALORI_SEP + idFornitore + "=";
	if(prodotti)
		for(let i = 0; i < prodotti.length; i++) {
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

/**
 * Ritorna tutti i prodotti relativi ad un fornitore tramite cookie
 * @param {Number} idUtente Codice identificativo dell'utente
 * @param {Number} idFornitore Codice identificativo del fornitore
 */
function ritornaCookieProdotti(idUtente, idFornitore) {
	var nome = idUtente + COOKIE_VALORI_SEP + idFornitore + "=";
  	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	// Estrapolazione del valore
  	for(let i = 0; i < ca.length; i++) {
    	var c = ca[i];
    	while (c.charAt(0) == ' ')
     		 c = c.substring(1);
    	if (c.indexOf(nome) == 0) {
			var valore = c.substring(nome.length, c.length);
			var va = valore.split(COOKIE_PRODOTTI_SEP);
			var prodotti = new Array();
			// Estrapolazione dei prodotti
			for(let j = 0; j < va.length; j++) {
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

/**
 * Ritorna tutti i prodotti presenti nel carrello con i relativi fornitori tramite cookie
 * @param {Number} idUtente Codice identificativo dell'utente
 */
function ritornaCookieCarrello(idUtente) {
	var nome = idUtente + COOKIE_VALORI_SEP;
  	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	var carrello = new Array();
	// Estrapolazione di tutti i carrelli per ogni fornitore
  	for(let i = 0; i < ca.length; i++) {
    	var c = ca[i];
    	while (c.charAt(0) == ' ')
     		 c = c.substring(1);
    	if (c.indexOf(nome) == 0) {
			var idFornitore = Number(c.split(COOKIE_VALORI_SEP)[1].split("=")[0]);
			var prodotti = ritornaCookieProdotti(idUtente, idFornitore);
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

/**
 * Ritorna tutti i prodotti presenti nel carrello, relativi ad un fornitore, tramite cookie
 * @param {Number} idUtente Codice identificativo dell'utente
 * @param {Number} idFornitore Codice identificativo del fornitore
 */
function ritornaCookieCarrelloDaFornitore(idUtente, idFornitore) {
	var carrello = new Array();
	var prodotti = ritornaCookieProdotti(idUtente, idFornitore);
	if(prodotti)
		carrello.push({
			"fornitore": {
				"ID": idFornitore
			},
			"prodotti": prodotti
		});
 	return JSON.stringify(carrello);
}

/**
 * Ritorna il numero dei prodotti presenti nel carrello, relativi ad un fornitore, tramite cookie
 * @param {Number} idUtente Codice identificativo dell'utente
 * @param {Number} idFornitore Codice identificativo del fornitore
 */
function numeroCookieProdottiDaFornitore(idUtente, idFornitore) {
	var prodotti = ritornaCookieProdotti(idUtente, idFornitore);
	var n = 0;
	if(prodotti)
		prodotti.forEach((prodotto) => {
			n += Number(prodotto.quantita);
		});
	return n;
}

/**
 * Cancella tutti i prodotti presenti nel carrello, relativi ad un fornitore, tramite cookie
 * @param {Number} idUtente Codice identificativo dell'utente
 * @param {Number} idFornitore Codice identificativo del fornitore
 */
function cancellaCookieCarrello(idUtente, idFornitore) {
	 document.cookie = idUtente + COOKIE_VALORI_SEP + idFornitore + COOKIE_DELETE;
}

/**
 * Restituisce la stringa completa contenente le varie informazioni relative ad un indirizzo
 * @param {Object} indirizzo Indirizzo da trascrivere
 */
function indirizzo(indirizzo) {
	return 	"Via " + indirizzo.via + " " + 
			indirizzo.numero + ", " + 
			indirizzo.citta + ", " + 
			indirizzo.cap;
}
