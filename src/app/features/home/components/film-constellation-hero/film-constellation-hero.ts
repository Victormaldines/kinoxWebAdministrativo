import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ConstellationFilm } from '../../../../core/models/kinox.models';

export type IntroStage = 'logo' | 'eye' | 'films' | 'ready';

interface OrbitFrameView {
  readonly film: ConstellationFilm;
  readonly transform: string;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly zIndex: number;
  readonly isFocused: boolean;
  readonly entranceDelayMs: number;
}

@Component({
  selector: 'app-film-constellation-hero',
  imports: [NgOptimizedImage],
  templateUrl: './film-constellation-hero.html',
  styleUrl: './film-constellation-hero.css',
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class FilmConstellationHero {
  private readonly destroyRef = inject(DestroyRef);

  readonly films = input.required<readonly ConstellationFilm[]>();
  readonly showConstellation = input(true);
  readonly selectFilm = output<ConstellationFilm>();
  readonly scrollToPanel = output<void>();
  readonly introReadyChange = output<boolean>();

  protected readonly introStage = signal<IntroStage>('logo');
  protected readonly hoveredFilmId = signal<number | null>(null);
  protected readonly isPausedByUser = signal(false);
  protected readonly prefersReducedMotion = signal(false);
  protected readonly orbitAngle = signal(0.32);
  protected readonly isEyeBlinking = signal(false);

  /** Smooth cursor tracking for the solo unauthenticated cinema eye */
  protected readonly eyeShift = signal({ x: 0, y: 0 });
  protected readonly pupilShift = signal({ x: 0, y: 0 });
  private readonly targetEye = { x: 0, y: 0 };
  private readonly targetPupil = { x: 0, y: 0 };

  /** Monotonic z-index stacking order so the most recently hovered film stays above all others */
  private readonly stackOrder = signal<Readonly<Record<number, number>>>({});
  private stackCounter = 20;

  /** Per-film smoothed scale values for buttery hover/unhover transitions without fighting rAF orbit */
  private readonly smoothScales = signal<Readonly<Record<number, number>>>({});
  /** Smoothly expands ellipsoid outward from the central eye when films emerge */
  private readonly spreadFactor = signal(0.8);

  private readonly viewportWidth = signal(1440);
  private readonly viewportHeight = signal(900);
  private readonly pointerOffset = signal({ x: 0, y: 0 });
  private readonly targetPointer = { x: 0, y: 0 };

  private rafId: number | null = null;
  private lastTimestamp = 0;
  private readonly introTimers: ReturnType<typeof setTimeout>[] = [];
  private blinkScheduleTimer: ReturnType<typeof setTimeout> | null = null;
  private blinkCloseTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly isInteractive = computed(() => this.introStage() === 'ready');

  protected readonly eyeTransform = computed(() => {
    const shift = this.eyeShift();
    return `translate(-50%, -50%) translate3d(${shift.x.toFixed(2)}px, ${shift.y.toFixed(2)}px, 0)`;
  });

  protected readonly pupilTransform = computed(() => {
    const p = this.pupilShift();
    return `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`;
  });

  protected readonly activeFilm = computed(() => {
    if (!this.isInteractive()) return null;
    const id = this.hoveredFilmId();
    if (id === null) return null;
    return this.films().find((film) => film.id === id) ?? null;
  });

  protected readonly isIsolating = computed(
    () => this.isInteractive() && this.hoveredFilmId() !== null,
  );

  protected readonly orbitFrames = computed<readonly OrbitFrameView[]>(() => {
    const list = this.films();
    const total = list.length;
    if (total === 0) return [];

    const vw = this.viewportWidth();
    const vh = this.viewportHeight();
    const angleOffset = this.orbitAngle();
    const activeId = this.isInteractive() ? this.hoveredFilmId() : null;
    const pointer = this.pointerOffset();
    const ranks = this.stackOrder();
    const scales = this.smoothScales();
    const introSpread = this.spreadFactor();

    // Lush horizontal ellipsoid geometry with standardized uniform cinema still dimensions
    const rx = Math.min(Math.max(vw * 0.278, 132), 405);
    const ry = Math.min(Math.max(vh * 0.205, 98), 186);
    const frameWidth = Math.round(Math.min(Math.max(vw * 0.195, 168), 284));
    const frameHeight = Math.round(frameWidth * (9 / 16));

    return list.map((film, index) => {
      const theta = (index / total) * Math.PI * 2 + angleOffset;
      const radialFactor = (1 + film.radialOffset) * introSpread;
      const depthFactor = (Math.sin(theta) + 1) / 2;

      const x = Math.cos(theta) * rx * radialFactor + pointer.x * (0.3 + depthFactor * 0.4);
      const y = Math.sin(theta) * ry * radialFactor + pointer.y * (0.3 + depthFactor * 0.4);

      const isFocused = activeId === film.id;
      const scale = scales[film.id] ?? (isFocused ? 1.22 : 1);
      // Last hovered film retains the highest z-index above all others
      const zIndex = ranks[film.id] ?? 10 + index;

      return {
        film,
        widthPx: frameWidth,
        heightPx: frameHeight,
        zIndex,
        isFocused,
        entranceDelayMs: index * 65,
        transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`,
      };
    });
  });

  constructor() {
    afterNextRender(() => {
      this.syncViewport();

      const mediaQuery =
        typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-reduced-motion: reduce)')
          : null;
      const reduced = mediaQuery?.matches ?? false;
      this.prefersReducedMotion.set(reduced);

      const handleMediaChange = (event: MediaQueryListEvent) => {
        this.prefersReducedMotion.set(event.matches);
        if (event.matches && this.introStage() !== 'ready') {
          this.completeIntroImmediately();
        }
      };
      mediaQuery?.addEventListener('change', handleMediaChange);

      if (reduced) {
        this.completeIntroImmediately();
      } else {
        this.runIntroSequence();
      }

      this.startLoop();
      this.scheduleNextBlink();

      this.destroyRef.onDestroy(() => {
        mediaQuery?.removeEventListener('change', handleMediaChange);
        this.clearIntroTimers();
        this.clearBlinkTimers();
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
        }
      });
    });
  }

  protected onResize(): void {
    this.syncViewport();
  }

  protected skipIntroIfActive(): void {
    if (this.introStage() !== 'ready') {
      this.completeIntroImmediately();
    }
  }

  protected onStagePointerMove(event: PointerEvent): void {
    if (this.prefersReducedMotion() || !this.isInteractive()) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    this.targetPointer.x = nx * -22;
    this.targetPointer.y = ny * -14;

    if (!this.showConstellation()) {
      // Gently follow cursor inside the hero + shift iris/pupil within the sclera ellipse
      const cx = Math.max(-1, Math.min(1, nx * 2));
      const cy = Math.max(-1, Math.min(1, ny * 2));
      this.targetEye.x = cx * 24;
      this.targetEye.y = cy * 16;

      const dist = Math.hypot(cx, cy);
      const clamp = dist > 1 ? 1 / dist : 1;
      this.targetPupil.x = cx * clamp * 8.5;
      this.targetPupil.y = cy * clamp * 3.6;
    }
  }

  protected onStagePointerLeave(): void {
    this.targetPointer.x = 0;
    this.targetPointer.y = 0;
    this.targetEye.x = 0;
    this.targetEye.y = 0;
    this.targetPupil.x = 0;
    this.targetPupil.y = 0;
    this.hoveredFilmId.set(null);
  }

  protected onFrameEnter(filmId: number): void {
    if (!this.isInteractive()) return;
    this.stackCounter += 1;
    this.stackOrder.update((prev) => ({
      ...prev,
      [filmId]: this.stackCounter,
    }));
    this.hoveredFilmId.set(filmId);
  }

  protected onFrameLeave(filmId: number): void {
    if (this.hoveredFilmId() === filmId) {
      this.hoveredFilmId.set(null);
    }
  }

  protected onFrameSelect(film: ConstellationFilm): void {
    if (!this.isInteractive()) return;
    this.selectFilm.emit(film);
  }

  protected togglePause(): void {
    this.isPausedByUser.update((paused) => !paused);
  }

  protected onExploreClick(): void {
    this.scrollToPanel.emit();
  }

  private runIntroSequence(): void {
    this.introStage.set('logo');
    this.introReadyChange.emit(false);

    // 1. Logo Kinox alone on obsidian black (0ms -> 900ms), then dissolves into central eye
    this.introTimers.push(
      setTimeout(() => {
        this.introStage.set('eye');
      }, 900),
    );

    if (!this.showConstellation()) {
      // Without constellation frames, unlock right after the central eye settles
      this.introTimers.push(
        setTimeout(() => {
          this.introStage.set('ready');
          this.introReadyChange.emit(true);
        }, 1500),
      );
      return;
    }

    // 2. Central eye establishes (900ms -> 1450ms), then films emerge around the ellipsoid
    this.introTimers.push(
      setTimeout(() => {
        this.introStage.set('films');
      }, 1450),
    );

    // 3. Films settled into orbit (2350ms) -> unlock UI chrome, hover, and page scroll
    this.introTimers.push(
      setTimeout(() => {
        this.introStage.set('ready');
        this.introReadyChange.emit(true);
      }, 2350),
    );
  }

  private completeIntroImmediately(): void {
    this.clearIntroTimers();
    this.spreadFactor.set(1);
    this.introStage.set('ready');
    this.introReadyChange.emit(true);
  }

  private clearIntroTimers(): void {
    while (this.introTimers.length > 0) {
      const timer = this.introTimers.pop();
      if (timer !== undefined) clearTimeout(timer);
    }
  }

  private scheduleNextBlink(): void {
    this.clearBlinkTimers();
    if (this.prefersReducedMotion()) return;

    const delayMs = 2400 + Math.random() * 3800;
    this.blinkScheduleTimer = setTimeout(() => {
      if (!this.showConstellation() && this.isInteractive() && !this.prefersReducedMotion()) {
        this.triggerBlink(Math.random() < 0.18);
      } else {
        this.scheduleNextBlink();
      }
    }, delayMs);
  }

  private triggerBlink(doubleBlink: boolean): void {
    this.isEyeBlinking.set(true);
    this.blinkCloseTimer = setTimeout(() => {
      this.isEyeBlinking.set(false);
      if (doubleBlink && !this.showConstellation()) {
        this.blinkScheduleTimer = setTimeout(() => {
          this.triggerBlink(false);
        }, 160);
      } else {
        this.scheduleNextBlink();
      }
    }, 150);
  }

  private clearBlinkTimers(): void {
    if (this.blinkScheduleTimer !== null) {
      clearTimeout(this.blinkScheduleTimer);
      this.blinkScheduleTimer = null;
    }
    if (this.blinkCloseTimer !== null) {
      clearTimeout(this.blinkCloseTimer);
      this.blinkCloseTimer = null;
    }
  }

  private syncViewport(): void {
    if (typeof window === 'undefined') return;
    this.viewportWidth.set(window.innerWidth);
    this.viewportHeight.set(window.innerHeight);
  }

  private startLoop(): void {
    const tick = (timestamp: number) => {
      if (this.lastTimestamp === 0) {
        this.lastTimestamp = timestamp;
      }
      const deltaSeconds = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
      this.lastTimestamp = timestamp;

      const stage = this.introStage();
      const canOrbit = stage === 'films' || stage === 'ready';

      // Smooth iris-like outward bloom as the films emerge from the central eye
      const targetSpread = canOrbit ? 1 : 0.8;
      const currentSpread = this.spreadFactor();
      if (Math.abs(targetSpread - currentSpread) > 0.0005) {
        this.spreadFactor.set(currentSpread + (targetSpread - currentSpread) * 0.085);
      } else if (currentSpread !== targetSpread) {
        this.spreadFactor.set(targetSpread);
      }

      const shouldOrbit =
        canOrbit &&
        !this.prefersReducedMotion() &&
        !this.isPausedByUser() &&
        this.hoveredFilmId() === null;

      if (shouldOrbit) {
        // Gentle clockwise entrance boost during 'films' stage, then steady 35mm reel drift
        const speed = stage === 'films' ? 0.24 : 0.175;
        this.orbitAngle.update((angle) => (angle + deltaSeconds * speed) % (Math.PI * 2));
      }

      // Smooth per-film scale interpolation for hover spotlight & gentle return
      const list = this.films();
      if (list.length > 0) {
        const activeId = this.isInteractive() ? this.hoveredFilmId() : null;
        const currentScales = this.smoothScales();
        let changed = false;
        const nextScales: Record<number, number> = { ...currentScales };

        for (let i = 0; i < list.length; i++) {
          const film = list[i];
          const target = activeId === film.id ? 1.22 : 1;
          const prev = currentScales[film.id] ?? target;
          const diff = target - prev;
          if (Math.abs(diff) > 0.001) {
            nextScales[film.id] = prev + diff * 0.16;
            changed = true;
          } else if (prev !== target) {
            nextScales[film.id] = target;
            changed = true;
          }
        }

        if (changed) {
          this.smoothScales.set(nextScales);
        }
      }

      // Smooth pointer parallax damping
      const current = this.pointerOffset();
      const dx = this.targetPointer.x - current.x;
      const dy = this.targetPointer.y - current.y;
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        this.pointerOffset.set({
          x: current.x + dx * 0.08,
          y: current.y + dy * 0.08,
        });
      }

      // Smooth cursor tracking for the solo unauthenticated eye & iris
      const curEye = this.eyeShift();
      const edx = this.targetEye.x - curEye.x;
      const edy = this.targetEye.y - curEye.y;
      if (Math.abs(edx) > 0.04 || Math.abs(edy) > 0.04) {
        this.eyeShift.set({
          x: curEye.x + edx * 0.11,
          y: curEye.y + edy * 0.11,
        });
      }

      const curPupil = this.pupilShift();
      const pdx = this.targetPupil.x - curPupil.x;
      const pdy = this.targetPupil.y - curPupil.y;
      if (Math.abs(pdx) > 0.03 || Math.abs(pdy) > 0.03) {
        this.pupilShift.set({
          x: curPupil.x + pdx * 0.16,
          y: curPupil.y + pdy * 0.16,
        });
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }
}
