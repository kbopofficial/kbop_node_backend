

#### Bus Endpoints

- **GET** `/all_bus` - Retrieve all bus records.  
  **Response**: JSON array of bus data or `404` if no records found.

- **POST** `/add_bus` - Add a new bus.  
  **Body Requirements**: `name`, `route`, `status`, `stops`, `image_url`  
  **Response**: Confirmation message or `400/500` errors for missing details or failure.

- **PUT** `/update_bus` - Update an existing bus.  
  **Body Requirements**: `id`, optional updated fields  
  **Response**: Confirmation of update or `404` if not found.

- **DELETE** `/delete_bus` - Delete a bus by ID.  
  **Query Parameter**: `id`  
  **Response**: Confirmation of deletion or `404` if not found.

- **GET** `/via_bus` - Search buses by a stop along their route (not first or last).  
  **Query Parameter**: `via` (stop name)  
  **Response**: List of matching buses or `404` if none found.

- **GET** `/busName` - Retrieve buses by name.  
  **Query Parameter**: `busName`  
  **Response**: List of buses with matching name or `404` if not found.

- **GET** `/from-to` - Search buses that include stops in sequence.  
  **Query Parameters**: `from`, `to`  
  **Response**: Buses that include both stops in the correct sequence.

- **GET** `/busId` - Retrieve a bus by its ID.  
  **Query Parameter**: `id`  
  **Response**: Bus data or `404` if not found.



##### Team Member Endpoints

- **GET** `/all_team_members` - Retrieve all team members.  
  **Response**: JSON array of team member data.

- **POST** `/add_team_member` - Add a new team member.  
  **Body Requirements**: `name`, `designation`, `image_path`  
  **Response**: Confirmation message or `400/500` errors.

- **PUT** `/update_team_member` - Update an existing team member.  
  **Body Requirements**: `id`, optional fields to update  
  **Response**: Confirmation or `404` if not found.

- **DELETE** `/delete_team_member` - Delete a team member by ID.  
  **Query Parameter**: `id`  
  **Response**: Confirmation of deletion or `404` if not found.



##### Admin Endpoints

- **GET** `/all_admin` - Retrieve all admins.  
  **Response**: JSON array of admin data or message if none found.

- **POST** `/add_admin` - Add a new admin.  
  **Body Requirements**: `name`, `designation`, `email_id`  
  **Response**: Confirmation message or `400/500` errors.

- **PUT** `/update_admin` - Update an admin’s details.  
  **Body Requirements**: `id`, optional fields to update  
  **Response**: Confirmation or `404` if not found.

- **DELETE** `/delete_admin` - Delete an admin by ID.  
  **Query Parameter**: `id`  
  **Response**: Confirmation of deletion or `404` if not found.



#### News Endpoints

- **GET** `/all_news` - Retrieve all news records.  
  **Response**: JSON array of news data.

- **POST** `/add_news` - Add a news item.  
  **Body Requirements**: `image_url`, `url`, `news`  
  **Response**: Confirmation message or `400/500` errors.

- **PUT** `/update_news` - Update a news item.  
  **Body Requirements**: `id`, optional fields to update  
  **Response**: Confirmation or `404` if not found.

- **DELETE** `/delete_news` - Delete a news item by ID.  
  **Query Parameter**: `id`  
  **Response**: Confirmation of deletion or `404` if not found.
