import { lazy, Suspense } from 'react';
import Stat from '@/components/Stat';
import useActivities from '@/hooks/useActivities';
import { formatPace } from '@/utils/utils';
import useHover from '@/hooks/useHover';
import { yearStats, githubYearStats } from '@assets/index';
import { loadSvgComponent } from '@/utils/svgUtils';
import { SHOW_ELEVATION_GAIN } from '@/utils/utils';
import { DIST_UNIT, M_TO_DIST, M_TO_ELEV } from '@/utils/utils';

const YearStat = ({
  year,
  onClick,
}: {
  year: string;
  onClick: (_year: string) => void;
}) => {
  let { activities: runs, years } = useActivities();
  const [hovered, eventHandlers] = useHover();
  const YearSVG = lazy(() => loadSvgComponent(yearStats, `./year_${year}.svg`));
  const GithubYearSVG = lazy(() =>
    loadSvgComponent(githubYearStats, `./github_${year}.svg`)
  );

  if (years.includes(year)) {
    runs = runs.filter((run) => run.start_date_local.slice(0, 4) === year);
  }

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
    // Logic for Consistency (Weeks)
    if (run.start_date_local) {
      const date = new Date(run.start_date_local);
      const oneJan = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - oneJan.getTime()) / 86400000);
      const weekNum = Math.ceil((days + oneJan.getDay() + 1) / 7);
      activeWeeksSet.add(`${date.getFullYear()}-${weekNum}`);
    }
  });

  sumDistance = parseFloat((sumDistance / M_TO_DIST).toFixed(1));
  const sumElevationGainStr = (sumElevationGain * M_TO_ELEV).toFixed(0);
  const avgPace = formatPace(totalMetersAvail / totalSecondsAvail);

  // Progress Bar Variables
  const GOAL_KM = 1000;
  const progressPercent = Math.min(Math.round((sumDistance / GOAL_KM) * 100), 100);

  // prettier-ignore
  return (
    <div className="cursor-pointer" onClick={() => onClick(year)}>
      <section {...eventHandlers}>
        <Stat value={year} description=" Journey" />
        <Stat value={runs.length} description=" Runs" />
        <Stat value={sumDistance} description={` ${DIST_UNIT}`} />
        {SHOW_ELEVATION_GAIN && (
          <Stat value={sumElevationGainStr} description=" Elevation Gain" />
        )}
        <Stat value={avgPace} description=" Avg Pace" />
        <Stat value={`${activeWeeksSet.size} Wks`} description=" Consistency" />
      </section>

      {(year === '2026' || year === 'Total') && (
        <div className="mt-2 mb-4 h-1.5 w-full rounded-full bg-gray-200 opacity-80 dark:bg-gray-700">
          <div
            className="h-1.5 rounded-full bg-blue-600"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

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