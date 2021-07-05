package it.polimi.tiw.progetto.js.utils;

public class IdException extends Exception {

	private static final long serialVersionUID = 1L;

	@Override
    public String getMessage() {
        return "L'ID a cui si sta tentando di accedere non esiste";
    }
}
