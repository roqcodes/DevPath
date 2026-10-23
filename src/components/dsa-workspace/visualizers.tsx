"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VisualizerKind } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

function StepControls({
  step,
  max,
  onStep,
  onReset,
  playing,
  onPlayToggle,
}: {
  step: number;
  max: number;
  onStep: (n: number) => void;
  onReset: () => void;
  playing: boolean;
  onPlayToggle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4" role="group" aria-label="Visualizer steps">
      <Button type="button" size="sm" variant="outline" onClick={() => onStep(Math.max(0, step - 1))} disabled={step <= 0}>
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => onStep(Math.min(max, step + 1))} disabled={step >= max}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onPlayToggle}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {playing ? "Pause" : "Play"}
      </Button>
      <span className="text-xs text-muted-foreground ml-auto">Step {step + 1} / {max + 1}</span>
    </div>
  );
}

function ArrayCells({ values, highlight }: { values: number[]; highlight?: number[] }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center py-4">
      {values.map((v, i) => (
        <div
          key={i}
          className={cn(
            "flex h-12 w-12 flex-col items-center justify-center rounded border text-sm font-mono",
            highlight?.includes(i) ? "border-accent bg-accent/15 text-accent" : "border-border bg-muted/40"
          )}
        >
          <span className="text-[10px] text-muted-foreground">{i}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}

function BinarySearchViz() {
  const arr = [2, 5, 8, 12, 16, 23, 38];
  const target = 16;
  const steps = [
    { l: 0, r: 6, m: 3, note: "mid=12 < 16 → move left boundary right" },
    { l: 4, r: 6, m: 5, note: "mid=23 > 16 → move right boundary left" },
    { l: 4, r: 4, m: 4, note: "mid=16 found" },
  ];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const s = steps[step];
  const hi = [s.l, s.m, s.r].filter((x) => x >= 0);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">Sorted array, target {target}</p>
      <ArrayCells values={arr} highlight={hi} />
      <p className="text-sm mt-2 font-medium">{s.note}</p>
      <StepControls step={step} max={steps.length - 1} onStep={setStep} onReset={() => setStep(0)} playing={playing} onPlayToggle={() => setPlaying((p) => !p)} />
    </div>
  );
}

function TwoPointersViz() {
  const arr = [1, 2, 4, 5, 7, 9];
  const steps = [
    { l: 0, r: 5, sum: 10 },
    { l: 0, r: 4, sum: 8 },
    { l: 1, r: 4, sum: 9 },
  ];
  const [step, setStep] = useState(0);
  const s = steps[step];
  return (
    <div>
      <p className="text-sm text-muted-foreground">Target sum 9</p>
      <ArrayCells values={arr} highlight={[s.l, s.r]} />
      <p className="text-sm mt-2">l={s.l}, r={s.r}, sum={s.sum}</p>
      <StepControls step={step} max={steps.length - 1} onStep={setStep} onReset={() => setStep(0)} playing={false} onPlayToggle={() => undefined} />
    </div>
  );
}

function SlidingWindowViz() {
  const arr = [2, 1, 5, 1, 3, 2];
  const k = 3;
  const steps = [0, 1, 2, 3].map((start) => ({
    start,
    end: start + k - 1,
    sum: arr.slice(start, start + k).reduce((a, b) => a + b, 0),
  }));
  const [step, setStep] = useState(0);
  const s = steps[step];
  const hi = Array.from({ length: k }, (_, i) => s.start + i);
  return (
    <div>
      <p className="text-sm text-muted-foreground">Window size {k}</p>
      <ArrayCells values={arr} highlight={hi} />
      <p className="text-sm mt-2">Sum = {s.sum}</p>
      <StepControls step={step} max={steps.length - 1} onStep={setStep} onReset={() => setStep(0)} playing={false} onPlayToggle={() => undefined} />
    </div>
  );
}

function HashMapViz() {
  const ops = [
    { op: "insert('a')", map: { a: 1 } },
    { op: "insert('b')", map: { a: 1, b: 1 } },
    { op: "insert('a')", map: { a: 2, b: 1 } },
  ];
  const [step, setStep] = useState(0);
  const cur = ops[step];
  return (
    <div>
      <p className="text-sm font-mono">{cur.op}</p>
      <div className="mt-3 space-y-1 font-mono text-sm">
        {Object.entries(cur.map).map(([k, v]) => (
          <div key={k} className="flex justify-between border rounded px-3 py-1 bg-muted/30 max-w-xs">
            <span>{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
      <StepControls step={step} max={ops.length - 1} onStep={setStep} onReset={() => setStep(0)} playing={false} onPlayToggle={() => undefined} />
    </div>
  );
}

function LinkedListViz() {
  const nodes = ["A", "B", "C", "D"];
  const [step, setStep] = useState(0);
  const head = step;
  return (
    <div className="flex items-center justify-center gap-2 py-6 flex-wrap">
      {nodes.map((n, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={cn("rounded border px-4 py-2 font-mono", i === head ? "border-accent bg-accent/10" : "border-border")}>
            {n}
          </div>
          {i < nodes.length - 1 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
          )}
        </div>
      ))}
      <p className="w-full text-center text-sm text-muted-foreground mt-2">Traverse pointer at index {head}</p>
      <StepControls step={step} max={nodes.length - 1} onStep={setStep} onReset={() => setStep(0)} playing={false} onPlayToggle={() => undefined} />
    </div>
  );
}

function RecursionStackViz() {
  const frames = ["fact(3)", "fact(2)", "fact(1)", "return 1", "return 2", "return 6"];
  const [step, setStep] = useState(0);
  const visible = frames.slice(0, step + 1);
  return (
    <div>
      <div className="space-y-1 max-w-sm mx-auto">
        {visible.map((f, i) => (
          <div key={i} className="border rounded px-3 py-1 text-sm font-mono bg-[#1e1e1e] text-[#d4d4d4]">
            {f}
          </div>
        ))}
      </div>
      <StepControls step={step} max={frames.length - 1} onStep={setStep} onReset={() => setStep(0)} playing={false} onPlayToggle={() => undefined} />
    </div>
  );
}

function TreeViz() {
  const order = ["root", "left", "right", "left.left"];
  const [step, setStep] = useState(0);
  return (
    <div className="text-center py-4">
      <div className="inline-block border rounded-full px-4 py-2 mb-2 bg-muted/40">root</div>
      <div className="flex justify-center gap-8">
        <div className={cn("border rounded px-3 py-1", step >= 1 ? "border-accent" : "")}>L</div>
        <div className={cn("border rounded px-3 py-1", step >= 2 ? "border-accent" : "")}>R</div>
      </div>
      <p className="text-sm mt-3">DFS preorder step: {order[step]}</p>
      <StepControls step={step} max={order.length - 1} onStep={setStep} onReset={() => setStep(0)} playing={false} onPlayToggle={() => undefined} />
    </div>
  );
}

function GraphBfsViz() {
  const nodes = ["A", "B", "C", "D"];
  const [visited, setVisited] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const sequence = [["A"], ["A", "B"], ["A", "B", "C"], ["A", "B", "C", "D"]];
  const cur = sequence[step];
  return (
    <div>
      <div className="flex gap-3 justify-center flex-wrap">
        {nodes.map((n) => (
          <div key={n} className={cn("rounded-full border w-10 h-10 flex items-center justify-center", cur.includes(n) ? "bg-accent/20 border-accent" : "")}>
            {n}
          </div>
        ))}
      </div>
      <p className="text-sm text-center mt-3 flex flex-wrap items-center justify-center gap-1">
        <span className="text-muted-foreground">BFS visited:</span>
        {cur.map((n, i) => (
          <span key={`${n}-${i}`} className="inline-flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />}
            <span className="font-mono font-medium">{n}</span>
          </span>
        ))}
      </p>
      <StepControls step={step} max={sequence.length - 1} onStep={setStep} onReset={() => { setStep(0); setVisited([]); }} playing={false} onPlayToggle={() => undefined} />
    </div>
  );
}

function StackQueueViz() {
  const [stack, setStack] = useState<string[]>(["("]);
  const ops = ["push '('", "push ')'", "pop", "valid"];
  const [step, setStep] = useState(0);
  const stacks = [["("], ["(", ")"], ["("], []];
  const cur = stacks[step] ?? [];
  return (
    <div>
      <p className="text-sm text-muted-foreground">{ops[step]}</p>
      <div className="flex flex-col-reverse items-center gap-1 min-h-[120px] border rounded p-3 max-w-xs mx-auto mt-2 bg-muted/20">
        {cur.map((c, i) => (
          <div key={i} className="border w-full text-center py-1 font-mono bg-background">{c}</div>
        ))}
      </div>
      <StepControls step={step} max={ops.length - 1} onStep={setStep} onReset={() => setStep(0)} playing={false} onPlayToggle={() => undefined} />
    </div>
  );
}

function DpTableViz() {
  const grid = [
    [0, 1, 1],
    [1, 1, 2],
    [1, 2, 3],
  ];
  const [step, setStep] = useState(0);
  const cells = [[0, 0], [0, 1], [1, 1], [2, 2]];
  const [r, c] = cells[step];
  return (
    <div>
      <div className="grid grid-cols-3 gap-1 max-w-[200px] mx-auto">
        {grid.flatMap((row, ri) =>
          row.map((val, ci) => (
            <div key={`${ri}-${ci}`} className={cn("border text-center py-2 text-sm", ri === r && ci === c ? "border-accent bg-accent/15" : "")}>
              {val}
            </div>
          ))
        )}
      </div>
      <p className="text-sm text-center mt-2">Highlighting transition into cell ({r},{c})</p>
      <StepControls step={step} max={cells.length - 1} onStep={setStep} onReset={() => setStep(0)} playing={false} onPlayToggle={() => undefined} />
    </div>
  );
}

export function TopicVisualizer({ kind }: { kind: VisualizerKind }) {
  if (kind === "none") {
    return <p className="text-sm text-muted-foreground">No visualizer for this lesson yet. Use the worked example and playground.</p>;
  }
  const map: Record<VisualizerKind, ReactNode> = {
    "array-cells": <ArrayCells values={[3, 1, 4, 1, 5]} highlight={[2]} />,
    "binary-search": <BinarySearchViz />,
    "two-pointers": <TwoPointersViz />,
    "sliding-window": <SlidingWindowViz />,
    "hash-map": <HashMapViz />,
    "linked-list": <LinkedListViz />,
    "stack-queue": <StackQueueViz />,
    "recursion-stack": <RecursionStackViz />,
    "tree-traversal": <TreeViz />,
    "graph-bfs": <GraphBfsViz />,
    "dp-table": <DpTableViz />,
    none: null,
  };
  return <div className="rounded-lg border border-border bg-card p-4">{map[kind]}</div>;
}
