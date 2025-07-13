DELETE FROM uploads
WHERE created_at < NOW() - INTERVAL '7 days';