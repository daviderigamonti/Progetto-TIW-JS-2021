package it.polimi.tiw.progetto.js.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;

import it.polimi.tiw.progetto.js.beans.Carrello;
import it.polimi.tiw.progetto.js.beans.Prodotto;
import it.polimi.tiw.progetto.js.dao.FornitoreDAO;
import it.polimi.tiw.progetto.js.dao.ProdottoDAO;
import it.polimi.tiw.progetto.js.utils.CalcoloCosti;
import it.polimi.tiw.progetto.js.utils.GestoreConnessione;
import it.polimi.tiw.progetto.js.utils.IdException;
import it.polimi.tiw.progetto.js.utils.ServletErrorResponse;

@WebServlet("/CaricaCarrello")
@MultipartConfig
public class CaricaCarrello extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public CaricaCarrello() {
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
		
		List<Carrello> carrelli = new ArrayList<Carrello>();
		
		ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
		FornitoreDAO fornitoreDAO = new FornitoreDAO(connection);
		
		try {
			// Caricamento informazioni sui carrelli da JSON
			String postContent = request.getReader().lines()
					.collect(Collectors.joining(System.lineSeparator()));
			carrelli = Arrays.asList(gson.fromJson(postContent, Carrello[].class));
			if (carrelli == null) 
				throw new Exception("Richiesta malformata");
			for (Carrello c : carrelli)
				for (Prodotto p : c.getProdotti()) 
					if(p.getQuantita() < 1  || p.getQuantita() > 999)
						throw new Exception("Quantità  di prodotti non valida");
		} catch (JsonSyntaxException e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_BAD_REQUEST, 
					"Richiesta malformata");
			return;
		} catch (Exception e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_BAD_REQUEST, 
					e.getMessage());
			return;
		}
		
		// Completa i beans importati dal JSON e calcola prezzo totale e costi di spedizione
		try {
			for (Carrello c : carrelli) {
				c.setFornitore(fornitoreDAO.prendiFornitoreById(c.getFornitore().getID()));
				List<Prodotto> prodottiCompleti = new ArrayList<>();
				for (Prodotto p : c.getProdotti()) {
					Prodotto temp = prodottoDAO.prendiProdottoByIdProdottoFornitore(
							p.getID(), c.getFornitore().getID());
					temp.setQuantita(p.getQuantita());
					prodottiCompleti.add(temp);
				}
				c.setProdotti(prodottiCompleti);
				
				c.setCostoSpedizione(CalcoloCosti.calcolaCostiSpedizione(c.getProdotti(), c.getFornitore()));
				c.setTotaleCosto(CalcoloCosti.calcolaPrezzo(c.getProdotti()));
			}
		} catch (SQLException e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
					"Impossibile recuperare informazioni da ID");
			return;
		} catch (IdException e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_BAD_REQUEST, 
					"Informazioni non esistenti");
			return;
		}
		
		String json = gson.toJson(carrelli);
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.setStatus(HttpServletResponse.SC_OK);
		response.getWriter().write(json);
	}
	
	public void destroy() {
		try {
			GestoreConnessione.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
