import * as migration_20261101_050920_initial from './20261101_050920_initial';

export const migrations = [
  {
    up: migration_20261101_050920_initial.up,
    down: migration_20261101_050920_initial.down,
    name: '20261101_050920_initial'
  },
];
