package it.polimi.tiw.progetto.js.controllers;

import java.io.IOException;
import java.sql.Connection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/GoToOrdini")
public class GoToOrdini extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public GoToOrdini() {
		super();
	}

	public void init() throws ServletException {
		
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

	}
}
