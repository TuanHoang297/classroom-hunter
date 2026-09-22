/**
 * CRYPTO RANDOM UTILS
 * Dùng Web Crypto API thay Math.random() để tránh PRNG lặp sequence.
 * Math.random() là pseudo-random — có thể cho cùng 1 chuỗi khi seed giống nhau.
 * crypto.getRandomValues() lấy entropy từ OS, thực sự ngẫu nhiên.
 */

/**
 * Trả về số float ngẫu nhiên trong khoảng [0, 1)
 * Thay thế hoàn toàn cho Math.random()
 */
export function cryptoRandom() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / (0xFFFFFFFF + 1);
}

/**
 * Trả về số nguyên ngẫu nhiên trong khoảng [0, max)
 */
export function cryptoRandomInt(max) {
  return Math.floor(cryptoRandom() * max);
}

/**
 * Fisher-Yates shuffle dùng crypto random — shuffle mảng tại chỗ
 * @param {Array} arr
 * @returns {Array} mảng đã shuffle (in-place)
 */
export function cryptoShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Chọn 1 phần tử ngẫu nhiên từ mảng
 */
export function cryptoPick(arr) {
  if (!arr || arr.length === 0) return undefined;
  return arr[cryptoRandomInt(arr.length)];
}
