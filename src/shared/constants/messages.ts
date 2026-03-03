// ================================================================
// UI messages — Vietnamese locale
// ================================================================

export const MESSAGES = {
  // ── Generic ──
  SUCCESS: 'Thành công',
  ERROR: 'Đã xảy ra lỗi',
  LOADING: 'Đang tải...',
  CONFIRM_DELETE: 'Bạn có chắc chắn muốn xóa?',
  NO_DATA: 'Không có dữ liệu',
  SAVE_SUCCESS: 'Lưu thành công',
  DELETE_SUCCESS: 'Xóa thành công',

  // ── Auth ──
  AUTH: {
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    LOGIN_FAILED: 'Sai tên đăng nhập hoặc mật khẩu',
    LOGOUT_SUCCESS: 'Đăng xuất thành công',
    SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập trang này',
  },

  // ── Rooms ──
  ROOMS: {
    CREATE_SUCCESS: 'Tạo phòng thành công',
    UPDATE_SUCCESS: 'Cập nhật phòng thành công',
    DELETE_SUCCESS: 'Xóa phòng thành công',
    DELETE_CONFIRM: 'Bạn có chắc chắn muốn xóa phòng này?',
    IMAGE_UPLOAD_SUCCESS: 'Tải ảnh lên thành công',
    IMAGE_DELETE_SUCCESS: 'Xóa ảnh thành công',
    PASSWORD_SET_SUCCESS: 'Đặt mật khẩu phòng thành công',
    PASSWORD_CHANGE_CONFIRM: 'Bạn có chắc chắn muốn thay đổi mật khẩu phòng này?',
    NO_PASSWORD: 'Chưa có mật khẩu',
  },

  // ── Amenities ──
  AMENITIES: {
    CREATE_SUCCESS: 'Tạo tiện nghi thành công',
    UPDATE_SUCCESS: 'Cập nhật tiện nghi thành công',
    DELETE_SUCCESS: 'Xóa tiện nghi thành công',
    DELETE_CONFIRM: 'Bạn có chắc chắn muốn xóa tiện nghi này?',
  },

  // ── Schedules ──
  SCHEDULES: {
    CREATE_SUCCESS: 'Tạo loại lịch thành công',
    UPDATE_SUCCESS: 'Cập nhật loại lịch thành công',
    DELETE_SUCCESS: 'Xóa loại lịch thành công',
    DELETE_CONFIRM: 'Bạn có chắc chắn muốn xóa loại lịch này?',
  },

  // ── Time Slots ──
  TIME_SLOTS: {
    CREATE_SUCCESS: 'Tạo khung giờ thành công',
    UPDATE_SUCCESS: 'Cập nhật khung giờ thành công',
    DELETE_SUCCESS: 'Xóa khung giờ thành công',
    DELETE_CONFIRM: 'Bạn có chắc chắn muốn xóa khung giờ này?',
    BOOK_SUCCESS: 'Đặt khung giờ thành công',
    CANCEL_BOOKING_SUCCESS: 'Hủy đặt phòng thành công',
    BOOK_CONFIRM: 'Bạn có chắc chắn muốn đặt khung giờ này?',
    CANCEL_BOOKING_CONFIRM: 'Bạn có chắc chắn muốn hủy đặt phòng?',
  },

  // ── Validation ──
  VALIDATION: {
    REQUIRED: 'Trường này là bắt buộc',
    MIN_LENGTH: (n: number) => `Tối thiểu ${n} ký tự`,
    MAX_LENGTH: (n: number) => `Tối đa ${n} ký tự`,
    MIN_VALUE: (n: number) => `Giá trị tối thiểu là ${n}`,
    INVALID_EMAIL: 'Email không hợp lệ',
    INVALID_FILE_TYPE: 'Định dạng file không hợp lệ',
    FILE_TOO_LARGE: (mb: number) => `Dung lượng file tối đa ${mb}MB`,
  },

  // ── Upload ──
  UPLOAD: {
    SUCCESS: 'Tải lên thành công',
    FAILED: 'Tải lên thất bại',
    PENDING: 'Chờ xử lý',
  },
} as const;
