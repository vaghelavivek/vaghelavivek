const ENDPOINT = 'https://api.github.com/graphql';

const CALENDAR_FIELDS = `contributionCalendar {
  totalContributions
  weeks { contributionDays { date contributionCount contributionLevel } }
}`;

async function graphql(token, query, variables) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}: ${await response.text()}`);
  }
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub API error: ${payload.errors.map((e) => e.message).join('; ')}`);
  }
  return payload.data;
}

const toDays = (calendar) =>
  calendar.weeks.flatMap((week) =>
    week.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: d.contributionLevel,
    })),
  );

/** One query per calendar year since the account was created (API limit is 1 year per range). */
export async function fetchContributions(token, login, now = new Date()) {
  const { user } = await graphql(token, 'query($login: String!) { user(login: $login) { createdAt } }', { login });
  if (!user) throw new Error(`GitHub user "${login}" not found`);

  const firstYear = new Date(user.createdAt).getUTCFullYear();
  const currentYear = now.getUTCFullYear();
  const yearFields = [];
  for (let year = firstYear; year <= currentYear; year += 1) {
    const to = year === currentYear ? now.toISOString() : `${year}-12-31T23:59:59Z`;
    yearFields.push(`y${year}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${to}") { ${CALENDAR_FIELDS} }`);
  }

  const data = await graphql(
    token,
    `query($login: String!) { user(login: $login) { lastYear: contributionsCollection { ${CALENDAR_FIELDS} } ${yearFields.join('\n')} } }`,
    { login },
  );

  const { lastYear, ...years } = data.user;
  return {
    yearDays: Object.values(years).map((c) => toDays(c.contributionCalendar)),
    heatmapDays: toDays(lastYear.contributionCalendar),
  };
}
