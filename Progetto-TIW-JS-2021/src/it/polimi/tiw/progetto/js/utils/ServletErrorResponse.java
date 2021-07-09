package it.polimi.tiw.progetto.js.utils;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

public class ServletErrorResponse {

	/**
	 * Metodo per inviare una risposta contenent un errore al client
	 * @param response Oggetto risposta tramite il quale è possibile comunicare
	 * @param code Codice d'errore
	 * @param message Messaggio d'errore
	 * @throws IOException Viene lanciata una IOException nel caso non sia possibile accedere
	 * 		   in scrittura alla Stream della risposta
	 */
	public static void createResponse(HttpServletResponse response, int code, String message) 
			throws IOException {
		response.setStatus(code);
		response.setContentType("text/html");
		response.getWriter().println(message);
		return;
	}
}
