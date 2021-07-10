package it.polimi.tiw.progetto.js.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import it.polimi.tiw.progetto.js.beans.Ordine;
import it.polimi.tiw.progetto.js.beans.Prodotto;
import it.polimi.tiw.progetto.js.utils.CalcoloCosti;
import it.polimi.tiw.progetto.js.utils.IdException;

public class OrdineDAO {
	private Connection connection;
	
	public OrdineDAO(Connection connection) {
		this.connection = connection;
	}
	
	public OrdineDAO() {
		
	}
	
	
	public List<Ordine> prendiOrdiniByIdUtente(int idUtente) throws SQLException, IdException {  
		//TODO: testare
		List<Ordine> ordini = new ArrayList<Ordine>();
		List<Integer> idOrdini = new ArrayList<Integer>();
		//prendo lista di id dei miei ordini e poi per ogni id prendo info prodotti ecc
		String query = "select Id from ordine ord where ord.IdUtente = ?  order by Data desc"; 
		
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, idUtente);
			try (ResultSet result = pstatement.executeQuery();) {
				while (result.next()) {
					idOrdini.add(result.getInt("Id"));
				}
			}
		}

		FornitoreDAO fornitoreDAO = new FornitoreDAO(connection);
		ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
		IndirizzoDAO indirizzoDAO = new IndirizzoDAO(connection);
		
		Date data = new Date();
		int IdFornitore = -1;
		int IdIndirizzo = -1;
		
		for(Integer idOrdine : idOrdini) {

			Ordine ordine = new Ordine();
			query = "select * from ordine ord join contenuto co on ord.Id=co.IdOrdine "
					+ "where ord.Id= ? "; 
			
			try (PreparedStatement pstatement = connection.prepareStatement(query);) {
				pstatement.setInt(1, idOrdine);
				try (ResultSet result = pstatement.executeQuery();) {
					if (!result.isBeforeFirst()) // no results
						throw new IdException();
					List<Prodotto> prodotti = new ArrayList<>();
					while (result.next()) {
						Prodotto prodotto = prodottoDAO.prendiProdottoByIdProdottoFornitore(
								Integer.parseInt(result.getString("IdProdotto")), 
								Integer.parseInt(result.getString("IdFornitore")));
						prodotto.setQuantita(Integer.parseInt(result.getString("Quantita")));
						prodotti.add(prodotto);
						
						data = result.getDate("Data");
						IdFornitore = Integer.parseInt(result.getString("IdFornitore"));
						IdIndirizzo = Integer.parseInt(result.getString("IdIndirizzo"));
					}
					
					ordine.setData(data);
					ordine.setFornitore(fornitoreDAO.prendiFornitoreById(IdFornitore));
					ordine.setIndirizzo(indirizzoDAO.prendiIndirizzoById(IdIndirizzo));
					ordine.setId(idOrdine);
					ordine.setProdotti(prodotti);
					ordine.setTotale(CalcoloCosti.calcolaTotale(prodotti, ordine.getFornitore()));
				}
			}
			ordini.add(ordine);
			
		}
		return ordini;
	}
	
	
	public void aggiungiOrdine(float totale, int idIndirizzo, int idUtente, int idFornitore, 
			List<Prodotto> prodotti) throws SQLException {
		
		int idOrdineNuovo = prendiProssimoId();
		
		String query = "INSERT INTO ordine (Id, Totale, Data, IdIndirizzo, IdUtente, IdFornitore) "
				+ "VALUES( ? , ? , CURDATE() , ? , ? , ? ) ";
		
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			

			pstatement.setInt(1, idOrdineNuovo);
			pstatement.setFloat(2, totale);
			pstatement.setInt(3, idIndirizzo);
			pstatement.setInt(4, idUtente);
			pstatement.setInt(5, idFornitore);
			pstatement.executeUpdate(); 
				
			for(Prodotto p : prodotti) {
				query = "INSERT INTO contenuto (IdOrdine, IdProdotto, Quantita) "
						+ "VALUES( ? , ? , ? ) ";
				try (PreparedStatement pstatement2 = connection.prepareStatement(query);) {
					pstatement2.setInt(1, idOrdineNuovo);
					pstatement2.setInt(2, p.getID());
					pstatement2.setInt(3, p.getQuantita());
					pstatement2.executeUpdate();
				}
			}
		}
	}
	
	
	public int prendiProssimoId() throws SQLException { //per scegliere nuovo id per l'ordine
		String query = "select max(Id) as Id from ordine "; 
		
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results
					return 1;
				if (result.next()) {
					return result.getInt("Id") + 1;
				}
			}
		}
		return -1;
	}
	
}