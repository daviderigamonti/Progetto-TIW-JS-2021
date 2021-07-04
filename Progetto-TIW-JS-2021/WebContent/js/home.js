/**
 * Home
 */

(function() {	// Nasconde le variabli dallo scope globale
	
	var gestorePagina;
	
	
	window.addEventListener("load", () => {
		gestorePagina = new GestorePagina();
		gestorePagina.init();
		gestorePagina.visHome();
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
    			if (e.keyCode === ENTER_KEY_CODE) {
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
				// TODO: CODICE CLICK SU LOGOUT
			})
			
		} 
	}
	
	function ListaOggetti(gestore, Oggetto, divLista, fCaricamento) {
		
		this.divLista = divLista;
		
		this.carica = fCaricamento;
		
		this.update = function(prodotti) {
			this.show();
			this.divLista.innerHTML = ""; // Svuota la lista
			
			var self = this;
			
			prodotti.forEach((prodotto) => {
				var p = new Oggetto(gestore, self.divLista);
				p.update(prodotto);
			});
		};
		
		this.show = () => {
			this.divLista.hidden = false;
		};
		
		this.hide = () => {
			this.divLista.hidden = true;
		};
	}
	
	function GestorePagina() {
		
		this.benvenuto = null;
		this.menu = null;
		this.listaRisultati = null;
		this.listaCarrello = null;
		this.listaOrdini = null;
		
		this.init = function() {
			
			this.benvenuto = new Benvenuto(	document.getElementById("nomeUtente"),
											JSON.parse(sessionStorage.getItem(SESSIONE_UTENTE)).nome					
			);
			this.benvenuto.show();
			
			this.menu = new Menu(	document.getElementById("bottoneHome"),
								document.getElementById("bottoneCarrello"),
								document.getElementById("bottoneOrdini"),
								document.getElementById("testoRicerca"),
								document.getElementById("bottoneRicerca"),
								this.benvenuto,
								document.getElementById("bottoneLogout")
			);
			this.menu.aggiungiEventi(this);
			
			this.listaRisultati = new ListaOggetti(	this,
													Prodotto,
													document.getElementById("listaRisultati"), 
													function(keyword) {
														if(keyword != null)
															caricaLista(this, "GET", 
																"CercaKeyword?keyword=" + keyword, null);
														else
															caricaLista(this, "POST", 
																"CaricaVisualizzati", caricaVisualizzati(), 
																true);
													}
			);
			
			this.listaCarrello = new ListaOggetti(	this,
													Carrello,
													document.getElementById("listaCarrello"),
													function() {
														caricaLista(this, "POST", 
															"CaricaCarrello", 
															ritornaCarrello(JSON.parse(sessionStorage.getItem(SESSIONE_UTENTE)).id),
															true);
													}
			);
			
			this.listaOrdini = new ListaOggetti(this,
												Ordine,
												document.getElementById("listaOrdini"),
												function() {
													caricaLista(this, "GET", 
														"VisualizzaOrdini", null);
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
			this.listaCarrello.carica(null);
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
	
})()
