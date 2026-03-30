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
  let { activities: runs, years } = useActivities();
  const [hovered, eventHandlers] = useHover();
  
  // Define what years we want to hide visually
  const isOldYear = year !== 'Total' && parseInt(year) < 2025;

  const YearSVG = lazy(() => loadSvgComponent(yearStats, `./year_${year}.svg`));
  const GithubYearSVG = lazy(() =>
    loadSvgComponent(githubYearStats, `./github_${year}.svg`)
  );

  if (years.includes(year)) {
    runs = runs.filter((run) => run.start_date_local.slice(0, 4) === year);
  }
  
  let sumDistance = 0;
  let streak = 0;
  let sumElevationGain = 0;
  let totalMetersAvail = 0;
  let totalSecondsAvail = 0;

  runs.forEach((run) => {
    sumDistance += run.distance || 0;
    sumElevationGain += run.elevation_gain || 0;
    if (run.average_speed) {
      totalMetersAvail += run.distance || 0;
      totalSecondsAvail += (run.distance || 0) / run.average_speed;
    }
    if (run.streak) {
      streak = Math.max(streak, run.streak);
    }
  });

  sumDistance = parseFloat((sumDistance / M_TO_DIST).toFixed(1));
  const sumElevationGainStr = (sumElevationGain * M_TO_ELEV).toFixed(0);
  const avgPace = totalSecondsAvail > 0 ? formatPace(totalMetersAvail / totalSecondsAvail) : '0';

  return (
    <div 
      className="cursor-pointer" 
      onClick={() => onClick(year)}
      style={{ display: isOldYear ? 'none' : 'block' }} // Hides old years without crashing
    >
      <section {...eventHandlers}>
        <Stat value={year} description=" Journey" />
        <Stat value={runs.length} description=" Runs" />
        <Stat value={sumDistance} description={` ${DIST_UNIT}`} />
        {SHOW_ELEVATION_GAIN && (
          <Stat value={sumElevationGainStr} description=" Elevation Gain" />
        )}
        <Stat value={avgPace} description=" Avg Pace" />
        <Stat value={`${streak} day`} description=" Streak" />
        {/* Heart Rate Stat Removed as requested */}
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
