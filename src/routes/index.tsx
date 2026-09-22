import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  Check,
  ChevronDown,
  FileSearch,
  FileText,
  Folder,
  FolderInput,
  FolderOutput,
  LoaderCircle,
  Play,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Separador de Comprovantes — Tradição" },
      {
        name: "description",
        content: "Ferramenta interna para separar e conferir comprovantes bancários.",
      },
      { property: "og:title", content: "Separador de Comprovantes — Tradição" },
      {
        property: "og:description",
        content: "Ferramenta interna para separar e conferir comprovantes bancários.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Mode = "folder" | "file" | "payment";
type PathKey = "input" | "output" | "listing" | "receipts";
type LogTone = "ok" | "missing" | "warning" | "ignored" | "error";

type LogItem = {
  time: string;
  tone: LogTone;
  label: string;
  message: string;
};

const modes = [
  {
    id: "folder" as const,
    icon: Folder,
    title: "Pasta inteira",
    description: "Detecta e separa por tipo",
  },
  {
    id: "file" as const,
    icon: FileText,
    title: "Arquivo único",
    description: "Processa um PDF por vez",
  },
  {
    id: "payment" as const,
    icon: FileSearch,
    title: "Pagamento de Bem",
    description: "Cruza listagem e comprovantes",
  },
];

const receiptTypes = [
  "PIX",
  "BOLETO",
  "BOLETO MANUAL",
  "TED",
  "REALTIME",
  "SALÁRIOS",
  "OUTROS TRIBUTOS",
];

const initialLogs: LogItem[] = [
  {
    time: "09:42:06",
    tone: "warning",
    label: "AVISO",
    message: "Selecione os caminhos para iniciar um novo processamento.",
  },
  {
    time: "09:42:06",
    tone: "ignored",
    label: "PRONTO",
    message: "Aguardando arquivos.",
  },
];

const resultLogs: Record<Mode, LogItem[]> = {
  folder: [
    { time: "09:48:12", tone: "warning", label: "AVISO", message: "Iniciando leitura de 18 arquivos PDF." },
    { time: "09:48:13", tone: "ok", label: "OK", message: "PIX_2209.pdf — 8 páginas separadas em PIX." },
    { time: "09:48:14", tone: "ok", label: "OK", message: "BOLETOS_2209.pdf — 5 páginas separadas em BOLETO." },
    { time: "09:48:14", tone: "ignored", label: "IGNORADO", message: "LEIA-ME.txt — formato não compatível." },
    { time: "09:48:15", tone: "ok", label: "OK", message: "TED_2209.pdf — 4 páginas separadas em TED." },
    { time: "09:48:15", tone: "warning", label: "AVISO", message: "Processamento concluído — confira o log." },
  ],
  file: [
    { time: "09:48:12", tone: "warning", label: "AVISO", message: "Validando o arquivo selecionado." },
    { time: "09:48:13", tone: "ok", label: "OK", message: "Documento identificado e aberto com sucesso." },
    { time: "09:48:14", tone: "ok", label: "OK", message: "6 páginas separadas e nomeadas." },
    { time: "09:48:15", tone: "warning", label: "AVISO", message: "Processamento concluído — confira o log." },
  ],
  payment: [
    { time: "09:48:12", tone: "warning", label: "AVISO", message: "Listagem carregada: 12 pagamentos." },
    { time: "09:48:13", tone: "ok", label: "OK", message: "12.345.678/0001-90 · R$ 18.450,00 — comprovante copiado." },
    { time: "09:48:13", tone: "ok", label: "OK", message: "845.612.390-10 · R$ 3.280,50 — comprovante copiado." },
    { time: "09:48:14", tone: "missing", label: "NÃO ENCONTRADO", message: "38.991.220/0001-44 · R$ 7.900,00" },
    { time: "09:48:14", tone: "ignored", label: "IGNORADO", message: "Comprovante já utilizado: PIX_84561239010.pdf" },
    { time: "09:48:15", tone: "warning", label: "AVISO", message: "Processamento concluído — confira o log." },
  ],
};

function Index() {
  const [mode, setMode] = useState<Mode>("folder");
  const [receiptType, setReceiptType] = useState("PIX");
  const [paths, setPaths] = useState<Partial<Record<PathKey, string>>>({});
  const [logs, setLogs] = useState<LogItem[]>(initialLogs);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const inputRefs = useRef<Partial<Record<PathKey, HTMLInputElement | null>>>({});

  const requiredPaths = useMemo<PathKey[]>(
    () => (mode === "payment" ? ["listing", "receipts", "output"] : ["input", "output"]),
    [mode],
  );

  const ready = requiredPaths.every((key) => Boolean(paths[key]));

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setPaths({});
    setLogs(initialLogs);
    setCompleted(false);
  };

  const chooseFiles = (key: PathKey) => inputRefs.current[key]?.click();

  const handleSelection = (key: PathKey, event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const first = files[0];
    const relativePath = first?.webkitRelativePath;
    const folder = relativePath?.split("/")[0];
    const value = files.length > 1 && folder ? `${folder} · ${files.length} arquivos` : first?.name;
    if (value) setPaths((current) => ({ ...current, [key]: value }));
    setCompleted(false);
  };

  const process = () => {
    if (!ready || isProcessing) return;
    setIsProcessing(true);
    setCompleted(false);
    setLogs([
      {
        time: "09:48:11",
        tone: "warning",
        label: "AVISO",
        message: "Preparando arquivos para processamento...",
      },
    ]);
    window.setTimeout(() => {
      setLogs(resultLogs[mode]);
      setIsProcessing(false);
      setCompleted(true);
    }, 1500);
  };

  const reset = () => {
    setPaths({});
    setLogs(initialLogs);
    setCompleted(false);
  };

  const pathFields = mode === "payment"
    ? [
        { key: "listing" as const, label: "Listagem PDF", action: "Selecionar PDF da Listagem", icon: FileText, file: true },
        { key: "receipts" as const, label: "Pasta de comprovantes", action: "Selecionar pasta de comprovantes", icon: FolderInput },
        { key: "output" as const, label: "Pasta de saída", action: "Selecionar pasta de saída", icon: FolderOutput },
      ]
    : [
        { key: "input" as const, label: mode === "file" ? "PDF de entrada" : "Pasta de entrada", action: mode === "file" ? "Selecionar PDF de entrada" : "Selecionar pasta de entrada", icon: mode === "file" ? FileText : FolderInput, file: mode === "file" },
        { key: "output" as const, label: "Pasta de saída", action: "Selecionar pasta de saída", icon: FolderOutput },
      ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-header/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <ReceiptText className="size-[19px]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold text-foreground">Separador de Comprovantes</h1>
              <p className="truncate text-xs text-muted-foreground">Tradição Administradora de Consórcio</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="size-1.5 rounded-full bg-success shadow-status" />
            Sistema pronto
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(460px,0.92fr)]">
          <div className="space-y-5">
            <section className="rounded-xl border border-border bg-card p-5 shadow-panel sm:p-6" aria-labelledby="mode-title">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Etapa 1</p>
                  <h2 id="mode-title" className="text-base font-semibold">Modo de operação</h2>
                </div>
                <span className="text-xs text-muted-foreground">Escolha uma opção</span>
              </div>
              <div className="grid gap-2.5 md:grid-cols-3" role="radiogroup" aria-label="Modo de operação">
                {modes.map((item) => {
                  const Icon = item.icon;
                  const selected = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => changeMode(item.id)}
                      className={cn(
                        "group relative flex min-h-[102px] flex-col items-start rounded-lg border p-4 text-left outline-hidden transition-all focus-visible:ring-3 focus-visible:ring-ring/35",
                        selected
                          ? "border-primary bg-primary-subtle shadow-selected"
                          : "border-border bg-secondary/45 hover:border-border-strong hover:bg-secondary",
                      )}
                    >
                      <div className="mb-3 flex w-full items-start justify-between">
                        <Icon className={cn("size-5", selected ? "text-primary" : "text-muted-foreground")} strokeWidth={1.8} />
                        <span className={cn("flex size-4 items-center justify-center rounded-full border", selected ? "border-primary bg-primary" : "border-border-strong")}>
                          {selected && <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{item.title}</span>
                      <span className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 shadow-panel sm:p-6" aria-labelledby="paths-title">
              <div className="mb-5">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Etapa 2</p>
                <h2 id="paths-title" className="text-base font-semibold">Caminhos</h2>
              </div>

              {mode === "file" && (
                <div className="mb-5">
                  <label htmlFor="receipt-type" className="mb-2 block text-xs font-medium text-muted-foreground">Tipo do comprovante</label>
                  <div className="relative">
                    <select
                      id="receipt-type"
                      value={receiptType}
                      onChange={(event) => setReceiptType(event.target.value)}
                      className="h-11 w-full appearance-none rounded-lg border border-border bg-secondary px-3 pr-10 text-sm font-medium text-foreground outline-hidden transition-colors focus:border-primary focus:ring-3 focus:ring-ring/25"
                    >
                      {receiptTypes.map((type) => <option key={type}>{type}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              )}

              <div className={cn("grid gap-3", mode === "payment" && "lg:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3")}>
                {pathFields.map((field) => {
                  const Icon = field.icon;
                  const selected = paths[field.key];
                  return (
                    <div key={field.key} className="min-w-0 rounded-lg border border-border bg-secondary/35 p-3.5">
                      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Icon className="size-4" strokeWidth={1.8} />
                        {field.label}
                      </div>
                      <Button variant="secondary" className="w-full justify-start px-3" onClick={() => chooseFiles(field.key)}>
                        {selected ? <Check className="size-4 text-success" /> : <Folder className="size-4 text-primary" />}
                        <span className="truncate">{field.action}</span>
                      </Button>
                      <p className={cn("mt-2 truncate text-[11px]", selected ? "text-foreground-soft" : "text-muted-foreground")} title={selected}>
                        {selected ?? "Nenhum caminho selecionado"}
                      </p>
                      <input
                        ref={(node) => {
                          inputRefs.current[field.key] = node;
                          if (node && !field.file) {
                            node.setAttribute("webkitdirectory", "");
                            node.setAttribute("directory", "");
                          }
                        }}
                        type="file"
                        accept={field.file ? "application/pdf,.pdf" : undefined}
                        multiple={!field.file}
                        className="hidden"
                        onChange={(event) => handleSelection(field.key, event)}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
                <Button className="h-12 flex-1 text-[13px] tracking-[0.08em]" disabled={!ready || isProcessing} onClick={process}>
                  {isProcessing ? <LoaderCircle className="size-4 animate-spin" /> : <Play className="size-4 fill-current" />}
                  {isProcessing ? "PROCESSANDO..." : "PROCESSAR"}
                </Button>
                <Button variant="ghost" className="h-12 px-4" disabled={isProcessing} onClick={reset} aria-label="Limpar seleção">
                  <RotateCcw className="size-4" />
                  Limpar
                </Button>
              </div>
              {!ready && <p className="mt-3 text-center text-[11px] text-muted-foreground sm:text-left">Selecione todos os caminhos para liberar o processamento.</p>}
            </section>
          </div>

          <section className="flex min-h-[490px] flex-col overflow-hidden rounded-xl border border-log-border bg-log shadow-panel" aria-labelledby="log-title">
            <div className="flex min-h-14 items-center justify-between border-b border-log-border px-5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-md bg-log-raised text-muted-foreground">
                  <Archive className="size-4" strokeWidth={1.8} />
                </span>
                <div>
                  <h2 id="log-title" className="text-sm font-semibold text-foreground">Log de processamento</h2>
                  <p className="text-[10px] text-muted-foreground">Acompanhamento em tempo real</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-error/70" />
                <span className="size-2 rounded-full bg-warning/70" />
                <span className="size-2 rounded-full bg-success/70" />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 font-mono text-xs leading-relaxed">
              <div className="mb-4 flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">›</span>
                <span>separador_comprovantes.exe</span>
                <span className="animate-pulse text-primary">_</span>
              </div>
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div key={`${log.time}-${index}`} className="grid grid-cols-[56px_minmax(0,1fr)] gap-2 animate-log-in">
                    <span className="text-muted-foreground/65">{log.time}</span>
                    <div className="min-w-0">
                      <span className={cn("mr-2 inline-block font-bold", {
                        "text-success": log.tone === "ok",
                        "text-warning": log.tone === "missing",
                        "text-info": log.tone === "warning",
                        "text-muted-foreground": log.tone === "ignored",
                        "text-error": log.tone === "error",
                      })}>[{log.label}]</span>
                      <span className="break-words text-log-foreground">{log.message}</span>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-2 text-log-foreground">
                    <span className="text-muted-foreground/65">09:48:12</span>
                    <span className="inline-flex items-center gap-2"><LoaderCircle className="size-3.5 animate-spin text-primary" />Lendo documentos...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-log-border bg-log-raised/55 p-4 sm:p-5">
              {completed ? (
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-success/20 bg-success/8 p-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Processamento concluído</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Confira os resultados e o log acima.</p>
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  O resumo será atualizado ao concluir.
                </div>
              )}
              <div className="grid grid-cols-3 divide-x divide-log-border">
                <Summary value={completed ? (mode === "payment" ? "11" : mode === "file" ? "6" : "17") : "—"} label="Processados" tone="success" />
                <Summary value={completed && mode === "payment" ? "1" : "0"} label="Não encontrados" tone="warning" />
                <Summary value={completed ? "1" : "0"} label="Avisos" tone="info" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Summary({ value, label, tone }: { value: string; label: string; tone: "success" | "warning" | "info" }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0 sm:px-5">
      <p className={cn("font-mono text-xl font-semibold", tone === "success" && "text-success", tone === "warning" && "text-warning", tone === "info" && "text-info")}>{value}</p>
      <p className="mt-1 truncate text-[10px] text-muted-foreground sm:text-[11px]">{label}</p>
    </div>
  );
}