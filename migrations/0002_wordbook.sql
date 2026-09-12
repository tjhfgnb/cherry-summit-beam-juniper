create table if not exists words (
  id text not null,
  user_id text not null,
  en text not null,
  zh text not null,
  phonetic text not null default '',
  pos text not null default '',
  example_en text not null default '',
  example_zh text not null default '',
  note text not null default '',
  tags text not null default '[]',
  starred boolean not null default false,
  ease integer not null default 0,
  interval_days integer not null default 0,
  next_review_at bigint not null default 0,
  review_count integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  created_at bigint not null,
  updated_at bigint not null,
  source text not null default 'manual',
  primary key (user_id, id)
);
create index if not exists words_user_id_idx on words (user_id);

create table if not exists practice_stats (
  user_id text primary key,
  streak integer not null default 0,
  last_practice_date text,
  total_reviews integer not null default 0,
  updated_at bigint not null
);
