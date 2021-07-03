/**
 * Home
 */

(function() {	// Nasconde le variabli dallo scope globale
	
	var gestorePagina, menu, listaRisultati, listaOrdini;
	
	
	window.addEventListener("load", () => {
		gestorePagina = new GestorePagina();
		gestorePagina.init();
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
			
			bHome.addEventListener("click", (e) => {
				listaRisultati.carica(null);
				listaOrdini.hide();
			});
			bCarrello.addEventListener("click", (e) => {
				listaRisultati.hide();
				listaOrdini.hide();
			});
			bOrdini.addEventListener("click", (e) => {
				listaOrdini.carica();
				listaRisultati.hide();
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
					listaRisultati.carica(new FormData(form).get("keyword"));
					listaOrdini.hide();
				}
				else
					form.reportValidity();
			})
			bLogout.addEventListener("click", (e) => {
				// CODICE CLICK SU LOGOUT
			})
			
		} 
	}
	
	function GestorePagina() {
		
		this.init = function() {
			
			benvenuto = new Benvenuto(	document.getElementById("nomeUtente"),
										sessionStorage.getItem(SESSIONE_NOME_UTENTE)						
			);
			benvenuto.show();
			
			menu = new Menu(	document.getElementById("bottoneHome"),
								document.getElementById("bottoneCarrello"),
								document.getElementById("bottoneOrdini"),
								document.getElementById("testoRicerca"),
								document.getElementById("bottoneRicerca"),
								benvenuto,
								document.getElementById("bottoneLogout")
			);
			menu.aggiungiEventi(this);
			
			listaRisultati = new ListaOggetti(	Prodotto,
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
			
			listaOrdini = new ListaOggetti(		Ordine,
												document.getElementById("listaOrdini"),
												function() {
													caricaLista(this, "GET", 
														"VisualizzaOrdini", null);
												}
			);
			
			listaRisultati.carica(null);
		}
		
	}
	
})();