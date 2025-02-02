const functions = require("firebase-functions");
const cors = require("cors")({origin: true});
const {google} = require("googleapis");
const keys = require("./serviceAccountKey.json");

const auth = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/spreadsheets.readonly"],
);

exports.getSolicitudes = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send("Email no proporcionado");
      }

      const sheets = google.sheets({version: "v4", auth});
      const spreadsheetId = "1R6zp-dOqKuyfh5RCu3eTUqztaRQheMbcGMwBCNlpTjU";
      const range = "A:Z";

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return res.status(404).send("No se encontraron datos en la hoja.");
      }

      const result = rows.filter((row) => row.includes(email));
      if (result.length === 0) {
        return res.status(404).send(
            "No se encontraron solicitudes para este correo.",
        );
      }

      return res.json(result);
    } catch (error) {
      console.error("Error al recuperar los datos de Google Sheets:", error);
      return res.status(500).send("Hubo un error al recuperar los datos.");
    }
  });
});
