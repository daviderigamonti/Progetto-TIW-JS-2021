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

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.progetto.js.beans.Prodotto;
import it.polimi.tiw.progetto.js.dao.ProdottoDAO;
import it.polimi.tiw.progetto.js.utils.GestoreConnessione;

@WebServlet("/CercaKeyword")
public class CercaKeyword extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	public CercaKeyword() {
		super();
	}

	public void init() throws ServletException {
		connection = GestoreConnessione.getConnection(getServletContext());
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
		//List<Prodotto> offerte = new ArrayList<Prodotto>();
		
		List<Prodotto> listaProdotti= new ArrayList<>();
		
		if(request.getParameter("keyword") != null && !request.getParameter("keyword").equals("")) {
			try {
				listaProdotti = prodottoDAO.prendiProdottiByKeyword(request.getParameter("keyword"));
			} catch (SQLException e) {
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
						"Impossibile recuperare prodotti da keyword");
				return;
			}
		}
		
		request.getSession().setAttribute("listaProdotti", listaProdotti);
		
		Gson gson = new GsonBuilder().setDateFormat("dd/MM/yyyy").create();
		String json = gson.toJson(listaProdotti);
		
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
