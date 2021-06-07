package it.polimi.tiw.progetto.js.controllers;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/GoToCarrello")
public class GoToCarrello extends HttpServlet {
	
	private static final long serialVersionUID = 1L;

	public GoToCarrello() {
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
	
	private HttpServletResponse addCookie(HttpServletRequest request, HttpServletResponse response) {
			return response;
	}
}
