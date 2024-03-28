INSERT INTO geopoints (
  id,
  latitude,
  longitude,
  formatted_address
) VALUES (
  'ChIJUUWhWpJa6IkRxyb1X3N_H1A',
  40.8044311,
  -72.8655558,
  '44 Grand Ave, Shirley, NY 11967, USA'
), (
  'ChIJHRlMCnNrsYkRb9B5_0l_r_Q',
  37.5952,
  -77.6003895,
  '10123 Palace Way, Richmond, VA 23238, USA'
);

INSERT INTO users (
  email,
  first_name,
  geopoint_id,
  id,
  is_active,
  last_name,
  phone_number,
  role
) VALUES (
  'johndoe@gmail.com',
  'John',
  'ChIJUUWhWpJa6IkRxyb1X3N_H1A',
  'caba1dbc-1295-459d-9b2e-95c72cde40da',
  true,
  'Doe',
  '1234567890',
  'client'
), (
  'janedoe@gmail.com',
  'Jane',
  'ChIJHRlMCnNrsYkRb9B5_0l_r_Q',
  '03bc12d3-1458-4681-9d72-6f92efb7c462',
  true,
  'Doe',
  '1234567890',
  'client'
);

INSERT INTO user_settings (
  id,
  is_dark_mode
) VALUES (
  'caba1dbc-1295-459d-9b2e-95c72cde40da',
  false
), (
  '03bc12d3-1458-4681-9d72-6f92efb7c462',
  false
);
