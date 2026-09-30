# LAKSHMI Saree Tassels Website

## Customer website
Open `/`

Customers can select tassels, enter their name, and send the selection to LAKSHMI on WhatsApp.

WhatsApp number configured: +91 9398463438.

## Admin
Open `/admin`

Default login (used only if no variables are set):
- Username: `admin`
- Password: `Lakshmi@123`

Change the login before publishing by setting these variables (in Railway: Service > Variables):

```
ADMIN_USER=yourusername
ADMIN_PASS=yourstrongpassword
SESSION_SECRET=some-long-random-secret
```

Notes:
- Do not use quotes or spaces around the values.
- After changing variables, redeploy so the new values are used.

## Run locally
1. Install Node.js 18+.
2. In this folder run: `npm install`
3. Run: `npm start`
4. Open http://localhost:3000
5. Admin: http://localhost:3000/admin

## Hosting (Railway)
This is a Node.js + SQLite site. Railway erases files on every redeploy, so add a Volume to keep products and uploaded images:

1. Railway service > Settings > Volumes > add a volume with mount path `/data`.
2. In Variables add:

```
DATA_DIR=/data/db
UPLOAD_DIR=/data/uploads
```

3. Redeploy.

If these two variables are not set, the site stores data in the `data` folder and `public/uploads`, which are lost on redeploy.

## WhatsApp
The customer order opens a WhatsApp chat with a pre-filled message. The customer must press Send. This uses WhatsApp's click-to-chat behavior.
