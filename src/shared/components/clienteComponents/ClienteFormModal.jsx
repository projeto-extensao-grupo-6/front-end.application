import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
  InputAdornment,
  Typography,
  Divider,
  Box,
  Stack,
  Grid,
  MenuItem, 
} from "@mui/material";
import {
  PersonOutline,
  PhoneOutlined,
  EmailOutlined,
  HomeOutlined,
  DeleteOutline,
  SettingsOutlined,
  Add,
  BusinessOutlined,
  MapOutlined,
  MonetizationOnOutlined,
  EventOutlined,
  PaymentOutlined,
  PercentOutlined,
  BadgeOutlined,
} from "@mui/icons-material";

import { IMaskInput } from "react-imask";
import PropTypes from "prop-types";
import api from "../../../axios/Api";

const TextMaskAdapter = React.forwardRef(function TextMaskAdapter(
  props,
  ref
) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(00) 00000-0000"
      definitions={{
        "#": /[1-9]/,
      }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

TextMaskAdapter.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const CpfMaskAdapter = React.forwardRef(function CpfMaskAdapter(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000000000"
      radix="."
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const CepMaskAdapter = React.forwardRef(function CepMaskAdapter(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000000"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

CpfMaskAdapter.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

CepMaskAdapter.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const getClienteInicial = () => ({
  nome: "",
  contato: "",
  email: "",
  endereco: "",
  status: "Inativo",
  historicoServicos: [],
  cidade: "",
  uf: "",
});


export default function ClienteFormModal({
  open,
  onClose,
  onSubmit,
  modoEdicao,
  clienteInicial,
}) {
  const [clienteData, setClienteData] = useState(getClienteInicial());

useEffect(() => {
  if (modoEdicao && clienteInicial) {

    const endereco = clienteInicial.enderecos?.[0] || {};

    setClienteData({
      ...getClienteInicial(),

      nome: clienteInicial.nome,
      contato: clienteInicial.telefone,
      email: clienteInicial.email,
      cpf: clienteInicial.cpf,
      status: clienteInicial.status,
      rua: endereco.rua,
      complemento: endereco.complemento,
      cep: endereco.cep,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      uf: endereco.uf,
      endereco: endereco.rua,
    });


  } else {
    setClienteData(getClienteInicial());
  }
}, [open, modoEdicao, clienteInicial]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setClienteData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    setClienteData((prev) => ({
      ...prev,
      status: e.target.checked ? "Ativo" : "Inativo",
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const dadosCompletos = {
      nome: clienteData.nome,
      cpf: clienteData.cpf ? clienteData.cpf.replace(/\D/g, "") : undefined,
      email: clienteData.email,
      telefone: clienteData.contato ? clienteData.contato.replace(/\D/g, "") : undefined,
      status: clienteData.status,
      enderecos: [
        {
          rua: clienteData.rua,
          complemento: clienteData.complemento || "",
          cep: clienteData.cep ? clienteData.cep.replace(/\D/g, "") : "",
          cidade: clienteData.cidade,
          bairro: clienteData.bairro,
          uf: clienteData.uf,
          pais: "Brasil",
          numero: clienteData.numero || undefined,
        },
      ],
    };

    let createdCliente = null;
    try {
      const maybePromise = onSubmit(dadosCompletos);
      if (maybePromise && typeof maybePromise.then === "function") {
        createdCliente = await maybePromise;
      } else {
        createdCliente = maybePromise || clienteInicial || null;
      }
    } catch (err) {
      createdCliente = clienteInicial || null;
    }

    if (typeof createdCliente === "string") {
      console.warn("onSubmit returned a string (possible token). Ignoring as createdCliente:", createdCliente);
      createdCliente = clienteInicial || null;
    }

  }

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setClienteData(getClienteInicial());
    }, 300);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            bgcolor="grey.100"
            borderRadius="8px"
            p={1}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
          >
            <PersonOutline color="action" />
          </Box>
          <Typography variant="h6" component="div">
            {modoEdicao ? "Editar Cliente" : "Adicionar novo cliente"}
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, bgcolor: "grey.50" }}>
          <Stack spacing={3}>
            <Box bgcolor="white" p={3} borderRadius={2} border={1} borderColor="grey.200">
              <Stack spacing={3}>
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                  <TextField
                    required
                    label="Nome do cliente"
                    name="nome"
                    placeholder="Ex: Tiago Mendes" 
                    value={clienteData.nome}
                    onChange={handleChange}
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline fontSize="small" /></InputAdornment> }}
                  />
                  
                  <TextField
                    required
                    label="CPF"
                    name="cpf"
                    placeholder="Ex: 12345678900"
                    value={clienteData.cpf || ""}
                    onChange={handleChange}
                    InputProps={{
                      inputComponent: CpfMaskAdapter,
                    }}
                  />

                  <TextField
                    required
                    label="Telefone"
                    name="contato"
                    placeholder="Ex: (11) 91234-5678"
                    value={clienteData.contato}
                    onChange={handleChange}
                    InputProps={{
                      inputComponent: TextMaskAdapter,
                      startAdornment: <InputAdornment position="start"><PhoneOutlined fontSize="small" /></InputAdornment>,
                    }}
                  />

                  <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Ex: tiago.mendes@email.com" 
                  value={clienteData.email}
                  onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined fontSize="small" /></InputAdornment> }}
                />

                </Box>

                <TextField
                  fullWidth
                  label="Endereço"
                  name="endereco"
                  placeholder="Ex: Rua das Flores, 123" 
                  value={clienteData.endereco}
                  onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><HomeOutlined fontSize="small" /></InputAdornment> }}
                />

                <Box display="grid" gridTemplateColumns="2fr 1fr" gap={2}>
                  <TextField
                    label="Cidade"
                    name="cidade"
                    placeholder="Ex: São Paulo"
                    value={clienteData.cidade}
                    onChange={handleChange}
                    InputProps={{ startAdornment: <InputAdornment position="start"><BusinessOutlined fontSize="small" /></InputAdornment> }}
                  />
                  
                  <TextField
                    required
                    label="CEP"
                    name="cep"
                    placeholder="Ex: 80035010"
                    value={clienteData.cep || ""}
                    onChange={handleChange}
                    InputProps={{
                      inputComponent: CepMaskAdapter,
                    }}
                  />

                  <TextField
                    label="UF"
                    name="uf"
                    placeholder="Ex: SP" 
                    value={clienteData.uf}
                    onChange={handleChange}
                    InputProps={{ startAdornment: <InputAdornment position="start"><MapOutlined fontSize="small" /></InputAdornment> }}
                  />

                  <TextField
                    required
                    label="Rua"
                    name="rua"
                    placeholder="Ex: Rua das Flores"
                    value={clienteData.rua || ""}
                    onChange={handleChange}
                  />

                  <TextField
                    label="Complemento"
                    name="complemento"
                    placeholder="Ex: Bloco B, apto 13"
                    value={clienteData.complemento || ""}
                    onChange={handleChange}
                  />

                  <TextField
                    required
                    label="Bairro"
                    name="bairro"
                    placeholder="Ex: Centro"
                    value={clienteData.bairro || ""}
                    onChange={handleChange}
                  />  

                </Box>

                <FormControlLabel
                  control={<Switch checked={clienteData.status === "Ativo"} onChange={handleSwitchChange} color="primary" />}
                  label="Possui serviço em andamento (Status: Ativo)"
                />
              </Stack>
            </Box>
            
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: "space-between", bgcolor: "white" }}>
          <Button onClick={handleClose} variant="outlined" color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" className="bg-[#007EA7]">
            {modoEdicao ? "Salvar Alterações" : "Criar Cliente"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}