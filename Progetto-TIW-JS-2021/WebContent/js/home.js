/**
 * Home
 */

(function() {	// Nasconde le variabli dallo scope globale
	
	var gestorePagina;
	var menu;
	
	
	
	window.addEventListener("load", () => {
		gestorePagina = new GestorePagina();
		gestorePagina.init();
	}, false);
	
	
	function Prodotto(parametri) {
		this.id = parametri["id"];
		this.nome = parametri["nome"];
		this.descrizione = parametri["descrizione"];
		this.categoria = parametri["categoria"];
		this.immagine = parametri["immagine"];
		this.fornitore = parametri["fornitore"];
		this.prezzo = parametri["prezzo"];
		this.valore = parametri["valore"];
	}
	
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
				// CODICE CLICK SU HOME
			});
			bCarrello.addEventListener("click", (e) => {
				// CODICE CLICK SU CARRELLO
			});
			bOrdini.addEventListener("click", (e) => {
				// CODICE CLICK SU ORDINI
			});
			tRicerca.addEventListener("keyup", (e) => {
    			e.preventDefault();
    			if (e.keyCode === ENTER_KEY_CODE)
        			bRicerca.click();
    		});
			bRicerca.addEventListener("click", (e) => {
				// CODICE CLICK SU RICERCA
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
		}
		
	}
	
})();