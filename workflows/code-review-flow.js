export const meta = {
  name: 'code-review-flow',
  description: 'Code review duplo (thermos + ce-code-review, ambos Opus) de um PR e consolidação dos relatórios',
  whenToUse:
    'Quando quiser revisar um PR existente sem implementar nada. Uso: Workflow({name: "code-review-flow", args: "<PR url ou número>"})',
  phases: [
    { title: 'Code Review', detail: '2 revisores em paralelo (thermos + ce-code-review, ambos Opus) e consolidação dos relatórios' },
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

const REVIEWERS = [
  { key: 'thermos', skill: 'thermos:thermos' },
  { key: 'ce-code-review', skill: 'ce-code-review' },
]

// Barreira proposital: a consolidação precisa dos DOIS relatórios juntos.
const reviews = (
  await parallel(
    REVIEWERS.map((r) => () =>
      agent(
        `Invoque a skill "${r.skill}" (via Skill tool) com a seguinte tarefa: ` +
          `revise o PR ${prRef} e gere um relatório em /tmp detalhando os achados e possíveis correções. ` +
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
  `Utilizei 2 agentes externos para fazer a revisão da implementação e PR ${prRef}. ` +
    `O resultado da revisão está em ${consolidated.report_path}. ` +
    'Use a skill /grill-with-docs e analise cada item da revisão, veja o que faz sentido corrigir ' +
    'e o que não faz sentido (e.g. overengineering, premissa incorreta, falsos positivos, etc.). ' +
    'Após julgar o que deve ser corrigido, gere um arquivo markdown final da revisão do PR na raiz do projeto "pr-review-xxxx.md". ' +
    'IMPORTANTE: o documento final deve conter APENAS os itens que devem ser corrigidos (os achados procedentes); ' +
    'não inclua os achados descartados/rejeitados (overengineering, premissas incorretas, falsos positivos, etc.). ' +
    'Em seguida use a skill /html-it para gerar uma versão HTML do "pr-review-xxxx.md" (para melhor legilibidade) também na raiz do projeto. ' +
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
if (!finalReview?.markdown_path) throw new Error('A etapa Final Review não retornou o path do relatório final.')
log(`Relatório final: ${finalReview.markdown_path}${finalReview.html_path ? ` | HTML: ${finalReview.html_path}` : ''}`)

return {
  pr: prRef,
  review_reports: reportPaths,
  consolidated_report: consolidated.report_path,
  final_review: finalReview,
}
