/**
 * Home Elements
 */

function Prodotto(gestore, listaProdotti) {
	
	this.listaProdotti = listaProdotti;
	this.offerte;
	
	this.update = function(prodotto) {
		
		var self = this;
		
		var tabellaProdotto, riga1, riga2, riga3, cellaImmagine, immagine, 
			cellaCategoria, cellaNome, cellaPrezzo, cellaDescrizione, 
			cellaOfferte, tabellaOfferte; 
			
		var caricaOfferte = (e) => {
			if(self.offerte.isHidden()) {
				var idSelezionato = e.target.getAttribute("idProdotto");
				aggiungiVisualizzato(idSelezionato);
	      		self.offerte.caricaOfferte(idSelezionato, self.tTabella);
			}
			self.offerte.toggleVisibilty();
		}
		
		tabellaProdotto = document.createElement("table");
		this.listaProdotti.appendChild(tabellaProdotto);
		
		riga1 = document.createElement("tr");
		tabellaProdotto.appendChild(riga1);
		
		riga2 = document.createElement("tr");
		tabellaProdotto.appendChild(riga2);
		
		riga3 = document.createElement("tr");
		riga3.colSpan = "4";
		tabellaProdotto.appendChild(riga3);
		
		// Sezione offerte
		cellaOfferte = document.createElement("td");
		cellaOfferte.colSpan = "4";
		riga3.appendChild(cellaOfferte);
		
		tabellaOfferte = document.createElement("table");
		tabellaOfferte.className = "tabellaRisultati";
		cellaOfferte.appendChild(tabellaOfferte);
		
		this.offerte = new InfoOfferte(gestore, riga3, tabellaOfferte);
		
		//Sezione immagine
		cellaImmagine = document.createElement("td");
		cellaImmagine.rowSpan = "2";
		riga1.appendChild(cellaImmagine);
		
		immagine = document.createElement("img");
		immagine.src = "data:image/png;base64," + prodotto.immagine;
		immagine.className = "immagineGrande";
		immagine.setAttribute("idProdotto", prodotto.ID);
		immagine.addEventListener("click", caricaOfferte, false);
		cellaImmagine.appendChild(immagine);
		
		//Sezione categoria
		cellaCategoria = document.createElement("td");
		cellaCategoria.textContent = prodotto.categoria;
		riga1.appendChild(cellaCategoria);
		
		//Sezione nome
		cellaNome = document.createElement("td");
		cellaNome.textContent = prodotto.nome;
		cellaNome.setAttribute("idProdotto", prodotto.ID);
		cellaNome.addEventListener("click", caricaOfferte, false);
		riga1.appendChild(cellaNome);
		
		//Sezione prezzo
		cellaPrezzo = document.createElement("td");
		cellaPrezzo.textContent = prodotto.prezzo.toFixed(2) + " \u20AC";
		riga1.appendChild(cellaPrezzo);
		
		//Sezione descrizione
		cellaDescrizione = document.createElement("td");
		cellaDescrizione.textContent = prodotto.descrizione;
		cellaDescrizione.colSpan = "3";
		riga2.appendChild(cellaDescrizione);
		
		
	};
}

function Ordine(gestore, listaOrdini) {
	
	this.listaOrdini = listaOrdini;
	
	this.update = function(ordine) {
		var tabellaOrdine, riga1, riga2, riga3, cellaAcquisto, cellaIndirizzo, 
			cellaLista, listaProdotti; 
			
		tabellaOrdine = document.createElement("table");
		this.listaOrdini.appendChild(tabellaOrdine);
		
		riga1 = document.createElement("tr");
		tabellaOrdine.appendChild(riga1);
		
		riga2 = document.createElement("tr");
		tabellaOrdine.appendChild(riga2);
		
		riga3 = document.createElement("tr");
		tabellaOrdine.appendChild(riga3);
		
		cellaAcquisto = document.createElement("td");
		cellaAcquisto.textContent = "Acquisto effettuato in data " + ordine.data + "\n" +
									"Presso il venditore " + ordine.fornitore.nome + " - " + 
									"Totale: " + ordine.totale;
		cellaAcquisto.style = "white-space:pre";	//TODO: da fare in CSS 
		riga1.appendChild(cellaAcquisto);
		
		cellaIndirizzo = document.createElement("td");
		cellaIndirizzo.textContent =	"Con indirizzo di spedizione:" + "\n" +
									 	indirizzo(ordine.indirizzo);
		cellaIndirizzo.style = "white-space:pre";	//TODO: da fare in CSS 
		riga2.appendChild(cellaIndirizzo);
		
		cellaLista = document.createElement("td");
		riga3.appendChild(cellaLista);
		
		listaProdotti = document.createElement("ul");
		cellaLista.appendChild(listaProdotti);
		
		ordine.prodotti.forEach((prodotto) => {
			var entryProdotto;
			
			entryProdotto = document.createElement("li");
			entryProdotto.textContent = prodotto.nome + " x" + prodotto.quantita;
			listaProdotti.appendChild(entryProdotto);
		});
		
	};
}

