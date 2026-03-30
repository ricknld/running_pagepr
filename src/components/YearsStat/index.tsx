import { useMemo } from 'react';
import YearStat from '@/components/YearStat';
import useActivities from '@/hooks/useActivities';
import { INFO_MESSAGE } from '@/utils/const';

const YearsStat = ({
  year,
  onClick,
}: {
  year: string;
  onClick: (_year: string) => void;
}) => {
  const { years } = useActivities();

// Memoize the years array calculation
  const yearsArrayUpdate = useMemo(() => {
    // 1. Only allow years 2025 and 2026
    const filteredYears = years.filter((y) => parseInt(y) >= 2025);
    
    let updatedYears = filteredYears.slice();
    updatedYears.push('Total');

    // 2. SAFETY CHECK: If the current 'year' is old (e.g. 2023), default to 'Total'
    // This prevents the "Rules of Hooks" error and undefined crashes
    const isValidYear = year === 'Total' || parseInt(year) >= 2025;
    const activeYear = isValidYear ? year : 'Total';

    // 3. Re-order the list so the active year is at the top
    updatedYears = updatedYears.filter((x) => x !== activeYear);
    updatedYears.unshift(activeYear);
    
    return updatedYears;
  }, [years, year]);

  const infoMessage = useMemo(() => {
    // Tell the message function we only have 2 years of data now (2025-2026)
    const activeYearsCount = years.filter((y) => parseInt(y) >= 2025).length;
    return INFO_MESSAGE(activeYearsCount, year);
  }, [years, year]);

  // for short solution need to refactor
  return (
    <div className="w-full pb-16 pr-16 lg:w-full lg:pr-16">
      <section className="pb-0">
        <p className="leading-relaxed">
          {infoMessage}
          <br />
        </p>
      </section>
      <hr />
      {yearsArrayUpdate.map((yearItem) => (
        <YearStat key={yearItem} year={yearItem} onClick={onClick} />
      ))}
    </div>
  );
};

export default YearsStat;
