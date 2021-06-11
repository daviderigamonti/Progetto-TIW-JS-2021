package it.polimi.tiw.progetto.js.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import it.polimi.tiw.progetto.js.beans.Utente;
import it.polimi.tiw.progetto.js.dao.UtenteDAO;
import it.polimi.tiw.progetto.js.utils.GestoreConnessione;

@WebServlet("/ControllaLogin")
@MultipartConfig
public class ControllaLogin extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	public ControllaLogin() {
		super();
	}
	
	public void init() throws ServletException {
		connection = GestoreConnessione.getConnection(getServletContext());
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String email = null;
		String psw = null;
		try {
			email = request.getParameter("email");
			psw = request.getParameter("psw");
			if (email == null || psw == null || email.isEmpty() || psw.isEmpty()) 
				throw new Exception("Credenziali mancanti o inesistenti");
		} catch (Exception e) {
			// for debugging only e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Credenziali non presenti");
			return;
		}
		
		UtenteDAO usrDao = new UtenteDAO(connection);
		Utente usr = null;
		try {
			usr = usrDao.controllaCredenziali(email, psw);
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile controllare le credenziali");
			return;
		}
		
		if (usr == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().println("Credenziali non valide");
		} else {
			request.getSession().setAttribute("utente", usr);
			response.setStatus(HttpServletResponse.SC_OK);
		}
	}
	
	public void destroy() {
		try {
			GestoreConnessione.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
