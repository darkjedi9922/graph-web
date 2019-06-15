import { Point } from '../types';

/**
 * При передвижении элемента, на нем все равно срабатывает событие onClick,
 * потому что onMouseDown и onMouseUp сработали на нем же. Но нужно, чтобы
 * onClick срабатывал только когда позиция курсора остается той же, то есть
 * когда элемент не передвигается. 
 * 
 * Этот механизм проверяет равность позиций в событиях и вызывает callback, 
 * который должен вызываться при нормальном onClick.
 * 
 * Эта функциональность была выделена в отдельный класс во избежания дублирования
 * и упрощения компонентов.
 */
class ClickEngine {
    private clicking: Point = null;

    public onMouseDown(e: MouseEvent) {
        // Клик допускается только левой кнопкой мыши. Для правшей-левшей все учтено.
        if (e.button !== 0) return;

        this.clicking = { x: e.pageX, y: e.pageY };
    }

    public onMouseUp(e: MouseEvent, callback: (e: MouseEvent) => void) {
        // Клик допускается только левой кнопкой мыши. Для правшей-левшей все учтено.
        if (e.button !== 0) return;
        if (this.clicking &&
            this.clicking.x === e.pageX && this.clicking.y === e.pageY) {
            callback(e);
        }
        this.clicking = null;
    }
}

export default ClickEngine;