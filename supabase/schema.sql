create table posts (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  slug                  text not null unique,        -- auto-generated from title
  docket_no             text not null unique,        -- auto-generated, "No. 001", "No. 002"...
  section               text not null default 'personal-essays'
                          check (section in (
                            'law-justice','criminal-justice','book-reviews',
                            'personal-essays','poetry-fiction','guest-posts','travel-diary'
                          )),
  dek                   text,                        -- short excerpt; auto-derived from body if left blank
  body_html             text not null,                -- sanitized HTML from the rich text editor
  cover_image_url       text,
  cover_image_position  text default 'center' check (cover_image_position in ('top','center','bottom')),
  location              text,                        -- optional free-form location (e.g. "Udaipur, Rajasthan")
  author                text not null default 'Pradyumn Singh Mephawat',
  status                text not null default 'draft' check (status in ('draft','published')),
  published_at          timestamptz,
  reading_time_minutes  int,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Public visitors can only ever read published posts.
alter table posts enable row level security;
create policy "public can read published posts"
  on posts for select using (status = 'published');
create policy "authenticated user has full access"
  on posts for all using (auth.role() = 'authenticated');

-- Seed posts
insert into posts (title, slug, docket_no, section, dek, body_html, cover_image_url, author, status, published_at, reading_time_minutes, created_at, updated_at)
values
(
  'The Quiet Work of Reading Judgments',
  'the-quiet-work-of-reading-judgments',
  'No. 001',
  'law-justice',
  'Why the language of the courtroom still matters outside it.',
  '<p>There is a peculiar discipline in reading court judgments not for the outcome, but for the sentence. The good ones move like essays: a premise stated, a counterargument weighed, a conclusion reached with something close to reluctance. The bad ones read like invoices&mdash;itemized, defensive, drained of voice.</p><p>I came to this habit late. Law school taught me to hunt for the ratio, to underline the holding, to treat everything else as scaffolding. But the scaffolding is where the mind of the court shows itself. A judge who explains slowly is not condescending; a judge who explains too quickly is often hiding something.</p><p>The public distrusts legal language, and not without reason. It is arcane when it needs to be precise, and pompous when it merely wants to be authoritative. Yet precision is a form of care. A sentence that admits its own limits is more trustworthy than one that pretends to certainty.</p><p>What I look for now, in judgment after judgment, is the moment where the voice softens. The point at which the court says, in effect, <em>we have considered this and we remain uncertain</em>. That uncertainty is not weakness. It is the opposite of propaganda.</p>',
  null,
  'Site Owner',
  'published',
  '2025-01-12 09:00:00+00',
  4,
  now(),
  now()
),
(
  'On Rereading <em>The Remains of the Day</em>',
  'on-rereading-the-remains-of-the-day',
  'No. 002',
  'book-reviews',
  'Ishiguro''s butler returns, older and more necessary than before.',
  '<p>The first time I read <em>The Remains of the Day</em> I was twenty-two and impatient. I thought Stevens a fool for postponing his life in service of a household that would not remember him. I underlined his mistakes in red ink, as if I were grading him.</p><p>Rereading it a decade later, I find him less foolish and more familiar. Stevens is not blind; he is loyal to a fault, and loyalty, when it outlives its object, becomes a kind of grief. His dignity is not pomposity. It is the last wall standing between him and the realization that he has misplaced his years.</p><p>Ishiguro never condemns him. The prose is too gentle for that. Instead, the novel accumulates small absences: a missed conversation, a withheld compliment, a drive to the sea that should have happened sooner. By the end, the tragedy is not that Stevens failed at love. It is that he understood love too late to change the shape of his life.</p><p>This is a novel about work, class, England, and politics, but it is finally a novel about time. We do not get it back. The best we can do is recognize, in the quiet of a pier at dusk, what we have spent it on.</p>',
  null,
  'Site Owner',
  'published',
  '2025-02-03 10:30:00+00',
  4,
  now(),
  now()
),
(
  'Poem for a Courtroom in Winter',
  'poem-for-a-courtroom-in-winter',
  'No. 003',
  'poetry-fiction',
  'A short poem on silence, oak, and the weight of waiting.',
  '<p>The radiator ticks like a clock someone forgot to wind.<br>The lawyers shuffle papers, each rustle a small pleading.</p><p>Outside, snow erases the city in white ink.<br>Inside, a witness waits to be asked the one true question.</p><p>The judge stares at the wall where no window is,<br>and for a moment the law is only a room, a voice, a winter.</p><p>When the gavel lifts, it lifts without malice.<br>What falls is only a sound. What remains is what we carry home.</p>',
  null,
  'Site Owner',
  'published',
  '2025-02-18 08:15:00+00',
  1,
  now(),
  now()
),
(
  'What the Prison Taught Me About Silence',
  'what-the-prison-taught-me-about-silence',
  'No. 004',
  'criminal-justice',
  'A volunteer reflects on the sound of a sentence being served.',
  '<p>For two years I taught writing at a medium-security facility an hour outside the city. I went in expecting noise: metal doors, shouted orders, the clatter of institutional life. What I found, more often, was silence. Not the silence of peace, but the silence of a room full of people who have learned that speaking can cost them.</p><p>The men I worked with wrote about their children first. Then their mothers. Then, weeks in, they wrote about the night that had brought them there. They did not ask for pity. They asked, usually, whether the sentences sounded true.</p><p>There is a theory that prison is meant to punish, rehabilitate, or deter. I saw a fourth function: it removes people from the economy of attention. Family visits thin. Phone credits run out. The world outside continues, and the person inside becomes, gradually, a secret.</p><p>I do not know what the correct policy is. But I know that any system which produces silence on this scale owes the rest of us an explanation. We ask them to disappear. Then we forget we asked.</p>',
  null,
  'Site Owner',
  'published',
  '2024-11-08 14:00:00+00',
  4,
  now(),
  now()
),
(
  'A Letter to the City I Left',
  'a-letter-to-the-city-i-left',
  'No. 005',
  'personal-essays',
  'On departure, return, and the way places keep their hold on us.',
  '<p>Dear city,</p><p>I did not leave you because I stopped loving you. I left because I could no longer afford the person I became when I walked your streets. There was always somewhere to be, someone to meet, a version of myself I was supposed to perform.</p><p>I thought I would return often. Instead, I return rarely, and each time you have changed a little more without me. A shop becomes a bank. A park loses its bench. The café where I wrote my first serious essay is now a pharmacy.</p><p>Still, certain corners remain. The bridge at dusk. The library reading room on a rainy afternoon. The street where I once stood for twenty minutes unable to decide whether to knock on a door. These places do not need me. They simply continue, and in continuing, they forgive.</p><p>I am older now. The cities I love are spread across years and continents. None of them is home in the old sense. Home, I have learned, is not a place that keeps you. It is a place you are allowed to remember without bitterness.</p>',
  null,
  'Site Owner',
  'published',
  '2024-09-22 11:00:00+00',
  3,
  now(),
  now()
),
(
  'The Prosecutor''s Dilemma',
  'the-prosecutors-dilemma',
  'No. 006',
  'law-justice',
  'When the law demands certainty and the facts refuse to provide it.',
  '<p>The prosecutor sat across from me with a coffee he did not drink. He had spent twenty years deciding whom to charge and with what, and the weight of that discretion had settled into his shoulders like a coat he no longer noticed.</p><p>We talked about a case that had troubled him: a death in a house fire, a defendant with a history of violence but no direct evidence, a family that wanted closure and called it justice. He had charged the case. The jury had convicted. Years later, a witness recanted.</p><p>His point was not that he had been wrong. His point was that the system had asked him to be certain when certainty was not available. The law pretends that charging decisions are either right or wrong. In practice, they are bets made with incomplete information.</p><p>What stayed with me was his final admission: he slept better when he declined to charge than when he charged and won. Victory, he said, can feel like proof. But proof is what you need before you win, not what the verdict supplies afterward.</p>',
  null,
  'Site Owner',
  'published',
  '2025-03-01 16:45:00+00',
  4,
  now(),
  now()
),
(
  'Why I Stopped Reading the News Before Bed',
  'why-i-stopped-reading-the-news-before-bed',
  'No. 007',
  'guest-posts',
  'A guest essay on attention, anxiety, and the shape of a day.',
  '<p>I used to read the news before bed because I thought it made me informed. What it made me was awake. My body would lie still while my mind raced through headlines: a court ruling, a fire, a politician''s statement, a number rising. The screen lit my face like a small moon.</p><p>The news is not designed for the end of the day. It is designed for the middle of it, when you are alert enough to absorb, share, and react. At night it becomes something else: a catalogue of everything you cannot fix before morning.</p><p>I stopped. Not because the world improved, but because I needed to believe that my own small life deserved the last hour of my consciousness. I read fiction instead. I read old letters. Sometimes I read nothing and simply listened to the house settle around me.</p><p>The news still happens. I catch it in the morning, with coffee, when I have the energy to feel what it asks me to feel. The difference is that I now fall asleep with my own thoughts, not someone else''s emergency.</p>',
  null,
  'A Guest Writer',
  'published',
  '2024-12-14 07:30:00+00',
  3,
  now(),
  now()
),
(
  'On Finding a First Edition in a Strange Town',
  'on-finding-a-first-edition-in-a-strange-town',
  'No. 008',
  'book-reviews',
  'A bookseller, a forgotten novel, and the accident that makes a library.',
  '<p>I was in a town I did not plan to visit, killing time before a delayed train, when I found the bookshop. It sat between a closing butcher and a vacant estate agent, its window crowded with paperbacks arranged by color rather than author.</p><p>The owner was reading behind the counter and did not look up. I browsed the way one browses in strange towns: without intention, ready to be surprised. On a bottom shelf, pressed between two book club editions, was a first edition of a novel I had loved at nineteen and lost at twenty-three in a move.</p><p>I bought it for less than the price of lunch. The owner wrapped it in brown paper without comment. I carried it onto the train and opened it to the first page, which I had not read in years.</p><p>Some books find you twice. The first time they shape you; the second time they recognize you. That night, in a hotel room overlooking a car park, I stayed up reading until the sky turned the color of old paper.</p>',
  null,
  'Site Owner',
  'published',
  '2024-08-30 13:20:00+00',
  4,
  now(),
  now()
);

-- Newsletter digest state — tracks the last time we successfully sent a digest.
-- A single-row table (enforced by the check constraint on id = 1).
-- The cron route reads last_notified_at to find new posts and writes it back
-- on success. On failure, it is left unchanged so the next run retries.
create table newsletter_state (
  id                  int primary key default 1,
  last_notified_at    timestamptz not null default now(),
  constraint newsletter_state_singleton check (id = 1)
);

-- Service role bypasses RLS by default; we still lock down public access.
alter table newsletter_state enable row level security;
-- No public SELECT/INSERT/UPDATE policies — only the service role key may touch this table.

-- Seed the single row; on conflict (re-running schema) do nothing.
insert into newsletter_state (id, last_notified_at)
  values (1, now())
  on conflict (id) do nothing;
