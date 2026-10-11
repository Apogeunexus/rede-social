// @vitest-environment happy-dom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BarList } from '../ui/BarList';
import { LineChart } from '../ui/LineChart';
import { barPercent } from '../ui/scale';

/** Charts drawn to scale, in token colours, with no words of their own (sentinel strings). */

afterEach(cleanup);

function fillWidths(container: HTMLElement): string[] {
  return [...container.querySelectorAll<HTMLElement>('[data-bar-fill]')].map(
    (el) => el.style.width,
  );
}

describe('BarList', () => {
  const rows = [
    { id: 'a', label: 'row-a', value: 5230, display: 'shown-a', highlight: true },
    { id: 'b', label: 'row-b', value: 410, display: 'shown-b' },
  ];

  it('fills each bar to value / largest value', () => {
    const { container } = render(<BarList rows={rows} />);
    expect(fillWidths(container)).toEqual(['100%', `${barPercent(410, 5230)}%`]);
  });

  it('uses the caller max when given', () => {
    const { container } = render(
      <BarList rows={rows.map((r) => ({ ...r, value: 50 }))} max={100} />,
    );
    expect(fillWidths(container)).toEqual(['50%', '50%']);
  });

  it('prints the caller value label and the optional rate', () => {
    render(
      <BarList rows={[{ id: 'a', label: 'L', value: 1, display: 'D', rate: 'rate-sentinel' }]} />,
    );
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('rate-sentinel')).toBeInTheDocument();
  });

  it('paints the highlighted bar in the brand token', () => {
    const { container } = render(<BarList rows={rows} />);
    const [first, second] = container.querySelectorAll('[data-bar-fill]');
    expect(first).toHaveClass('bg-brand');
    expect(second).not.toHaveClass('bg-brand');
  });
});

describe('LineChart', () => {
  const series = [310, 330, 425, 380];
  const previous = [280, 290, 300, 355];

  function chart(withPrevious: boolean) {
    return render(
      <LineChart
        series={series}
        {...(withPrevious ? { previous } : {})}
        xLabels={['x1', '', '', 'x4']}
        yStep={50}
        formatValue={(n) => `v${n}`}
        ariaLabel="chart-sentinel"
      />,
    );
  }

  it('is an image with the caller label', () => {
    chart(false);
    expect(screen.getByRole('img', { name: 'chart-sentinel' })).toBeInTheDocument();
  });

  it('shares ONE y-scale across both series (ticks from the union, floored/ceiled to the step)', () => {
    const { container } = chart(true);
    const ticks = [...container.querySelectorAll('[data-tick]')].map((t) => t.textContent);
    expect(ticks).toEqual(['v250', 'v350', 'v450']);
  });

  it('draws the previous period dashed in the tertiary token, the current one in brand', () => {
    const { container } = chart(true);
    const prev = container.querySelector('[data-series="previous"]');
    const cur = container.querySelector('[data-series="current"]');
    expect(prev).toHaveAttribute('stroke-dasharray');
    expect(prev).toHaveClass('text-text-tertiary');
    expect(cur).toHaveClass('text-brand');
    expect(cur).not.toHaveAttribute('stroke-dasharray');
    expect(container.querySelector('[data-series="area"]')).toHaveClass('text-brand');
    expect(container.querySelector('[data-last-point]')).toHaveClass('text-brand');
  });

  it('has no previous path without a previous series, and prints only the x labels given', () => {
    const { container } = chart(false);
    expect(container.querySelector('[data-series="previous"]')).toBeNull();
    const xs = [...container.querySelectorAll('[data-x-label]')].map((t) => t.textContent);
    expect(xs).toEqual(['x1', 'x4']);
  });

  it('ships no words: every text node comes from the caller', () => {
    const { container } = chart(true);
    const texts = [...container.querySelectorAll('text')].map((t) => t.textContent ?? '');
    for (const text of texts) expect(text).toMatch(/^(v\d+|x\d)$/);
  });
});
