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
import api from "../../../service/api";

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

const getNovoServico = () => ({
  id: `temp-${Date.now()}`,
  servico: "",
  valor: 0,
  dataOrcamento: new Date().toISOString().split("T")[0],
  dataServico: "",
  formaPagamento: "N/A",
  desconto: 0.1
});

export default function ClienteFormModal({
  open,
  onClose,
  onSubmit,
  modoEdicao,
  clienteInicial,
}) {
  const [clienteData, setClienteData] = useState(getClienteInicial());
  const [historico, setHistorico] = useState([]);

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

    setHistorico(clienteInicial.historicoServicos || []);

  } else {
    setClienteData(getClienteInicial());
    setHistorico([]);
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

  const handleHistoricoChange = (index, fieldName, value) => {
    const novoHistorico = [...historico];
    if (!novoHistorico[index]) novoHistorico[index] = {};

    let finalValue = value;
    if (fieldName === "valor" || fieldName === "desconto") {
      finalValue = parseFloat(value) || 0;
    }

    novoHistorico[index] = { ...novoHistorico[index], [fieldName]: finalValue };
    setHistorico(novoHistorico);
  };

  const handleAddServico = () => {
    setHistorico([...historico, getNovoServico()]);
  };

  const handleRemoveServico = (index) => {
    const novoHistorico = historico.filter((_, i) => i !== index);
    setHistorico(novoHistorico);
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

    // se onSubmit retornou um token (string) — não é o cliente criado
    if (typeof createdCliente === "string") {
      // log para debugging e fallback para clienteInicial
      console.warn("onSubmit returned a string (possible token). Ignoring as createdCliente:", createdCliente);
      createdCliente = clienteInicial || null;
    }

    const clienteId = createdCliente?.id || clienteInicial?.id || undefined;

    if (historico && historico.length > 0) {
      const formatDecimal = (val) => {
        const n = parseFloat(val);
        return isNaN(n) ? "0.00" : n.toFixed(2);
      };

      const pedidosToPost = historico.map((h) => {
        const valor = formatDecimal(h.valor);
        return {
          valorTotal: valor,
          ativo: true,
          observacao: h.servico || h.observacao || "",
          formaPagamento: h.formaPagamento || "N/A",
          tipoPedido: null,
          cliente: clienteId ? { id: clienteId } : {
            nome: dadosCompletos.nome,
            cpf: dadosCompletos.cpf,
            email: dadosCompletos.email,
            telefone: dadosCompletos.telefone,
            status: dadosCompletos.status,
            enderecos: dadosCompletos.enderecos,
          },
          status: { nome: "PENDENTE", tipo: "AGENDAMENTO" },
          produtos: [],
          servico: {
            nome: h.servico || "",
            descricao: h.descricao || h.servico || "",
            precoBase: valor,
            ativo: true,
            etapa: { nome: h.etapaNome || "PENDENTE", tipo: "PEDIDO" },
          },
        };
      });

      console.log(pedidosToPost)

      try {
        for (const p of pedidosToPost) {
          const payload = JSON.parse(JSON.stringify(p));
          if (!payload) continue;
          console.log("Criando pedido com payload:", payload);

          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

          await api.post("/pedidos", payload, { headers });
        }
      } catch (err) {
        console.error("Erro ao criar pedidos:", err);
      }
    }

    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setClienteData(getClienteInicial());
      setHistorico([]);
    }, 300);
  };

  const opcoesPagamento = [
    { value: "N/A", label: "N/A" },
    { value: "Debito", label: "Débito" },
    { value: "Pix", label: "Pix" },
    { value: "Dinheiro", label: "Dinheiro" },
    { value: "Credito (1x)", label: "Crédito (1x)" },
    { value: "Credito (2x)", label: "Crédito (2x)" },
    { value: "Credito (3x)", label: "Crédito (3x)" },
  ];

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

            {clienteData.status !== "Ativo" && (
              <Box>
                <Typography variant="h6" mb={2}>
                  Histórico de serviços prestados
                </Typography>

                <Stack spacing={3}>
                  {historico.map((hist, index) => (
                    <Box
                      key={hist.id || index}
                      bgcolor="white"
                      p={3}
                      borderRadius={2}
                      border={1}
                      borderColor="grey.200"
                      position="relative"
                    >
                      <IconButton
                        aria-label="Deletar serviço"
                        onClick={() => handleRemoveServico(index)}
                        color="error"
                        sx={{ position: "absolute", top: 8, right: 8 }}
                      >
                        <DeleteOutline />
                      </IconButton>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label={`Serviço ${index + 1}`}
                            value={hist.servico || ""}
                            onChange={(e) =>
                              handleHistoricoChange(index, "servico", e.target.value)
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SettingsOutlined fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <TextField
                            fullWidth
                            label="Valor"
                            type="number"
                            value={hist.valor || ""}
                            onChange={(e) =>
                              handleHistoricoChange(index, "valor", e.target.value)
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MonetizationOnOutlined fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <TextField
                            fullWidth
                            label="Desconto (%)"
                            type="number"
                            value={hist.desconto || ""}
                            onChange={(e) =>
                              handleHistoricoChange(index, "desconto", e.target.value)
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PercentOutlined fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            select 
                            fullWidth
                            label="Forma de Pagamento"
                            value={hist.formaPagamento || "N/A"}
                            onChange={(e) =>
                              handleHistoricoChange(
                                index,
                                "formaPagamento",
                                e.target.value
                              )
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PaymentOutlined fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          >
                            {opcoesPagamento.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Data Orçamento"
                            type="date"
                            value={hist.dataOrcamento || ""}
                            onChange={(e) =>
                              handleHistoricoChange(
                                index,
                                "dataOrcamento",
                                e.target.value
                              )
                            }
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EventOutlined fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Data Serviço"
                            type="date"
                            value={hist.dataServico || ""}
                            onChange={(e) =>
                              handleHistoricoChange(
                                index,
                                "dataServico",
                                e.target.value
                              )
                            }
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EventOutlined fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}

                  <Box>
                    <Button
                      startIcon={<Add />}
                      onClick={handleAddServico}
                      variant="outlined"
                      size="medium"
                    >
                      Adicionar Serviço
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}
            
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