import { lazy, Suspense } from 'react';
import Stat from '@/components/Stat';
import useActivities from '@/hooks/useActivities';
import { formatPace } from '@/utils/utils';
import useHover from '@/hooks/useHover';
import { yearStats, githubYearStats } from '@assets/index';
import { loadSvgComponent } from '@/utils/svgUtils';
import { SHOW_ELEVATION_GAIN } from '@/utils/const';
import { DIST_UNIT, M_TO_DIST, M_TO_ELEV } from '@/utils/utils';

const YearStat = ({
  year,
  onClick,
}: {
  year: string;
  onClick: (_year: string) => void;
}) => {
  const { activities: allRuns, years } = useActivities();
  const [hovered, eventHandlers] = useHover();
  
  // 1. Filter runs first
  let runs = allRuns;
  if (years.includes(year)) {
    runs = allRuns.filter((run) => run.start_date_local.slice(0, 4) === year);
  }

  // 2. Lazy Components
  const YearSVG = lazy(() => loadSvgComponent(yearStats, `./year_${year}.svg`));
  const GithubYearSVG = lazy(() =>
    loadSvgComponent(githubYearStats, `./github_${year}.svg`)
  );

  // 3. Calculation Loop
  let sumDistance = 0;
  let sumElevationGain = 0;
  let totalMetersAvail = 0;
  let totalSecondsAvail = 0;
  const activeWeeksSet = new Set();

  runs.forEach((run) => {
    sumDistance += run.distance || 0;
    sumElevationGain += run.elevation_gain || 0;
    
    if (run.average_speed) {
      totalMetersAvail += run.distance || 0;
      totalSecondsAvail += (run.distance || 0) / run.average_speed;
    }

    // Weekly consistency logic
    if (run.start_date_local) {
      const date = new Date(run.start_date_local);
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDays = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
      const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
      activeWeeksSet.add(`${date.getFullYear()}-${weekNum}`);
    }
  });

  // 4. Format Values
  const formattedDist = parseFloat((sumDistance / M_TO_DIST).toFixed(1));
  const avgPace = totalSecondsAvail > 0 ? formatPace(totalMetersAvail / totalSecondsAvail) : '0:00';
  const activeWeeks = activeWeeksSet.size;
  const GOAL_KM = 1000;
  const progressPercent = Math.min(Math.round((formattedDist / GOAL_KM) * 100), 100);

  return (
    <div className="cursor-pointer" onClick={() => onClick(year)}>
      <section {...eventHandlers}>
        <Stat value={year} description=" Journey" />
        <Stat value={runs.length} description=" Runs" />
        
        <div className="flex flex-col">
          <Stat value={formattedDist} description={` ${DIST_UNIT}`} />
          {(year === '2026' || year === 'Total') && (
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1 dark:bg-gray-800" style={{ minWidth: '100px' }}>
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
              <p className="text-[10px] text-gray-500 mt-0.5">{progressPercent}% of {GOAL_KM}km Goal</p>
            </div>
          )}
        </div>

        <Stat value={avgPace} description=" Avg Pace" />
        <Stat value={`${activeWeeks} wks`} description=" Consistency" />
      </section>

      {year !== 'Total' && hovered && (
        <Suspense fallback="loading...">
          <YearSVG className="year-svg my-4 h-4/6 w-4/6 border-0 p-0" />
          <GithubYearSVG className="github-year-svg my-4 h-auto w-full border-0 p-0" />
        </Suspense>
      )}
      <hr />
    </div>
  );
};

export default YearStat;
