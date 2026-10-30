export function useFormValidation() {
  const isValidName = (val: string) => {
    return val.length >= 2 && /^[a-zA-Z\s.'-]+$/.test(val);
  };

  const isValidPhone = (val: string) => {
    if (!/^\d{10}$/.test(val)) return false;
    
    if (/^(\d)\1{9}$/.test(val)) return false;
    
    if (["1234567890", "0987654321", "9876543210", "0123456789"].includes(val)) return false;
    
    if (!/^[6-9]\d{9}$/.test(val)) return false;
    return true;
  };

  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(val);
  };

  return {
    isValidName,
    isValidPhone,
    isValidEmail,
  };
}
