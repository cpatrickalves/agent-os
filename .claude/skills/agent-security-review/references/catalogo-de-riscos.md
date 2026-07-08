# Catálogo de riscos agentic

Referência para os passos 4–6 do `SKILL.md` e para red teaming.

## Combinações tóxicas (par dado × canal)

Cada linha é um caminho de exfiltração ou dano. Procure o par no inventário; a lista é ponto de partida, não limite — avalie todo par (fonte de dado, canal externo) do agente.

| Acesso a dado | Canal de saída | Risco |
|---|---|---|
| CRM sensível (Salesforce, Dynamics) | envio de e-mail | exfiltração de dados de clientes |
| dados internos | web fetch / chamada web externa | envio a site malicioso sob manipulação |
| dado sensível | upload para domínio recém-criado | exfiltração para infra do atacante |
| e-mail | adicionar destinatário externo em BCC | vazamento silencioso |
| calendário (intenção: só leitura) | permissão de escrita | excesso de privilégio → adulteração |
| coding / produção | apagar arquivos, tabelas, volumes | dano destrutivo sem dado sensível envolvido |

Regra: o achado é o **caminho** (dado → canal), não a permissão isolada. Uma permissão de e-mail só é tóxica junto de um acesso a dado sensível.

## TTPs específicos de agentes

Ataques que não existem em chatbots — detecção baseada nesses padrões (limitação: arquiteturas novas geram TTPs novos, e a detecção atrasa):

- **memory poisoning**: instrução persistente plantada na memória do agente.
- **malicious skills**: skill instalada carrega comportamento hostil.
- **manipulação de ferramentas**: desviar qual tool o agente chama e com quais argumentos.
- **instruções persistentes**: payload que sobrevive entre execuções.

## Prompt injection: direto vs. indireto

- **Direto**: usuário envia instrução maliciosa ao agente. Fácil de automatizar; herdado da segurança de chatbots.
- **Indireto** (mais perigoso, mais difícil de automatizar): o payload vem de conteúdo que o agente consumiu, não do usuário. Ex.: atacante manda e-mail com instruções → usuário pede "resuma minha caixa de entrada" → agente lê o e-mail → a instrução tenta controlar o agente.

Subestimar o indireto é erro comum. Testar só biblioteca de prompts diretos não cobre o vetor real.

## Red teaming de agente ≠ red teaming de chatbot

Em chatbot, o foco é quebrar a resposta do modelo. Em agente, o foco é manipular ferramentas, dados, permissões, chamadas MCP, ações reais e caminhos de exfiltração. Cenários a testar:

- prompt injection direto e indireto;
- manipulação de ferramentas e de seus argumentos;
- caminhos de exfiltração (as combinações tóxicas acima);
- escalada via permissões;
- execução de ações reais de alto risco.

## Checklist de segurança de MCP

Respostas de MCP são não confiáveis — rode-as pelos guardrails como qualquer conteúdo externo.

- **allow list** (não deny list): há muitos servidores MCP para a mesma ferramenta e é difícil achar o oficial; deny list exige verificar tudo. Exemplo real: 300+ MCPs para GitHub, apenas um oficial.
- usar registry de MCP;
- preferir servidores oficiais;
- validar versão do protocolo;
- exigir HTTPS;
- usar MCP gateway;
- escanear o código do MCP;
- tratar toda resposta de MCP como não confiável.

## Fundações antes da camada agentic

Riscos que existem mesmo antes do agente e devem entrar na análise se aplicáveis:

- **Cloud**: identidades, permissões, rede, containers em AWS/Azure/GCP mal configurados.
- **Chatbot / GenAI**: modelos baixados de fontes externas (Hugging Face) sem **model scan**, malware em arquivos de modelo, dependências comprometidas, oversharing em SharePoint/OneDrive. Catálogo curado de hyperscaler reduz — não elimina — o risco.

## Erros comuns (anti-padrões a sinalizar)

- tratar agente como chatbot;
- proteger só o prompt;
- ignorar permissões e ferramentas;
- não inventariar agentes;
- não governar MCP;
- deny list como controle principal;
- não detectar combinações tóxicas;
- posture management feito uma única vez;
- subestimar prompt injection indireto;
- acreditar que red teaming elimina o risco.
