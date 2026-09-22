# Comprovante Certo

Crie a interface de um aplicativo desktop/web chamado "Separador de Comprovantes" para uso interno de uma administradora de consórcio (Tradição Administradora de Consórcio).

## Objetivo do app

Automatizar a separação de comprovantes bancários (PDF) e o cruzamento com listagens de Pagamento de Bem.

## Funcionalidades (3 modos)

1. **Pasta inteira** — detecta o tipo pelo nome do arquivo (PIX, BOLETO, BOLETO MANUAL, TED, REALTIME, SALÁRIOS, OUTROS TRIBUTOS) e separa cada página em PDFs individuais, organizados em subpastas por tipo.

2. **Arquivo único** — usuário escolhe o tipo manualmente e processa um PDF.

3. **Pagamento de Bem** — cruza uma listagem PDF (CNPJ/CPF + Valor) com uma pasta de comprovantes já separados; copia os encontrados para a pasta PAGAMENTO_BEM e lista no log os não encontrados. Não copia o mesmo arquivo de origem duas vezes; se o nome já existir, salva como -2, -3.

## Layout da tela

- Header compacto com nome do app e subtítulo discreto.

- Card “Modo de operação” com 3 opções em radio (ou segmented control).

- Card “Caminhos” com botões de seleção e caminho exibido abaixo (truncado se longo).

  - No modo Bem: 3 seletores (Listagem PDF | Pasta de comprovantes | Pasta de saída).

  - Nos outros modos: entrada + saída (e seletor de tipo só no modo arquivo único).

- Botão principal “PROCESSAR” em destaque, desabilitado durante o processamento.

- Área de log em destaque (terminal limpo): fundo escuro, texto mono, scroll, tags coloridas:

  - [OK] verde

  - [NÃO ENCONTRADO] âmbar/laranja

  - [AVISO] azul

  - [IGNORADO] cinza

  - [ERRO] vermelho

- Rodapé com resumo rápido após o processamento (processados / não encontrados / avisos).

## Estilo visual (design system)

- Visual: SaaS financeiro moderno, sóbrio e profissional — não “startup colorida”.

- Tema: dark mode como padrão (ambiente de trabalho contábil/financeiro).

- Cores:

  - Fundo: #0F1419 / cards #1A2332

  - Borda sutil: #2A3544

  - Texto principal: #E8EEF6

  - Texto secundário: #8B9BB4

  - Primária (ação): #3B82F6 (azul confiável)

  - Sucesso: #22C55E | Aviso: #F59E0B | Erro: #EF4444

- Tipografia: Inter ou similar para UI; JetBrains Mono / IBM Plex Mono no log.

- Cantos: 10–12px nos cards; botões 8px.

- Espaçamento generoso, hierarquia clara, sem poluição visual.

- Ícones lineares discretos (pasta, arquivo, play, check).

- Feedback de loading no botão PROCESSAR (spinner + “Processando…”).

- Microinterações leves (hover nos botões, foco nos radios).

## Tom da interface

Textos em português do Brasil, objetivos e curtos. Evitar jargão técnico desnecessário. Exemplos:

- “Selecionar pasta de entrada”

- “Selecionar PDF da Listagem (Pagto de Bem)”

- “Processamento concluído — confira o log”

## Não incluir

- Login, dashboard genérico, gráficos ou marketing.

- Tema claro por enquanto (pode haver toggle depois, mas o foco é dark).

- Elementos decorativos excessivos.

## Resultado esperado

Uma única tela principal polida, pronta para uso operacional diário, com aparência de ferramenta interna de backoffice financeiro — limpa, legível e confiável.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e132875a-6c5f-41c5-ab92-928da213ee2b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
