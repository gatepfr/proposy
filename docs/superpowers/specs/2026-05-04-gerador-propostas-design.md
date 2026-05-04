# Design Spec: Gerador de Propostas Comerciais SaaS

**Data:** 2026-05-04
**Status:** Draft
**Nicho:** Serviços Gerais e Consultoria

## 1. Visão Geral
Um SaaS focado em freelancers e consultores para geração rápida de propostas comerciais de alta conversão. O diferencial reside no uso de IA para diagnóstico de problemas (autoridade) e um fluxo interativo via chat para refinamento do conteúdo, culminando em um PDF totalmente personalizável (White Label).

## 2. Objetivos e Sucesso
- Permitir que um usuário gere uma proposta profissional em menos de 5 minutos.
- Oferecer personalização total de marca para justificar o modelo de assinatura.
- Proporcionar uma interface "Chat-to-Proposal" intuitiva.

## 3. Arquitetura Técnica
- **Frontend:** Next.js (App Router), Tailwind CSS.
- **Backend/BaaS:** Supabase (Autenticação, PostgreSQL para dados, Storage para assets).
- **IA:** OpenAI API (GPT-4o) + LangChain (para histórico e contexto do chat).
- **Geração de PDF:** Puppeteer rodando em Serverless Function (HTML -> PDF).

## 4. Funcionalidades Principais

### 4.1. Onboarding de Marca (Perfil do Usuário)
- Upload de Logo.
- Seletor de Cores Primária e Secundária.
- Escolha de Tipografia (Fontes seguras do sistema ou Google Fonts).
- Mini-biografia/Diferenciais padrão do profissional.

### 4.2. Fluxo de Geração
1. **Input Inicial:** Formulário ou Chat com 5 perguntas base:
   - Cliente (Nome/Empresa).
   - Serviço Proposto.
   - Valor/Investimento.
   - Prazo de Entrega.
   - Diagnóstico (Qual o problema principal do cliente?).
2. **Refino Interativo (Chat):**
   - A IA apresenta um rascunho (Preview lateral).
   - O usuário solicita ajustes via chat ("Muda o tom para mais agressivo", "Adiciona uma etapa de revisão").
   - A IA atualiza o estado da proposta em tempo real.

### 4.3. Exportação "White Label"
- Geração de PDF sem marcas d'água (para assinantes).
- Layout otimizado para leitura digital e impressão.
- Inclusão automática de elementos de marca do usuário.

## 5. Estrutura da Proposta (Prompt IA)
A proposta gerada deve seguir esta estrutura:
- **Abertura:** Personalizada para o cliente.
- **Diagnóstico do Problema:** Foco na dor e no custo da inação.
- **Solução Proposta:** Como o serviço resolve o problema.
- **Metodologia/Etapas:** Cronograma macro.
- **Investimento e Condições:** Clareza financeira.
- **Call to Action (CTA):** Próximos passos claros.

## 6. Modelo de Monetização (Plano SaaS)
- **Free:** 1 proposta/mês, marca d'água "Gerado por [Nome do SaaS]".
- **Pro:** R$ 29/mês, propostas ilimitadas, customização de marca, exportação limpa.

## 7. Próximos Passos
1. Setup do projeto Next.js + Supabase.
2. Implementação da engine de PDF com Puppeteer.
3. Desenvolvimento do sistema de Chat com LangChain.
