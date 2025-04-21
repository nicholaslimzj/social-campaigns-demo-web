'use client';

import { useState, useEffect } from 'react';
import { Company } from '../utils/api';

interface CompanySelectorProps {
  companies: Company[];
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ 
  companies,
  selectedCompany, 
  onCompanyChange 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCompanyChange(e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={selectedCompany}
        onChange={handleChange}
        className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {companies.map((company) => (
          <option key={company.company} value={company.company}>
            {company.company}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

export default CompanySelector;