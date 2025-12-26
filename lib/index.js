/**
 * NativeSlider - Lightweight native browser slider library
 * @version 0.0.1
 */
export class NativeSlider {
    constructor(options) {
        this.slidesContainer = null;
        this.slides = [];
        this.prevButton = null;
        this.nextButton = null;
        this.pagination = null;
        this.paginationBullets = [];
        this.observer = null;
        this.currentIndex = 0;
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
    getElement(selector) {
        if (typeof selector === 'string') {
            const element = document.querySelector(selector);
            if (!element) {
                throw new Error(`NativeSlider: Element not found: ${selector}`);
            }
            return element;
        }
        return selector;
    }
    getElementOrNull(selector) {
        if (selector === null) {
            return null;
        }
        if (typeof selector === 'string') {
            const element = document.querySelector(selector);
            if (!element) {
                throw new Error(`NativeSlider: Element not found: ${selector}`);
            }
            return element;
        }
        return selector;
    }
    init() {
        this.slidesContainer = this.container.querySelector(this.options.slidesSelector);
        if (!this.slidesContainer) {
            throw new Error('NativeSlider: Slides container not found');
        }
        this.slides = Array.from(this.slidesContainer.querySelectorAll(this.options.slideSelector));
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
    setupButtons() {
        if (this.options.prevButton) {
            this.prevButton = this.getElementOrNull(this.options.prevButton);
            this.prevButton?.addEventListener('click', () => this.prev());
        }
        if (this.options.nextButton) {
            this.nextButton = this.getElementOrNull(this.options.nextButton);
            this.nextButton?.addEventListener('click', () => this.next());
        }
    }
    setupPagination() {
        if (!this.options.pagination)
            return;
        this.pagination = this.getElementOrNull(this.options.pagination);
        if (!this.pagination)
            return;
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
    updatePagination() {
        this.paginationBullets.forEach((bullet, index) => {
            if (index === this.currentIndex) {
                bullet.classList.add('active');
                bullet.setAttribute('aria-current', 'true');
            }
            else {
                bullet.classList.remove('active');
                bullet.removeAttribute('aria-current');
            }
        });
    }
    setupObserver() {
        const observerOptions = {
            root: this.slidesContainer,
            rootMargin: '0px',
            threshold: this.options.threshold,
        };
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = this.slides.indexOf(entry.target);
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
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            const rect = this.container.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
            if (!isInViewport)
                return;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prev();
            }
            else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.next();
            }
        });
    }
    setActiveSlide(index) {
        if (index === this.currentIndex)
            return;
        this.slides.forEach((slide) => {
            slide.classList.remove('active');
        });
        this.slides[index]?.classList.add('active');
        this.currentIndex = index;
        this.updatePagination();
        this.options.onSlideChange(index);
    }
    goToSlide(index, smooth = true) {
        if (index < 0 || index >= this.slides.length)
            return;
        const slide = this.slides[index];
        if (!slide)
            return;
        slide.scrollIntoView({
            behavior: smooth ? this.options.scrollBehavior : 'auto',
            block: 'nearest',
            inline: 'center',
        });
        this.setActiveSlide(index);
    }
    next() {
        const nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.slides.length) {
            if (this.options.loop) {
                this.goToSlide(0);
            }
        }
        else {
            this.goToSlide(nextIndex);
        }
    }
    prev() {
        const prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            if (this.options.loop) {
                this.goToSlide(this.slides.length - 1);
            }
        }
        else {
            this.goToSlide(prevIndex);
        }
    }
    getCurrentIndex() {
        return this.currentIndex;
    }
    getSlidesCount() {
        return this.slides.length;
    }
    update() {
        this.observer?.disconnect();
        this.slides = Array.from(this.slidesContainer.querySelectorAll(this.options.slideSelector));
        if (this.pagination) {
            this.setupPagination();
        }
        this.setupObserver();
        this.setActiveSlide(Math.min(this.currentIndex, this.slides.length - 1));
    }
    destroy() {
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
