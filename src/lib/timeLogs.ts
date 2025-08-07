interface SubmitEntryParams {
  employeeId: string;
  clockIn: string;
  clockOut?: string | null;
  notes?: string | null;
}

export async function submitManualEntry({
  employeeId,
  clockIn,
  clockOut,
  notes,
}: SubmitEntryParams): Promise<{ error?: string }> {
  console.log('Mock manual entry submitted:', {
    employeeId,
    clockIn,
    clockOut,
    notes,
  });

  // Simulate a small delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate success/failure
  const isSuccess = Math.random() > 0.1; // 90% chance of success
  if (!isSuccess) {
    return { error: 'Failed to save manual entry (mock error).' };
  }

  return {}; // Success: no error
}
