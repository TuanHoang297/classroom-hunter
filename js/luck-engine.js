/**
 * LUCK ENGINE (God Save & Vận Mệnh Lớp Học)
 * Determines whether a student is summoned to the board or saved by a Lucky Escape twist.
 * Dùng crypto.getRandomValues() thay Math.random() để tránh lặp sequence.
 */

import { cryptoRandom, cryptoPick } from './utils/random.js';

export class LuckEngine {
  static LUCKY_QUOTES = [
    'Thần may mắn mỉm cười! Thoát nạn ngoạn mục trong gang tấc!',
    'Nhân phẩm vô cực! Bạn được miễn lên bảng lần này!',
    'Hào quang nhân vật chính đã kích hoạt! An toàn tuyệt đối!',
    'God Save phát huy tác dụng! Thở phào nhẹ nhõm!',
    'Thần rùa hộ mệnh: Trúng tên nhưng không phải lên bảng!'
  ];

  static MUST_ANSWER_QUOTES = [
    'Chiến thần lên bảng! Cơ hội tỏa sáng trước cả lớp đã đến!',
    'Mục tiêu đã định vị! Tự tin bước lên bảng giải bài nào!',
    'Học bá xuất trận! Cả lớp đang hồi hộp dõi theo bạn!',
    'Vinh quang thuộc về người tiên phong! Cố lên nhé!',
    'Giờ lành đã điểm! Mời bạn lên trổ tài giải bài tập!'
  ];

  /**
   * Evaluates fate based on the luck probability rate
   * @param {number} luckRate (0.0 to 1.0)
   * @param {boolean} forceNoLuck (if true, forces a non-lucky outcome)
   * @returns {{ isLucky: boolean, fateType: string, title: string, quote: string }}
   */
  static evaluate(luckRate = 0.5, forceNoLuck = false) {
    const rand = cryptoRandom();
    const isLucky = forceNoLuck ? false : rand < luckRate;

    if (isLucky) {
      return {
        isLucky: true,
        fateType: 'lucky-escape',
        title: 'GOD SAVE - ĐƯỢC MIỄN!',
        quote: cryptoPick(this.LUCKY_QUOTES)
      };
    } else {
      return {
        isLucky: false,
        fateType: 'must-answer',
        title: 'MỜI LÊN BẢNG LÀM BÀI!',
        quote: cryptoPick(this.MUST_ANSWER_QUOTES)
      };
    }
  }
}
