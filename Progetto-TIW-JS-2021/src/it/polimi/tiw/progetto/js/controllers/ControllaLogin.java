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

import org.apache.commons.lang.StringEscapeUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.progetto.js.beans.Utente;
import it.polimi.tiw.progetto.js.dao.UtenteDAO;
import it.polimi.tiw.progetto.js.utils.GestoreConnessione;
import it.polimi.tiw.progetto.js.utils.ServletErrorResponse;

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
		
		Gson gson = new GsonBuilder().setDateFormat("dd/MM/yyyy").create();
		
		Utente usr = null;
		String email = "";
		String psw = "";
		
		UtenteDAO usrDao = new UtenteDAO(connection);
		
		// Controlla l'esistenza delle credenziali di accesso
		try {
			email = StringEscapeUtils.escapeJava(request.getParameter("email"));
			psw = StringEscapeUtils.escapeJava(request.getParameter("psw"));
			if (email == null || psw == null || email.isEmpty() || psw.isEmpty()) 
				throw new Exception("Credenziali mancanti o inesistenti");
		} catch (Exception e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_BAD_REQUEST,
					"Credenziali non presenti");
			return;
		}
		
		// Controlla la validità delle credenziali di accesso
		try {
			usr = usrDao.controllaCredenziali(email, psw);
		} catch (SQLException e) {
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
					"Impossibile controllare le credenziali");
			return;
		}
		
		if (usr == null) {	
			// Se le credenziali non sono valide viene ritornato un messaggio di errore
			ServletErrorResponse.createResponse(response, 
					HttpServletResponse.SC_UNAUTHORIZED, 
					"Credenziali non valide");
		} 
		else {
			//Se le credenziali sono valide l'utente viene aggiunto alla sessione
			request.getSession().setAttribute("utente", usr);

			String json = gson.toJson(usr);
			
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.setStatus(HttpServletResponse.SC_OK);
			response.getWriter().write(json);
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
