/**
 * Home
 */

(function() {	// Nasconde le variabli dallo scope globale
	
	var gestorePagina, menu, listaRisultati;
	
	
	window.addEventListener("load", () => {
		gestorePagina = new GestorePagina();
		gestorePagina.init();
	}, false);
	
	
	function Prodotto(tTabella) {
		
		this.tTabella = tTabella;
		this.offerte;
		
		this.update = function(prodotto) {
			var riga1, riga2, riga3, cellaImmagine, immagine, cellaCategoria, 
				cellaNome, collegamento, cellaPrezzo, cellaDescrizione, 
				cellaOfferte, tabellaOfferte; 
				
			var self = this;
			
			riga1 = document.createElement("tr");
			this.tTabella.appendChild(riga1);
			
			riga2 = document.createElement("tr");
			this.tTabella.appendChild(riga2);
			
			riga3 = document.createElement("tr");
			riga3.colSpan = "4";
			this.tTabella.appendChild(riga3);
			
			cellaOfferte = document.createElement("td");
			cellaOfferte.colSpan = "4";
			riga3.appendChild(cellaOfferte);
			
			tabellaOfferte = document.createElement("table");
			tabellaOfferte.className = "tabellaRisultati";
			cellaOfferte.appendChild(tabellaOfferte);
			
			// Tabella offerte
			this.offerte = new InfoOfferte(tabellaOfferte);
			this.offerte.hide();
			
			cellaImmagine = document.createElement("td");
			cellaImmagine.rowSpan = "2";
			riga1.appendChild(cellaImmagine);
			
			immagine = document.createElement("img");
			immagine.src = "data:image/png;base64," + prodotto.immagine;
			immagine.className = "immagineGrande";
			cellaImmagine.appendChild(immagine);
			
			cellaCategoria = document.createElement("td");
			cellaCategoria.textContent = prodotto.categoria;
			riga1.appendChild(cellaCategoria);
			
			cellaNome = document.createElement("td");
			collegamento = document.createElement("a");
			collegamento.setAttribute("idProdotto", prodotto.ID);
			collegamento.textContent = prodotto.nome;
			collegamento.addEventListener("click", (e) => {
          		self.offerte.caricaOfferte(e.target.getAttribute("idProdotto"), self.tTabella);
			}, false);
			cellaNome.appendChild(collegamento);
			riga1.appendChild(cellaNome);
			
			cellaPrezzo = document.createElement("td");
			cellaPrezzo.textContent = prodotto.prezzo.toFixed(2) + " \u20AC";
			riga1.appendChild(cellaPrezzo);
			
			cellaDescrizione = document.createElement("td");
			cellaDescrizione.textContent = prodotto.descrizione;
			cellaDescrizione.colSpan = "3";
			riga2.appendChild(cellaDescrizione);
			
			
		};
	}
	
	function InfoOfferte(tabellaOfferte) {//TODO: passare e nascondere anche la riga
		
		this.tabellaOfferte = tabellaOfferte;
		
		this.caricaOfferte = function(idProdotto) {
			var self = this;
			makeCall("GET", "CercaProdotto?idProdotto=" + idProdotto, null, function(req) {
				if (req.readyState == 4) {
	            	if (req.status == 200) {
	              		var offerte = JSON.parse(req.responseText);
						self.update(offerte);
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
		};
			
		this.update = function(offerte) {
			this.show();
			this.tabellaOfferte.innerHTML = ""; // Svuota la tabella
			var self = this;
			
			offerte.forEach((offerta) => {
			
				var rigaOff = new Array();
				var cellaFornitore, cellaCarrello, formCarrello, numberCarrello, bottoneCarrello;
				
				rigaOff[0] = document.createElement("tr");
				self.tabellaOfferte.appendChild(rigaOff[0]);
				
				cellaFornitore = document.createElement("td");
				cellaFornitore.textContent =	offerta.fornitore.nome + " - " + 
												offerta.fornitore.valutazione + " \u2605 - " + 
												offerta.prezzo.toFixed(2) + " \u20AC";
				cellaFornitore.rowSpan = offerta.fornitore.politica.length;
				rigaOff[0].appendChild(cellaFornitore);
				
				for(let i = 0; i < offerta.fornitore.politica.length; i++) {
					
					var politica = offerta.fornitore.politica[i];
					var rigaPolitica, cellaSpedizione, cellaMinimo, cellaMassimo
					
					if(rigaOff[i] !== undefined)
						rigaPolitica = rigaOff[i];
					else {
						rigaPolitica = document.createElement("tr");
						self.tabellaOfferte.appendChild(rigaPolitica);
					}
					
					cellaSpedizione = document.createElement("td");
					cellaSpedizione.textContent = 	"Fascia di spedizione: " + 
													politica.prezzo.toFixed(2) + " \u20AC";
					rigaPolitica.appendChild(cellaSpedizione);
					
					cellaMinimo = document.createElement("td");
					cellaMinimo.textContent = "Numero minimo prodotti: " + politica.min;
					rigaPolitica.appendChild(cellaMinimo);
					
					cellaMassimo = document.createElement("td");
					cellaMassimo.textContent = "Numero massimo prodotti: " + politica.max;
					rigaPolitica.appendChild(cellaMassimo);
				}
				
				cellaCarrello = document.createElement("td");
				cellaCarrello.rowSpan = offerta.fornitore.politica.length;
				cellaCarrello.style = "white-space:pre"; 
				cellaCarrello.textContent = "La soglia per la spedizione gratis \xE9 di " + 
											offerta.fornitore.soglia + " \u20AC" + "\n\n" +
											"Numero di prodotti gi\xE1 nel carrello: " + 
											offerta.quantita + "\n\n" +
											"Valore dei prodotti gi\xE1 nel carrello: " + 
											offerta.valore + " \u20AC" + "\n\n";
				rigaOff[0].appendChild(cellaCarrello);
				
				formCarrello = document.createElement("form");
				formCarrello.action = "#";
				cellaCarrello.appendChild(formCarrello);
				
				numberCarrello = document.createElement("input");
				numberCarrello.type = "number";
				numberCarrello.min = "1";
				numberCarrello.value = "1";
				formCarrello.appendChild(numberCarrello);
				
				bottoneCarrello = document.createElement("input");
				bottoneCarrello.type = "button";
				bottoneCarrello.value = "Inserisci";
				formCarrello.appendChild(bottoneCarrello);
				//TODO funzione aggiunta al carrello
			});
		}
		
		this.show = () => {
			this.tabellaOfferte.hidden = false;
		};
		
		this.hide = () => {
			this.tabellaOfferte.hidden = true;
		};
	}
	
	function ListaProdotti(tLista, tTabella) {
		
		this.tLista = tLista;
		this.tTabella = tTabella;
		
		this.caricaVisualizzati = undefined;
		
		this.caricaRisultati = function(keyword) {
			var self = this;
			makeCall("GET", "CercaKeyword?keyword=" + keyword, null, function(req) {
				if (req.readyState == 4) {
	            	if (req.status == 200) {
	              		var prodotti = JSON.parse(req.responseText);
	              		if (prodotti.length == 0)
	                		return;
						self.update(prodotti);
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
		};
		
		this.update = function(prodotti) {
			this.show();
			this.tTabella.innerHTML = ""; // Svuota la tabella
			
			var self = this;
			
			prodotti.forEach((prodotto) => {
				var p = new Prodotto(self.tTabella);
				p.update(prodotto);
			});
		};
		
		this.show = () => {
			this.tLista.hidden = false;
		};
		
		this.hide = () => {
			this.tLista.hidden = true;
		};
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
				listaRisultati.hide();
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
				var form = e.target.closest("form");
				if(form.checkValidity())
					listaRisultati.caricaRisultati(new FormData(form).get("keyword"));
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
			listaRisultati = new ListaProdotti(	document.getElementById("listaRisultati"),
												document.getElementById("tabellaRisultati")
			);
		}
		
	}
	
})();