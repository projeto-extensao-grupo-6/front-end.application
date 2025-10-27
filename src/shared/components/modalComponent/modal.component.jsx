import * as React from 'react';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export default function ApprovalPendingModal({ open, onClose }) {

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="approval-modal-title"
      aria-describedby="approval-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={(theme) => ({
          position: 'relative',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: theme.shadows[5],
          p: 4,
          textAlign: 'center',
        })}
      >
        <Typography id="approval-modal-title" variant="h6" component="h2" fontWeight="bold">
          Cadastro enviado!
        </Typography>

        <Typography id="approval-modal-description" sx={{ mt: 2 }}>
          Seu cadastro foi realizado com sucesso.  
          Agora aguarde a aprovação do administrador para acessar o sistema.
        </Typography>

        <Button 
          onClick={onClose} 
          variant="contained" 
          sx={{ mt: 3 }}
        >
          Fechar
        </Button>
      </Box>
    </Modal>
  );
}
