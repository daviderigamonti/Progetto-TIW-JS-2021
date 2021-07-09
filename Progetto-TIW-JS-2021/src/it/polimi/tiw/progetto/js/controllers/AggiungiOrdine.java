package it.polimi.tiw.progetto.js.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringEscapeUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.progetto.js.beans.Carrello;
import it.polimi.tiw.progetto.js.beans.Prodotto;
import it.polimi.tiw.progetto.js.beans.Utente;
import it.polimi.tiw.progetto.js.dao.FornitoreDAO;
import it.polimi.tiw.progetto.js.dao.IndirizzoDAO;
import it.polimi.tiw.progetto.js.dao.OrdineDAO;
import it.polimi.tiw.progetto.js.dao.ProdottoDAO;
import it.polimi.tiw.progetto.js.utils.CalcoloCosti;
import it.polimi.tiw.progetto.js.utils.GestoreConnessione;
import it.polimi.tiw.progetto.js.utils.IdException;
import it.polimi.tiw.progetto.js.utils.ServletErrorResponse;

@WebServlet("/AggiungiOrdine")
@MultipartConfig
public class AggiungiOrdine extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public AggiungiOrdine() {
		super();
	}

	public void init() throws ServletException {
		connection = GestoreConnessione.getConnection(getServletContext());
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request, response);
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		Gson gson = new GsonBuilder().setDateFormat("dd/MM/yyyy").create();
		
		Carrello carrello;
		int idFornitore, idUtente, idIndirizzo;
		String citta = "", via = "", cap = "", numero = "";
		List<Prodotto> prodottiUtente = new ArrayList<Prodotto>();
		float totale;
		
		OrdineDAO ordineDAO = new OrdineDAO(connection);
		ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
		FornitoreDAO fornitoreDAO = new FornitoreDAO(connection);
		IndirizzoDAO indirizzoDAO = new IndirizzoDAO(connection);
		
		HttpSession s = request.getSession(); 
		
		try {	
			// Caricamento del carrello dal JSON
			List<Carrello> carrelli = Arrays.asList(
					gson.fromJson(request.getParameter("carrello"), Carrello[].class));
			if (carrelli == null || carrelli.size() < 1) 
				throw new Exception("Richiesta malformata");
			
			// Selezione del primo carrello e completamento delle informazioni
			carrello = carrelli.get(0);
			idFornitore = carrello.getFornitore().getID();
			idUtente = ((Utente)s.getAttribute("utente")).getId();
			if(!fornitoreDAO.esisteFornitore(idFornitore))
				throw new Exception("ID fornitore non riconosciuto");
			
			// Caricamento informazioni relative all'indirizzo
			citta = StringEscapeUtils.escapeJava(request.getParameter("citta"));
			via = StringEscapeUtils.escapeJava(request.getParameter("via"));
			cap = StringEscapeUtils.escapeJava(request.getParameter("cap"));
			numero = StringEscapeUtils.escapeJava(request.getParameter("numero"));
			if (citta == null || citta.isEmpty() || via == null || via.isEmpty() || 
					cap == null || cap.isEmpty() || numero == null || numero.isEmpty())
						throw new Exception("Campi indirizzo assenti");
			
		} catch (Exception e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_BAD_REQUEST, 
					e.getMessage());
			return;
		}
		
		// Recupero dei prodotti da aggiungere
		for (Prodotto p : carrello.getProdotti()) {
			try {
				Prodotto daAggiungere = prodottoDAO.prendiProdottoByIdProdottoFornitore(p.getID(), idFornitore);
				daAggiungere.setQuantita(p.getQuantita());
				prodottiUtente.add(daAggiungere);
			} catch (SQLException e) {
				ServletErrorResponse.createResponse(response, 
						HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
						"Impossibile recuperare prodotti da id prodotto e id fornitore");
				return;
			} catch (IdException e) {
				ServletErrorResponse.createResponse(response, 
						HttpServletResponse.SC_BAD_REQUEST, 
						"Prodotti non esistenti");
				return;
			}
		}
		
		// Calcolo costi dell'ordine
		try {  
			totale = CalcoloCosti.calcolaTotale(prodottiUtente, fornitoreDAO.prendiFornitoreById(idFornitore));
		} catch (SQLException e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
					"Impossibile recuperare fornitore da ID");
			return;
		} catch (IdException e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_BAD_REQUEST, 
					"Fornitori non esistenti");
			return;
		}
		
		// Gestione indirizzo dell'ordine
		try {  
			idIndirizzo = indirizzoDAO.prendiIdIndirizzoByParam(citta, via, cap, Integer.parseInt(numero));
		} catch (SQLException e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
					"Impossibile recuperare valore indirizzo");
			return;
		}
		
		// Aggiunta ordine nel db
		try {  
			ordineDAO.aggiungiOrdine(totale, idIndirizzo, idUtente, idFornitore, prodottiUtente);
		} catch (SQLException e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
					"Impossibile aggiungere ordine");
			return;
		}
		
		response.setStatus(HttpServletResponse.SC_OK);
	}
	
	public void destroy() {
		try {
			GestoreConnessione.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

}
