export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const regex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return regex.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};