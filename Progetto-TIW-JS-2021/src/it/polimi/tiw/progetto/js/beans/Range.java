package it.polimi.tiw.progetto.js.beans;

public class Range {

	int ID;
	int min;
	int max;
	int prezzo;
	
	
	
	public Range(int iD, int min, int max, int prezzo) {
		super();
		ID = iD;
		this.min = min;
		this.max = max;
		this.prezzo = prezzo;
	}
	public int getID() {
		return ID;
	}
	public void setID(int iD) {
		ID = iD;
	}
	public int getMin() {
		return min;
	}
	public void setMin(int min) {
		this.min = min;
	}
	public int getMax() {
		return max;
	}
	public void setMax(int max) {
		this.max = max;
	}
	public int getPrezzo() {
		return prezzo;
	}
	public void setPrezzo(int prezzo) {
		this.prezzo = prezzo;
	}	
}
