import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Input from "../../shared/components/Ui/Input.jsx";
import AccountCircle from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { QontoConnector, QontoStepIcon } from "../../shared/components/steppers/QontoStepper.jsx";
import Button from "../../shared/components/buttons/button.component";
import Api from "../../axios/Api";

function Cadastro() {
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const steps = ["Nome", "Email", "CPF", "Telefone"];

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(value);
  };

  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(value);
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    if (step === 1 && !nome) return setError("Digite o nome");
    if (step === 2 && !email) return setError("Digite o email");

    if (step === 3) {
      const cpfNumbers = cpf.replace(/\D/g, "");
      if (!cpfNumbers || cpfNumbers.length !== 11) return setError("Digite um CPF válido");
    }

    if (step === 4) {
      const telefoneNumbers = telefone.replace(/\D/g, "");
      if (!telefoneNumbers || telefoneNumbers.length !== 11) return setError("Digite um telefone válido");
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleCadastro(e);
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const dadosCadastro = {
        nome,
        cpf: cpf.replace(/[^\d]/g, ""),
        telefone: telefone.replace(/[^\d]/g, ""),
        email,
      };

      const response = await Api.post("/solicitacoes", dadosCadastro);

      console.log("Cadastro OK:", response.data);

      setModalOpen(true);

      setTimeout(() => {
        setModalOpen(false);
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      setError(error.response?.data?.message || "Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#ffffff] to-[#f3f4f6] p-4">
      <div className="w-full max-w-6xl flex items-center justify-center gap-12">
        <div
          className="hidden lg:flex flex-1 h-[600px] rounded-xl bg-cover bg-center shadow-lg"
          style={{ backgroundImage: 'url("/src/assets/images/premium_photo-1672287579489-4e92e57de92a.jpeg")' }}
        />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 rounded-xl"
        >
          <div className="flex flex-col gap-6">
            <div className="mb-10 text-center flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-[#111827] mb-2">Criar conta</h1>
              <p className="text-[#6b7280] text-sm">Preencha os dados para criar sua conta</p>
            </div>

            <div className="mb-10">
              <Stepper alternativeLabel activeStep={step - 1} connector={<QontoConnector />}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </div>

            <form onSubmit={handleNext} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }} className="space-y-3">
                    <label className="block text-sm font-medium text-[#6b7280] text-left">Nome</label>
                    <div className="flex items-center gap-3 border-b-2 border-[#8a8e97] bg-transparent focus-within:border-[#007EA7] transition-all py-3">
                      <AccountCircle className="text-[#6b7280] text-3xl" />
                      <input
                        type="text"
                        placeholder="Digite seu nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full bg-transparent text-[#111827] placeholder-[#9ca3af] focus:outline-none text-lg py-3"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }} className="space-y-3">
                    <label className="block text-sm font-medium text-[#6b7280] text-left">Email</label>
                    <div className="flex items-center gap-3 border-b-2 border-[#8a8e97] bg-transparent focus-within:border-[#007EA7] transition-all py-3">
                      <EmailIcon className="text-[#6b7280] text-3xl" />
                      <input
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-[#111827] placeholder-[#9ca3af] focus:outline-none text-lg py-3"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }} className="space-y-3">
                    <label className="block text-sm font-medium text-[#6b7280] text-left">CPF</label>
                    <div className="flex items-center gap-3 border-b-2 border-[#8a8e97] bg-transparent focus-within:border-[#007EA7] transition-all py-3">
                      <BadgeIcon className="text-[#6b7280] text-3xl" />
                      <input
                        type="text"
                        placeholder="Digite seu CPF"
                        value={cpf}
                        onChange={handleCpfChange}
                        className="w-full bg-transparent text-[#111827] placeholder-[#9ca3af] focus:outline-none text-lg py-3"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }} className="space-y-3">
                    <label className="block text-sm font-medium text-[#6b7280] text-left">Telefone</label>
                    <div className="flex items-center gap-3 border-b-2 border-[#8a8e97] bg-transparent focus-within:border-[#007EA7] transition-all py-3">
                      <PhoneIcon className="text-[#6b7280] text-3xl" />
                      <input
                        type="text"
                        placeholder="Digite seu telefone"
                        value={telefone}
                        onChange={handleTelefoneChange}
                        className="w-full bg-transparent text-[#111827] placeholder-[#9ca3af] focus:outline-none text-lg py-3"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 items-center justify-center pt-4">
                <Button type="submit" variant="primary" size="lg" disabled={loading} className="flex-1 bg-[#007EA7] text-white font-medium py-4 rounded-lg max-w-sm">
                  {loading ? "Processando..." : step < 4 ? "Próximo" : "Solicitar cadastro"}
                </Button>
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-4 text-[#007EA7] hover:bg-[#f0f0f0] rounded-lg transition-colors font-medium">
                    Voltar
                  </button>
                )}
              </div>
            </form>

            <div className="my-8">
              <div className="h-px bg-black w-full" />
            </div>

            <div className="text-center">
              <button type="button" onClick={() => (window.location.href = "/login")} className="text-black hover:text-[#333333] transition-colors text-sm">
                Já tem conta? Voltar para Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#111827] mb-2">Cadastro realizado com sucesso!</h2>
              <p className="text-[#6b7280]">Aguarde a aprovação do administrador.</p>
              <p className="text-sm text-[#9ca3af] mt-4">Redirecionando...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cadastro;
