export const meta = {
  name: 'dev-flow',
  description: 'Fluxo de desenvolvimento: implementação do plano → code review triplo → correções no PR',
  whenToUse: 'Quando existir um plano de implementação em markdown pronto para executar de ponta a ponta. Uso: Workflow({name: "dev-flow", args: "/path/do/plano.md"})',
  phases: [
    { title: 'Development', detail: 'implementa o plano, commita e abre PR para a branch dev', model: 'sonnet' },
    { title: 'Code Review', detail: '3 revisores em paralelo (thermos + ce-code-review + matt-code-review, todos Opus) e consolidação dos relatórios' },
    { title: 'PR Fixes', detail: 'julga cada achado, aplica as correções procedentes e atualiza o PR', model: 'sonnet' },
    { title: 'Docs Audit', detail: 'auditoria de documentação da branch com a skill docs-generator (sincronia /docs + ADRs/guides)', model: 'opus' },
  ],
}

// O input é o path do plano de implementação (string ou {plan: "..."}).
const planPath = typeof args === 'string' ? args.trim() : args?.plan
if (!planPath) {
  throw new Error('Informe o path do plano de implementação em args, ex.: args: "/path/do/plano.md"')
}

// ── Etapa 1: Development ────────────────────────────────────────────────────
phase('Development')
log(`Implementando o plano: ${planPath}`)

const dev = await agent(
  `Execute a implementação usando as skills e plano detalhados no arquivo: ${planPath}. ` +
    'Use a abordagem Subagent-Driven com a skill subagent-driven-development seguindo as skills `karpathy-guidelines` e `tdd`' +
    'Faça todos os commits referenciando a Issue e ao final crie um PR para a branch "dev". ' +
    'Como resultado, retorne o link do Pull Request criado.',
  {
    label: 'development',
    phase: 'Development',
    model: 'sonnet',
    schema: {
      type: 'object',
      properties: {
        pr_url: { type: 'string', description: 'URL do Pull Request criado' },
        summary: { type: 'string', description: 'Resumo curto do que foi implementado' },
      },
      required: ['pr_url'],
    },
  },
)
if (!dev?.pr_url) throw new Error('A etapa Development não retornou o link do PR.')
log(`PR criado: ${dev.pr_url}`)

// ── Etapa 2: Code Review ────────────────────────────────────────────────────
phase('Code Review')

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    report_path: { type: 'string', description: 'Path absoluto do relatório gerado em /tmp' },
  },
  required: ['report_path'],
}

// Sufixo dos relatórios: número do PR — Azure DevOps (.../pullrequest/1234),
// GitHub (.../pull/1234) ou o número solto. Fallback: última sequência de dígitos.
const prId =
  String(dev.pr_url).match(/\/(?:pullrequest|pull)\/(\d+)/i)?.[1] ?? String(dev.pr_url).match(/\d+/g)?.pop() ?? 'pr'

const REVIEWERS = [
  { key: 'thermos', skill: 'thermos:thermos' },
  { key: 'ce-code-review', skill: 'ce-code-review' },
  { key: 'matt-code-review', skill: 'code-review' },
]

// Barreira proposital: a consolidação precisa dos TRÊS relatórios juntos.
const reviews = (
  await parallel(
    REVIEWERS.map((r) => () =>
      agent(
        `Invoque a skill "${r.skill}" (via Skill tool) com a seguinte tarefa: ` +
          `revise o PR ${dev.pr_url} e gere um relatório detalhando os achados e possíveis correções ` +
          `em "/tmp/relatorio-${r.key}-${prId}.md". ` +
          'Como resultado, retorne o path do relatório gerado.',
        { label: `review:${r.key}`, phase: 'Code Review', model: 'opus', schema: REPORT_SCHEMA },
      ),
    ),
  )
).filter(Boolean)

if (reviews.length === 0) throw new Error('Nenhum revisor retornou relatório.')
if (reviews.length < REVIEWERS.length) log(`Atenção: apenas ${reviews.length}/${REVIEWERS.length} revisores concluíram.`)

const reportPaths = reviews.map((r) => r.report_path)
log(`Relatórios de revisão: ${reportPaths.join(' | ')}`)

const consolidated = await agent(
  `Consolide em um único relatório os relatórios de code review do PR ${dev.pr_url}: ${reportPaths.join(' e ')}. ` +
    'Preserve todos os achados, agrupe os duplicados (citando que ambos os revisores apontaram) e mantenha as correções sugeridas. ' +
    'Salve o relatório consolidado em /tmp e, como resultado, retorne o path dele.',
  { label: 'consolidate', phase: 'Code Review', model: 'sonnet', schema: REPORT_SCHEMA },
)
if (!consolidated?.report_path) throw new Error('A consolidação não retornou o path do relatório.')
log(`Relatório consolidado: ${consolidated.report_path}`)

