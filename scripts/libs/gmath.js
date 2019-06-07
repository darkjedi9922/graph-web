/**
 * point.x: number
 * point.y: number
 * center.x: number
 * center.y: number
 * degree: number
 * 
 * return.x: number
 * return.y: number
 */
function rotatePoint(point, center, degree) {
    const rad = 3.14 / 180 * degree;

    return {
        x: center.x + (point.x - center.x) * Math.cos(rad) -
            (point.y - center.y) * Math.sin(rad),
        y: center.y + (point.y - center.y) * Math.cos(rad) +
            (point.x - center.x) * Math.sin(rad)
    }
}

/**
 * start.x: number
 * start.y: number
 * end.x: number
 * end.y: number
 * 
 * return number
 */
function calcVectorLength(start, end) {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

/**
 * start.x: number
 * start.y: number
 * end.x: number
 * end.y: number
 * 
 * return number
 */
function calcVectorDegree(start, end) {
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

exports.rotatePoint = rotatePoint;
exports.calcVectorDegree = calcVectorDegree;
exports.calcVectorLength = calcVectorLength;