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
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.progetto.js.utils.GestoreConnessione;
import it.polimi.tiw.progetto.js.utils.IdException;
import it.polimi.tiw.progetto.js.beans.*;
import it.polimi.tiw.progetto.js.dao.OrdineDAO;

@WebServlet("/VisualizzaOrdini")
public class VisualizzaOrdini extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public VisualizzaOrdini() {
		super();
	}

	public void init() throws ServletException {
		connection = GestoreConnessione.getConnection(getServletContext());
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		List<Ordine> ordiniDaMostrare = new ArrayList<Ordine>();
		OrdineDAO ordineDAO = new OrdineDAO(connection);
		HttpSession s = request.getSession(); 
		
		//mostro tutti gli ordini presi dal db

		try {
			ordiniDaMostrare = ordineDAO.prendiOrdiniByIdUtente(((Utente)s.getAttribute("utente")).getId());
		}catch(SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile prendere ordine da id utente");
			e.printStackTrace();
		}catch (IdException e) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			return;
		}
		
		Gson gson = new GsonBuilder().setDateFormat("yyyy MMM dd").create();
		String json = gson.toJson(ordiniDaMostrare);
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
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
