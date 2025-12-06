import React, { useState, useEffect, useRef } from 'react';
import Api from '../../axios/Api';
import { User, MapPin, Lock, Save, Edit2, Camera, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '../../shared/components/sidebar/sidebar';
import Header from '../../shared/components/header/header';
import UserImg from '../../assets/User.png'; 

// Componente InputField (mantido inalterado)
const InputField = ({ label, name, value, onChange, type = "text", disabled = false, className = "", showPasswordToggle = false, onTogglePassword, showPassword }) => (
    <div className={`flex flex-col ${className}`}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
        </label>
        <div className="relative">
            <input
                type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full border rounded-lg px-4 py-3 text-gray-800 text-base transition-all duration-200 outline-none ${disabled
                    ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white border-gray-300 focus:border-[#003d6b] focus:ring-2 focus:ring-blue-100"
                    } ${showPasswordToggle ? "pr-10" : ""}`}
            />
            {disabled && !showPasswordToggle && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                </div>
            )}
            {showPasswordToggle && !disabled && (
                <button
                    type="button"
                    onClick={onTogglePassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            )}
        </div>
    </div>
);

export default function Perfil() {
    // ... Estados e Props (Mantidos inalterados)
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        nome: "",
        cpf: "",
        cargo: "",
        email: "",
        telefone: "",
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
        rua: "",
        cep: "",
        bairro: "",
        cidade: "",
        numero: "",
        estado: "",
        pais: "",
        complemento: ""
    });
    
    // NOVOS ESTADOS E REFS PARA FOTO DE PERFIL
    const [userPhoto, setUserPhoto] = useState(UserImg); // Inicializa com a imagem padrão
    const fileInputRef = useRef(null); // Referência para o input de arquivo

    // FUNÇÕES DE UPLOAD DE FOTO (MODIFICADAS)
    
    // 1. Aciona o clique no input file escondido
    const handlePhotoClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // 2. Lida com a seleção do arquivo
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            previewProfilePhoto(file);
        }
        event.target.value = null; 
    };

    const previewProfilePhoto = (file) => {
        setLoading(true);
        setMessage({ type: '', text: 'Pré-visualizando foto de perfil...' });

        const reader = new FileReader();

        reader.onloadend = () => {
            const base64Url = reader.result;
            // Define a userPhoto como a URL base64 do arquivo
            localStorage.setItem('leoVidros_userPhoto', base64Url);
            setUserPhoto(base64Url); 
            setMessage({ type: 'success', text: 'Pré-visualização da foto carregada!' });
            setLoading(false);
        };

        reader.onerror = () => {
            setMessage({ type: 'error', text: 'Erro ao ler o arquivo de imagem.' });
            setLoading(false);
        };
        
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');

        if (!userId) {
            console.error("ID do usuário não encontrado no sessionStorage.");
            return;
        }

        const localPhoto = localStorage.getItem('leoVidros_userPhoto');
         if (localPhoto) {
            setUserPhoto(localPhoto);
        }

        setLoading(true);
        Api.get(`/usuarios/${userId}`)
            .then(response => {
                const userData = response.data.usuario || response.data.data || response.data;
                const endereco = userData.endereco || {};

                if (!localPhoto) {
                    if (userData.fotoUrl) {
                        setUserPhoto(userData.fotoUrl);
                    } else {
                        setUserPhoto(UserImg);
                    }
                }
                // *****************************************

                setFormData({
                    nome: userData.nome || "",
                    cpf: userData.cpf || "",
                    email: userData.email || "",
                    telefone: userData.telefone || "",
                    cargo: "Gerente Administrativo",
                    
                    rua: endereco.rua || endereco.logradouro || "",
                    cep: endereco.cep || "",
                    bairro: endereco.bairro || "",
                    cidade: endereco.cidade || "",
                    numero: endereco.numero || "",
                    estado: endereco.uf || endereco.estado || "",
                    pais: endereco.pais || "Brasil",
                    complemento: endereco.complemento || "",

                    senhaAtual: "",
                    novaSenha: "",
                    confirmarSenha: ""
                });
            })
            .catch(error => {
                console.error("ERRO AO CARREGAR PERFIL");
                console.error("Erro:", error);
            })
            .finally(() => {
                setLoading(false);
            });

    }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validatePasswordChange = () => {
        if (!formData.senhaAtual) {
            setMessage({ type: 'error', text: 'Digite sua senha atual.' });
            return false;
        }
        
        if (!formData.novaSenha) {
            setMessage({ type: 'error', text: 'Digite a nova senha.' });
            return false;
        }
        
        if (formData.novaSenha.length < 6) {
            setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
            return false;
        }
        
        if (formData.novaSenha !== formData.confirmarSenha) {
            setMessage({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
            return false;
        }
        
        return true;
    };

    const handleSave = () => {
        const userId = sessionStorage.getItem('userId');

        if (!userId) {
            setMessage({ type: 'error', text: 'Não é possível salvar: usuário não autenticado.' });
            return;
        }

        if (isChangingPassword && !validatePasswordChange()) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const enderecoRequest = {
            rua: formData.rua,
            cep: formData.cep,
            cidade: formData.cidade,
            bairro: formData.bairro,
            uf: formData.estado,
            numero: formData.numero,
            complemento: formData.complemento,
            pais: formData.pais,
        };

        const usuarioRequest = {
            nome: formData.nome,
            email: formData.email,
            cpf: formData.cpf,
            telefone: formData.telefone,
            endereco: enderecoRequest
        };

        Api.put(`/usuarios/${userId}`, usuarioRequest)
            .then(response => {
                console.log('Salvo com sucesso!', response.data);
                setMessage({ 
                    type: 'success', 
                    text: isChangingPassword ? 'Perfil e senha atualizados com sucesso!' : 'Perfil atualizado com sucesso!' 
                });
                setIsEditing(false);
                setIsChangingPassword(false);

                return Api.get(`/usuarios/${userId}`);
            })
            .then(response => {
                const userData = response.data.usuario || response.data.data || response.data;
                const endereco = userData.endereco || {};
                
                if (userData.fotoUrl) {
                    setUserPhoto(userData.fotoUrl);
                }

                setFormData({
                    nome: userData.nome || "",
                    cpf: userData.cpf || "",
                    email: userData.email || "",
                    telefone: userData.telefone || "",
                    cargo: "Gerente Administrativo",
                    rua: endereco.rua || "",
                    cep: endereco.cep || "",
                    bairro: endereco.bairro || "",
                    cidade: endereco.cidade || "",
                    numero: endereco.numero || "",
                    estado: endereco.uf || endereco.estado || "",
                    pais: endereco.pais || "Brasil",
                    complemento: endereco.complemento || ""
                });
            })
            .catch(error => {
                console.error("Erro ao salvar:", error);
                console.error("Detalhes:", error.response?.data);
                alert('Erro ao salvar as informações. Verifique o console.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const toggleEdit = () => {
        if (isEditing) {
            handleSave();
        } else {
            setIsEditing(true);
            setMessage({ type: '', text: '' });
        }
    };

    const MessageAlert = ({ message }) => {
        if (!message.text) return null;
        
        return (
            <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                message.type === 'error' 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
                {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                <span>{message.text}</span>
            </div>
        );
    };


    return (
        <div className="flex h-screen font-sans overflow-hidden">
            {/* INPUT DE ARQUIVO ESCONDIDO - Adicionado */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col">
                <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

                <main className="flex-1 overflow-hidden">
                    <div className="h-full pt-15">
                        <div className="bg-white h-full border-t border-gray-200">
                            <div className="flex flex-col lg:flex-row h-full">

                                <div className="lg:w-80 bg-[#003249] text-white p-8 pt-16 flex flex-col border-r border-gray-700">
                                    <h2 className="text-lg font-medium text-gray-300 mb-8 pb-4">
                                        Informações do Perfil
                                    </h2>

                                    {/* BLOCO DA FOTO - Modificado */}
                                    <div className="flex flex-col items-center mb-10">
                                        <div className="relative group mb-4">
                                            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
                                                <img
                                                    // ** Usa a URL da foto do estado **
                                                    src={userPhoto}
                                                    alt="Foto de perfil"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {/* ** Conecta o onClick ao handler de foto ** */}
                                            <button 
                                                onClick={handlePhotoClick}
                                                disabled={loading} // Desabilita o botão enquanto o preview está em andamento
                                                className="absolute bottom-0 right-0 bg-[#003d6b] border-2 border-white p-2 rounded-full hover:bg-blue-800 transition cursor-pointer"
                                            >
                                                <Camera size={16} />
                                            </button>
                                        </div>
                                        <div className='flex flex-col mb-10 py-6'>
                                            <h3 className="text-xl font-semibold mb-1">{formData.nome}</h3>
                                            <p className="text-sm text-gray-400">{formData.cargo}</p>
                                        </div>
                                    </div>
                                    {/* Fim do Bloco da Foto */}

                                    <nav className="space-y-3">
                                        <button
                                            onClick={() => { setActiveTab('personal'); setIsEditing(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all ${activeTab === 'personal'
                                                ? 'bg-cyan-500/20 text-white border-l-4 border-cyan-400 shadow-lg'
                                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <User size={20} />
                                            <span className="font-medium">Dados Pessoais</span>
                                        </button>

                                        <button
                                            onClick={() => { setActiveTab('address'); setIsEditing(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all ${activeTab === 'address'
                                                ? 'bg-cyan-500/20 text-white border-l-4 border-cyan-400 shadow-lg'
                                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <MapPin size={20} />
                                            <span className="font-medium">Dados de Endereço</span>
                                        </button>
                                    </nav>
                                </div>

                                <div className="flex-1 p-8 lg:p-12 overflow-y-auto h-full">
                                    <div className="w-full h-full">

                                        <div className="mb-10">
                                            <h1 className="text-3xl font-bold text-gray-800 mb-2 py-1">
                                                {activeTab === 'personal' ? 'Dados Pessoais' : 'Dados de Endereço'}
                                            </h1>
                                            <p className="text-gray-600">
                                                {activeTab === 'personal'
                                                    ? 'Atualize suas informações de forma rápida e segura.'
                                                    : 'Mantenha seu endereço atualizado para correspondências.'}
                                            </p>
                                        </div>

                                        <MessageAlert message={message} />

                                        {loading && (
                                            <div className="text-center py-4">
                                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007EA7]"></div>
                                                <p className="text-gray-600 mt-2">Carregando...</p>
                                            </div>
                                        )}
                                        {/* ABA DE DADOS PESSOAIS */}
                                        <div className="space-y-2">
                                            {activeTab === 'personal' ? (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
                                                    <InputField
                                                        label="Nome"
                                                        name="nome"
                                                        value={formData.nome}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="lg:col-span-2 text-start py-3"
                                                    />

                                                    <InputField
                                                        label="CPF"
                                                        name="cpf"
                                                        value={formData.cpf}
                                                        onChange={handleInputChange}
                                                        disabled={true}
                                                        className="text-start"
                                                    />

                                                    <InputField
                                                        label="Cargo"
                                                        name="cargo"
                                                        value={formData.cargo}
                                                        onChange={handleInputChange}
                                                        disabled={true}
                                                        className="text-start"
                                                    />

                                                    <InputField
                                                        label="E-mail"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="text-start"
                                                    />

                                                    <InputField
                                                        label="Telefone"
                                                        name="telefone"
                                                        value={formData.telefone}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="text-start"
                                                    />

                                                    <div className="lg:col-span-2 pt-6 border-t border-gray-200">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="text-lg font-semibold text-gray-800">Segurança da Conta</h3>
                                                            {isEditing && !isChangingPassword && (
                                                                <button
                                                                    onClick={() => setIsChangingPassword(true)}
                                                                    className="text-sm text-[#0085cc] hover:text-[#006fa8] font-semibold cursor-pointer"
                                                                >
                                                                    Alterar senha
                                                                </button>
                                                            )}
                                                        </div>

                                                        {isChangingPassword && isEditing ? (
                                                            <div className="flex flex-col gap-1 space-y-2 bg-gray-50 p-6 rounded-lg border border-gray-200">
                                                                <InputField
                                                                    label="Senha Atual"
                                                                    name="senhaAtual"
                                                                    value={formData.senhaAtual}
                                                                    onChange={handleInputChange}
                                                                    disabled={false}
                                                                    showPasswordToggle={true}
                                                                    showPassword={showCurrentPassword}
                                                                    onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                    className='text-start gap-2'
                                                                />

                                                                <InputField
                                                                    label="Nova Senha"
                                                                    name="novaSenha"
                                                                    value={formData.novaSenha}
                                                                    onChange={handleInputChange}
                                                                    disabled={false}
                                                                    showPasswordToggle={true}
                                                                    showPassword={showNewPassword}
                                                                    onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                                                                    className='text-start gap-2'
                                                                />

                                                                <InputField
                                                                    label="Confirmar Nova Senha"
                                                                    name="confirmarSenha"
                                                                    value={formData.confirmarSenha}
                                                                    onChange={handleInputChange}
                                                                    disabled={false}
                                                                    showPasswordToggle={true}
                                                                    showPassword={showConfirmPassword}
                                                                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className='text-start gap-2'
                                                                />

                                                                <button
                                                                    onClick={() => {
                                                                        setIsChangingPassword(false);
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            novaSenha: "",
                                                                            confirmarSenha: ""
                                                                        }));
                                                                    }}
                                                                    className="text-sm font-semibold text-gray-600 hover:text-gray-800 cursor-pointer"
                                                                >
                                                                    Cancelar alteração de senha
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <p className="text-sm text-gray-600">
                                                                    {isEditing
                                                                        ? "Clique em 'Alterar senha' para atualizar sua senha de acesso."
                                                                        : "Clique em 'Editar Informações' para alterar sua senha."}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* ABA DE DADOS DE ENDEREÇO */
                                                <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 py-9">

                                                    <InputField
                                                        label="Rua (Logradouro)"
                                                        name="rua"
                                                        value={formData.rua}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="lg:col-span-4 text-start"
                                                    />

                                                    <InputField
                                                        label="CEP"
                                                        name="cep"
                                                        value={formData.cep}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="lg:col-span-2 text-start"
                                                    />

                                                    <InputField
                                                        label="Bairro"
                                                        name="bairro"
                                                        value={formData.bairro}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="lg:col-span-2 text-start"
                                                    />

                                                    <InputField
                                                        label="Cidade"
                                                        name="cidade"
                                                        value={formData.cidade}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="lg:col-span-2 text-start"
                                                    />

                                                    <InputField
                                                        label="Número"
                                                        name="numero"
                                                        value={formData.numero}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="lg:col-span-2 text-start"
                                                    />

                                                    <InputField
                                                        label="Estado"
                                                        name="estado"
                                                        value={formData.estado}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="lg:col-span-2 text-start"
                                                    />

                                                    <InputField
                                                        label="Pais"
                                                        name="pais"
                                                        value={formData.pais}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="lg:col-span-2 text-start"
                                                    />

                                                    <InputField
                                                        label="Complemento"
                                                        name="complemento"
                                                        value={formData.complemento}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="lg:col-span-4 text-start"
                                                    />
                                                </div>
                                            )}
                                            {/* BOTÕES DE EDIÇÃO/SALVAR */}
                                            <div className="pt-4 flex justify-end">
                                                <button
                                                    onClick={toggleEdit}
                                                    disabled={loading}
                                                    className={`flex items-center gap-2 px-4 py-3 cursor-pointer rounded-lg font-semibold text-white shadow-lg transition-all hover:scale-105 ${
                                                        loading 
                                                            ? "bg-gray-400 cursor-not-allowed" 
                                                            : isEditing
                                                                ? "bg-green-700 hover:bg-green-800"
                                                                : "bg-[#007EA7] hover:bg-[#006fa8]"
                                                    }`}
                                                >
                                                    {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Editar Informações"}
                                                    {!loading && (isEditing ? <Save size={20} /> : <Edit2 size={20} />)}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}