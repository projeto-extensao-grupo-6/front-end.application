import { StringUtils, FormatUtils } from './utils';

console.log("=== Testes removerNaoNumeros ===");
console.log(StringUtils.removerNaoNumeros("123.456-789"));
console.log(StringUtils.removerNaoNumeros("(11) 98765-4321"));
console.log(StringUtils.removerNaoNumeros("ABC123XYZ"));
console.log(StringUtils.removerNaoNumeros(""));
console.log(StringUtils.removerNaoNumeros(null));


console.log("=== Testes formatarEmail ===");
console.log(FormatUtils.formatarEmail("  USUARIO@EMAIL.COM  "));
console.log(FormatUtils.formatarEmail("teste@dominio.com"));
console.log(FormatUtils.formatarEmail("Joao.Pedro@Empresa.com  "));
console.log(FormatUtils.formatarEmail("  ESPAÇOS@MEIO   .com "));


console.log("=== Testes formatarCpf ===");
console.log(FormatUtils.formatarCpf("12345678901"));
console.log(FormatUtils.formatarCpf("123.456.789-01"))
console.log(FormatUtils.formatarCpf("11122233344"));
console.log(FormatUtils.formatarCpf("12345678"));
console.log(FormatUtils.formatarCpf(""));


console.log("=== Testes formatarData ===");
console.log(DateUtils.formatarData("2025-09-01")); 
console.log(DateUtils.formatarData(new Date(2024, 0, 15))); 
console.log(DateUtils.formatarData("data inválida")); 
console.log(DateUtils.formatarData(null)); 


console.log("=== Testes parser ===");
console.log(DateUtils.parser("2025/09/01")); 
console.log(DateUtils.parser("1999/12/31")); 
console.log(DateUtils.parser("31/12/1999")); 


console.log("=== Testes calcularIdade ===");
console.log(DateUtils.calcularIdade("2000/09/01")); 
console.log(DateUtils.calcularIdade("1990/01/01")); 
console.log(DateUtils.calcularIdade("data inválida")); 


console.log("=== Testes validarEmail ===");
console.log(ValidUtils.validarEmail("usuario@email.com")); 
console.log(ValidUtils.validarEmail("usuario@empresa.com.br")); 
console.log(ValidUtils.validarEmail("usuarioemail.com")); 
console.log(ValidUtils.validarEmail("usuario@empresa")); 
console.log(ValidUtils.validarEmail("usuario @email.com")); 


console.log("=== Testes validarSenha ===");
console.log(ValidUtils.validarSenha("Senha123")); 
console.log(ValidUtils.validarSenha("abc")); 
console.log(ValidUtils.validarSenha("abcdef")); 
console.log(ValidUtils.validarSenha("abcdef1")); 
console.log(ValidUtils.validarSenha("ABCDEF1")); 


console.log("=== Testes validarConfirmacaoSenha ===");
console.log(ValidUtils.validarConfirmacaoSenha("Senha123", "Senha123")); 
console.log(ValidUtils.validarConfirmacaoSenha("Senha123", "senha123")); 
console.log(ValidUtils.validarConfirmacaoSenha("123456", "654321")); 

/*
  async function cadastrarEndereco(cep) {
  try {
    const endereco = await validarCep(cep);
    console.log("Endereço encontrado:", endereco);

  } catch (erro) {
    console.error("Erro:", erro.message);
    alert(erro.message);
  }
}

cadastrarEndereco("01001-000");

cadastrarEndereco("12345678");
*/