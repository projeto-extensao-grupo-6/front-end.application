import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";

export default function DeleteFuncionario({ open, setOpen, funcionario, deletarFuncionario }) {
  const [confirmNome, setConfirmNome] = useState("");

  useEffect(() => {
    setConfirmNome("");
  }, [open]);

  const handleDelete = () => {
    if (funcionario && confirmNome === funcionario.nome) {
      deletarFuncionario(funcionario.id);
      setOpen(false);
    } else {
      alert("O nome digitado não confere com o funcionário.");
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "20px" } }}>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <Typography mb={2}>Deseja realmente excluir este funcionário?</Typography>
        {funcionario && <Typography mb={1}>Nome: {funcionario.nome}</Typography>}
        <TextField
          fullWidth
          label="Digite o nome completo para confirmar"
          value={confirmNome}
          onChange={(e) => setConfirmNome(e.target.value)}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} variant="contained" color="error">
          Excluir
        </Button>
        <Button onClick={() => setOpen(false)}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
}
