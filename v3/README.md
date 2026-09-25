# KBOP Node Backend - V3 API Documentation

Welcome to the **V3 API Documentation** for the KBOP Node Backend. 

The V3 API introduces a modular architectural structure, dedicated MongoDB database connection (`MONGO_URL_V3`), relational bus-to-city reference schema, delta-sync timestamp tracking, and standardized pagination support.

---

## 📌 Base URL & Mount Point

All V3 endpoints are mounted under `/v3` on the root application server:
`http://<host>:<port>/v3`

---

## 🔑 Architecture & Key Concepts

### 1. Database Connection (`db.js`)
V3 uses a dedicated Mongoose connection via `MONGO_URL_V3` environment variable. All models in `v3/modules/*` register on this connection.

### 2. Auto Timestamp Sync (`shared/touchLastUpdated.js`)
Whenever write operations (`POST`, `PUT`, `DELETE`) occur on tracked modules (`cities`, `buses`, `team`, `emergency`, `news`, `about`, `socialLinks`), the system automatically updates the global timestamp in the `LastUpdated` document. Clients use `GET /v3/lastupdated` to check if cached local data needs re-syncing.

### 3. Delta-Sync & Pagination (`shared/pagination.js`)
Used by endpoints like `/v3/cities/allstops` and `/v3/buses`.
- **Query Parameters**:
  - `size` *(number, default: 100)*: Items per page packet.
  - `packet` *(number, default: 1)*: Page packet number (1-indexed).
  - `last_updated` *(ISO date string, optional)*: Filter for records created or updated after this date (`$or: [{ updatedAt: { $gt: checkDate } }, { createdAt: { $gt: checkDate } }]`).

- **Paginated Response Envelope**:
  ```json
  {
    "packet": 1,
    "totalPackets": 5,
    "size": 100,
    "data": [ ... ]
  }
  ```
  If up-to-date or no records found:
  ```json
  {
    "message": "Already up to date",
    "packet": 1,
    "totalPackets": 0,
    "size": 100,
    "data": []
  }
  ```

---

## 📑 Complete Endpoint Reference

---

### 🕒 1. Last Updated Module (`/v3/lastupdated`)

Tracks write timestamps across application sections.

#### 🔹 `GET /v3/lastupdated`
Get the global last-updated timestamps document.

- **Response `200 OK`**:
  ```json
  {
    "_id": "66f123456789...",
    "cities": "2026-09-23T10:00:00.000Z",
    "buses": "2026-09-23T11:30:00.000Z",
    "team": "2026-09-20T08:15:00.000Z",
    "emergency": "2026-09-15T12:00:00.000Z",
    "news": "2026-09-22T14:20:00.000Z",
    "about": "2026-08-01T00:00:00.000Z",
    "socialLinks": "2026-09-10T09:45:00.000Z",
    "admin": {
      "master_admin": true,
      "local_admin": false,
      "community_admin": false
    }
  }
  ```
  The `admin` flags are resolved from the optional `useremail` request header, matched case-insensitively against `email_id` in the Admin collection (`master_admin` ← `main`, `local_admin`, `community_admin`). If the header is missing or matches no admin, all flags are `false`.

---

### 🏙️ 2. Cities & Stops Module (`/v3/cities`)

Manages city and bus stop geolocation entries (`name`, `lat`, `lng`, `zones`). `zones` is the list of zones of all buses that stop at the city; it is kept in sync automatically when buses are created, updated or deleted.

#### 🔹 `GET /v3/cities`
Fetch all cities in non-paginated format.
- **Query Parameters**: `zone` *(string, optional)* - only cities whose `zones` contain it.
- **Response `200 OK`**: Array of City objects.

#### 🔹 `GET /v3/cities/allstops`
Fetch paginated cities with delta-sync filtering.
- **Query Parameters**: `size`, `packet`, `last_updated`, `zone` *(optional)*
- **Response `200 OK`**: Paginated envelope with City array in `data`.

