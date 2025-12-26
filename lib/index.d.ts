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
export declare class NativeSlider {
    private container;
    private slidesContainer;
    private slides;
    private prevButton;
    private nextButton;
    private pagination;
    private paginationBullets;
    private observer;
    private currentIndex;
    private options;
    constructor(options: NativeSliderOptions);
    private getElement;
    private getElementOrNull;
    private init;
    private setupButtons;
    private setupPagination;
    private updatePagination;
    private setupObserver;
    private setupKeyboard;
    private setActiveSlide;
    goToSlide(index: number, smooth?: boolean): void;
    next(): void;
    prev(): void;
    getCurrentIndex(): number;
    getSlidesCount(): number;
    update(): void;
    destroy(): void;
}
export default NativeSlider;
