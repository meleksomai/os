export interface AgeCalculation {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  description: string;
  dob: string;
}

export function calculateAge(dateOfBirth: string): AgeCalculation {
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = years * 12 + months;

  // Create human-readable description
  let description: string;
  if (totalMonths === 0 && days < 7) {
    description = `${days} day${days !== 1 ? "s" : ""} old`;
  } else if (totalMonths === 0 && days < 60) {
    const weeks = Math.floor(days / 7);
    description = `${weeks} week${weeks !== 1 ? "s" : ""} old`;
  } else if (totalMonths < 24) {
    description = `${totalMonths} month${totalMonths !== 1 ? "s" : ""} old`;
  } else if (years < 5 && months > 0) {
    description = `${years} year${years !== 1 ? "s" : ""} and ${months} month${months !== 1 ? "s" : ""} old`;
  } else {
    description = `${years} year${years !== 1 ? "s" : ""} old`;
  }

  return { years, months, days, totalMonths, description, dob: dateOfBirth };
}
