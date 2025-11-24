   const StringUtils = {
    removerNaoNumeros(str){
        if(!str) return null;
        return str.replace(/\D/g, '')
    }
   }

   const FormatUtils = {
    
    formatarCpf(cpf) {
        if (cpf.length != 11) return null;
        let numeros_cpf = StringUtils.removerNaoNumeros(cpf)
        return numeros_cpf;
    },

     formatarEmail(email) {
        return email.trim().toLowerCase(); // Melhor para salvar no banco
    }

   }
   
   dayjs.extend(dayjs_plugin_customParseFormat);
   const DateUtils = {
    
        FORMATO_MYSQl: 'YYYY/MM/DD',

        formatarData(data){
            if(!data || !dayjs(data).isValid()) return null;
            return dayjs(data).format(this.FORMATO_MYSQl);
        },

        parser(dataStr){
            const data = dayjs(dataStr, this.FORMATO_MYSQl);
            return data.isValid() ? data.toDate() : null;

        },

        calcularIdade(dataNascimento){
            const dataNasc = dayjs(dataNascimento, this.FORMATO_MYSQl) 
            if(!dataNasc.isValid()) return null;
            return dayjs().diff(dataNasc, 'year')
        }

   }

   const ValidUtils = {

        validarEmail(email) {
            return /^[^\s@]+@[^\s@]+$/.test(email); // O Regex verifica se o Email tem "@" "." e se NÃO tem espaços
        },

        validarSenha(senha) {
            if (senha.length < 6) return false;
            if (!/[0-9]/.test(senha)) return false;
            if (!/[A-Z]/.test(senha)) return false;
            return true;
        },


        validarConfirmacaoSenha(senha, confirmacao_senha){
            return senha == confirmacao_senha
        }

   }

   const MessageUtils ={

        mostrarSucesso(msg){
            alert("Sucesso 🥳" + msg)

        },

        mostrarFalha (msg){
            alert("Falha ❌ " + msg)
        }

   }

   /*  Chama a API do ViaCep, é necessário validar com o professor se ja podemos implementar,
        pois ela precisa de conexão com a internet para funcionar, nessa etapa todo o projeto é offline

   const ViaCepUtils = {
    
    async validarCep(cep) {

        cep = cep.replace(/\D/g, "");

        if (cep.length !== 8) {
            throw new Error("CEP inválido: deve ter 8 dígitos.");
        }
        
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resposta.json();
        
        if (dados.erro) {
            throw new Error("CEP não encontrado.");
        }

        return {
            cep: dados.cep,
            logradouro: dados.logradouro,
            bairro: dados.bairro,
            cidade: dados.localidade,
            estado: dados.uf,
        };
        }
   }
        */