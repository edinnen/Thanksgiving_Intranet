drop table if exists logs;
create table logs (
  id integer primary key autoincrement,
  members text not null,
  'entry' text not null
);
