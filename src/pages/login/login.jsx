import React, { useState } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import AccountCircle from "@mui/icons-material/AccountCircle";
  import LockIcon from "@mui/icons-material/Lock";
  import Button from "../../shared/components/buttons/button.component";
  import { useNavigate } from "react-router-dom"

  function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleLogin = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });

      console.log(response)

        if (!response.ok) throw new Error("Email ou senha inválidos");

        const data = await response.json();
        const { id, token, firstLogin, nome, email: userEmail} = data;
        console.log("Login OK:", data);

        sessionStorage.setItem("accessToken", token); 
        sessionStorage.setItem("userId", id);
        sessionStorage.setItem("userFirstLogin", String(firstLogin));
        sessionStorage.setItem("loggedUserName", nome);
        sessionStorage.setItem("loggedUserEmail", userEmail);
        sessionStorage.setItem("nome", nome); // Para compatibilidade com novaSenha.jsx

        setModalOpen(true);

        const redirectPath = firstLogin 
          ? `/primeiroAcesso/${id}` 
          : "/paginaInicial";

      setTimeout(() => {
        setModalOpen(false);
        
        // Verificar se é primeiro login para redirecionar para nova senha
        if (data.firstLogin === true || data.firstLogin === "true") {
          navigate(`/primeiroAcesso/${data.id}`);
        } else {
          navigate("/paginaInicial");
        }
      }, 2000);
  
    } catch (error) {
      setError(error.response?.data?.message || "Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };
  

    const variants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    };

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#ffffff] to-[#f3f4f6] p-4">
        <div className="w-full max-w-6xl flex items-center justify-center gap-12">
          {/* Imagem lateral */}
          <div
            className="hidden lg:flex flex-1 h-[600px] rounded-xl bg-cover bg-center shadow-lg"
            style={{
              backgroundImage:
                'url("/src/assets/images/premium_photo-1672287579489-4e92e57de92a.jpeg")',
            }}
          />

          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md backdrop-blur-sm p-8 rounded-xl"
          >
            <div className="flex flex-col gap-6">
              <div className="mb-10 text-center flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-[#111827] mb-2">
                  Entre na sua conta
                </h1>
                <p className="text-[#6b7280] text-sm">
                  Faça login para continuar
                </p>
              </div>

              {/* Formulário */}
              <form onSubmit={handleLogin} className="space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="login"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-[#6b7280] text-left"
                      >
                        Email
                      </label>
                      <div className="flex items-center gap-3 border-b-2 border-[#8a8e97] bg-transparent focus-within:border-[#007EA7] transition-all py-3">
                        <AccountCircle className="text-[#6b7280] text-3xl" />
                        <input
                          id="email"
                          type="email"
                          placeholder="Digite seu email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent text-[#111827] placeholder-[#9ca3af] focus:outline-none text-lg py-3"
                        />
                      </div>
                    </div>

                    {/* Senha */}
                    <div className="space-y-3">
                      <label
                        htmlFor="senha"
                        className="block text-sm font-medium text-[#6b7280] text-left"
                      >
                        Senha
                      </label>
                      <div className="flex items-center gap-3 border-b-2 border-[#8a8e97] bg-transparent focus-within:border-[#007EA7] transition-all py-3">
                        <LockIcon className="text-[#6b7280] text-3xl" />
                        <input
                          id="senha"
                          type="password"
                          placeholder="Digite sua senha"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          className="w-full bg-transparent text-[#111827] placeholder-[#9ca3af] focus:outline-none text-lg py-3"
                        />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Mensagem de erro */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Esqueceu senha */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-[#007EA7] hover:text-[#005f73] transition"
                    onClick={() => navigate("/esqueceuSenha")}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>

                {/* Botão */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="w-full bg-[#007EA7] hover:bg-[#005f73] text-white font-medium py-4 rounded-lg transition-colors"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </form>

              {/* Divisor */}
              <div className="my-8">
                <div className="h-px bg-black w-full" />
              </div>

              {/* Cadastro link */}
              <div className="text-center">
                <p className="text-sm text-[#6b7280]">
                  Ainda não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/cadastro")}
                    className="text-[#007EA7] hover:text-[#005f73] font-medium transition-colors"
                  >
                    Cadastre-se
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#111827] mb-2">
                  Login realizado com sucesso!
                </h2>
                <p className="text-[#6b7280]">Redirecionando...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  export default Login;