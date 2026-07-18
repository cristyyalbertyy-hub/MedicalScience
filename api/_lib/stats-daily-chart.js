const STATS_DAILY_COLLECTION = "stats_daily";

function dayKeyFromIso(iso) {
  const text = String(iso ?? "").trim();
  if (text.length >= 10) return text.slice(0, 10);
  return null;
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

function getCurrentMonthMeta(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const todayKey = now.toISOString().slice(0, 10);
  const monthLabelRaw = new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));

  return {
    monthKey,
    daysInMonth,
    todayKey,
    monthLabel: monthLabelRaw.charAt(0).toUpperCase() + monthLabelRaw.slice(1),
  };
}

/**
 * Full calendar month for the vertical chart: days 1..N persist in Firestore
 * so earlier days stay visible (unlike the rolling 7-day horizontal chart).
 */
export async function syncVisitorsVsSalesChart(db, monthDailyVisitors, ordersSnap) {
  const monthMeta = getCurrentMonthMeta();
  const salesByDay = buildDailySalesMap(ordersSnap);
  const visitorsByDay = new Map(
    (monthDailyVisitors ?? []).map((entry) => [entry.date, entry.pageviews ?? 0]),
  );

  const storedSnap = await db
    .collection(STATS_DAILY_COLLECTION)
    .where("month_key", "==", monthMeta.monthKey)
    .get();
  const stored = new Map();
  storedSnap.forEach((doc) => stored.set(doc.id, doc.data()));

  const batch = db.batch();
  const series = [];

  for (let day = 1; day <= monthMeta.daysInMonth; day += 1) {
    const date = `${monthMeta.monthKey}-${String(day).padStart(2, "0")}`;
    const isFuture = date > monthMeta.todayKey;
    const isToday = date === monthMeta.todayKey;

    let visitors = 0;
    let sales = 0;

    if (!isFuture) {
      if (visitorsByDay.has(date)) {
        visitors = visitorsByDay.get(date) ?? 0;
      } else {
        visitors = stored.get(date)?.visitors ?? 0;
      }

      sales = salesByDay.get(date) ?? stored.get(date)?.sales ?? 0;

      batch.set(
        db.collection(STATS_DAILY_COLLECTION).doc(date),
        {
          date,
          month_key: monthMeta.monthKey,
          visitors,
          sales,
          updated_at: new Date().toISOString(),
        },
        { merge: true },
      );
    }

    series.push({
      date,
      day,
      visitors,
      sales,
      is_today: isToday,
      is_future: isFuture,
    });
  }

  await batch.commit();

  return {
    month_label: monthMeta.monthLabel,
    month_key: monthMeta.monthKey,
    days_in_month: monthMeta.daysInMonth,
    today: monthMeta.todayKey,
    series,
  };
}
