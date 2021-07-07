package it.polimi.tiw.progetto.js.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.progetto.js.beans.Prodotto;
import it.polimi.tiw.progetto.js.dao.ProdottoDAO;
import it.polimi.tiw.progetto.js.utils.GestoreConnessione;
import it.polimi.tiw.progetto.js.utils.IdException;

@WebServlet("/CaricaVisualizzati")
public class CaricaVisualizzati extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public CaricaVisualizzati() {
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
		ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
		List<Integer> listaVisualizzati = new LinkedList<>();
		List<Prodotto> prodotti = new ArrayList<Prodotto>();
		
		try {
			String postContent = request.getReader().lines()
					.collect(Collectors.joining(System.lineSeparator()));
			listaVisualizzati = Arrays.asList(gson.fromJson(postContent, Integer[].class));
			if (listaVisualizzati == null) 
				throw new Exception("Credenziali mancanti o inesistenti");
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Credenziali non presenti");
			return;
		}
		
		if(!listaVisualizzati.isEmpty()) {
			Collections.reverse(listaVisualizzati);
			for(Integer id : listaVisualizzati)
				try {
					prodotti.add(prodottoDAO.prendiProdottoById(id));
				}catch (SQLException e) {
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare prodotti già visualizzati");
					return;
				}catch (IdException e) {
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
					return;
				}
		}
		
		if(prodotti.size() < 5) {   //riempio i 5 prodotti da visualizzare con prodotti random
			try {
				prodotti.addAll(prodottoDAO.prendiProdotti(listaVisualizzati, 5 - prodotti.size()));
			} catch (SQLException e) {
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare prodotti casuali");
				return;
			}
		}
		
		
		String json = gson.toJson(prodotti);
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
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
