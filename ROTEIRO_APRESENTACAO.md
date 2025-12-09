# 🎯 ROTEIRO DE APRESENTAÇÃO - SISTEMA DE GESTÃO

## 📋 Informações da Apresentação
**Data:** 9 de dezembro de 2025  
**Duração Estimada:** 20-30 minutos  
**Objetivo:** Demonstrar todas as funcionalidades do sistema de gestão

---

## 🚀 FLUXO DE APRESENTAÇÃO

### **1. INTRODUÇÃO (2 minutos)**

#### O que falar:
*"Bom dia/Boa tarde! Hoje vou apresentar o sistema completo de gestão desenvolvido para otimizar as operações da sua empresa. O sistema foi desenvolvido em React e possui integração com backend via API REST."*

#### Pontos a destacar:
- ✅ Sistema web responsivo (funciona em desktop, tablet e mobile)
- ✅ Interface moderna e intuitiva
- ✅ Gestão completa de clientes, funcionários, estoque, pedidos e agendamentos
- ✅ Dashboard com indicadores em tempo real

---

### **2. TELA DE LOGIN (2 minutos)**

#### Como demonstrar:
1. Acesse: `http://localhost:5173`
2. Mostre a tela de login profissional

#### Funcionalidades a destacar:
- 🔐 **Login Seguro**: Sistema de autenticação com validação
- 🔑 **Esqueci minha Senha**: Fluxo de recuperação de senha
- 📝 **Cadastro**: Possibilidade de criar nova conta
- 🎨 **Design Moderno**: Interface clean e profissional

#### Script sugerido:
*"A primeira tela que o usuário vê é o login. Temos um sistema de autenticação seguro, com opção de recuperação de senha caso o usuário esqueça. Vou fazer login com um usuário de demonstração..."*

**Ação:** Fazer login no sistema

---

### **3. DASHBOARD / PÁGINA INICIAL (5 minutos)** ⭐ PRINCIPAL

#### Como demonstrar:
- Assim que fizer login, você já está no Dashboard

#### Funcionalidades a destacar:

##### �� **KPIs (Indicadores-Chave)**
Mostre os 4 cards principais:
1. **Total de Itens em Baixo Estoque**: Alerta de produtos que precisam reposição
2. **Agendamentos de Hoje**: Quantos serviços estão agendados para hoje
3. **Taxa de Ocupação de Serviços**: Percentual de utilização da capacidade
4. **Total de Agendamentos Futuros**: Próximos serviços a serem realizados

##### 📦 **Itens em Estoque Crítico**
- Lista de produtos com quantidade baixa
- Status visual (Crítico/Baixo)
- Botão para ver detalhes do item
- **Demonstre:** Clique no ícone de "Ver detalhes" de um item

##### 📅 **Próximos Agendamentos**
- Lista de agendamentos futuros
- Horário de início e fim
- Valor total do serviço
- Status da etapa
- **Demonstre:** Clique para ver detalhes de um agendamento

#### Script sugerido:
*"Este é o coração do sistema - o Dashboard. Aqui temos uma visão completa e em tempo real de tudo que está acontecendo:*

*- No topo, temos os KPIs principais que dão uma visão rápida do negócio*
*- Abaixo, vemos os itens de estoque que estão com quantidade crítica, permitindo ação rápida*
*- E aqui temos os próximos agendamentos, com todos os detalhes importantes*
*- Repare que posso clicar em qualquer item para ver mais detalhes..."*

---

### **4. GESTÃO DE CLIENTES (4 minutos)**

#### Como acessar:
- Menu lateral → **Clientes**

#### Funcionalidades a demonstrar:

##### 📋 **Lista de Clientes**
1. **Visualização em tabela** com todas as informações
2. **Busca e filtros** para encontrar clientes rapidamente
3. **Status ativo/inativo**

##### ➕ **Cadastro de Cliente**
**Demonstre criando um novo cliente:**
- Clique em "Novo Cliente" ou "+"
- Preencha o formulário:
  - Nome completo
  - CPF (com máscara automática)
  - E-mail
  - Telefone (com máscara)
  - Endereço completo (Rua, Número, Bairro, Cidade, UF, CEP)
- Salve e mostre que aparece na lista

