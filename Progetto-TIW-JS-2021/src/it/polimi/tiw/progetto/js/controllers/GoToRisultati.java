package it.polimi.tiw.progetto.js.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import it.polimi.tiw.progetto.js.beans.Prodotto;

@WebServlet("/GoToRisultati")
public class GoToRisultati extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private List<Prodotto> prodotti = new ArrayList<Prodotto>();
	
	public GoToRisultati() {
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
