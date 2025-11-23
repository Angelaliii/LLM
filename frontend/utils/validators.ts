// 表單驗證工具
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export class FormValidator {
  // 驗證姓名
  static validateName(name: string): ValidationResult {
    if (!name.trim()) {
      return { isValid: false, message: "請輸入姓名" };
    }

    if (name.length < 2) {
      return { isValid: false, message: "姓名至少需要 2 個字元" };
    }

    if (name.length > 20) {
      return { isValid: false, message: "姓名不能超過 20 個字元" };
    }

    const namePattern = /^[\u4e00-\u9fa5a-zA-Z\s]+$/;
    if (!namePattern.test(name)) {
      return { isValid: false, message: "姓名只能包含中文、英文字母" };
    }

    return { isValid: true, message: "" };
  }

  // 驗證 Email
  static validateEmail(email: string): ValidationResult {
    if (!email.trim()) {
      return { isValid: false, message: "請輸入電子郵件" };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return { isValid: false, message: "請輸入有效的電子郵件格式" };
    }

    return { isValid: true, message: "" };
  }

  // 驗證學校或機構名稱
  static validateInstitution(institution: string): ValidationResult {
    if (!institution.trim()) {
      return { isValid: false, message: "請輸入學校或機構名稱" };
    }

    if (institution.length < 2) {
      return { isValid: false, message: "機構名稱至少需要 2 個字元" };
    }

    if (institution.length > 50) {
      return { isValid: false, message: "機構名稱不能超過 50 個字元" };
    }

    return { isValid: true, message: "" };
  }

  // 驗證身分選擇
  static validateRole(role: string): ValidationResult {
    const validRoles = ["student", "parent"];

    if (!role) {
      return { isValid: false, message: "請選擇身分" };
    }

    if (!validRoles.includes(role)) {
      return { isValid: false, message: "請選擇有效的身分" };
    }

    return { isValid: true, message: "" };
  }

  // 驗證手機號碼
  static validatePhone(phone: string): ValidationResult {
    if (!phone.trim()) {
      return { isValid: false, message: "請輸入手機號碼" };
    }

    const phonePattern = /^09\d{8}$/;
    if (!phonePattern.test(phone.replace(/[\s-]/g, ""))) {
      return {
        isValid: false,
        message: "請輸入有效的台灣手機號碼格式（09xxxxxxxx）",
      };
    }

    return { isValid: true, message: "" };
  }

  // 通用驗證方法
  static validate(value: string, rules: ValidationRule): ValidationResult {
    // 必填驗證
    if (rules.required && !value.trim()) {
      return { isValid: false, message: "此欄位為必填" };
    }

    // 最小長度驗證
    if (rules.minLength && value.length < rules.minLength) {
      return { isValid: false, message: `至少需要 ${rules.minLength} 個字元` };
    }

    // 最大長度驗證
    if (rules.maxLength && value.length > rules.maxLength) {
      return { isValid: false, message: `不能超過 ${rules.maxLength} 個字元` };
    }

    // 正則表達式驗證
    if (rules.pattern && !rules.pattern.test(value)) {
      return { isValid: false, message: "格式不正確" };
    }

    // 自訂驗證函數
    if (rules.custom && !rules.custom(value)) {
      return { isValid: false, message: "驗證失敗" };
    }

    return { isValid: true, message: "" };
  }
}

// React Hook for form validation
export const useFormValidation = () => {
  return {
    validateName: FormValidator.validateName,
    validateEmail: FormValidator.validateEmail,
    validateInstitution: FormValidator.validateInstitution,
    validateRole: FormValidator.validateRole,
    validatePhone: FormValidator.validatePhone,
    validate: FormValidator.validate,
  };
};
