/**
 * South African ID Number Validator
 *
 * SA ID format: YYMMDD GSSS CAZ (13 digits)
 * - YYMMDD: Date of birth
 * - G: Gender digit (0-4 = Female, 5-9 = Male)
 * - SSS: Sequence number
 * - C: Citizenship (0 = SA citizen, 1 = Permanent resident)
 * - A: Formerly used, usually 8 or 9
 * - Z: Luhn checksum digit
 */

export const validateSAID = (idNumber) => {
  const result = {
    isValid: false,
    error: '',
    dateOfBirth: null,
    gender: '',
    citizenship: '',
    age: null,
  };

  if (!idNumber) {
    result.error = 'ID number is required';
    return result;
  }

  // Remove spaces and check length
  const id = idNumber.replace(/\s/g, '');

  if (!/^\d{13}$/.test(id)) {
    result.error = 'SA ID number must be exactly 13 digits';
    return result;
  }

  // Extract date components
  const year = parseInt(id.substring(0, 2), 10);
  const month = parseInt(id.substring(2, 4), 10);
  const day = parseInt(id.substring(4, 6), 10);

  // Determine full year (00-24 = 2000s, 25-99 = 1900s)
  const currentYear = new Date().getFullYear();
  const century = year <= (currentYear % 100) ? 2000 : 1900;
  const fullYear = century + year;

  // Validate month
  if (month < 1 || month > 12) {
    result.error = 'Invalid month in ID number (must be 01-12)';
    return result;
  }

  // Validate day
  const daysInMonth = new Date(fullYear, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    result.error = `Invalid day in ID number (must be 01-${daysInMonth} for month ${month})`;
    return result;
  }

  // Extract gender
  const genderDigit = parseInt(id.substring(6, 7), 10);
  result.gender = genderDigit < 5 ? 'Female' : 'Male';

  // Extract citizenship
  const citizenshipDigit = parseInt(id.substring(10, 11), 10);
  if (citizenshipDigit !== 0 && citizenshipDigit !== 1) {
    result.error = 'Invalid citizenship digit in ID number';
    return result;
  }
  result.citizenship = citizenshipDigit === 0 ? 'SA Citizen' : 'Permanent Resident';

  // Luhn algorithm check
  let total = 0;
  let isSecond = false;

  for (let i = id.length - 1; i >= 0; i--) {
    let digit = parseInt(id[i], 10);

    if (isSecond) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    total += digit;
    isSecond = !isSecond;
  }

  if (total % 10 !== 0) {
    result.error = 'Invalid ID number (checksum failed)';
    return result;
  }

  // Calculate date of birth and age
  const dob = new Date(fullYear, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  result.isValid = true;
  result.dateOfBirth = dob;
  result.age = age;

  return result;
};

/**
 * Format a date of birth from an SA ID validation result
 */
export const formatDOBFromID = (dob) => {
  if (!dob) return '';
  return dob.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
