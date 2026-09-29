# LAKSHMI Saree Tassels Website

## Customer website
Open `/`

Customers can select tassels, enter their name, and send the selection to LAKSHMI on WhatsApp.

WhatsApp number configured: +91 9398463438.

## Admin
Open `/admin`

Default login:
- Username: `admin`
- Password: `Lakshmi@123`

Change the password before publishing by setting:
ADMIN_USER=yourusername
ADMIN_PASS=yourstrongpassword
SESSION_SECRET=some-long-random-secret

## Run
1. Install Node.js 18+.
2. In this folder run: `npm install`
3. Run: `npm start`
4. Open http://localhost:3000
5. Admin: http://localhost:3000/admin

## Hosting
This is a Node.js + SQLite site. It can be deployed to a Node-compatible host. Make sure the `data` folder and `public/uploads` are on persistent storage, otherwise uploaded images/database data may be lost after a restart/redeploy.

## WhatsApp
The customer order opens a WhatsApp chat with a pre-filled message. The customer must press Send. This uses WhatsApp's click-to-chat behavior.
