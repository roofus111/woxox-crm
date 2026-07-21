# WOXOX CRM backend (crmserver)

Cloned from: https://github.com/SoorajCanbridge/crmserver.git  
Local path: `C:\Users\CanBridge\Projects\crmserver`

## Run (memory Mongo — no install)

```powershell
cd C:\Users\CanBridge\Projects\crmserver
npm run dev
```

Listens on **http://localhost:8000**

### Demo login (seeded locally)

- Email: `admin@woxox.local`
- Password: `admin123`
- Role: `admin`

## Connect to CRM frontend

`crm/.env` already has:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Open http://localhost:3000/en/login and use the demo credentials above.

## Notes

- Memory Mongo = empty DB each restart (except while the process stays up)
- Redis is optional; logs may show `ECONNREFUSED :6379` — WhatsApp/email queues skip without Redis
- For production data, set `MONGODB_URI` to Atlas and run `npm start` instead of `npm run dev`
