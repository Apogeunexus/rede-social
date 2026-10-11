import { Card, cn } from '@rede-social/ui';
import type { ReactNode } from 'react';

export interface TableColumn<K extends string> {
  key: K;
  header: string;
  numeric?: boolean;
  /** Left out of the small-screen card (the table still shows it from md up). */
  hideOnPhone?: boolean;
}

export interface TableRow<K extends string> {
  id: string;
  cells: Record<K, ReactNode>;
}

export interface ResponsiveTableProps<K extends string> {
  /** The table's accessible name (rendered as a visually hidden caption). */
  caption: string;
  columns: readonly TableColumn<K>[];
  rows: readonly TableRow<K>[];
}

/**
 * A table that never scrolls sideways (the TenantTable pattern): a real table element in a card from
 * md up, and below md one card per row, with the first column as the card's title and every other
 * column not hidden on small screens as label + value. Long tokens (domains, e-mails) break anywhere.
 */
export function ResponsiveTable<K extends string>({
  caption,
  columns,
  rows,
}: ResponsiveTableProps<K>) {
  const [titleColumn, ...rest] = columns;
  const phoneColumns = rest.filter((column) => !column.hideOnPhone);

  return (
    <>
      <Card className="hidden md:block">
        <table className="w-full table-auto border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-tertiary',
                    column.numeric && 'text-right',
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-divider last:border-0">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 align-middle text-text [overflow-wrap:anywhere]',
                      column.numeric && 'text-right tabular-nums',
                      column === titleColumn && 'font-bold',
                    )}
                  >
                    {row.cells[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <Card className="flex flex-col gap-2 p-4 [overflow-wrap:anywhere]">
              {titleColumn ? (
                <span className="text-sm font-bold text-text">{row.cells[titleColumn.key]}</span>
              ) : null}
              {phoneColumns.length > 0 ? (
                <dl className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 text-sm">
                  {phoneColumns.map((column) => (
                    <div key={column.key} className="contents">
                      <dt className="text-text-secondary">{column.header}</dt>
                      <dd
                        className={cn(
                          'min-w-0 text-right text-text',
                          column.numeric && 'tabular-nums',
                        )}
                      >
                        {row.cells[column.key]}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
