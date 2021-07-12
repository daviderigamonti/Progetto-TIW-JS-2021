package it.polimi.tiw.progetto.js.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringEscapeUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.progetto.js.beans.Prodotto;
import it.polimi.tiw.progetto.js.dao.ProdottoDAO;
import it.polimi.tiw.progetto.js.utils.GestoreConnessione;
import it.polimi.tiw.progetto.js.utils.IdException;
import it.polimi.tiw.progetto.js.utils.ServletErrorResponse;

@WebServlet("/CercaProdotto")
public class CercaProdotto extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	public CercaProdotto() {
		super();
	}

	public void init() throws ServletException {
		connection = GestoreConnessione.getConnection(getServletContext());
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		Gson gson = new GsonBuilder().setDateFormat("dd/MM/yyyy").create();
		
		List<Prodotto> offerte = new ArrayList<Prodotto>();
		String idProdotto = "";
		
		ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
		
		// Recupera un prodotto dal database dato il suo id
		try {
			idProdotto = StringEscapeUtils.escapeJava(request.getParameter("idProdotto"));
			if (idProdotto != null && !idProdotto.equals("")) {
				
				try {
					Integer.parseInt(idProdotto);
				} catch (NumberFormatException e) {
					ServletErrorResponse.createResponse(response, 
							HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
							"Richiesta malformata");
					return;
			    }

				offerte = prodottoDAO.prendiOfferteByIdProdotto(Integer.parseInt(idProdotto));
			}
		} catch (SQLException e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
					"Impossibile recuperare prodotti da id");
			return;
		} catch (IdException e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_BAD_REQUEST, 
					"Id prodotto non esistente");
			return;
		} catch (Exception e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_BAD_REQUEST, 
					"Richiesta malformata");
			return;
		}
		
		String json = gson.toJson(offerte);
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.setStatus(HttpServletResponse.SC_OK);
		response.getWriter().write(json);
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doGet(request, response);
	}
	
	public void destroy() {
		try {
			GestoreConnessione.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

}
