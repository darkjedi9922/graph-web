import { Point } from "scripts/types";
import $ from 'jquery';

export function rotatePoint(point: Point, center: Point, degree: number): Point {
    const rad = 3.14 / 180 * degree;

    return {
        x: center.x + (point.x - center.x) * Math.cos(rad) -
            (point.y - center.y) * Math.sin(rad),
        y: center.y + (point.y - center.y) * Math.cos(rad) +
            (point.x - center.x) * Math.sin(rad)
    }
}

export function calcVectorLength(start: Point, end: Point): number {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

export function calcVectorDegree(start: Point, end: Point): number {
    // Найдем угол через угол между вектором и его проекцией на ось Х.
    const length = calcVectorLength(start, end);
    const projectionLength = end.x - start.x;

    // Градусов в радианах.
    const DEG = 57.2958;

    // При определенных условиях может выйти NaN, тогда просто вернем 0.
    let result = (Math.acos(projectionLength / length) * DEG) || 0;

    // В 3 и 4 четвертях косинус не расчитывает больше 180. Нужно это исправить.
    if (end.y > start.y) return 360 - result;
    return result;
}

export function toHtmlDeg(degree: number): number {
    return 360 - degree;
}

export function toNormalDegree(htmlDegree: number): number {
    return 360 - htmlDegree;
}

export function textWidth(text: string, font: string) {
    var f = font || '12px arial',
        o = $('<div></div>')
            .text(text)
            .css({
                'position': 'absolute',
                'float': 'left',
                'white-space': 'nowrap',
                'visibility': 'hidden',
                'font': f
            })
            .appendTo($('body')),
        w = o.width();

    o.remove();

    return w;
}