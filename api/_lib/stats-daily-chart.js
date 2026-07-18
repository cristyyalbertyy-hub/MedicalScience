const STATS_DAILY_COLLECTION = "stats_daily";
const BATCH_LIMIT = 450;

function dayKeyFromIso(iso) {
  const text = String(iso ?? "").trim();
  if (text.length >= 10) return text.slice(0, 10);
  return null;
}

function isValidDayKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function buildDailySalesMap(ordersSnap) {
  const salesByDay = new Map();
  ordersSnap.forEach((doc) => {
    const day = dayKeyFromIso(doc.data().processed_at);
    if (!day) return;
    salesByDay.set(day, (salesByDay.get(day) ?? 0) + 1);
  });
  return salesByDay;
}

async function commitBatch(batch, pendingWrites) {
  if (pendingWrites <= 0) return;
  await batch.commit();
}

/**
 * Merge Vercel unique visitors + Lemon Squeezy sales into Firestore stats_daily.
 * Returns the full historical series (no time window cap).
 */
export async function syncVisitorsVsSalesChart(db, dailyVisitors, ordersSnap) {
  const salesByDay = buildDailySalesMap(ordersSnap);
  const visitorsByDay = new Map(
    (dailyVisitors ?? []).map((entry) => [entry.date, entry.pageviews ?? entry.visitors ?? 0]),
  );

  const storedSnap = await db.collection(STATS_DAILY_COLLECTION).get();
  const stored = new Map();
  storedSnap.forEach((doc) => stored.set(doc.id, doc.data()));

  const todayKey = new Date().toISOString().slice(0, 10);
  const allDates = new Set([
    ...stored.keys(),
    ...salesByDay.keys(),
    ...visitorsByDay.keys(),
    todayKey,
  ]);

  const dates = [...allDates].filter(isValidDayKey).sort();
  let batch = db.batch();
  let pendingWrites = 0;
  const series = [];

  for (const date of dates) {
    if (date > todayKey) continue;

    const fromVercel = visitorsByDay.has(date);
    const visitors = fromVercel
      ? visitorsByDay.get(date) ?? 0
      : stored.get(date)?.visitors ?? 0;
    const sales = salesByDay.get(date) ?? stored.get(date)?.sales ?? 0;

    const previous = stored.get(date);
    const changed =
      fromVercel ||
      salesByDay.has(date) ||
      !previous ||
      previous.visitors !== visitors ||
      previous.sales !== sales;

    if (changed) {
      batch.set(
        db.collection(STATS_DAILY_COLLECTION).doc(date),
        {
          date,
          visitors,
          sales,
          updated_at: new Date().toISOString(),
        },
        { merge: true },
      );
      pendingWrites += 1;

      if (pendingWrites >= BATCH_LIMIT) {
        await commitBatch(batch, pendingWrites);
        batch = db.batch();
        pendingWrites = 0;
      }
    }

    series.push({
      date,
      visitors,
      sales,
      is_today: date === todayKey,
    });
  }

  await commitBatch(batch, pendingWrites);

  return {
    total_days: series.length,
    today: todayKey,
    series,
  };
}
