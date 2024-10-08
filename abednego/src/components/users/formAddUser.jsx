import * as React from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRef } from "react";
import zxcvbn from "zxcvbn";
import { Toast } from "primereact/toast";
import axios from "axios";
import { PhoneInput,defaultCountries ,parseCountry} from 'react-international-phone';
import 'react-international-phone/style.css';
import formatPhoneNumber from '../NumberFormat';


const defaultTheme = createTheme();

export default function SignUp() {

  const countries = defaultCountries.filter((country) => {
    const { iso2 } = parseCountry(country);
    return ['re', 'mg'].includes(iso2);

  });



  //verification for valid email
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const ip = process.env.REACT_APP_IP;

  const handleEmailChange = (event) => {
    const newEmail = event.target.value;
    setEmail(newEmail);

    // Expression régulière pour vérifier une adresse e-mail simple.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(newEmail);
    setIsValidEmail(isValid);
  };

  //verification for strong password
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });

  const handlePasswordChange = (event) => {
    const newPassword = event.target.value;
    setPassword(newPassword);

    // Utilisation de zxcvbn pour évaluer la force du mot de passe
    const result = zxcvbn(newPassword);
    setPasswordStrength({
      score: result.score,
      feedback: result.feedback.suggestions.join(" "),
    });
  };

  //toast notification
  const toast = useRef(null);
  const showSuccess = () => {
    toast.current.show({
      severity: "success",
      summary: "Création effectué",
      detail: "L'utilisateur peut maintenant se connecter",
      sticky: true,
    });
  };
  const showVoidText = () => {
    toast.current.show({
      severity: "warn",
      summary: "Vérifier vos champs de saisies",
      detail: "Certains de vos champs sont vides",
      life: 3000,
    });
  };

  const showError = () => {
    toast.current.show({
      severity: "error",
      summary: "Erreur",
      detail: "Erreur de création de l'utilisateur",
      life: 3000,
    });
  };

  
  const showExistant = () => {
    toast.current.show({
      severity: "error",
      summary: "Ustilisateur Existant",
      detail: "Certains des informations existent déjà notamment des noms d'utilisateurs des mails ou des numero de téléphone",
      life: 3000,
    });
  };


  //to send form data to the node js server
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    let nom = data.get("nom");
    let prenom = data.get("prenom");
    let username = data.get("username");
    let password = data.get("password");
    let mail = data.get("mail");
    let phone =data.get("telephone");

    if (
      nom === "" ||
      prenom === "" ||
      username === "" ||
      password === "" ||
      mail === ""
    ) {
      showVoidText();
    } else {
      const dataIns = {
        nom: nom,
        prenom: prenom,
        username: username,
        phone: formatPhoneNumber(phone),
        password: password,
        mail: mail,
      };

      const url = `${ip}create-prospectors`;
      const headers = { "Content-Type": "application/json" };

      try {
        const response = await axios.post(url, dataIns, { headers });

        if (response.status === 200) {
          console.log("Data sent successfully");
          showSuccess();
        } else {
          console.error("Failed to send data");
          showError();
        }
      } catch (error) {
        // console.error("Error sending data:", error);
        // console.error("Error response:", error.response);

        if (error.response && error.response.status === 409) {
          console.log("Conflict detected in catch block");
          showExistant();  
        } else if (error.response && error.response.status === 500) {
          console.error("Server error in catch block");
          showError();
        }
      }
    
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Création de compte
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="prenom"
                  required
                  fullWidth
                  id="prenom"
                  label="Prénom(s)"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="nom"
                  label="Nom"
                  name="nom"
                  autoComplete="family-name"
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <PhoneInput
                  placeholder="Numéro de téléphone"
                  fullWidth
                  defaultCountry="mg"
                  name='telephone'
                  countries={countries}
                  value={phone}
                  onChange={setPhone}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="mail"
                  label="Boîte mail"
                  name="mail"
                  autoComplete="mail"
                  value={email}
                  onChange={handleEmailChange}
                  error={!isValidEmail}
                  helperText={!isValidEmail ? "Adresse e-mail invalide" : ""}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Nom d'utilisateur"
                  name="username"
                  autoComplete="username"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Mot de Passe"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <div>
                  Force du mot de passe: {passwordStrength.score}/4
                  {passwordStrength.feedback && (
                    <div style={{ color: "red", fontSize: "0.8em" }}>
                      {passwordStrength.feedback}
                    </div>
                  )}
                </div>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Créer mon compte
            </Button>
            <Toast ref={toast} />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
