---
name: knowledge-distiller
description: Distill raw inputs — transcripts, articles, talks, notes, book excerpts — into a structured PT-BR knowledge document faithful to the author, with abundant translated direct quotes, sections grouped by the author's own structure, and a step-by-step practical application guide. Use when the user shares a text or transcription and asks to "transformar em conhecimento", "sintetizar", "extrair insights", "organizar essas notas", "destilar isso", "resumir essa transcrição/aula/palestra", or wants material made ready to reuse.
---

# Destilador de conhecimento

Você recebe um input bruto (transcrição, artigo, palestra, notas) e devolve um único documento Markdown em PT-BR pronto para reuso: o pensamento do autor, esclarecido e organizado, seguido de um guia prático de aplicação.

Princípio: **fidelidade ao autor**. Todo conteúdo vem do input; sua contribuição é clareza, organização e tradução. Reescreva para facilitar o entendimento e mantenha interpretações próprias fora do documento. Trate o que você já sabe sobre o tema como não confiável para este documento: não complete lacunas do autor, não o corrija e não resolva incertezas dele — "acho que foi em 2015" continua "acho que foi em 2015".

O documento tem três camadas, e o leitor volta a cada uma com frequência diferente:

- **Essência** (topo) — o que se relê: tese, método compactado, vocabulário do autor. Cabe em uma tela.
- **Seções** (corpo) — o que se lê uma vez com atenção: cada conceito com todo o contexto, exemplos e citações.
- **Guia prático** (fim) — o que se consulta na hora de aplicar.

A essência lista, as seções explicam, o guia aplica. O mesmo texto não se repete nas três.

## Processo

1. **Ler tudo antes de escrever.** Percorra o input inteiro e liste: conceitos importantes, frases impactantes candidatas a citação, exemplos/histórias/casos, metodologias/frameworks, termos que o autor cunha ou redefine, objeções que ele responde, obras/pessoas/fontes que ele cita. Concluído quando cada conceito do autor está na lista junto com **todo o contexto** em que ele aparece.
2. **Mapear a estrutura.** Agrupe os conceitos pela similaridade natural do próprio autor, respeitando a ordem do pensamento dele. Cada grupo recebe um título **outlier** (fora da curva) em H1 que captura a essência única daquela seção. Concluído quando cada item da lista pertence a um grupo.
3. **Escrever cada seção** aplicando as regras de síntese, citação e formatação abaixo.
4. **Escrever o guia prático** como seção final, na estrutura abaixo.
5. **Escrever a essência por último** — ela resume o que você já escreveu — e posicioná-la no topo, logo após a fonte.
6. **Checagem final** com o checklist antes de entregar.

## Regras de síntese

- Para cada conceito, analise **todo o contexto** que o autor forneceu e escreva de forma clara, para fácil compreensão.
- Preserve **nuances, qualificações e refinamentos** que o autor faz.
- Inclua **exemplos práticos, histórias e casos** mencionados pelo autor.
- Capture **metodologias completas** quando há processos ou frameworks — todas as etapas, na ordem do autor.
- Registre **objeções e respostas juntas**: quando o autor antecipa uma crítica ("as pessoas dizem X, mas..."), responde a uma pergunta da plateia ou corrige um erro comum de quem aplica a ideia, o par objeção → resposta é o trecho que mais protege o leitor de aplicar errado. Ele fica na seção do conceito e alimenta o "O que evitar" do guia.
- Incerteza do autor é conteúdo: mantenha "acho", "se não me engano", "provavelmente".

## Citações diretas

Abundância: toda **frase impactante** do autor deve estar preservada como citação, sempre traduzida para o português.

Priorize citações que revelam:

- princípios universais
- paradoxos e tensões intelectuais
- definições únicas de conceitos conhecidos
- metáforas e analogias poderosas

