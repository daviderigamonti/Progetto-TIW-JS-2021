/**
 * Home
 */

(function() {	// Nasconde le variabli dallo scope globale
	
	var gestorePagina;
	
	window.addEventListener("load", () => {
		if (infoUtente() != null) {
			gestorePagina = new GestorePagina();
			gestorePagina.init();
			gestorePagina.visHome();
		}
		else 
			window.location.href = "login.html";
	}, false);
		
	function Benvenuto(lBenvenuto, nomeUtente) {
		
		this.nomeUtente = nomeUtente;
		
		this.show = function() {
			lBenvenuto.textContent = this.nomeUtente;
		}
	}
	
	function Menu(bHome, bCarrello, bOrdini, tRicerca, bRicerca, benvenuto, bLogout) {
		
		this.bHome = bHome;
		this.bCarrello = bCarrello;
		this.bOrdini = bOrdini;
		this.tRicerca = tRicerca;
		this.bRicerca = bRicerca;
		this.benvenuto = benvenuto;
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
    			if (e.code === ENTER_KEY_CODE) {
					bRicerca.click();
					e.preventDefault();
				}
    		});
			bRicerca.addEventListener("click", (e) => {
				var form = e.target.closest("form");
				if(form.checkValidity()) {
					gestore.visRisultati(form);
				}
				else
					form.reportValidity();
			})
			bLogout.addEventListener("click", () => {
				makeCall("GET", "Logout", null, gestore.messaggio, () => {
					window.sessionStorage.removeItem(SESSIONE_UTENTE);
					window.location.href = "login.html";
				});
			})
		} 
	}
	
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
			
			// Menu comprensivo di bottoni per la navigazione e messaggio di benvenuto
			this.menu = new Menu(document.getElementById("bottoneHome"),
				document.getElementById("bottoneCarrello"), 
				document.getElementById("bottoneOrdini"), 
				document.getElementById("testoRicerca"),
				document.getElementById("bottoneRicerca"),
				this.benvenuto,
				document.getElementById("bottoneLogout")
			);
			this.menu.aggiungiEventi(this);
			
			// Lista utilizzata per visualizzare prodotti
			this.listaRisultati = new ListaOggetti(this, Prodotto, 
				document.getElementById("listaRisultati"), 
				function(keyword) {
					if(keyword != null)
						caricaLista(this, "GET", "CercaKeyword?keyword=" + keyword, 
							null, this.messaggio);
					else
						caricaLista(this, "POST", "CaricaVisualizzati", 
							caricaVisualizzati(), messaggio, true);
				}
			);
			
			// Lista utilizzata per visualizzare il carrello dell'utente
			this.listaCarrello = new ListaOggetti(this, Carrello,
				document.getElementById("listaCarrello"),
				function() {
					caricaLista(this, "POST", "CaricaCarrello", 
						ritornaCarrello(infoUtente().id), messaggio, true);
				}
			);
			
			// Lista utilizzata per visualizzare gli ordini dell'utente
			this.listaOrdini = new ListaOggetti(this, Ordine,
				document.getElementById("listaOrdini"),
				function() {
					caricaLista(this, "GET", "VisualizzaOrdini", messaggio);
				}
			);
			
		}
		
		this.visHome = function() {
			this.listaCarrello.hide();
			this.listaOrdini.hide();
			this.listaRisultati.carica(null);
		}
		
		this.visCarrello = function() {
			this.listaRisultati.hide();
			this.listaOrdini.hide();
			this.listaCarrello.carica();
		}
		
		this.visOrdini = function() {
			this.listaRisultati.hide();
			this.listaCarrello.hide();
			this.listaOrdini.carica();
		}
		
		this.visRisultati = function(form) {
			this.listaCarrello.hide();
			this.listaOrdini.hide();
			this.listaRisultati.carica(new FormData(form).get("keyword"));
		}
		
	}
})();