##### ✏️ **Edição de Cliente**
- Clique no botão de editar em um cliente
- Mostre que todos os dados podem ser alterados
- Salve as alterações

##### 👁️ **Visualização de Detalhes**
- Clique para ver o modal com todas as informações do cliente
- Mostre o histórico de pedidos (se houver)

#### Script sugerido:
*"Agora vamos para a gestão de clientes. Aqui podemos cadastrar, editar e visualizar todos os clientes da empresa. Vou cadastrar um cliente novo para demonstrar... Repare que o sistema já formata automaticamente o CPF e telefone. Todos os campos são validados para garantir a qualidade dos dados..."*

---

### **5. GESTÃO DE FUNCIONÁRIOS (3 minutos)**

#### Como acessar:
- Menu lateral → **Funcionários**

#### Funcionalidades a demonstrar:

##### 👥 **Lista de Funcionários**
- Visualização completa da equipe
- Informações de cargo, departamento, status

##### ➕ **Cadastro de Funcionário**
**Demonstre:**
- Clique em "Novo Funcionário"
- Preencha: Nome, CPF, E-mail, Telefone, Cargo, Departamento
- Defina permissões de acesso
- Salve

##### 🔐 **Gestão de Acesso**
- Mostre que é possível definir diferentes níveis de acesso
- Ativar/Desativar funcionários

#### Script sugerido:
*"Na área de funcionários, gerenciamos toda a equipe. Podemos cadastrar novos colaboradores, definir seus cargos e principalmente, controlar o acesso ao sistema. Isso é importante para segurança e organização..."*

---

### **6. GESTÃO DE ESTOQUE (4 minutos)**

#### Como acessar:
- Menu lateral → **Estoque**

#### Funcionalidades a demonstrar:

##### 📦 **Lista de Produtos**
- Visualização de todos os itens
- Quantidade atual vs. Quantidade mínima
- Status (Normal, Baixo, Crítico)
- Valor unitário e total

##### ➕ **Cadastro de Produto**
**Demonstre:**
- Clique em "Novo Produto"
- Preencha: Nome, Código, Descrição, Preço, Quantidade, Nível Mínimo
- Salve

##### 📊 **Detalhes do Produto**
- Clique em um produto para ver detalhes completos
- Mostre o histórico de movimentações (se disponível)

##### ⚠️ **Alertas de Estoque**
- Destaque os produtos com status "Crítico" ou "Baixo"
- Explique que o sistema alerta automaticamente

#### Script sugerido:
*"O controle de estoque é fundamental. Aqui temos visibilidade total de todos os produtos, suas quantidades e valores. O sistema nos alerta automaticamente quando um produto está ficando com estoque baixo - veja aqui os itens em vermelho ou amarelo. Posso cadastrar novos produtos facilmente..."*

---

### **7. GESTÃO DE PEDIDOS (5 minutos)** ⭐ PRINCIPAL

#### Como acessar:
- Menu lateral → **Pedidos**

#### Funcionalidades a demonstrar:

##### 📋 **Lista de Pedidos/Serviços**
- Visualização de todos os pedidos
- Filtros por status e etapa
- Informações: Cliente, Serviço, Valor, Data, Etapa

##### ➕ **Criar Novo Pedido**
**Demonstre:**
1. Clique em "Novo Pedido"
2. Selecione o cliente
3. Selecione o serviço
4. Informe valor e forma de pagamento
5. Adicione observações
6. Salve

##### 🔄 **Fluxo de Etapas do Serviço**
**Mostre as 7 etapas:**
1. ⭕ **PENDENTE** → Cliente solicitou o serviço
2. 📋 **AGUARDANDO ORÇAMENTO** → Aguardando preparação do orçamento
3. 🔍 **ANÁLISE DO ORÇAMENTO** → Cliente analisando proposta
4. ✅ **ORÇAMENTO APROVADO** → Cliente aprovou, pronto para agendar
5. 📅 **SERVIÇO AGENDADO** → Data e hora definidas
6. 🔧 **SERVIÇO EM EXECUÇÃO** → Equipe executando
7. ✅ **CONCLUÍDO** → Serviço finalizado

