package it.polimi.tiw.progetto.js.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.progetto.js.beans.Prodotto;
import it.polimi.tiw.progetto.js.beans.Utente;
import it.polimi.tiw.progetto.js.dao.ProdottoDAO;
import it.polimi.tiw.progetto.js.utils.CalcoloCosti;
import it.polimi.tiw.progetto.js.utils.CookieParser;
import it.polimi.tiw.progetto.js.utils.GestoreConnessione;
import it.polimi.tiw.progetto.js.utils.IdException;


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
	
	@SuppressWarnings("unchecked")
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
		List<Prodotto> offerte = new ArrayList<Prodotto>();
		
		if(request.getParameter("idProdotto") != null) {
			// Aggiunta alla lista visualizzati
			int idProdotto = Integer.parseInt(request.getParameter("idProdotto"));
			Queue<Integer> listaVisualizzati = new LinkedList<>();
			HttpSession session = request.getSession();
			if (session.getAttribute("listaVisualizzati") == null) {
				listaVisualizzati.add(idProdotto);
				request.getSession().setAttribute("listaVisualizzati", listaVisualizzati);
			}
			else {
				listaVisualizzati = (Queue<Integer>) session.getAttribute("listaVisualizzati");
				if(!listaVisualizzati.contains(idProdotto)) {
					if(listaVisualizzati.size() == 5)
						listaVisualizzati.remove();
					listaVisualizzati.add(idProdotto);
				}
			}
			
			try {
				offerte = prodottoDAO.prendiOfferteByIdProdotto(Integer.parseInt(request.getParameter("idProdotto")));
			} catch (SQLException e) {
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare prodotti da id");
				return;
			}catch (IdException e) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
				return;
			}
			
			HttpSession s = request.getSession(); 
			Cookie[] cookies = request.getCookies();
			List<Prodotto> prodotti = new ArrayList<Prodotto>();
			List<Prodotto> mieiProdotti = new ArrayList<Prodotto>();
			for(Prodotto o : offerte) {
				int idForn = o.getFornitore().getID();
				o.setValore(0);
				o.setQuantita(0);
				if (cookies != null) {
					for (int i = 0; i < cookies.length; i++) { //TODO: x evitare il cookie JSESSIONID?
						
						mieiProdotti = new ArrayList<Prodotto>();
						
						if(!cookies[i].getName().equals("JSESSIONID")) {
							if(cookies[i].getName().split("-")[0].equals(String.valueOf((((Utente)s.getAttribute("utente")).getId()))))
							{
								if(cookies[i].getName().split("-")[1].equals(String.valueOf(idForn))) {
									prodotti = CookieParser.parseCookie(cookies[i]);
									for(Prodotto p : prodotti) {
										try {
											Prodotto daAggiungere = prodottoDAO.prendiProdottoByIdProdottoFornitore(p.getID(),p.getFornitore().getID());
											daAggiungere.setQuantita(p.getQuantita());
											mieiProdotti.add(daAggiungere);
										} catch (SQLException e) {
											response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare prodotti da cookie info");
											return;
										}catch (IdException e) {
											response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
											return;
										}
									}
									o.setValore(CalcoloCosti.calcolaPrezzo(mieiProdotti));
									o.setQuantita(CalcoloCosti.calcolaNumeroProdotti(mieiProdotti));
								}
							}
						}
					}
				}
			}
		}
		
		Gson gson = new GsonBuilder().setDateFormat("yyyy MMM dd").create();
		String json = gson.toJson(offerte);
		
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
