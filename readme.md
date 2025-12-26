# NativeSlider

Легковесная библиотека для создания нативных слайдеров на чистом JavaScript/TypeScript без зависимостей.

## Особенности

- 🚀 **Нативный скролл** - использует встроенные возможности браузера
- 📱 **Адаптивный** - работает на всех устройствах
- ⌨️ **Управление клавиатурой** - навигация стрелками
- 🎯 **IntersectionObserver** - отслеживание активного слайда
- 🔄 **Loop режим** - бесконечная прокрутка
- 📍 **Пагинация** - автоматически генерируется
- 🎨 **Кастомизация** - полный контроль над стилями
- 💪 **TypeScript** - полная типизация

## Установка

```bash
npm install native-slider
# или
yarn add native-slider
# или
pnpm add native-slider
```

## Быстрый старт

### HTML структура

```html
<div class="slider-container">
  <div class="slider">
    <div class="slide">Slide 1</div>
    <div class="slide">Slide 2</div>
    <div class="slide">Slide 3</div>
  </div>
  
  <button class="btn-prev">Previous</button>
  <button class="btn-next">Next</button>
  <div class="pagination"></div>
</div>
```

### JavaScript

```javascript
import NativeSlider from 'native-slider';

const slider = new NativeSlider({
  container: '.slider-container',
  slidesSelector: '.slider',
  slideSelector: '.slide',
  prevButton: '.btn-prev',
  nextButton: '.btn-next',
  pagination: '.pagination',
  loop: true,
  keyboard: true
});
```

## Опции

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `container` | `string \| HTMLElement` | **обязательно** | Контейнер слайдера |
| `slidesSelector` | `string` | `'.slider'` | Селектор обёртки слайдов |
| `slideSelector` | `string` | `'.slide'` | Селектор отдельного слайда |
| `prevButton` | `string \| HTMLElement` | `null` | Кнопка "Назад" |
| `nextButton` | `string \| HTMLElement` | `null` | Кнопка "Вперёд" |
| `pagination` | `string \| HTMLElement` | `null` | Контейнер пагинации |
| `initialSlide` | `number` | `0` | Начальный слайд |
| `loop` | `boolean` | `true` | Зацикливание |
| `keyboard` | `boolean` | `true` | Управление клавиатурой |
| `threshold` | `number` | `0.5` | Порог IntersectionObserver |
| `scrollBehavior` | `'smooth' \| 'auto'` | `'smooth'` | Поведение скролла |
| `onSlideChange` | `(index: number) => void` | `() => {}` | Callback при смене слайда |
| `onInit` | `(slider: NativeSlider) => void` | `() => {}` | Callback при инициализации |

## API Методы

### `goToSlide(index: number, smooth?: boolean): void`

Переход на конкретный слайд.

```javascript
slider.goToSlide(2); // С анимацией
slider.goToSlide(2, false); // Без анимации
```

### `next(): void`

Переход на следующий слайд.

```javascript
slider.next();
```

### `prev(): void`

Переход на предыдущий слайд.

```javascript
slider.prev();
```

### `getCurrentIndex(): number`

Получить индекс текущего слайда.

```javascript
const currentIndex = slider.getCurrentIndex();
console.log(currentIndex); // 0, 1, 2...
```

### `getSlidesCount(): number`

Получить общее количество слайдов.

```javascript
const total = slider.getSlidesCount();
console.log(total); // 5
```

### `update(): void`

Обновить слайдер (пересчитать слайды, пагинацию).

```javascript
// После динамического добавления/удаления слайдов
slider.update();
```

### `destroy(): void`

Уничтожить экземпляр слайдера.

```javascript
slider.destroy();
```

## Использование с Vue 3

```vue
<template>
  <div class="slider-wrapper">
    <div class="slider" ref="sliderContainer">
      <div class="slide" v-for="(item, index) in items" :key="index">
        {{ item }}
      </div>
    </div>
    <button ref="prevBtn">Prev</button>
    <button ref="nextBtn">Next</button>
    <div ref="paginationEl"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import NativeSlider from 'native-slider';

const sliderContainer = ref(null);
const prevBtn = ref(null);
const nextBtn = ref(null);
const paginationEl = ref(null);
const items = ref(['Slide 1', 'Slide 2', 'Slide 3']);

let slider = null;

onMounted(() => {
  slider = new NativeSlider({
    container: sliderContainer.value,
    slidesSelector: '.slider',
    slideSelector: '.slide',
    prevButton: prevBtn.value,
    nextButton: nextBtn.value,
    pagination: paginationEl.value,
    onSlideChange: (index) => {
      console.log('Current slide:', index);
    }
  });
});

onBeforeUnmount(() => {
  slider?.destroy();
});
</script>
```

## Использование с React

```jsx
import { useEffect, useRef } from 'react';
import NativeSlider from 'native-slider';

function Slider() {
  const sliderRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);
  const sliderInstance = useRef(null);

  useEffect(() => {
    sliderInstance.current = new NativeSlider({
      container: sliderRef.current,
      slidesSelector: '.slider',
      slideSelector: '.slide',
      prevButton: prevRef.current,
      nextButton: nextRef.current,
      pagination: paginationRef.current,
    });

    return () => {
      sliderInstance.current?.destroy();
    };
  }, []);

  return (
    <div className="slider-wrapper">
      <div className="slider" ref={sliderRef}>
        <div className="slide">Slide 1</div>
        <div className="slide">Slide 2</div>
        <div className="slide">Slide 3</div>
      </div>
      <button ref={prevRef}>Previous</button>
      <button ref={nextRef}>Next</button>
      <div ref={paginationRef}></div>
    </div>
  );
}
```

## CSS стили

Базовые стили для слайдера:

```css
.slider {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  gap: 1rem;
}

.slider::-webkit-scrollbar {
  display: none;
}

.slide {
  scroll-snap-align: center;
  scroll-snap-stop: always;
  flex-shrink: 0;
  width: 100%;
  opacity: 0.5;
  transition: opacity 0.3s, transform 0.3s;
}

.slide.active {
  opacity: 1;
  transform: scale(1);
}

/* Стили пагинации */
.slider-pagination-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.slider-pagination-bullet.active {
  background: white;
  width: 30px;
  border-radius: 5px;
}
```

## Примеры

### Карточный слайдер с картинками

```javascript
const imageSlider = new NativeSlider({
  container: '.image-slider',
  prevButton: '.image-prev',
  nextButton: '.image-next',
  pagination: '.image-pagination',
  loop: true,
  onSlideChange: (index) => {
    console.log(`Showing image ${index + 1}`);
  }
});
```

### Вертикальный слайдер

```css
.vertical-slider {
  flex-direction: column;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  height: 100vh;
}

.vertical-slide {
  scroll-snap-align: start;
  height: 100vh;
}
```

### Слайдер с автоплеем

```javascript
const slider = new NativeSlider({
  container: '.auto-slider',
  loop: true
});

// Автоплей каждые 3 секунды
const autoplay = setInterval(() => {
  slider.next();
}, 3000);

// Остановить при взаимодействии
document.querySelector('.auto-slider').addEventListener('mouseenter', () => {
  clearInterval(autoplay);
});
```

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅
- IE11: ❌ (требуются полифилы для IntersectionObserver)

## Лицензия

MIT

## Contributing

Pull requests приветствуются! Для больших изменений сначала откройте issue.

## Автор

Ваше имя - [GitHub](https://github.com/yourusername)