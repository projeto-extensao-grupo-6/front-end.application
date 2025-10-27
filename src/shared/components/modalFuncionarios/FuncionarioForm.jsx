import React, { useState, useEffect, forwardRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  MenuItem,
  Avatar,
  Box,
  Typography,
} from "@mui/material";
import { Person } from "@mui/icons-material";
import { IMaskInput } from "react-imask";

const TextMaskCustom = forwardRef(function TextMaskCustom(props, ref) {
  const { onAccept, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(00) 00000-0000"
      inputRef={ref}
      onAccept={onAccept}
      overwrite
    />
  );
});

export default function FuncionarioForm({ open, setOpen, modoEdicao, funcionario, salvarFuncionario }) {
  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: "",
    telefone: "",
    funcao: "",
    escala: "",
    contrato: "Registrado",
    status: true,
  });

  useEffect(() => {
    if (modoEdicao && funcionario) {
      setNovoFuncionario({
        nome: funcionario.nome,
        telefone: funcionario.telefone,
        funcao: funcionario.funcao,
        escala: funcionario.escala,
        contrato: funcionario.contrato,
        status: funcionario.status === "Ativo",
      });
    } else {
      setNovoFuncionario({
        nome: "",
        telefone: "",
        funcao: "",
        escala: "",
        contrato: "Registrado",
        status: true,
      });
    }
  }, [modoEdicao, funcionario, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoFuncionario((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = () => {
    setNovoFuncionario((prev) => ({ ...prev, status: !prev.status }));
  };

  const handleSalvar = () => {
    if (!novoFuncionario.nome.trim()) return alert("Digite o nome do funcionário.");
    salvarFuncionario({ ...novoFuncionario, status: novoFuncionario.status ? "Ativo" : "Pausado" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "20px" } }}>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "#007EA7" }}>
            <Person />
          </Avatar>
          <Typography variant="h6">{modoEdicao ? "Editar Funcionário" : "Novo Funcionário"}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <FormControlLabel
          control={<Switch checked={novoFuncionario.status} onChange={handleStatusChange} color="primary" />}
          label="Status do Contrato"
        />

        <TextField
          fullWidth
          label="Nome"
          placeholder="Ex: João Silva"
          name="nome"
          value={novoFuncionario.nome}
          onChange={handleChange}
          margin="dense"
        />

        <TextField
          fullWidth
          label="Telefone"
          placeholder="Ex: (11) 12345-6789"
          margin="dense"
          value={novoFuncionario.telefone}
          onChange={() => {}}
          InputProps={{
            inputComponent: TextMaskCustom,
            inputProps: {
              value: novoFuncionario.telefone,
              onAccept: (val) => setNovoFuncionario((prev) => ({ ...prev, telefone: val })),
            },
          }}
        />

        <Box display="flex" gap={2}>
          <TextField
            select
            fullWidth
            label="Tipo de contrato"
            name="contrato"
            value={novoFuncionario.contrato}
            onChange={handleChange}
            margin="dense"
          >
            <MenuItem value="Registrado">Registrado</MenuItem>
            <MenuItem value="Fixo">Fixo</MenuItem>
            <MenuItem value="Temporário">Temporário</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Função"
            placeholder="Ex: Cozinheiro"
            name="funcao"
            value={novoFuncionario.funcao}
            onChange={handleChange}
            margin="dense"
          />
        </Box>

        <TextField
          fullWidth
          label="Escala"
          placeholder="Ex: 6x1 - 08h00 às 17h00"
          name="escala"
          value={novoFuncionario.escala}
          onChange={handleChange}
          margin="dense"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSalvar} variant="contained" sx={{ backgroundColor: "#007EA7", "&:hover": { backgroundColor: "#00698A" } }}>
          {modoEdicao ? "Salvar Alterações" : "Salvar Funcionário"}
        </Button>
        <Button onClick={() => setOpen(false)}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
}
