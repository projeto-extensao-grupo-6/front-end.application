import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Check, X, Eye, EyeOff } from 'lucide-react'; 
import { TextField, Button, Paper, IconButton, InputAdornment } from "@mui/material";
import Api from "../../axios/Api"; 

const PasswordRequirement = ({ text, isValid }) => (
    <div className={`flex items-center gap-2 text-base transition-colors duration-200 font-[Inter] ${
        isValid ? 'text-green-700' : 'text-gray-700'
    }`}>
        {isValid ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-gray-500" />}
        <span>{text}</span>
    </div>
);

export default function NovaSenha() {
    const { idUsuario } = useParams();
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const [userName, setUserName] = useState("Carregando...");
    
    useEffect(() => {
        const loggedUserName = sessionStorage.getItem('nome'); 
        
        if (loggedUserName) {
            setUserName(loggedUserName);
        } else {
            setUserName("Usuário"); 
        }
    }, [idUsuario]);

    const [showPassword, setShowPassword] = useState(false); 

    // --- Dados e Cores ---
    const primaryDarkColor = "#003d6b";
    const inputBgColor = "#f5f8fa";

    // --- Lógica de Validação ---
    const is8Chars = novaSenha.length >= 8;
    const isUppercase = /[A-Z]/.test(novaSenha);
    const isNumber = /[0-9]/.test(novaSenha);
    const passwordsMatch = novaSenha === confirmaSenha && novaSenha.length > 0;

    const isFormValid = is8Chars && isUppercase && isNumber && passwordsMatch;

    const handleToggleShowPassword = () => {
        setShowPassword(prev => !prev);
    };

    // --- Handler de Submissão ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isFormValid) {
            setError('Verifique se todos os requisitos de senha foram atendidos e se as senhas coincidem.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await Api.put("/usuarios/definir-senha", {
                idUsuario: parseInt(idUsuario),
                novaSenha: novaSenha
            });

            if (response.status === 200 || response.status === 204) {
                setSuccess('Senha definida com sucesso! Redirecionando...');
                localStorage.setItem("firstLogin", "false");

                setTimeout(() => {
                    navigate('/paginaInicial');
                }, 1500);

            } else {
                const errorData = response.data;
                const errorMessage = errorData.message || 'Erro ao definir a senha. Tente novamente.';
                setError(errorMessage);
            }

        } catch (err) {
            console.error("Erro na API:", err);
            setError(err.response?.data?.message || 'Falha na comunicação com o servidor. Verifique sua conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-[Inter]">
            <Paper elevation={3} className="rounded-xl shadow-2xl p-10 w-full max-w-md mx-auto">
                <div className="flex flex-col items-center text-center">

                    <img
                        src="/src/assets/logo/logo-sidebar.png"
                        alt="Logo Léo Vidros"
                        className="w-32 mb-6"
                    />

                    <h2 className="text-xl font-normal text-gray-700 mb-2">Seja bem vindo</h2>
                    
                    <h1 className="text-3xl font-semibold text-gray-800 mb-8 w-full">
                        {userName}
                    </h1>
                    <p className="text-gray-600 mb-12 text-lg">
                        Defina sua senha para começar a utilizar o sistema
                    </p>

                    <form onSubmit={handleSubmit} className="w-full max-w-sm">

                        <div className="mb-8 text-left">
                            <label htmlFor="novaSenha" className="block text-gray-700 font-medium mb-3 text-base">Nova senha:</label>
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                id="novaSenha"
                                placeholder="********"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                required
                                size="medium"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px', 
                                        backgroundColor: inputBgColor,
                                        paddingLeft: '12px',
                                        '& fieldset': { border: 'none' },
                                        '&.Mui-focused': { boxShadow: '0 0 0 2px #007EA740' }, 
                                    },
                                   
                                    marginBottom: '20px' 
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <Lock className="w-6 h-6 mr-3 text-gray-500" />
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                // ✅ Ambos chamam a mesma função sem parâmetro
                                                onClick={handleToggleShowPassword}
                                                edge="end"
                                            >
                                                {/* ✅ Ambos checam o mesmo estado 'showPassword' */}
                                                {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>

                        <div className="mb-10 text-left">
                            <label htmlFor="confirmaSenha" className="block text-gray-700 font-medium mb-3 text-base">Digite a senha novamente:</label>
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                id="confirmaSenha"
                                placeholder="********"
                                value={confirmaSenha}
                                onChange={(e) => setConfirmaSenha(e.target.value)}
                                required
                                size="medium"
                                error={confirmaSenha.length > 0 && !passwordsMatch}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        backgroundColor: inputBgColor,
                                        paddingLeft: '12px',
                                        '& fieldset': { border: 'none' },
                                        '&.Mui-focused': { boxShadow: '0 0 0 2px #007EA740' },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <Lock className="w-6 h-6 mr-3 text-gray-500" />
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                // ✅ Ambos chamam a mesma função sem parâmetro
                                                onClick={handleToggleShowPassword}
                                                edge="end"
                                            >
                                                {/* ✅ Ambos checam o mesmo estado 'showPassword' */}
                                                {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>

                        <div className="flex flex-col items-start space-y-3 mb-10"> 
                            <PasswordRequirement text="Pelo menos 8 caracteres" isValid={is8Chars} />
                            <PasswordRequirement text="Pelo menos 1 letra maiúscula" isValid={isUppercase} />
                            <PasswordRequirement text="Pelo menos 1 número" isValid={isNumber} />
                            <PasswordRequirement text="As senhas coincidem" isValid={passwordsMatch} />
                        </div>

                        {success && (
                            <p className="text-green-600 text-sm mb-10 bg-green-100 p-3 rounded-lg border border-green-300 w-full text-center">
                                {success}
                            </p>
                        )}

                        {error && (
                            <p className="text-red-600 text-sm mb-10 bg-red-100 p-3 rounded-lg border border-red-300 w-full text-center">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={!isFormValid || isLoading}
                            sx={{
                                backgroundColor: primaryDarkColor,
                                '&:hover': { backgroundColor: '#002a4b' },
                                '&.Mui-disabled': {
                                    backgroundColor: '#002a4b', 
                                    color: '#ffffff'
                                },
                                padding: '16px 0', 
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                transition: 'all 0.3s',
                                fontFamily: 'Inter'
                            }}
                            className="mt-4" 
                        >
                            {isLoading ? 'Definindo Senha...' : 'Definir senha'}
                        </Button>
                    </form>
                </div>
            </Paper>
        </div>
    );
}