##### ✏️ **Editar Pedido/Serviço**
**Demonstre o modal completo:**
1. Clique para editar um pedido
2. Mostre todas as informações:
   - Resumo do Pedido (Valor, Forma de Pagamento)
   - Dados do Cliente (Nome, CPF, Telefone, Endereço)
   - Informações do Serviço (Nome, Descrição, Etapa)
   - Barra de Progresso (visual do andamento)
   - Seção de Agendamentos (à direita)
3. **Demonstre mudança de etapa:**
   - Mude de "PENDENTE" para "AGUARDANDO ORÇAMENTO"
   - Salve e mostre a atualização

##### 📅 **Botões de Agendamento Inteligentes**
**Mostre os botões contextuais:**
- Quando etapa = **PENDENTE**: Aparece botão "Agendar Orçamento"
- Quando etapa = **ORÇAMENTO APROVADO**: Aparece botão "Agendar Serviço"
- **Demonstre:** Clique em um dos botões e mostre que redireciona para a tela de agendamentos

##### ⚠️ **Proteção de Dados**
- Tente mudar um pedido de volta para "PENDENTE" (se tiver agendamentos)
- Mostre o modal de confirmação que alerta sobre exclusão de agendamentos

#### Script sugerido:
*"Esta é uma das áreas mais importantes - a gestão de pedidos e serviços. Aqui controlamos todo o ciclo de vida de um serviço, desde a solicitação até a conclusão.*

*Vou criar um pedido novo... Seleciono o cliente, o serviço que ele contratou, defino o valor...*

*Agora vou abrir um pedido existente para mostrar o acompanhamento. Veja: temos um resumo completo com valor e forma de pagamento, todos os dados do cliente, e o mais importante: a etapa atual do serviço.*

*O serviço passa por 7 etapas: Pendente, Aguardando Orçamento, Análise, Aprovado, Agendado, Em Execução e Concluído. Esta barra de progresso mostra visualmente onde estamos.*

*Repare que quando o serviço está PENDENTE, aparece automaticamente o botão 'Agendar Orçamento'. E quando o orçamento é aprovado, aparece 'Agendar Serviço'. O sistema guia o usuário no fluxo correto!*

*Aqui do lado direito ficam todos os agendamentos relacionados a este pedido..."*

---

### **8. GESTÃO DE AGENDAMENTOS (5 minutos)** ⭐ PRINCIPAL

#### Como acessar:
- Menu lateral → **Agendamentos**
- Ou via botão "Agendar Orçamento/Serviço" nos pedidos

#### Funcionalidades a demonstrar:

##### 📅 **Calendário Completo**
- Visualização mensal/semanal/diária
- Agendamentos coloridos por tipo (Orçamento/Execução)
- Mini calendário lateral

##### ➕ **Criar Novo Agendamento**
**Demonstre:**
1. Clique em "Novo Agendamento" ou em uma data do calendário
2. Preencha o formulário:
   - Tipo: Orçamento ou Execução de Serviço
   - Cliente (ou selecione de um pedido)
   - Serviço
   - Data
   - Horário de início e fim
   - Endereço (pode usar o mesmo do cliente)
   - Observações
3. Salve e mostre aparecendo no calendário

##### 🔄 **Tipos de Agendamento**
- 📊 **Orçamento**: Para visita de avaliação e elaboração de proposta
- 🔧 **Execução**: Para realização do serviço aprovado

##### 📍 **Integração com Pedidos**
- Mostre que ao criar agendamento, ele aparece automaticamente no pedido relacionado
- Volte para a tela de pedidos e abra o mesmo pedido
- Mostre que o agendamento está listado na coluna direita

##### ✏️ **Editar Agendamento**
- Clique em um agendamento no pedido
- Mostre que pode alterar: Data, Horário, Status, Observações
- Demonstre mudança de status: PENDENTE → EM ANDAMENTO → CONCLUÍDO

##### 🎯 **Status do Agendamento**
- 🟡 **PENDENTE**: Aguardando execução
- 🔵 **EM ANDAMENTO**: Equipe no local
- 🟢 **CONCLUÍDO**: Finalizado

