import React, { useState } from "react";

function cadastro(){
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [error, setError] = useState("");

  const handleCadastro = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/solicitacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, cpf })
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar");
      }

      const data = await response.json();
      console.log(data);
      window.location.href = "/FlowController";
    }catch(error){
      setError(error.message);
    }
  }
  return (
    <div>
      <h1>Cadastro</h1>
      <form onSubmit={handleCadastro}>
        <div>
          <label>Nome:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>CPF:</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  )
}

export default cadastro;
