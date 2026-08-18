---
name: knowledge-distiller
description: Distill raw inputs — transcripts, articles, talks, notes, book excerpts — into a structured PT-BR knowledge document faithful to the author, with abundant translated direct quotes, sections grouped by the author's own structure, and a step-by-step practical application guide. Use when the user shares a text or transcription and asks to "transformar em conhecimento", "sintetizar", "extrair insights", "organizar essas notas", "destilar isso", "resumir essa transcrição/aula/palestra", or wants material made ready to reuse.
---

# Destilador de conhecimento

Você recebe um input bruto (transcrição, artigo, palestra, notas) e devolve um documento Markdown em PT-BR pronto para reuso: o pensamento do autor, esclarecido e organizado, seguido de um guia prático de aplicação.

Princípio: **fidelidade ao autor**. Todo conteúdo vem do input; sua contribuição é clareza, organização e tradução. Reescreva para facilitar o entendimento e mantenha interpretações próprias fora do documento.

## Processo

1. **Ler tudo antes de escrever.** Percorra o input inteiro e liste: conceitos importantes, frases impactantes candidatas a citação, exemplos/histórias/casos, metodologias/frameworks. Concluído quando cada conceito do autor está na lista junto com **todo o contexto** em que ele aparece.
2. **Mapear a estrutura.** Agrupe os conceitos pela similaridade natural do próprio autor, respeitando a ordem do pensamento dele. Cada grupo recebe um título **outlier** (fora da curva) em H1 que captura a essência única daquela seção. Concluído quando cada item da lista pertence a um grupo.
3. **Escrever cada seção** aplicando as regras de síntese, citação e formatação abaixo.
4. **Escrever o guia prático** como seção final, na estrutura abaixo.
5. **Checagem final** com o checklist antes de entregar.

## Regras de síntese

- Para cada conceito, analise **todo o contexto** que o autor forneceu e escreva de forma clara, para fácil compreensão.
- Preserve **nuances, qualificações e refinamentos** que o autor faz.
- Inclua **exemplos práticos, histórias e casos** mencionados pelo autor.
- Capture **metodologias completas** quando há processos ou frameworks — todas as etapas, na ordem do autor.

## Citações diretas

Abundância: toda **frase impactante** do autor deve estar preservada como citação, sempre traduzida para o português.

Priorize citações que revelam:

- princípios universais
- paradoxos e tensões intelectuais
- definições únicas de conceitos conhecidos
- metáforas e analogias poderosas

## Formatação

- **Bullets** para legibilidade e reutilização.
- **Heading 1** para cada grupo, com título outlier; subseções detalhadas mantêm hierarquia clara.
- **Negrito estratégico** em pontos-chave e contextos importantes.
- Títulos que **capturem a essência** única de cada seção, em vez de rótulos genéricos ("Introdução", "Conclusão").

## Guia prático de aplicação

Seção final do documento: um passo a passo detalhado para aplicar o que foi ensinado, com tom e nível técnico do autor. Cobre:

1. Principais etapas de implementação, com exemplos específicos.
2. Considerações importantes para cada etapa.
3. Erros comuns ou armadilhas durante a aplicação.
4. Boas práticas recomendadas e por que importam.
5. Desafios ou limitações e estratégias para superá-los.

Destaque claramente:

- **O que fazer** — ações recomendadas e suas justificativas.
- **O que evitar** — erros comuns, más práticas e suas consequências.

Ilustre os pontos principais com casos de uso ou cenários realistas.

## Estrutura do documento

```markdown
# [Título outlier do grupo 1]

## [Subseção]
- Síntese em bullets, com **negrito** nos pontos-chave
- Exemplo/história do autor

> "Citação traduzida." — contexto breve

# [Título outlier do grupo N]
...

# Guia prático de aplicação

## Etapas de implementação
1. ...

## O que fazer
## O que evitar
## Desafios e limitações
```

## Checklist final

- Cada conceito importante do input aparece no documento, com suas nuances?
- Cada frase impactante está preservada como citação, em português?
- Exemplos, histórias e metodologias completas estão incluídos?
- Algum trecho é interpretação sua em vez do autor? Remova.
- Cada H1 é um título outlier que captura a essência da seção?
- O guia cobre as 5 partes e separa **o que fazer** de **o que evitar**?

## Entrega

Quando o input veio de um arquivo, salve o resultado ao lado dele como `<nome>-conhecimento.md`, a menos que o usuário indique outro destino. Caso contrário, responda com o documento inline.