##### 🔗 **Atualização Automática de Etapa**
**Demonstre o fluxo completo:**
1. Abra um pedido em etapa "ORÇAMENTO APROVADO"
2. Crie um agendamento de tipo "EXECUÇÃO"
3. Salve
4. **Mostre que a etapa do pedido mudou automaticamente para "SERVIÇO AGENDADO"**
5. Edite o agendamento e mude status para "EM ANDAMENTO"
6. **Mostre que a etapa do pedido mudou para "SERVIÇO EM EXECUÇÃO"**
7. Mude o status do agendamento para "CONCLUÍDO"
8. **Mostre que a etapa do pedido mudou para "CONCLUÍDO"**

#### Script sugerido:
*"O calendário de agendamentos é onde organizamos toda a operação. Podemos visualizar por mês, semana ou dia.*

*Existem dois tipos de agendamento: Orçamento, para quando vamos fazer a visita inicial e avaliar o serviço; e Execução, para quando vamos realizar o trabalho aprovado.*

*Vou criar um agendamento agora... Seleciono o tipo, a data, o horário, o cliente e o endereço onde será realizado...*

*Agora vem a parte inteligente do sistema: quando eu crio um agendamento de execução para um pedido aprovado, o sistema AUTOMATICAMENTE atualiza a etapa do pedido para 'Serviço Agendado'. Vou voltar na tela de pedidos para mostrar... Viu? Atualizou sozinho!*

*E quando marco o agendamento como 'Em Andamento', a etapa do pedido também muda automaticamente. Tudo integrado e sincronizado!*

*Isso elimina erros manuais e garante que todo mundo tenha a informação atualizada em tempo real."*

---

### **9. PERFIL DO USUÁRIO (2 minutos)**

#### Como acessar:
- Menu lateral → **Perfil**
- Ou ícone do usuário no header

#### Funcionalidades a demonstrar:
- 👤 Dados pessoais do usuário logado
- ✏️ Edição de informações
- 🔑 Troca de senha
- 📸 Upload de foto de perfil (se disponível)

#### Script sugerido:
*"Na área de perfil, cada usuário pode gerenciar suas próprias informações, trocar senha e personalizar sua conta..."*

---

### **10. SOLICITAÇÕES DE ACESSO (2 minutos)**

#### Como acessar:
- Menu lateral → **Solicitações** ou **Acesso**

#### Funcionalidades a demonstrar:
- 📋 Lista de solicitações pendentes
- ✅ Aprovar novos usuários
- ❌ Recusar solicitações
- 👥 Gestão de permissões

#### Script sugerido:
*"Aqui gerenciamos as solicitações de novos usuários que querem acessar o sistema. Podemos aprovar ou recusar, garantindo segurança e controle..."*

---

### **11. GEOLOCALIZAÇÃO (2 minutos)**

#### Como acessar:
- Menu lateral → **Geolocalização**

#### Funcionalidades a demonstrar:
- 🗺️ Mapa interativo
- 📍 Localização de clientes
- 📍 Localização de agendamentos
- 🚗 Planejamento de rotas (se disponível)

#### Script sugerido:
*"Esta funcionalidade permite visualizar geograficamente onde estão nossos clientes e agendamentos, facilitando o planejamento logístico e de rotas para a equipe..."*

---

## 🎯 PONTOS-CHAVE PARA ENFATIZAR

### Durante toda apresentação, reforce:

1. **✅ Integração Total**: Tudo está conectado
   - Clientes → Pedidos → Agendamentos
   - Agendamentos atualizam automaticamente os pedidos
   - Dashboard reflete tudo em tempo real

2. **⚡ Automação Inteligente**:
   - Etapas dos pedidos atualizam automaticamente conforme agendamentos
   - Alertas de estoque crítico
   - Botões contextuais que aparecem no momento certo

3. **🎨 Interface Intuitiva**:
   - Design moderno e profissional
   - Fácil de usar, pouco treinamento necessário
   - Responsivo (funciona em qualquer dispositivo)

4. **📊 Visibilidade Total**:
   - Dashboard com indicadores em tempo real
   - Rastreamento completo de cada serviço
   - Histórico e relatórios

5. **🔒 Segurança**:
   - Sistema de login seguro
   - Controle de permissões por usuário
   - Proteção de dados sensíveis

---

## 💡 DICAS PARA UMA BOA APRESENTAÇÃO

### Antes de começar:
- ✅ Teste TUDO antes da apresentação
- ✅ Tenha dados de demonstração cadastrados (clientes, produtos, pedidos)
- ✅ Limpe o console do navegador
- ✅ Feche abas desnecessárias
- ✅ Teste a conexão com a API
- ✅ Prepare um cliente fictício com nome engraçado/memorável para cadastrar ao vivo

