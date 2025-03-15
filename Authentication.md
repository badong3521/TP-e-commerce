# Authentication

## 1. Authentication là gì?
**Authentication** (Xác thực) là quá trình kiểm tra danh tính của người dùng, hệ thống hoặc thiết bị. Nó trả lời câu hỏi: _"Bạn là ai?"_

- Sau khi Authentication thành công, hệ thống sẽ tiếp tục thực hiện Authorization (Phân quyền).
- Authentication có nhiều phương thức: mật khẩu, OTP, sinh trắc học (vân tay, nhận diện khuôn mặt), Single Sign-On (SSO), OAuth,...

---

## 2. OAuth Pattern
### 2.1 OAuth là gì?
OAuth (Open Authorization) là một tiêu chuẩn **ủy quyền** mở, cho phép ứng dụng bên thứ 3 truy cập tài nguyên trên hệ thống mà không cần tiết lộ mật khẩu của người dùng.  
OAuth không thay thế Authentication, mà nó xử lý Authorization sau khi đã xác thực thành công.

- **OAuth 2.0** là phiên bản phổ biến nhất hiện nay.
- OAuth cho phép các ứng dụng lấy quyền truy cập thông qua **Access Token**.

---

### 2.2 Thành phần chính trong OAuth
| Thành phần        | Vai trò |
|------------------|-------|
| **Resource Owner** | Chủ sở hữu tài nguyên (người dùng). |
| **Client**        | Ứng dụng bên thứ 3 cần truy cập tài nguyên. |
| **Authorization Server** | Máy chủ xác thực và cấp token. |
| **Resource Server** | Máy chủ tài nguyên (cung cấp API để lấy dữ liệu). |

---

## 3. Implicit Codeflow vs Authorization Codeflow
### 3.1 Authorization Code Flow

- **Cơ chế:** 2 bước (có thêm backend trao đổi code lấy token).
- **Flow chi tiết:**
    1. User đăng nhập tại Authorization Server.
    2. Server trả về Authorization Code.
    3. Client gửi Authorization Code về backend.
    4. Backend gọi Authorization Server để đổi lấy Access Token và Refresh Token.
- **Ưu điểm:**
    - Token không xuất hiện trực tiếp trên trình duyệt.
    - Bảo mật cao hơn.
- **Nhược điểm:**
    - Phức tạp hơn do cần thêm backend để trao đổi code.

---

### 3.2 Implicit Flow (Flow rút gọn)
- **Cơ chế:** 1 bước (trả về Access Token ngay sau khi user đăng nhập thành công).
- **Flow chi tiết:**
    1. User đăng nhập tại Authorization Server.
    2. Server trả về trực tiếp **Access Token** trong URL redirect.
- **Ưu điểm:**
    - Đơn giản, nhanh gọn (phù hợp với app frontend đơn thuần).
- **Nhược điểm:**
    - Access Token hiển thị trên URL, dễ bị lộ (kém bảo mật hơn).
    - Không có Refresh Token.
- **Lưu ý:** Từ OAuth 2.1 trở đi, **Implicit Flow** bị khuyến cáo không nên dùng do vấn đề bảo mật.

---

## 4. So sánh nhanh
| Tiêu chí            | Authorization Code Flow  | Implicit Flow |
|----------------|--------------------|-----------------|
| Độ bảo mật        | Cao                  | Thấp            |
| Token xuất hiện trên URL | Không           | Có              |
| Sử dụng được Refresh Token | Có | Không |
| Độ phức tạp       | Cao                 | Thấp            |
| Phù hợp với       | Backend-Frontend App | Single Page App (cũ) |

---

## 5. Kết luận
- Nếu có **backend** thì nên dùng **Authorization Code Flow** để đảm bảo an toàn.
- **Implicit Flow** ngày càng ít được khuyến khích do vấn đề bảo mật.
- Hiện nay, **PKCE (Proof Key for Code Exchange)** là giải pháp hiện đại cải tiến từ Authorization Code Flow dành cho Public Client (ứng dụng frontend, mobile app), giúp tăng cường bảo mật mà không cần client secret.

---

## 6. Tham khảo thêm
- [Implicit flow vs. Authorization code flow: Why implicit flow is dead?](https://blog.logto.io/implicit-flow-is-dead)
- [RFC6749 - OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749)
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1)

---