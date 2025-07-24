import React from 'react';
import {
  User,
  Truck,
  FileUp,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Personal Details',
    icon: User,
    color: 'green',
  },
  {
    number: 2,
    title: 'Vehicle Details',
    icon: Truck,
    color: 'blue',
  },
  {
    number: 3,
    title: 'Upload Documents',
    icon: FileUp,
    color: 'amber',
  },
  {
    number: 4,
    title: 'Service Location',
    icon: MapPin,
    color: 'purple',
  },
  {
    number: 5,
    title: 'Terms & Conditions',
    icon: CheckCircle2,
    color: 'gray',
  },
];

const statusStyles = {
  completed: {
    border: 'border-l-4 border-green-600',
    bg: 'bg-green-100',
    iconBg: 'bg-green-600',
    iconColor: 'text-white',
    title: 'text-green-900',
    status: 'text-green-700',
  },
  current: {
    border: 'border-l-4 border-blue-600',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-600',
    iconColor: 'text-white',
    title: 'text-blue-900',
    status: 'text-blue-600',
  },
  pending: {
    border: 'border-l-4 border-slate-200',
    bg: 'bg-white',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-400',
    title: 'text-slate-900',
    status: 'text-slate-500',
  },
};

const RegistrationSidebar = ({ currentStep, onStepClick }) => {
  return (
    <aside className="bg-slate-50 rounded-xl p-3 m-4 w-64 min-w-[220px]">
      <nav className="flex flex-col gap-4">
        {steps.map((step) => {
          let status = 'pending';
          if (currentStep === step.number) status = 'current';
          else if (currentStep > step.number) status = 'completed';
          const style = statusStyles[status];
          return (
            <button
              type="button"
              key={step.number}
              onClick={() => onStepClick(step.number)}
              className={`flex items-center gap-4 px-5 py-4 rounded-lg transition-all text-left w-full ${style.bg} ${style.border} shadow-sm`}
            >
              <span className={`flex items-center justify-center w-11 h-11 rounded-full text-xl ${style.iconBg} ${style.iconColor}`}>
                {React.createElement(step.icon, { size: 26 })}
              </span>
              <span>
                <div className={`font-semibold text-lg ${style.title}`}>{step.title}</div>
                <div className={`text-xs mt-1 ${style.status}`}>
                  {status === 'current' ? 'Current Step' : status === 'completed' ? 'Completed' : 'Pending'}
                </div>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default RegistrationSidebar; 