// ── Etapa 3: PR Fixes ───────────────────────────────────────────────────────
phase('PR Fixes')

const fixes = await agent(
  `Utilizei 3 agentes externos para fazer a revisão da implementação e PR ${dev.pr_url}. ` +
    `O resultado da revisão está em ${consolidated.report_path}. ` +
    'Use a skill superpowers:brainstorming e analise cada item da revisão, veja o que faz sentido corrigir ' +
    'e o que não faz sentido (e.g. overengineering, premissa incorreta, falsos positivos, etc.). ' +
    'Após julgar o que deve ser corrigido, planeje e aplique as alterações (usando subagents), faça os commits, push para o PR ' +
    'e atualize o PR adicionando comentários somente dos fixes aplicados e suas justificativas (nao precisa mencionar os rejeitados.',
  {
    label: 'pr-fixes',
    phase: 'PR Fixes',
    model: 'sonnet',
    schema: {
      type: 'object',
      properties: {
        applied: { type: 'array', items: { type: 'string' }, description: 'Fixes aplicados' },
        rejected: { type: 'array', items: { type: 'string' }, description: 'Achados descartados e o motivo' },
        summary: { type: 'string', description: 'Resumo do fechamento do ciclo' },
      },
      required: ['summary'],
    },
  },
)

// ── Etapa 4: Docs Audit ─────────────────────────────────────────────────────
phase('Docs Audit')

const docsAudit = await agent(
  `Use a skill /docs-generator (via Skill tool) sobre o PR ${dev.pr_url}. ` +
    `O plano de implementação que originou esta branch está em: ${planPath}. ` +
    `Contexto: as etapas anteriores de code review e correção já rodaram. Resumo dos fixes aplicados no PR: ${fixes?.summary ?? 'n/d'}. ` +
    `Fixes aplicados: ${fixes?.applied?.length ? fixes.applied.join('; ') : 'nenhum registrado'}. ` +
    'Realize uma auditoria minuciosa nas alterações desta branch seguindo estas diretrizes:\n' +
    '- Verificação de Sincronia: Analise todos os arquivos alterados no PR e verifique se a pasta /docs foi atualizada ' +
    "corretamente em conformidade com as diretrizes e padrões da skill 'docs-generator'.\n" +
    '- Extração de Conhecimento: Identifique decisões arquiteturais, mudanças de lógica complexa ou trade-offs importantes ' +
    'que não estejam documentados. Transfira esses achados para um formato de documentação oficial, preferencialmente ' +
    'seguindo o modelo de ADR (Architecture Decision Records) ou atualizando os guias técnicos existentes.\n' +
    '- Lista de verificação: Confirmação de que o docs-generator foi aplicado corretamente em todos os módulos impactados. ' +
    'Seja criterioso, focando na manutenibilidade e na clareza para futuros desenvolvedores.\n' +
    '- Considere que arquivos git-ignored em `docs` não entrarão na versão final do projeto (são temporários), então ' +
    'achados importantes têm que virar documentação (ex: ADRs, README, Guides, References, etc.).\n' +
    '- Ao promover uma solution para ADR (quando a investigação revelar uma decisão arquitetural), o ADR deve ser **self-contained**.\n' +
    '- Também não faça referências a Issues do Linear ou Plane no Código (ex: "feito de acordo com DEV-88", "EVABOT-XX"), ' +
    'pois não serão acessíveis após a entrega do software. Somente docs versionadas (ADRs, guides, etc.) devem ser referenciadas.\n' +
    '\n' +
    'Ao final, commite e faça push das atualizações de documentação para o PR.',
  {
    label: 'docs-audit',
    phase: 'Docs Audit',
    model: 'opus',
    schema: {
      type: 'object',
      properties: {
        docs_updated: { type: 'array', items: { type: 'string' }, description: 'Arquivos de documentação criados ou atualizados' },
        adrs_created: { type: 'array', items: { type: 'string' }, description: 'ADRs promovidos a partir de achados da auditoria' },
        summary: { type: 'string', description: 'Resumo da auditoria de documentação' },
      },
      required: ['summary'],
    },
  },
)

return {
  pr_url: dev.pr_url,
  review_reports: reportPaths,
  consolidated_report: consolidated.report_path,
  fixes,
  docs_audit: docsAudit,
}
