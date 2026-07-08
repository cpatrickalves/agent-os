---
name: agent-security-review
description: Analisa a postura de segurança de agentes de IA — inventário de dados/ferramentas/MCPs, permissões vs. intenção, combinações tóxicas, guardrails e defesa em runtime. Use quando o usuário pedir para analisar, auditar ou revisar a segurança de um agente de IA, mapear combinações tóxicas entre dados e ferramentas, avaliar risco de prompt injection ou exfiltração em um agente, revisar segurança de MCPs, ou planejar red teaming de agente.
---

# Agent Security Review

A pergunta que guia toda a análise: **"O que esse agente pode fazer se alguém conseguir manipulá-lo?"**

Um agente não apenas responde — ele decide, acessa e executa. O risco agentic nasce da combinação: LLM manipulável (jailbreak, prompt injection) × acesso a dados sensíveis × ações privilegiadas. Nem sempre os três são necessários: acesso privilegiado sozinho já basta para dano (ex.: agente de coding que pode apagar tabelas ou volumes de produção).

**Todo token é superfície de ataque.** Instrução maliciosa pode chegar por prompt do usuário, e-mail, documento, site, memória, skill ou resposta de MCP — não só pelo prompt inicial.

O catálogo de combinações tóxicas, TTPs agentic, checklist de MCP e cenários de red teaming está em [`references/catalogo-de-riscos.md`](references/catalogo-de-riscos.md) — carregue-o ao chegar nos passos 4–6 ou quando o usuário pedir red teaming.

## Processo

### 1. Inventariar o agente

Você não protege o que não vê. Examine:

- código: chamadas a APIs de LLM (uma app que chama LLM + declara MCP provavelmente é um agente);
- configs de MCP, `.claude/`, definições de tools, skills, memória;
- permissões: identidades cloud, service accounts, scopes de API, credenciais;
- dados alcançáveis: bases, e-mail, calendário, CRM, documentos, filesystem.

Produza uma tabela: componente | tipo (dado / ferramenta / ação) | acesso concedido | evidência (`arquivo:linha` ou config).

**Critério de conclusão:** toda ferramenta, MCP, fonte de dado e ação privilegiada listada com evidência verificada no código ou config — nada inferido ou "provavelmente existe".

### 2. Classificar a autonomia

- **Baixa**: fluxo pré-programado (passo 1, 2, 3), LLM em pontos específicos — comportamento previsível, baseline claro.
- **Alta**: planeja o próprio caminho em runtime, escolhe ferramentas dinamicamente — mesma tarefa por caminhos diferentes.
- **Multiagente**: agentes interagem; ações individualmente benignas podem combinar em dano, e a superfície de ataque cresce muito.

Autonomia maior multiplica a severidade de todo achado dos passos seguintes.

### 3. Comparar permissões com intenção

Compare a instrução do agente (para que foi criado) com as permissões reais do inventário. Quatro intenções precisam se alinhar: a da organização (risco aceito), a do desenvolvedor (propósito do agente), a do usuário (pedido atual) e a do agente em runtime (o que ele decidiu fazer). Desalinhamento é achado.

**Excesso de privilégio** = permissão que a intenção declarada não exige. Ex.: agente que só prioriza calendário com permissão de escrita.

**Critério de conclusão:** cada permissão do inventário classificada como *necessária* ou *excesso*, com a intenção que a justifica (ou não).

### 4. Mapear combinações tóxicas

O achado mais grave raramente é uma permissão isolada — é o par **acesso a dado × canal de saída** que cria caminho de exfiltração ou dano (ex.: lê CRM + envia e-mail; lê dado interno + web fetch). Use o catálogo da referência.

**Critério de conclusão:** todo par (fonte de dado, ação/canal externo) do inventário avaliado — não apenas os pares do catálogo.

### 5. Avaliar guardrails e defesa em runtime

Proteger em runtime importa mais que proteger só no build. Verifique:

- **Guardrails em todo conteúdo** que entra no LLM — inclusive respostas de MCP, que são não confiáveis por definição. Filtrar só o prompt inicial é achado.
- **Bloqueio de ações de alto risco** (deletar dados de produção, `DROP TABLE`, envio externo de dado sensível) ou aprovação humana antes delas.
- **Pontos de interceptação** antes de: enviar prompt ao LLM, chamar MCP, executar ferramenta, instalar skill, enviar e-mail, gravar ou enviar dados. A lógica: o agente pergunta ao controle "estou prestes a fazer isto — é seguro?".
- **Detecção**: TTPs agentic (memory poisoning, malicious skills), combinações tóxicas em runtime, anomalia comportamental (viável em baixa autonomia; frágil em alta autonomia e multiagente).
- **Postura contínua**: memória, skills, MCPs e as APIs atrás deles mudam durante o uso — verificação única pré-go-live é achado.

### 6. Avaliar governança de MCP

MCP é o grande acelerador de capacidade e de risco. Mínimo aceitável: allow list (não deny list), servidores oficiais, HTTPS, respostas tratadas como não confiáveis. Checklist completo na referência.

### 7. Relatório

Estruture assim:

1. **Cabeçalho**: classificação de autonomia + resumo do inventário (nº de ferramentas, MCPs, fontes de dados, ações privilegiadas).
2. **Achados**, ordenados por severidade (crítico / alto / médio / baixo). Cada achado: componente(s), **caminho de ataque** (como a manipulação vira dano concreto — não só "permissão ampla"), evidência, recomendação.
3. **Descartados**: pares e permissões avaliados e considerados aceitáveis, com justificativa de uma linha.

**Critério de conclusão:** todo excesso de privilégio do passo 3 e toda combinação tóxica do passo 4 aparece no relatório — como achado ou como descartado justificado. Nenhum item do inventário some silenciosamente.