#### 🔹 `POST /v3/cities`
Create a new city/stop. *Triggers `lastUpdated.cities` touch.*
- **Request Body**:
  ```json
  {
    "name": "Belagavi Central",
    "lat": 15.8497,
    "lng": 74.4977,
    "zones": ["1", "4"]
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "City created",
    "city": {
      "_id": "66f1001...",
      "name": "Belagavi Central",
      "lat": 15.8497,
      "lng": 74.4977,
      "zones": ["1", "4"],
      "createdAt": "2026-09-23T12:00:00.000Z",
      "updatedAt": "2026-09-23T12:00:00.000Z"
    }
  }
  ```

#### 🔹 `PUT /v3/cities/:id`
Update an existing city by ID. *Triggers `lastUpdated.cities` touch.*
- **Request Body**: Partial or full fields (`name`, `lat`, `lng`, `zones`).
- **Response `200 OK`**: `{ "message": "City updated successfully", "city": { ... } }`

#### 🔹 `DELETE /v3/cities/:id`
Delete a city by ID. *Triggers `lastUpdated.cities` touch.*
- **Response `200 OK`**: `{ "message": "City deleted successfully", "city": { ... } }`

---

### 🚌 3. Buses Module (`/v3/buses`)

Manages bus schedules, routes, status, and associated stop sequences.

#### 🔹 `GET /v3/buses`
Fetch paginated buses (with populated `stops` arrays).
- **Query Parameters**:
  - `zone` *(string, optional)*: Filter by zone name.
  - `size`, `packet`, `last_updated`: Delta-sync pagination.
- **Response `200 OK`**: Paginated envelope with Bus objects (populated City stops) in `data`.

#### 🔹 `GET /v3/buses/names`
Get lightweight array of bus names, zones and IDs.
- **Response `200 OK`**:
  ```json
  [
    { "_id": "66f2001...", "name": "Bus 12A", "zone": "1" }
  ]
  ```

#### 🔹 `GET /v3/buses/disabled`
Fetch disabled buses (`enable: false`).
- **Query Parameters**: `zone` *(string, optional)*
- **Response `200 OK`**: `{ "disabledBuses": [ ... ] }`
- **Response `404 Not Found`**: `{ "message": "No disabled buses found." }`

#### 🔹 `GET /v3/buses/via`
Find buses passing through a given stop.
- **Query Parameters**: `stop` *(string, required)* - City ObjectId.
- **Response `200 OK`**: Array of matching Bus objects with populated `stops`.

#### 🔹 `GET /v3/buses/from-to`
Find buses traveling from origin stop to destination stop in sequential order (`from` stop must appear before `to` stop in the route array).
- **Query Parameters**:
  - `from` *(string, required)* - City ObjectId
  - `to` *(string, required)* - City ObjectId
- **Response `200 OK`**: Array of matching Bus objects.

#### 🔹 `GET /v3/buses/:id`
Get a single bus by ID with populated `stops`.
- **Response `200 OK`**: Bus object.

#### 🔹 `POST /v3/buses`
Create a new bus. *Triggers `lastUpdated.buses` touch.*
- **Request Body**:
  ```json
  {
    "name": "Route 4 express",
    "route": "Central to North",
    "status": "On Time",
    "image_url": "https://example.com/bus.jpg",
    "enable": true,
    "firstservice": 600,
    "lastservice": 2200,
    "zone": "North",
    "stops": ["66f1001...", "66f1002..."]
  }
  ```
- Zones of the cities in `stops` are re-synced from the buses' `zone`.
- **Response `201 Created`**: `{ "message": true, "bus": { ... } }`

#### 🔹 `PUT /v3/buses/:id`
Update a bus by ID. *Triggers `lastUpdated.buses` touch.*
- **Response `200 OK`**: `{ "message": "Bus updated", "bus": { ... } }`

#### 🔹 `DELETE /v3/buses/:id`
Delete a bus by ID. *Triggers `lastUpdated.buses` touch.*
- **Response `200 OK`**: `{ "message": "Bus deleted successfully" }`

