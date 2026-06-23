'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { StepProgress } from '@/components/ui/StepProgress';
import { LEVELS, FACULTIES_AND_DEPARTMENTS } from '@/lib/constants';
import { audio } from '@/lib/audio';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [regNumber, setRegNumber] = useState(user?.reg_number || '');
  const [level, setLevel] = useState(user?.level || '100');
  const [faculty, setFaculty] = useState(user?.faculty || '');
  const [department, setDepartment] = useState(user?.department || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = ['Details', 'Academics', 'Welcome'];

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required';
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{7,15}$/.test(phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Enter a valid phone number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!level) errs.level = 'Level is required';
    if (!faculty) errs.faculty = 'Faculty is required';
    if (!department) errs.department = 'Department is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (validateStep1()) {
        audio.play('rally');
        setCurrentStep(1);
      } else {
        audio.play('courtSqueak');
      }
    } else if (currentStep === 1) {
      if (validateStep2()) {
        audio.play('rally');
        setCurrentStep(2);
      } else {
        audio.play('courtSqueak');
      }
    }
  };

  const handleBack = () => {
    audio.play('netDrop');
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFaculty = e.target.value;
    setFaculty(selectedFaculty);
    setDepartment(''); // Reset department
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    audio.play('serve');
    setErrorState(null);

    try {
      if (!user?.id) throw new Error('No user session found');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          reg_number: regNumber.trim() || null,
          level,
          faculty,
          department,
          is_active: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      audio.play('whistle');
      await refreshProfile();
      onComplete();
    } catch (err: any) {
      audio.play('courtSqueak');
      setErrorState(err.message || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [errorState, setErrorState] = useState<string | null>(null);

  const departments = faculty ? FACULTIES_AND_DEPARTMENTS[faculty] || [] : [];

  return (
    <div className="shuttle-panel p-6 sm:p-8 max-w-lg w-full mx-auto my-8">
      <h2
        className="text-2xl sm:text-3xl text-center mb-6 text-stroke text-sl-green"
        style={{ fontFamily: 'Bangers, cursive', textShadow: '2px 2px 0 var(--sl-border)' }}
      >
        LION ONBOARDING 🦁
      </h2>

      <StepProgress steps={steps} currentStep={currentStep} className="mb-8" />

      {errorState && (
        <div className="mb-6 p-3 bg-sl-error/15 border-2 border-sl-error text-sl-error text-xs font-bold rounded-lg text-center">
          ⚠️ {errorState}
        </div>
      )}

      {/* Step 1: Details */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <ShuttleInput
            label="Full Name (surname first)"
            placeholder="e.g. Okeke Chukwudi Emmanuel"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
          />
          <ShuttleInput
            label="Phone Number"
            type="tel"
            placeholder="e.g. +2348031234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
          />
          <ShuttleInput
            label="UNN Registration Number (Optional)"
            placeholder="e.g. 2021/174932"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            error={errors.regNumber}
          />
          <div className="pt-4">
            <ShuttleButton onClick={handleNext} fullWidth>
              Next: Academic Details
            </ShuttleButton>
          </div>
        </div>
      )}

      {/* Step 2: Academics */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <ShuttleSelect
            label="Current Level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            error={errors.level}
            options={LEVELS.map((lvl) => ({ value: lvl, label: `${lvl} Level` }))}
          />

          <ShuttleSelect
            label="Faculty"
            value={faculty}
            onChange={handleFacultyChange}
            error={errors.faculty}
            placeholder="Select your Faculty"
            options={Object.keys(FACULTIES_AND_DEPARTMENTS).map((fac) => ({
              value: fac,
              label: fac,
            }))}
          />

          <ShuttleSelect
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            error={errors.department}
            placeholder="Select Department"
            disabled={!faculty}
            options={departments.map((dept) => ({ value: dept, label: dept }))}
          />

          <div className="flex gap-4 pt-4">
            <ShuttleButton variant="white" onClick={handleBack} className="flex-1">
              Back
            </ShuttleButton>
            <ShuttleButton onClick={handleNext} className="flex-1">
              Next: Confirm
            </ShuttleButton>
          </div>
        </div>
      )}

      {/* Step 3: Welcome */}
      {currentStep === 2 && (
        <div className="space-y-6 text-center">
          <div className="text-5xl my-4">🏸🦁</div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--sl-green)' }}>
            Welcome to ShuttleLions, {fullName}!
          </h3>
          <p className="text-xs text-sl-muted font-semibold leading-relaxed max-w-sm mx-auto">
            You are registering as a student from <strong className="text-sl-foreground">{department}</strong>, {faculty} ({level} Level).
          </p>
          <div className="p-4 bg-sl-green/10 border-2 border-dashed border-sl-green rounded-lg text-left text-xs space-y-1.5">
            <h4 className="font-bold text-sl-green uppercase mb-1">Club Membership Fees:</h4>
            <div>• <strong>One-time Registration:</strong> ₦5,000</div>
            <div>• <strong>Monthly Membership:</strong> ₦1,000 / month</div>
          </div>
          <div className="flex gap-4 pt-4">
            <ShuttleButton variant="white" onClick={handleBack} className="flex-1" disabled={isSubmitting}>
              Back
            </ShuttleButton>
            <ShuttleButton onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Joining...' : 'Complete & Enter!'}
            </ShuttleButton>
          </div>
        </div>
      )}
    </div>
  );
}
