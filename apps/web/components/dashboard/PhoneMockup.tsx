import { BatteryFull, Signal, Wifi } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { CSSProperties, ReactNode } from 'react';

/**
 * The preview's iPhone 17 Pro Max around a panel (desktop only).
 *
 * (a) The logical screen is 440x956 pt, rendered at 1:1 CSS px, inside a 12 px bezel: the frame is
 * 464x980.
 * (b) The viewport `lg:` variants here are intentional: the frame belongs to the window (no frame
 * below lg, where the panel is full width), while everything inside lays out against the
 * `@container` wrapper, so a panel shows its phone layout in the 440 px screen and its wide layout
 * unframed.
 * (c) The frame scales down to the window height, never up: `--phone-scale` is
 * min(1, (100dvh - 4rem) / 980px). tan(atan2(a, b)) is how CSS turns a length ratio into a plain
 * number that every current engine parses. 4rem is the preview `main`'s 3rem vertical padding plus
 * 1rem of slack, so subpixel rounding never adds a page scrollbar. The bezel is scaled with a
 * transform over a box reserved at the scaled size, so the screen's own size stays 440x956.
 * (d) `DevicePhone` is not reused: it is a client component modelling a 393x852 iPhone 15 Pro, with a
 * hard-coded clock, and it wraps the device in `role="img"`, which would hide the panel's headings,
 * tables and buttons from assistive tech. It also belongs to the platform panel. Its device tokens,
 * island and home-indicator proportions and reserved-box pattern are reused here.
 */
export async function PhoneMockup({ children }: { children: ReactNode }) {
  const t = await getTranslations('dashboard.preview');

  return (
    <div
      data-phone-frame
      className="min-w-0 lg:h-[calc(980px*var(--phone-scale))] lg:w-[calc(464px*var(--phone-scale))] lg:shrink-0"
      style={{ '--phone-scale': 'min(1, tan(atan2(100dvh - 4rem, 980px)))' } as CSSProperties}
    >
      <div className="lg:h-[980px] lg:w-[464px] lg:origin-top-left lg:[transform:scale(var(--phone-scale))] lg:rounded-[67px] lg:bg-[var(--device-bezel)] lg:p-3 lg:shadow-[var(--device-shadow),0_0_0_1px_var(--device-rim)]">
        <div
          data-phone-screen
          className="lg:relative lg:h-[956px] lg:w-[440px] lg:overflow-y-auto lg:overscroll-contain lg:rounded-[55px] lg:bg-bg lg:scrollbar-none"
        >
          <div
            aria-hidden
            className="sticky top-0 z-10 hidden h-[62px] items-center justify-between bg-bg pr-8 pl-10 text-sm font-bold text-text lg:flex"
          >
            <span className="tabular-nums">{t('phone.time')}</span>
            <span className="flex items-center gap-1.5">
              <Signal aria-hidden size={18} />
              <Wifi aria-hidden size={18} />
              <BatteryFull aria-hidden size={22} />
            </span>
            <span
              aria-hidden
              className="absolute top-[11px] left-1/2 h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black"
            />
          </div>
          <div className="@container lg:px-4 lg:pt-2 lg:pb-4">{children}</div>
          <div
            aria-hidden
            className="pointer-events-none sticky bottom-0 hidden h-[34px] items-end justify-center pb-2 lg:flex"
          >
            <span className="h-[5px] w-[140px] rounded-full bg-text opacity-30" />
          </div>
        </div>
      </div>
    </div>
  );
}
