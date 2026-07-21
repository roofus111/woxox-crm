"use client"

import React, { useState } from 'react';
import LinkAcceptanceScreen from './components/LinkAcceptanceScreen';
import EmployeeUpdateForm from './components/EmployeeUpdateForm';
import PasswordCreationScreen from './components/PasswordCreationScreen';

export default function EmployeeInvitationSystem() {
  const [step, setStep] = useState(1);
  const [employee, setEmployee] = useState({
    firstName: '',
    lastName: '',
    email: 'john.doe@company.com',
    phone: '',
    department: '',
    position: '',
    startDate: '',
    address: ''
  });

  // common setter
  const handleChange = (field, value) =>
    setEmployee(prev => ({ ...prev, [field]: value }));

  return (
    <>
      {step === 1 && (
        <LinkAcceptanceScreen
          email={employee.email}
          onAccept={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <EmployeeUpdateForm
          data={employee}
          onChange={handleChange}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <PasswordCreationScreen
          onBack={() => setStep(2)}
          onCreate={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-2xl">🎉 Account created! Redirecting to login…</p>
        </div>
      )}
    </>
  );
}