function Carrello(gestore, listaCarrelli) {
	
	this.listaCarrelli = listaCarrelli;
	
	this.update = function(carrello) {
		var tabellaCarrello, riga1, riga2, riga3, cellaTotale, cellaPrezzoSpedizione, cellaSpedizione, formSpedizione, 
		testoCitta, testoVia, testoNumero, testoCAP, bottoneSpedizione, label ,linebreak;
		
		var utente = JSON.parse(sessionStorage.getItem(SESSIONE_UTENTE));
		var indirizzo = utente.indirizzo;
			
		tabellaCarrello = document.createElement("table");
		tabellaCarrello.className = "tabellaProdotti";
		this.listaCarrelli.appendChild(tabellaCarrello);
		
		carrello.prodotti.forEach((prodotto) => {
			
			var riga, cellaImmagine, immagine, cellaNome, cellaQuantita, cellaPrezzo;
		
			riga = document.createElement("tr");
			tabellaCarrello.appendChild(riga);
			
			cellaImmagine = document.createElement("td");
			riga.appendChild(cellaImmagine);
			
			immagine = document.createElement("img");
			immagine.src = "data:image/png;base64," + prodotto.immagine;
			immagine.className = "immagineMedia";
			cellaImmagine.appendChild(immagine);
			
			cellaNome = document.createElement("td");
			cellaNome.textContent = prodotto.nome;
			riga.appendChild(cellaNome);
			
			cellaQuantita = document.createElement("td");
			cellaQuantita.textContent = "x" + prodotto.quantita;
			riga.appendChild(cellaQuantita);
			
			cellaPrezzo = document.createElement("td");
			cellaPrezzo.textContent = prodotto.prezzo.toFixed(2) + " \u20AC";
			riga.appendChild(cellaPrezzo);
			
		});
		
		riga1 = document.createElement("tr");
		riga1.colSpan = "4";
		tabellaCarrello.appendChild(riga1);
		
		riga2 = document.createElement("tr");
		riga2.colSpan = "4";
		tabellaCarrello.appendChild(riga2);
		
		riga3 = document.createElement("tr");
		riga3.colSpan = "4";
		tabellaCarrello.appendChild(riga3);
		
		cellaTotale = document.createElement("td");
		cellaTotale.textContent = carrello.totaleCosto.toFixed(2) + " \u20AC";
		riga1.appendChild(cellaTotale);
		
		cellaPrezzoSpedizione = document.createElement("td");
		cellaPrezzoSpedizione.textContent = carrello.costoSpedizione.toFixed(2) + " \u20AC";
		riga2.appendChild(cellaPrezzoSpedizione);
		
		cellaSpedizione = document.createElement("td");
		riga3.appendChild(cellaSpedizione);
		
		formSpedizione = document.createElement("form");
		formSpedizione.action = "#";
		formSpedizione.id = "formSpedizione";
		cellaSpedizione.appendChild(formSpedizione);
		
		label = document.createElement("label");
        label.innerHTML = "Città: ";
		formSpedizione.appendChild(label);
		
		testoCitta = document.createElement("input");
		testoCitta.name = "citta";
		testoCitta.type = "text";
		testoCitta.value = indirizzo.citta;
		formSpedizione.appendChild(testoCitta);
		
		linebreak = document.createElement("br");
		formSpedizione.appendChild(linebreak);
		
		label = document.createElement("label");
        label.innerHTML = "Via: ";
		formSpedizione.appendChild(label);
		
		testoVia = document.createElement("input");
		testoVia.name = "via";
		testoVia.type = "text";
		testoVia.value = indirizzo.via;
		formSpedizione.appendChild(testoVia);
		
		linebreak = document.createElement("br");
		formSpedizione.appendChild(linebreak);
		
		label = document.createElement("label");
        label.innerHTML = "Numero: ";
		formSpedizione.appendChild(label);
		
		testoNumero = document.createElement("input");
		testoNumero.name = "numero";
		testoNumero.type = "number";
		testoNumero.value = indirizzo.numero;
		formSpedizione.appendChild(testoNumero);
		
		linebreak = document.createElement("br");
		formSpedizione.appendChild(linebreak);
		
		label = document.createElement("label");
        label.innerHTML = "CAP: ";
		formSpedizione.appendChild(label);
		
		testoCAP = document.createElement("input");
		testoCAP.name = "cap";
		testoCAP.type = "number";
		testoCAP.value = indirizzo.cap;
		formSpedizione.appendChild(testoCAP);
		
		linebreak = document.createElement("br");
		formSpedizione.appendChild(linebreak);
		
		var carrelloForm = document.createElement("input");
		carrelloForm.hidden = true;
		carrelloForm.name = "carrello";
		carrelloForm.value = "";
		formSpedizione.appendChild(carrelloForm);
		
		bottoneSpedizione = document.createElement("input");
		bottoneSpedizione.type = "button";
		bottoneSpedizione.value = "Ordina";
		bottoneSpedizione.addEventListener("click", (e) => {
			var form = e.target.closest("form");
			if(form.checkValidity()) {
				carrelloForm.value = ritornaCarrello(utente.id);
				makeCall("POST", "AggiungiOrdine", new FormData(form), function(req) {
					if (req.readyState == 4) {
		            	if (req.status == 200) {
							carrelloForm.value = "";
		              		cancellaCarrello(utente.id, carrello.fornitore.ID);
							gestore.visOrdini();
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
			else
				form.reportValidity();
		}, false);
		formSpedizione.appendChild(bottoneSpedizione);
		
	};
}

function InfoOfferte(gestore, rigaOfferte, tabellaOfferte) {
	
	this.rigaOfferte = rigaOfferte;
	this.tabellaOfferte = tabellaOfferte;
	this.rigaOfferte.hidden = true;	// Le offerte sono sempre nascoste al momento della creazione
	
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
		this.tabellaOfferte.innerHTML = ""; // Svuota la tabella
		var self = this;
		
		offerte.forEach((offerta) => {
		
			var rigaOff = new Array();
			var cellaFornitore, cellaCarrello, formCarrello, numeroCarrello, bottoneCarrello;
			
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
			cellaCarrello.style = "white-space:pre";	//TODO: da fare in CSS 
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
			
			numeroCarrello = document.createElement("input");
			numeroCarrello.name = "quantita";
			numeroCarrello.type = "number";
			numeroCarrello.min = "1";
			numeroCarrello.value = "1";
			numeroCarrello.addEventListener("keypress", (e) => {
				if (e.keyCode === ENTER_KEY_CODE)
					e.preventDefault();
			}, false);
			formCarrello.appendChild(numeroCarrello);
			
			bottoneCarrello = document.createElement("input");
			bottoneCarrello.type = "button";
			bottoneCarrello.value = "Inserisci";
			bottoneCarrello.addEventListener("click", (e) => {
				var form = e.target.closest("form");
				if(form.checkValidity()) {
					aggiungiCookie(	JSON.parse(sessionStorage.getItem(SESSIONE_UTENTE)).id, 
									offerta.fornitore.ID, offerta.ID, form.quantita.value);	//TODO: limitare max prodotti
					gestore.visCarrello();
				}
				else
					form.reportValidity();
			}, false);
			formCarrello.appendChild(bottoneCarrello);
		});
	}
	
	this.isHidden = () => {
		return this.rigaOfferte.hidden;
	}
	
	this.toggleVisibilty = () => {
		this.rigaOfferte.hidden = !this.rigaOfferte.hidden;
	}
}
