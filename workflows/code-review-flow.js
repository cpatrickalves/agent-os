export const meta = {
  name: 'code-review-flow',
  description: 'Code review triplo (thermos + ce-code-review + matt-code-review, todos Opus) de um PR e consolidação dos relatórios',
  whenToUse:
    'Quando quiser revisar um PR existente sem implementar nada. Uso: Workflow({name: "code-review-flow", args: "<PR url ou número>"})',
  phases: [
    { title: 'Code Review', detail: '3 revisores em paralelo (thermos + ce-code-review + matt-code-review, todos Opus) e consolidação dos relatórios' },
    { title: 'Final Review', detail: 'julga os achados com grill-with-docs e gera o relatório final em markdown + HTML (html-it) na raiz do projeto', model: 'opus' },
  ],
}

// O input é o PR a ser revisado (string com a URL/número ou {pr: "..."}).
const prRef = typeof args === 'string' ? args.trim() : args?.pr
if (!prRef) {
  throw new Error('Informe o PR a revisar em args, ex.: args: "https://github.com/org/repo/pull/123" ou args: "123"')
}

// ── Code Review ──────────────────────────────────────────────────────────────
phase('Code Review')
log(`Revisando o PR: ${prRef}`)

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    report_path: { type: 'string', description: 'Path absoluto do relatório gerado em /tmp' },
  },
  required: ['report_path'],
}

// Sufixo dos relatórios: número do PR — Azure DevOps (.../pullrequest/1234),
// GitHub (.../pull/1234) ou o número solto. Fallback: última sequência de dígitos.
const prId = String(prRef).match(/\/(?:pullrequest|pull)\/(\d+)/i)?.[1] ?? String(prRef).match(/\d+/g)?.pop() ?? 'pr'

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
          `revise o PR ${prRef} e gere um relatório detalhando os achados e possíveis correções ` +
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
  `Consolide em um único relatório os relatórios de code review do PR ${prRef}: ${reportPaths.join(' e ')}. ` +
    'Preserve todos os achados, agrupe os duplicados (citando que ambos os revisores apontaram) e mantenha as correções sugeridas. ' +
    'Salve o relatório consolidado em /tmp e, como resultado, retorne o path dele.',
  { label: 'consolidate', phase: 'Code Review', model: 'sonnet', schema: REPORT_SCHEMA },
)
if (!consolidated?.report_path) throw new Error('A consolidação não retornou o path do relatório.')
log(`Relatório consolidado: ${consolidated.report_path}`)

// ── Final Review ─────────────────────────────────────────────────────────────
phase('Final Review')

const finalReview = await agent(
  `Você executa a etapa "Final Review" do workflow code-review-flow, que o usuário pediu para ` +
    `rodar sobre o PR ${prRef}. Três revisores independentes produziram o relatório consolidado ` +
    `em ${consolidated.report_path}. ` +
    'Use a skill /grill-with-docs e julgue cada achado: procedente, ou improcedente ' +
    '(falso positivo, premissa incorreta, overengineering, etc.). ' +
    `Após o julgamento, gere o relatório final em markdown na raiz do projeto, com o nome "pr-review-${prId}.md". ` +
    'IMPORTANTE: o documento final deve conter APENAS os itens que devem ser corrigidos (os achados procedentes); ' +
    'não inclua os achados descartados/rejeitados (overengineering, premissas incorretas, falsos positivos, etc.). ' +
    `Em seguida use a skill /html-it para gerar uma versão HTML do "pr-review-${prId}.md" (para melhor legibilidade) também na raiz do projeto. ` +
    'Este workflow não altera o PR: nenhum commit, push ou comentário — apenas os dois arquivos de relatório. ' +
    'ultrathink.',
  {
    label: 'final-review',
    phase: 'Final Review',
    model: 'opus',
    schema: {
      type: 'object',
      properties: {
        markdown_path: { type: 'string', description: 'Path do relatório final em markdown na raiz do projeto' },
        html_path: { type: 'string', description: 'Path da versão HTML gerada pela skill html-it' },
        summary: { type: 'string', description: 'Resumo do julgamento dos achados (procedentes vs. descartados)' },
      },
      required: ['markdown_path'],
    },
  },
)
// Sem throw: se a Final Review falhar, os relatórios já produzidos continuam no resultado.
if (!finalReview?.markdown_path) {
  log('⚠️ Etapa Final Review não concluiu (bloqueio ou erro) — julgar o relatório consolidado manualmente.')
} else {
  log(`Relatório final: ${finalReview.markdown_path}${finalReview.html_path ? ` | HTML: ${finalReview.html_path}` : ''}`)
}

return {
  pr: prRef,
  review_reports: reportPaths,
  consolidated_report: consolidated.report_path,
  final_review: finalReview,
}
