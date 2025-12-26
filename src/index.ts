/**
 * NativeSlider - Lightweight native browser slider library
 * @version 0.0.1
 */

export interface NativeSliderOptions {
  container: string | HTMLElement;
  slidesSelector?: string;
  slideSelector?: string;
  prevButton?: string | HTMLElement;
  nextButton?: string | HTMLElement;
  pagination?: string | HTMLElement;
  initialSlide?: number;
  loop?: boolean;
  keyboard?: boolean;
  threshold?: number;
  scrollBehavior?: ScrollBehavior;
  onSlideChange?: (index: number) => void;
  onInit?: (slider: NativeSlider) => void;
}

export class NativeSlider {
  private container: HTMLElement;
  private slidesContainer: HTMLElement | null = null;
  private slides: HTMLElement[] = [];
  private prevButton: HTMLElement | null = null;
  private nextButton: HTMLElement | null = null;
  private pagination: HTMLElement | null = null;
  private paginationBullets: HTMLElement[] = [];
  private observer: IntersectionObserver | null = null;
  private currentIndex: number = 0;
  private options: {
    container: string | HTMLElement;
    slidesSelector: string;
    slideSelector: string;
    prevButton: string | HTMLElement | null;
    nextButton: string | HTMLElement | null;
    pagination: string | HTMLElement | null;
    initialSlide: number;
    loop: boolean;
    keyboard: boolean;
    threshold: number;
    scrollBehavior: ScrollBehavior;
    onSlideChange: (index: number) => void;
    onInit: (slider: NativeSlider) => void;
  };

  constructor(options: NativeSliderOptions) {
    this.options = {
      container: options.container,
      slidesSelector: options.slidesSelector || '.slider',
      slideSelector: options.slideSelector || '.slide',
      prevButton: options.prevButton || null,
      nextButton: options.nextButton || null,
      pagination: options.pagination || null,
      initialSlide: options.initialSlide || 0,
      loop: options.loop !== undefined ? options.loop : true,
      keyboard: options.keyboard !== undefined ? options.keyboard : true,
      threshold: options.threshold || 0.5,
      scrollBehavior: options.scrollBehavior || 'smooth',
      onSlideChange: options.onSlideChange || (() => { }),
      onInit: options.onInit || (() => { }),
    };


    this.container = this.getElement(this.options.container);
    if (!this.container) {
      throw new Error('NativeSlider: Container element not found');
    }

    this.init();
  }

  private getElement(selector: string | HTMLElement): HTMLElement {
    if (typeof selector === 'string') {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`NativeSlider: Element not found: ${selector}`);
      }
      return element as HTMLElement;
    }
    return selector;
  }

  private getElementOrNull(selector: string | HTMLElement | null): HTMLElement | null {
    if (selector === null) {
      return null;
    }
    if (typeof selector === 'string') {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`NativeSlider: Element not found: ${selector}`);
      }
      return element as HTMLElement;
    }
    return selector;
  }

  private init(): void {
    this.slidesContainer = this.container.querySelector(this.options.slidesSelector);
    if (!this.slidesContainer) {
      throw new Error('NativeSlider: Slides container not found');
    }

    this.slides = Array.from(
      this.slidesContainer.querySelectorAll(this.options.slideSelector)
    ) as HTMLElement[];

    if (this.slides.length === 0) {
      throw new Error('NativeSlider: No slides found');
    }

    this.setupButtons();
    this.setupPagination();
    this.setupObserver();
    if (this.options.keyboard) {
      this.setupKeyboard();
    }

    this.goToSlide(this.options.initialSlide, false);
    this.options.onInit(this);
  }

  private setupButtons(): void {
    if (this.options.prevButton) {
      this.prevButton = this.getElementOrNull(this.options.prevButton);
      this.prevButton?.addEventListener('click', () => this.prev());
    }

    if (this.options.nextButton) {
      this.nextButton = this.getElementOrNull(this.options.nextButton);
      this.nextButton?.addEventListener('click', () => this.next());
    }
  }

  private setupPagination(): void {
    if (!this.options.pagination) return;

    this.pagination = this.getElementOrNull(this.options.pagination);
    if (!this.pagination) return;

    this.pagination.innerHTML = '';

    this.slides.forEach((_, index) => {
      const bullet = document.createElement('button');
      bullet.classList.add('slider-pagination-bullet');
      bullet.setAttribute('aria-label', `Go to slide ${index + 1}`);
      bullet.addEventListener('click', () => this.goToSlide(index));
      this.pagination?.appendChild(bullet);
      this.paginationBullets.push(bullet);
    });

    this.updatePagination();
  }

  private updatePagination(): void {
    this.paginationBullets.forEach((bullet, index) => {
      if (index === this.currentIndex) {
        bullet.classList.add('active');
        bullet.setAttribute('aria-current', 'true');
      } else {
        bullet.classList.remove('active');
        bullet.removeAttribute('aria-current');
      }
    });
  }

  private setupObserver(): void {
    const observerOptions: IntersectionObserverInit = {
      root: this.slidesContainer,
      rootMargin: '0px',
      threshold: this.options.threshold,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = this.slides.indexOf(entry.target as HTMLElement);
          if (index !== -1 && index !== this.currentIndex) {
            this.setActiveSlide(index);
          }
        }
      });
    }, observerOptions);

    this.slides.forEach((slide) => {
      this.observer?.observe(slide);
    });
  }

  private setupKeyboard(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {

      const rect = this.container.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (!isInViewport) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });
  }

  private setActiveSlide(index: number): void {
    if (index === this.currentIndex) return;

    this.slides.forEach((slide) => {
      slide.classList.remove('active');
    });

    this.slides[index]?.classList.add('active');

    this.currentIndex = index;
    this.updatePagination();
    this.options.onSlideChange(index);
  }

  public goToSlide(index: number, smooth: boolean = true): void {
    if (index < 0 || index >= this.slides.length) return;

    const slide = this.slides[index];
    if (!slide) return;

    slide.scrollIntoView({
      behavior: smooth ? this.options.scrollBehavior : 'auto',
      block: 'nearest',
      inline: 'center',
    });

    this.setActiveSlide(index);
  }

  public next(): void {
    const nextIndex = this.currentIndex + 1;

    if (nextIndex >= this.slides.length) {
      if (this.options.loop) {
        this.goToSlide(0);
      }
    } else {
      this.goToSlide(nextIndex);
    }
  }

  public prev(): void {
    const prevIndex = this.currentIndex - 1;

    if (prevIndex < 0) {
      if (this.options.loop) {
        this.goToSlide(this.slides.length - 1);
      }
    } else {
      this.goToSlide(prevIndex);
    }
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getSlidesCount(): number {
    return this.slides.length;
  }

  public update(): void {
    this.observer?.disconnect();

    this.slides = Array.from(
      this.slidesContainer!.querySelectorAll(this.options.slideSelector)
    ) as HTMLElement[];

    if (this.pagination) {
      this.setupPagination();
    }

    this.setupObserver();

    this.setActiveSlide(Math.min(this.currentIndex, this.slides.length - 1));
  }

  public destroy(): void {
    this.observer?.disconnect();
    this.prevButton?.removeEventListener('click', () => this.prev());
    this.nextButton?.removeEventListener('click', () => this.next());

    this.paginationBullets = [];
    if (this.pagination) {
      this.pagination.innerHTML = '';
    }

    this.slides.forEach((slide) => {
      slide.classList.remove('active');
    });
  }
}

export default NativeSlider;