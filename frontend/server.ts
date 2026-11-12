import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

// Path to railway management system static files
const rmsPath = path.join(process.cwd(), "railway-management-system");

app.use(express.json());
// Serve zip download
app.get("/download-zip", (req, res) => {
  const zipPath = path.join(process.cwd(), "railway-management-system.zip");
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="railway-management-system.zip"');
  res.sendFile(zipPath, (err) => {
    if (err) {
      console.error("Error sending zip file:", err);
      if (!res.headersSent) {
        res.status(500).send("Zip file not available for download.");
      }
    }
  });
});

app.get("/download.zip", (req, res) => {
  res.redirect("/download-zip");
});

app.get("/railway-management-system.zip", (req, res) => {
  res.redirect("/download-zip");
});

// Default root route serves login.html as the primary first page
app.get("/", (req, res) => {
  res.sendFile(path.join(rmsPath, "login.html"));
});

// Serve static files from railway-management-system folder
app.use(express.static(rmsPath, { index: "login.html" }));
app.use("/railway-management-system", express.static(rmsPath, { index: "login.html" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Railway Management System running on http://0.0.0.0:${PORT}`);
});
