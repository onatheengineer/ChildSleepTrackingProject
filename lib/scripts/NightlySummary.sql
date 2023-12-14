SELECT( SELECT count(*) from PROJECT.deviceAnalyticsSummaryTracker WHERE date=DATE(NOW())) as totalinTracker,
      (SELECT count(*) from PROJECT.deviceAnalyticsSummary WHERE date=DATE(NOW())) as totalin,
      (SELECT count(*) from PROJECT.deviceAnalyticsSummaryTracker WHERE date=DATE(NOW()) AND algoDate is not null ) as totalinTAlgo,
      (SELECT count(*) from PROJECT.deviceAnalyticsSummary WHERE date=DATE(NOW()) AND nightSleepDuration is null) as totalNullin;


