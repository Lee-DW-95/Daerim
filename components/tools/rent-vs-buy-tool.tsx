"use client";

import * as React from "react";
import { TrendingUp, Minus, ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatManwon } from "@/lib/format";
import { simulate, SCENARIO_LABEL, type SimulatorInput, type Scenario } from "@/lib/simulator";
import { RentVsBuyChart } from "@/components/charts/rent-vs-buy-chart";

const DEFAULT_INPUT: SimulatorInput = {
  capitalManwon: 30000, // 3억
  loanManwon: 50000, // 5억
  years: 10,
  appreciationRatePct: 3,
  loanRatePct: 4,
  monthlyRentManwon: 150,
  savingsRatePct: 3,
};

export function RentVsBuyTool() {
  const [input, setInput] = React.useState<SimulatorInput>(DEFAULT_INPUT);

  const update = <K extends keyof SimulatorInput>(key: K, value: SimulatorInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const result = React.useMemo(() => simulate(input), [input]);

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <NumberInput
            label="자본금"
            unit="만원"
            value={input.capitalManwon}
            onChange={(v) => update("capitalManwon", v)}
            step={1000}
            min={0}
          />
          <NumberInput
            label="대출 가능 금액"
            unit="만원"
            value={input.loanManwon}
            onChange={(v) => update("loanManwon", v)}
            step={1000}
            min={0}
          />
          <RangeInput
            label="보유 기간"
            unit="년"
            value={input.years}
            onChange={(v) => update("years", v)}
            min={1}
            max={30}
            step={1}
          />
          <RangeInput
            label="예상 시세 상승률"
            unit="%/년"
            value={input.appreciationRatePct}
            onChange={(v) => update("appreciationRatePct", v)}
            min={-3}
            max={10}
            step={0.5}
            decimals={1}
          />
          <RangeInput
            label="대출 금리"
            unit="%/년"
            value={input.loanRatePct}
            onChange={(v) => update("loanRatePct", v)}
            min={1}
            max={10}
            step={0.25}
            decimals={2}
          />
          <NumberInput
            label="월세 (시나리오 비교용)"
            unit="만원/월"
            value={input.monthlyRentManwon}
            onChange={(v) => update("monthlyRentManwon", v)}
            step={10}
            min={0}
          />
          <RangeInput
            label="적금/안전자산 수익률"
            unit="%/년"
            value={input.savingsRatePct}
            onChange={(v) => update("savingsRatePct", v)}
            min={0}
            max={8}
            step={0.25}
            decimals={2}
          />
        </CardContent>
      </Card>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              RESULTS
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              {input.years}년 후 시나리오별 순자산
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              y축은 보유 순자산(만원). 월세는 매월 지출이라 시간이 지날수록
              순자산이 줄어드는 게 정상입니다.
            </p>
          </div>
          <Badge variant="outline">최적: {SCENARIO_LABEL[result.best]}</Badge>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 md:p-6">
          <RentVsBuyChart data={result.series} />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {(Object.keys(SCENARIO_LABEL) as Scenario[]).map((s) => {
          const final = result.finalManwon[s];
          const baseline = result.finalManwon[result.best];
          const diff = final - baseline;
          return (
            <Card
              key={s}
              className={cn(
                "transition-colors",
                s === result.best && "border-primary/50 bg-primary/5"
              )}
            >
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{SCENARIO_LABEL[s]}</p>
                  {s === result.best ? (
                    <Badge>1위</Badge>
                  ) : (
                    <Badge variant="secondary">차이</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {input.years}년 후 순자산
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatManwon(final, { unit: "auto" })}
                </p>
                {s !== result.best && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {diff < 0 ? (
                      <ArrowDown className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    1위와 {formatManwon(Math.abs(diff), { unit: "auto" })} 차이
                  </p>
                )}
                {s === result.best && (
                  <p className="flex items-center gap-1 text-xs font-medium text-primary">
                    <TrendingUp className="h-3 w-3" />
                    가장 유리한 선택
                  </p>
                )}
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {result.notes[s]}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <div className="rounded-xl border border-border bg-secondary/40 p-5 text-xs leading-relaxed text-muted-foreground">
        <p className="mb-1 font-medium text-foreground">계산 가정</p>
        <ul className="space-y-1">
          <li>· 매매: 자본금+대출로 매수, 시세 상승률 매년 적용, 대출은 단리 이자만 계산.</li>
          <li>· 전세: 자본금 전액이 보증금이라 가정, N년 후 보증금 그대로 회수 (인상 미반영).</li>
          <li>· 월세: 자본금은 적금/안전자산에 거치, 월세는 매월 지출 (소득 외 추가 비용).</li>
          <li>· 세금·중개수수료·이사비용 등 부대 비용은 제외했습니다.</li>
        </ul>
      </div>
    </div>
  );
}

function NumberInput({
  label,
  unit,
  value,
  onChange,
  min = 0,
  step = 100,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:border-primary">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-base font-semibold tabular-nums outline-none"
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      {value >= 10000 && (
        <p className="text-xs text-muted-foreground">
          ≈ {formatManwon(value, { unit: "eok" })}
        </p>
      )}
    </div>
  );
}

function RangeInput({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step = 1,
  decimals = 0,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
        <span className="text-sm font-semibold tabular-nums">
          {value.toFixed(decimals)} {unit}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
