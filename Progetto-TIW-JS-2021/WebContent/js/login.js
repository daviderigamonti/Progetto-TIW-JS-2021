/**
 * Login
 */

(function() {	// Nasconde le variabli dallo scope globale

	document.getElementById("bottoneLogin").addEventListener("click", (e) => {
		var form = e.target.closest("form");
		if(form.checkValidity()) {
			// AGGIUNGERE controlli aggiuntivi
			makeCall("POST", "ControllaLogin", form, function(req) {
				if(req.readyState == XMLHttpRequest.DONE) {
					if(req.status == HTTP_CODES.success)
						window.location.href = "home.html";
					else
						document.getElementById("erroreLogin").textContent = req.message;
				}
			});
		}
		else
			form.reportValidity();
	});
	
})();