// @vitest-environment happy-dom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { KpiCard, KpiGrid } from '../ui/KpiCard';

/**
 * The KPI card as an observable contract. It ships NO words (PWA-03): every string is a prop,
 * sentinel ASCII here so a copy change cannot turn this file red.
 */

afterEach(cleanup);

describe('KpiCard', () => {
  it('renders the label, value, unit, delta, sentiment and note it is given', () => {
    const { container } = render(
      <KpiCard
        label="label-sentinel"
        value="42"
        unit="unit-sentinel"
        delta={{ text: 'delta-sentinel', direction: 'up', tone: 'success', sentiment: 'good-word' }}
        note="note-sentinel"
      />,
    );
    for (const text of [
      'label-sentinel',
      '42',
      'unit-sentinel',
      'delta-sentinel',
      'note-sentinel',
    ]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
    expect(screen.getByText('good-word')).toHaveClass('sr-only');
    expect(screen.getByText('delta-sentinel').parentElement).toHaveClass('text-success');
    expect(container.querySelector('svg.lucide-arrow-up')).not.toBeNull();
  });

  it('draws a down arrow for down and a dash for flat', () => {
    const { container, rerender } = render(
      <KpiCard label="l" value="1" delta={{ text: 'd', direction: 'down', tone: 'danger' }} />,
    );
    expect(container.querySelector('svg.lucide-arrow-down')).not.toBeNull();
    rerender(
      <KpiCard label="l" value="1" delta={{ text: 'd', direction: 'flat', tone: 'neutral' }} />,
    );
    expect(container.querySelector('svg.lucide-minus')).not.toBeNull();
    expect(container.querySelector('svg.lucide-arrow-up, svg.lucide-arrow-down')).toBeNull();
  });

  it('renders no text of its own', () => {
    const { container } = render(<KpiCard label="L" value="V" />);
    expect(container.textContent).toBe('LV');
  });

  it('the missing variant is dashed and muted', () => {
    const { container } = render(
      <KpiCard label="L" value="missing-sentinel" note="why" variant="missing" />,
    );
    expect(container.firstElementChild).toHaveClass('border-dashed');
    expect(screen.getByText('missing-sentinel')).toHaveClass('text-text-tertiary');
  });

  it('renders the badge next to the value', () => {
    render(<KpiCard label="L" value="value-sentinel" badge="badge-sentinel" />);
    const badge = screen.getByText('badge-sentinel');
    expect(badge.parentElement).toContainElement(screen.getByText('value-sentinel'));
  });

  it('renders the chart slot', () => {
    render(<KpiCard label="L" value="V" chart={<span>chart-sentinel</span>} />);
    expect(screen.getByText('chart-sentinel')).toBeInTheDocument();
  });

  it('renders the footer last, after the note and the chart', () => {
    const { container } = render(
      <KpiCard
        label="L"
        value="V"
        note="note-sentinel"
        chart={<span>chart-sentinel</span>}
        footer={<span>footer-sentinel</span>}
      />,
    );
    const footer = screen.getByText('footer-sentinel');
    expect(container.firstElementChild?.lastElementChild).toContainElement(footer);
    const note = screen.getByText('note-sentinel');
    expect(note.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('without a footer, adds nothing after the note', () => {
    const { container } = render(<KpiCard label="L" value="V" note="note-sentinel" />);
    const card = container.firstElementChild;
    expect(card?.children).toHaveLength(3);
    expect(card?.lastElementChild).toBe(screen.getByText('note-sentinel'));
  });
});

describe('KpiGrid', () => {
  it('is a wrapping grid, never a horizontal scroller', () => {
    const { container } = render(
      <KpiGrid>
        <span>a</span>
      </KpiGrid>,
    );
    const grid = container.firstElementChild;
    expect(grid).toHaveClass('grid');
    expect(grid?.className).not.toMatch(/overflow-x|flex-nowrap/);
  });
});