---

### 👥 4. Team Module (`/v3/team`)

Manages organization team members.

#### 🔹 `GET /v3/team`
- **Response `200 OK`**: Array of Team Member objects.

#### 🔹 `POST /v3/team`
Create a new team member. *Triggers `lastUpdated.team` touch.*
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "designation": "Lead Developer",
    "image_path": "https://example.com/jane.jpg",
    "insta": "janedoe",
    "facebook": "janedoe",
    "others": "https://linkedin.com/in/janedoe",
    "order": 1
  }
  ```
- **Response `201 Created`**: `{ "message": "New member added successfully", "member": { ... } }`

#### 🔹 `PUT /v3/team/:id`
Update a team member by ID. *Triggers `lastUpdated.team` touch.*

#### 🔹 `DELETE /v3/team/:id`
Delete a team member by ID. *Triggers `lastUpdated.team` touch.*

---

### 📰 5. News Module (`/v3/news`)

Manages news items and announcements.

#### 🔹 `GET /v3/news`
- **Response `200 OK`**: Array of News objects.

#### 🔹 `POST /v3/news`
Create a news entry. *Triggers `lastUpdated.news` touch.*
- **Request Body**:
  ```json
  {
    "image_url": "https://example.com/news.jpg",
    "url": "https://example.com/news/1",
    "news": "New bus line launching soon!",
    "order": 1
  }
  ```
- **Response `201 Created`**: `{ "message": "News added successfully", "news": { ... } }`

#### 🔹 `PUT /v3/news/:id`
Update a news item by ID. *Triggers `lastUpdated.news` touch.*

#### 🔹 `DELETE /v3/news/:id`
Delete a news item by ID. *Triggers `lastUpdated.news` touch.*

---

### ℹ️ 6. About Module (`/v3/about`)

Manages application about info and version details.

#### 🔹 `GET /v3/about`
- **Response `200 OK`**: Array of About objects.

#### 🔹 `POST /v3/about`
Create about info. *Triggers `lastUpdated.about` touch.*
- **Request Body**: `{ "about": "KBOP App v3", "version": "3.0.0" }`
- **Response `201 Created`**: `{ "message": "about created", "about": { ... } }`

#### 🔹 `PUT /v3/about/:id`
Update about entry by ID. *Triggers `lastUpdated.about` touch.*

#### 🔹 `DELETE /v3/about/:id`
Delete about entry by ID. *Triggers `lastUpdated.about` touch.*

---

### 🚨 7. Emergency Contacts Module (`/v3/emergency`)

Manages emergency helpline contacts.

#### 🔹 `GET /v3/emergency`
- **Response `200 OK`**: Array of Emergency objects.

#### 🔹 `POST /v3/emergency`
Create emergency contact. *Triggers `lastUpdated.emergency` touch.*
- **Request Body**: `{ "title": "Police Helpline", "value": "112", "order": 1 }`
- **Response `201 Created`**: `{ "message": "Emergency contact added", "item": { ... } }`

#### 🔹 `PUT /v3/emergency/:id`
Update emergency contact by ID. *Triggers `lastUpdated.emergency` touch.*

#### 🔹 `DELETE /v3/emergency/:id`
Delete emergency contact by ID. *Triggers `lastUpdated.emergency` touch.*

---

### 🔗 8. Social Links Module (`/v3/social-links`)

Manages platform social media links.

#### 🔹 `GET /v3/social-links`
- **Response `200 OK`**: Array of Social Link objects.

#### 🔹 `POST /v3/social-links`
Create social link. *Triggers `lastUpdated.socialLinks` touch.*
- **Request Body**: `{ "platform": "Twitter", "url": "https://x.com/kbop", "order": 1 }`
- **Response `201 Created`**: `{ "message": "Social link added", "link": { ... } }`

#### 🔹 `PUT /v3/social-links/:id`
Update social link by ID. *Triggers `lastUpdated.socialLinks` touch.*

#### 🔹 `DELETE /v3/social-links/:id`
Delete social link by ID. *Triggers `lastUpdated.socialLinks` touch.*

---

### 👑 9. Admin Module (`/v3/admin`)

Manages administrator profiles.

#### 🔹 `GET /v3/admin`
- **Response `200 OK`**: Array of Admin objects (or `"No admin found"` string if empty).

#### 🔹 `POST /v3/admin`
Create an admin profile.
- **Request Body**:
  ```json
  {
    "name": "Super Admin",
    "designation": "System Administrator",
    "email_id": "admin@kbop.org",
    "phone": 9876543210,
    "main": true,
    "image_path": "https://example.com/admin.jpg"
  }
  ```
- **Response `201 Created`**: `{ "message": "Admin added successfully", "admin": { ... } }`

#### 🔹 `PUT /v3/admin/:id`
Update admin profile by ID.

#### 🔹 `DELETE /v3/admin/:id`
Delete admin profile by ID.

---

### 📅 10. Event Module (`/v3/event`)

Manages events with TTL auto-expiration via MongoDB index on `expiresAt`.

#### 🔹 `GET /v3/event`
- **Response `200 OK`**: Array of Event objects.

#### 🔹 `POST /v3/event`
Create an event with optional expiration.
- **Request Body**:
  ```json
  {
    "name": "Annual City Marathon",
    "image_url": "https://example.com/event.jpg",
    "url": "https://example.com/event",
    "order": 1,
    "expiresAt": "2026-10-01T00:00:00.000Z"
  }
  ```
- **Response `201 Created`**: `{ "message": "Event created with expiration timer", "event": { ... } }`

#### 🔹 `PUT /v3/event/:id`
Update event by ID.

#### 🔹 `DELETE /v3/event/:id`
Delete event by ID.

---

### ❓ 11. Help Module (`/v3/help`)

Manages user help and FAQ links.

#### 🔹 `GET /v3/help`
- **Response `200 OK`**: Array of Help objects.

#### 🔹 `POST /v3/help`
Create help item.
- **Request Body**: `{ "info": "How to track buses?", "url": "https://kbop.org/faq/bus-tracking" }`
- **Response `201 Created`**: `{ "message": "help created", "help": { ... } }`

#### 🔹 `PUT /v3/help/:id`
Update help item by ID.

#### 🔹 `DELETE /v3/help/:id`
Delete help item by ID.

---

## 🛠️ Data Models & Schemas

| Entity | Fields | References / Notes |
| :--- | :--- | :--- |
| **City** | `name` *(String)*, `lat` *(Number)*, `lng` *(Number)*, `zones` *(String[])*, `timestamps` | Base stop location |
| **Bus** | `name`, `route`, `status`, `image_url`, `enable` *(Boolean)*, `firstservice` *(Number)*, `lastservice` *(Number)*, `zone`, `stops` *(ObjectId[])*, `timestamps` | `stops` references `City` model |
| **LastUpdated** | `cities`, `buses`, `team`, `emergency`, `news`, `about`, `socialLinks` *(Dates)* | Singleton doc tracking write dates |
| **Team** | `name`, `designation`, `image_path`, `insta`, `facebook`, `others`, `order`, `timestamps` | Team members |
| **News** | `image_url`, `url`, `news`, `order`, `timestamps` | News feed |
| **About** | `about`, `version`, `timestamps` | Application metadata |
| **Emergency** | `title`, `value`, `order`, `timestamps` | Emergency contacts |
| **SocialLink** | `platform`, `url`, `order`, `timestamps` | Social links |
| **Admin** | `name`, `designation`, `image_path`, `email_id`, `phone`, `main` *(Boolean, master admin)*, `local_admin` *(Boolean)*, `community_admin` *(Boolean)*, `timestamps` | System administrators |
| **Event** | `name`, `image_url`, `url`, `order`, `expiresAt` *(Date)* | TTL index: `expiresAt` (auto-purged) |
| **Help** | `info`, `url`, `timestamps` | FAQ / Help resources |