Uma frase entra como citação **ou** como bullet, não como os dois. Se a formulação do autor já é clara, use a citação e deixe o bullet para o que ela não diz sozinha: quando foi dita, sobre o quê, qual o mecanismo por trás. Repetir a mesma frase em bullet, negrito e blockquote triplica o tamanho sem acrescentar entendimento.

Toda citação traz um contexto breve após o travessão. Se o input tem marcadores de tempo, número de página ou de capítulo, inclua-os nesse contexto: o leitor consegue conferir a fonte em segundos.

## Vocabulário do autor

Quando o autor cunha termos, metáforas ou redefine palavras comuns ("porta de um sentido", "caneta hidrocor", "adjacência"), esse vocabulário é parte do conhecimento. O documento precisa usá-lo com consistência para o leitor conseguir voltar à fonte e conversar com quem leu o original.

- Escolha **uma** tradução por termo e use só ela em todo o documento. Na primeira ocorrência, mostre o original entre parênteses: "porta de um sentido" (*one-way door*).
- Liste esses termos na essência, cada um definido em uma linha com as palavras do autor. Só termos que o autor cunha ou redefine — não é um dicionário de termos comuns. Sem termos assim, omita a lista.

## Formatação

- **Bullets** para legibilidade e reutilização.
- **Heading 1** para cada grupo, com título outlier; subseções detalhadas mantêm hierarquia clara.
- **Negrito estratégico** em pontos-chave e contextos importantes — poucos por bullet, senão deixa de destacar.
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

Ilustre os pontos principais com casos de uso ou cenários realistas. Se o usuário disse onde quer aplicar ("na squad", "no meu time de vendas"), os cenários falam para esse contexto; caso contrário, use o contexto do próprio autor.

Fronteira de fidelidade no guia: cada recomendação deriva de algo que o autor disse. Cenários que você cria para ilustrar são bem-vindos, mas marcados como tal ("*Cenário ilustrativo:*"), para o leitor não os atribuir ao autor. O guia não reexplica o método — as seções já fizeram isso; ele mostra como colocá-lo em prática.

## Referências citadas pelo autor

Se o autor menciona livros, artigos, pessoas, palestras ou ferramentas, reúna-os em uma seção curta ao fim do documento: o que ele disse sobre cada um e para que recomenda. Preserve incertezas de título e ano. Não acrescente referências que o autor não citou nem complete dados a partir do seu conhecimento. Sem referências no input, omita a seção.

## Estrutura do documento

```markdown
# [Título do documento]

**Fonte:** autor, tipo de material (palestra, artigo, podcast, notas), veículo e data quando houver, idioma original.

## Essência
- **Tese central:** uma ou duas frases, de preferência do autor.
- **[Método ou framework do autor]:** etapas em uma linha cada.
- **Vocabulário do autor:** termo (*original*) — definição em uma linha. [só se houver]

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

# Referências citadas pelo autor [só se houver]
```

## Checklist final

- Cada conceito importante do input aparece no documento, com suas nuances?
- Cada frase impactante está preservada como citação, em português?
- Exemplos, histórias, metodologias completas e pares objeção → resposta estão incluídos?
- Algum trecho é interpretação sua em vez do autor? Remova. Alguma incerteza do autor foi resolvida com o seu conhecimento? Devolva a incerteza.
- Cada H1 é um título outlier que captura a essência da seção?
- A essência cabe em uma tela e não repete o corpo?
- Cada termo do autor tem uma única tradução, com o original na primeira ocorrência?
- Alguma frase aparece duplicada como bullet e como citação? Escolha uma.
- O guia cobre as 5 partes, separa **o que fazer** de **o que evitar** e marca os cenários que são seus?
- Referências citadas pelo autor reunidas ao fim (quando houver)?

## Entrega

Quando o input veio de um arquivo, salve o resultado ao lado dele como `<nome>-conhecimento.md`, a menos que o usuário indique outro destino. Caso contrário, responda com o documento inline.
