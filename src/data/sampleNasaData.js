/**
 * Archived fallback content, used only when NASA's live services cannot be
 * reached. Everything here is clearly labelled "archived" in the app.
 * These are general descriptions of well-known events, not live measurements.
 */

export const ARCHIVED_SPACE_WEATHER = [
  {
    id: 'archived-gst-2024-05',
    type: 'Geomagnetic storm',
    name: 'Strong geomagnetic storm (May 2024)',
    date: '2024-05-10',
    description:
      'A series of eruptions from a very active region of the Sun reached Earth and caused the strongest geomagnetic storm in about 20 years. People saw colourful auroras much farther from the poles than usual.',
    link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
    source: 'NASA DONKI (archived summary)',
    archived: true,
  },
  {
    id: 'archived-flr-2024-05',
    type: 'Solar flare',
    name: 'Strong X-class solar flares (May 2024)',
    date: '2024-05',
    description:
      'During May 2024 the Sun produced several strong solar flares, the most powerful kind. Flares are sudden flashes of light and energy.',
    link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
    source: 'NASA DONKI (archived summary)',
    archived: true,
  },
];

/** Example record in the format of NASA's Mars Rover Photos API documentation. */
export const ARCHIVED_MARS_PHOTOS = [
  {
    id: 'archived-curiosity-1000',
    rover: 'Curiosity',
    camera: 'FHAZ',
    cameraFull: 'Front Hazard Avoidance Camera',
    earthDate: '2015-05-30',
    sol: 1000,
    img: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/fcam/FLB_486265257EDR_F0481570FHAZ00323M_.JPG',
    archived: true,
  },
];

export const ARTEMIS_INFO = {
  intro:
    'Artemis is NASA’s program to return astronauts to the Moon and to prepare for future human missions to Mars.',
  points: [
    'Artemis I was a test flight of the Space Launch System rocket and the Orion spacecraft, flown without a crew in 2022.',
    'Later Artemis missions are planned to carry astronauts around the Moon and then to the Moon’s south pole region.',
    'NASA plans to study how people can live and work on the Moon so we can learn how to go on to Mars.',
  ],
  note: 'Mission plans and dates change. Check NASA’s Artemis page for the latest news.',
  links: [{ label: 'NASA Artemis', url: 'https://www.nasa.gov/humans-in-space/artemis/' }],
};

export const OSDR_INFO = {
  intro:
    'NASA’s Open Science Data Repository (OSDR) is a free library of space biology data. Scientists share experiments there about how spaceflight, including microgravity and space radiation, affects living things such as cells, plants and animals.',
  note: 'These are research datasets. They are not live health monitoring of astronauts, and ASTRA does not turn them into game numbers.',
  searchUrl: 'https://osdr.nasa.gov/bio/repo/search?q=radiation&data_source=cgene',
  homeUrl: 'https://osdr.nasa.gov/bio/',
};

export const CREDITS = [
  {
    name: 'NASA DONKI – Space Weather Database Of Notifications, Knowledge, Information',
    use: 'Real space weather events (solar flares, coronal mass ejections, geomagnetic storms).',
    url: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
  },
  {
    name: 'NASA Open APIs (api.nasa.gov)',
    use: 'Access to DONKI and the Mars Rover Photos service.',
    url: 'https://api.nasa.gov/',
  },
  {
    name: 'NASA Mars Rover Photos',
    use: 'Photographs taken by Mars rovers, shown in the Mars mission.',
    url: 'https://api.nasa.gov/',
  },
  {
    name: 'NASA Open Science Data Repository (OSDR)',
    use: 'Space biology and radiation research datasets.',
    url: 'https://osdr.nasa.gov/bio/',
  },
  {
    name: 'NASA Artemis',
    use: 'Information about returning to the Moon.',
    url: 'https://www.nasa.gov/humans-in-space/artemis/',
  },
];