### Durante a apresentação:
- 🗣️ Fale devagar e com clareza
- 👁️ Mantenha contato visual com o cliente
- ❓ Faça perguntas: "Vocês já tiveram problema com X?"
- 🎯 Conecte as funcionalidades aos problemas reais do cliente
- ⏸️ Faça pausas para perguntas
- 📱 Mostre a responsividade (redimensione a janela)

### Frases poderosas para usar:
- *"Repare como o sistema já preenche automaticamente..."*
- *"Veja que tudo está integrado..."*
- *"Isso elimina o trabalho manual de..."*
- *"Com isso, vocês ganham tempo em..."*
- *"Imagina não ter mais que..."*
- *"Isso previne erros de..."*

### Se algo der errado:
- 😌 Mantenha a calma
- 🔄 Recarregue a página se necessário
- �� Seja transparente: "Isso é um ambiente de desenvolvimento, na produção..."
- 📝 Anote o problema para corrigir depois

---

## 📋 CHECKLIST PRÉ-APRESENTAÇÃO

### Ambiente:
- [ ] Backend rodando (`http://localhost:3000` ou API real)
- [ ] Frontend rodando (`http://localhost:5173`)
- [ ] Banco de dados com dados de teste
- [ ] Navegador limpo (cache, cookies)
- [ ] Console sem erros

### Dados de Teste:
- [ ] Pelo menos 3 clientes cadastrados
- [ ] Pelo menos 2 funcionários cadastrados
- [ ] Pelo menos 5 produtos no estoque (alguns críticos)
- [ ] Pelo menos 3 pedidos em etapas diferentes
- [ ] Pelo menos 2 agendamentos futuros
- [ ] 1 agendamento para hoje

### Equipamento:
- [ ] Notebook carregado / Fonte ligada
- [ ] Tela/Projetor testado
- [ ] Internet estável
- [ ] Mouse funcionando
- [ ] Água para beber

---

## 🎬 ENCERRAMENTO (2 minutos)

### O que falar:
*"Bem, esse é o sistema completo! Como vocês puderam ver, temos uma solução integrada que cobre todo o ciclo operacional: desde o cadastro do cliente, passagem pela elaboração de orçamentos, agendamentos, execução dos serviços e controle financeiro.*

*O sistema foi desenvolvido pensando em facilitar o dia a dia, reduzir erros manuais e dar visibilidade total das operações.*

*Ficou alguma dúvida? Querem que eu demonstre alguma funcionalidade novamente?"*

### Perguntas finais a fazer ao cliente:
1. "O que acharam da solução?"
2. "Alguma funcionalidade adicional que gostariam de ver?"
3. "Quando gostariam de começar a usar?"
4. "Precisam de treinamento para a equipe?"

---

## 📞 PRÓXIMOS PASSOS

Após aprovação do cliente:
1. ✅ Deploy em servidor de produção
2. ✅ Configuração de banco de dados real
3. ✅ Treinamento da equipe
4. ✅ Período de testes (homologação)
5. ✅ Go-live (início de operação)
6. ✅ Suporte pós-implantação

---

## 🎯 RESUMO - FLUXO RECOMENDADO (Ordem de Demonstração)

1. **Login** (2 min)
2. **Dashboard** (5 min) - Mostre a visão geral
3. **Clientes** (4 min) - Cadastre um cliente
4. **Serviços/Pedidos** (5 min) - Crie um pedido para o cliente
5. **Agendamentos** (5 min) - Agende um serviço, mostre atualização automática
6. **Volte aos Pedidos** (2 min) - Mostre que atualizou automaticamente
7. **Estoque** (4 min) - Mostre alertas e controle
8. **Funcionários** (3 min) - Gestão de equipe
9. **Extras** (2 min) - Perfil, Solicitações, Geolocalização

**Tempo Total: ~32 minutos + 5 min para perguntas = 37 minutos**

---

✨ **BOA SORTE NA APRESENTAÇÃOstart* ✨

*Lembre-se: você conhece o sistema melhor que ninguém. Confie no seu trabalho e demonstre com entusiasmo!*
