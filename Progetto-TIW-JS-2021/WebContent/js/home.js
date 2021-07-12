/**
 * Home: Script relativo alla pagina home per Progetto-TIW-JS-2021
 */

(function() {	// Nasconde le variabli dallo scope globale
	
	var gestorePagina;
	
	window.addEventListener("load", () => {
		if (infoUtente() != null) {
			// Creo un nuovo gestore della pagina e lo inizializzo
			gestorePagina = new GestorePagina();
			gestorePagina.init();
			// Visualizzo la pagina principale
			gestorePagina.visHome();
		}
		else 
			window.location.href = DEFAULT_PAGE;
	}, false);
	
	/**
	 * Messaggio di benvenuto della pagina contenente il nome dell'utente
	 * @param {Node} lBenvenuto Nodo contenente il messaggio di benvenuto
	 * @param {String} nomeUtente Nome dell'utente da visualizzare
	 */
	function Benvenuto(lBenvenuto, nomeUtente) {
		
		this.nomeUtente = nomeUtente;
		
		this.show = function() {
			lBenvenuto.textContent = this.nomeUtente;
		}
	}
	
	/**
	 * Menu interattivo per la navigazione all'interno della pagina
	 * @param {Node} bHome Nodo contenente il bottone HOME
	 * @param {Node} bCarrello Nodo contenente il bottone CARRELLO
	 * @param {Node} bOrdini Nodo contenente il bottone ORDINI
	 * @param {Node} tRicerca Nodo contenente la textbox di ricerca
	 * @param {Node} bRicerca Nodo contenente il bottone RICERCA
	 * @param {Node} bLogout Nodo contenente il bottone LOGOUT
	 */
	function Menu(bHome, bCarrello, bOrdini, tRicerca, bRicerca, bLogout) {
		
		this.bHome = bHome;
		this.bCarrello = bCarrello;
		this.bOrdini = bOrdini;
		this.tRicerca = tRicerca;
		this.bRicerca = bRicerca;
		this.bLogout = bLogout;
		
		this.aggiungiEventi = function(gestore) {
			
			bHome.addEventListener("click", () => {
				gestore.visHome();
			});
			bCarrello.addEventListener("click", () => {
				gestore.visCarrello();
			});
			bOrdini.addEventListener("click", () => {
				gestore.visOrdini();
			});
			tRicerca.addEventListener("keypress", (e) => {
				// In caso l'utente prema il pulsante INVIO all'interno del campo di ricerca
				// l'evento viene reindirizzato al gestore del pulsante
    			if (e.code === ENTER_KEY_CODE) {
					bRicerca.click();
					e.preventDefault();
				}
    		});
			bRicerca.addEventListener("click", (e) => {
				var form = e.target.closest("form");
				if(form.checkValidity()) {
					// Se il form è valido si effettua la ricerca
					gestore.visRisultati(form);
				}
				else
					form.reportValidity();
			})
			bLogout.addEventListener("click", () => {
				makeCall("GET", "Logout", null, gestore.messaggio, () => {
					// Routine di logout
					window.sessionStorage.removeItem(SESSIONE_UTENTE);
					window.sessionStorage.removeItem(SESSIONE_VISUALIZZATI);
					window.location.href = DEFAULT_PAGE;
				});
			})
		} 
	}
	
	/**
	 * Gestore della pagina che regola l'inizializzazione dei componenti 
	 * e la visualizzazione degli elementi
	 */
	function GestorePagina() {
		
		this.messaggio = null;
		this.benvenuto = null;
		this.menu = null;
		this.listaRisultati = null;
		this.listaCarrello = null;
		this.listaOrdini = null;
		
		this.init = function() {
			
			// Messaggio per errori/notifiche
			this.messaggio = document.getElementById("messaggio");
			
			// Messaggio di benvenuto
			this.benvenuto = new Benvenuto(	document.getElementById("nomeUtente"),
											infoUtente().nome					
			);
			this.benvenuto.show();
			
			// Menu comprensivo di bottoni per la navigazione 
			this.menu = new Menu(document.getElementById("bottoneHome"),
				document.getElementById("bottoneCarrello"), 
				document.getElementById("bottoneOrdini"), 
				document.getElementById("testoRicerca"),
				document.getElementById("bottoneRicerca"),
				document.getElementById("bottoneLogout")
			);
			this.menu.aggiungiEventi(this);
			
			// Lista utilizzata per visualizzare prodotti
			this.listaRisultati = new ListaOggetti(this, Prodotto, 
				document.getElementById("listaRisultati"), 
				function(keyword) {
					if(keyword != null)		// Ricerca per keyword
						caricaLista(this, "GET", "CercaKeyword?keyword=" + keyword, 
							null, messaggio, false, 
							'Nessun risultato di ricerca per la parola chiave \"' + keyword + '"');
					else					// Visualizzazione dei prodotti recenti
						caricaLista(this, "POST", "CaricaVisualizzati", 
							caricaVisualizzati(), messaggio, true, 
							"Nessun prodotto visualizzato di recente");
				}
			);
			
			// Lista utilizzata per visualizzare il carrello dell'utente
			this.listaCarrello = new ListaOggetti(this, Carrello,
				document.getElementById("listaCarrello"),
				function() {
					caricaLista(this, "POST", "CaricaCarrello", 
						ritornaCookieCarrello(infoUtente().id), messaggio, true, 
						"Nessun prodotto all'interno del carrello");
				}
			);
			
			// Lista utilizzata per visualizzare gli ordini dell'utente
			this.listaOrdini = new ListaOggetti(this, Ordine,
				document.getElementById("listaOrdini"),
				function() {
					caricaLista(this, "GET", "VisualizzaOrdini", null, messaggio, false,
					"Nessun ordine presente");
				}
			);
			
		}
		
		this.update = function() {
			// Ogni volta che si aggiorna la pagina, il messaggio precedente viene cancellato
			this.messaggio.textContent = "";
			// Ogni volta che si aggiorna la pagina, i contenuti vengono nascosti
			this.listaCarrello.hide();
			this.listaOrdini.hide();
			this.listaRisultati.hide();
		}
		
		this.visHome = function() {
			this.update();
			this.listaRisultati.carica(null);
		}
		
		this.visCarrello = function() {
			this.update();
			this.listaCarrello.carica();
		}
		
		this.visOrdini = function() {
			this.update();
			this.listaOrdini.carica();
		}
		
		this.visRisultati = function(form) {
			this.update();
			this.listaRisultati.carica(new FormData(form).get("keyword"));
		}
		
	}
})();
