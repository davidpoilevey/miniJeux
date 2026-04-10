const REAL_SECONDS_PER_SIM_HOUR = 10;
const MS_PER_SIM_HOUR = REAL_SECONDS_PER_SIM_HOUR * 1000;

export function TimeSystem(world, delta) {
  if (!world.time) return;

  const { time } = world;

  // delta est en millisecondes
  const scaledDelta = delta * time.timeScale;

  // combien d'heures simulées ont passé ?
  const simHoursPassed = scaledDelta / MS_PER_SIM_HOUR;
  time.deltaSimHours = simHoursPassed;

  time.totalHours += simHoursPassed;

  // recalculer jour / heure / minute
  const totalMinutes = time.totalHours * 60;

  const currentDayTotal = Math.floor(totalMinutes / (60 * 24));

  time.day = currentDayTotal + 1;
  time.weekday = (currentDayTotal % 7) + 1;

  const minutesToday = totalMinutes % (60 * 24);

  time.hour = Math.floor(minutesToday / 60);
  time.minute = Math.floor(minutesToday % 60);
}


export function setTimeScale(world, scale) {
  world.time.timeScale = scale;
}

export function isWeekday(world, weekday) {
  return world.time.weekday === weekday;
}

export function isHour(world, hour) {
  return world.time.hour === hour;
}


export function scheduleSystem(world) {
  const currentHour = world.time.hour + world.time.minute / 60;

  Object.values(world.entities).forEach(entity => {
    if (!entity.schedule) return;

    const active = entity.schedule.find(event =>
      currentHour >= event.start &&
      currentHour < event.end
    );
    if (entity.forcedNeed === "work" && !active) {

      entity.forcedNeed = "home";
      entity.currentGoal = "goToCar";
      entity.currentAction=null;// on arrete l'action en cours
    }

    if (!active) return;

    entity.forcedNeed = active.type;
    if (entity.currentGoal != null) return;

    if (active.type == 'work')
      entity.currentGoal = "goToCar"
    if (active.type == 'sleep')
      entity.currentGoal = "goToBed"

  });
}
