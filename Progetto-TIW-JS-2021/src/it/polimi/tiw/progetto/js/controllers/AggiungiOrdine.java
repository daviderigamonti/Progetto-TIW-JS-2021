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
		
		Gson gson = new GsonBuilder().setDateFormat("yyyy MMM dd").create();
		
		Carrello carrello;
		int idFornitore, idUtente, idIndirizzo;
		List<Prodotto> prodottiUtente = new ArrayList<Prodotto>();
		float totale;
		
		OrdineDAO ordineDAO = new OrdineDAO(connection);
		ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
		FornitoreDAO fornitoreDAO = new FornitoreDAO(connection);
		IndirizzoDAO indirizzoDAO = new IndirizzoDAO(connection);
		
		HttpSession s = request.getSession(); 
		
		try {	
			List<Carrello> carrelli = Arrays.asList(gson.fromJson(request.getParameter("carrello"), Carrello[].class));
			if (carrelli == null || carrelli.size() < 1) 
				throw new Exception("Richiesta malformata");
			carrello = carrelli.get(0);
			idFornitore = carrello.getFornitore().getID();
			idUtente = ((Utente)s.getAttribute("utente")).getId();
			if(!fornitoreDAO.esisteFornitore(idFornitore))
				throw new Exception("ID fornitore non riconosciuto");
			if(request.getParameter("citta") == null || request.getParameter("citta").isEmpty() || 
					request.getParameter("via") == null || request.getParameter("via").isEmpty() ||
					request.getParameter("cap") == null || request.getParameter("cap").isEmpty() ||
					request.getParameter("numero") == null || request.getParameter("numero").isEmpty())
						throw new Exception("Campi indirizzo assenti");
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			return;
		}
		
		for(Prodotto p : carrello.getProdotti()) {
			try {
				Prodotto daAggiungere = prodottoDAO.prendiProdottoByIdProdottoFornitore(p.getID(), idFornitore);
				daAggiungere.setQuantita(p.getQuantita());
				prodottiUtente.add(daAggiungere);
			} catch (SQLException e) {
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare prodotti da id prodotto e id fornitore");
				return;
			}catch (IdException e) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
				return;
			}
		}
		
		try {  //calcolo costi dell'ordine
			totale = CalcoloCosti.calcolaTotale(prodottiUtente, fornitoreDAO.prendiFornitoreById(idFornitore));
		}catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare fornitore da ID");
			return;
		}catch (IdException e) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			return;
		}
		
		try {  //gestione indirizzo dell'ordine
			idIndirizzo = indirizzoDAO.prendiIdIndirizzoByParam(request.getParameter("citta"), request.getParameter("via"), 
					request.getParameter("cap"), Integer.parseInt(request.getParameter("numero")));
		}catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare valore indirizzo");
			return;
		}
		
		try {  //aggiunta ordine nel db
			ordineDAO.aggiungiOrdine(totale, idIndirizzo, idUtente, idFornitore, prodottiUtente);
		}catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile aggiungere ordine");
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
