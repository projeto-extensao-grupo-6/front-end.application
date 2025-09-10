import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputText from "../../shared/components/inputs/inputText/inputText.component";
import AccountCircle from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../shared/components/buttons/button.component";
import "./cadastro.css";
import Login from "../login/login.jsx";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
// IMPORTS DO STEPPER
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { QontoConnector, QontoStepIcon } from "../../shared/components/steppers/QontoStepper.jsx";

function Cadastro() {
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [celular, setCelular] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const steps = ["Nome", "Email", "CPF", "Celular"]; // labels no stepper

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    if (step === 1 && !nome) return setError("Digite o nome");
    if (step === 2 && !email) return setError("Digite o email");
    if (step === 3 && !cpf) return setError("Digite o CPF");
    if (step === 4 && !celular) return setError("Digite o celular");

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleCadastro(e);
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/solicitacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, cpf, celular }),
      });

      if (!response.ok) throw new Error("Erro ao cadastrar");

      const data = await response.json();
      console.log(data);

      setModalOpen(true);

      setTimeout(() => {
        setModalOpen(false);
        window.location.href = "/Login";
      }, 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  const variants = {
    initial: { opacity: 0.3, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0.3, x: -50 },
  };

  return (
    <div className="main-container m-32">
      <div className="image"></div>
      <div className="form-container m-4">
        <div className="header-back">
          <span
            className="back-icon"
            onClick={() => window.location.href = "/Login"} // ou setMode("login") se estiver no mesmo container
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
            <span>Voltar para Login</span>
          </span>
        </div>
        <h1>Criar conta</h1>

        {/* STEPPER */}
        <Stepper
          alternativeLabel
          activeStep={step - 1}
          connector={<QontoConnector />}
          sx={{ mb: 4 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleNext} className="form">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <InputText
                  id="nome"
                  label="Nome"
                  value={nome}
                  placeholder={"Digite seu nome"}
                  onChange={(e) => setNome(e.target.value)}
                  icon={<AccountCircle />}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <InputText
                  id="email"
                  label="Email"
                  type="email"
                  placeholder={"Digite seu email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<EmailIcon />}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <InputText
                  id="cpf"
                  label="CPF"
                  value={cpf}
                  placeholder={"Digite seu CPF"}
                  onChange={(e) => setCpf(e.target.value)}
                  icon={<BadgeIcon />}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <InputText
                  id="celular"
                  label="Celular"
                  value={celular}
                  placeholder={"Digite seu celular"}
                  onChange={(e) => setCelular(e.target.value)}
                  icon={<PhoneIcon />}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p style={{ color: "red", margin: "4px" }}>{error}</p>}

          <div>
            <Button type="submit" variant="primary" size="md" class="mt-l2">
              {step < 4 ? "Próximo" : "Solicitar cadastro"}
            </Button>
            {step > 1 && (
              <a
                onClick={() => setStep(step - 1)}
                style={{ margin: "10px", cursor: "pointer" }}
                className="mx-2"
              >
                Voltar
              </a>
            )}
          </div>
        </form>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" component="h2">
            Cadastro realizado com sucesso!
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Aguarde a aprovação do administrador.
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}

export default Cadastro;
