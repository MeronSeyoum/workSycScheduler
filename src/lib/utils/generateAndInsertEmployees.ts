// // Employee Data Generator Script
// // Run this script to generate and insert 50+ employee records into your database

// import { api } from '@/lib/api'; // Adjust path as needed

// // Sample data arrays for generating realistic employee information
// const firstNames = [
//   'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
//   'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
//   'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
//   'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
//   'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
//   'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah',
//   'Timothy', 'Dorothy', 'Ronald', 'Lisa', 'Jason', 'Nancy', 'Edward', 'Karen',
//   'Jeffrey', 'Betty', 'Ryan', 'Helen', 'Jacob', 'Sandra', 'Gary', 'Donna',
//   'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon', 'Stephen', 'Michelle',
//   'Larry', 'Laura', 'Justin', 'Sarah', 'Scott', 'Kimberly', 'Brandon', 'Deborah'
// ];

// const lastNames = [
//   'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
//   'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
//   'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
//   'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
//   'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
//   'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
//   'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
//   'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
//   'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey'
// ];

// const positions = [
//   'Manager',
//   'Supervisor', 
//   'Team Leader',
//   'Cleaning Technician',
//   'Janitor',
//   'Sanitation Specialist',
//   'Floor Care Specialist',
//   'Window Cleaner',
//   'Carpet Cleaner',
//   'Restroom Attendant',
//   'Waste Management Operator',
//   'Disinfection Specialist',
//   'Green Cleaning Specialist'
// ];

// const statuses = ['active', 'on_leave', 'terminated', 'inactive', 'suspended'];

// const streetNames = [
//   'Ave SW', 'Ave SE', 'Ave NW', 'Ave NE', 'St SW', 'St SE', 'St NW', 'St NE',
//   'Bow Trail SW', 'Crowchild Trail NW', 'Deerfoot Trail SE', 'Macleod Trail SE',
//   'Centre St N', 'Edmonton Trail NE', 'Kensington Rd NW', 'Memorial Dr NE',
//   'Elbow Dr SW', 'Blackfoot Trail SE', 'Glenmore Trail SW', 'Anderson Rd SE',
//   'Country Hills Blvd NW', 'Harvest Hills Blvd NE', 'Sarcee Trail SW'
// ];

// const calgaryNeighborhoods = [
//   { name: 'Kensington', postalCode: 'T2N' },
//   { name: 'Hillhurst', postalCode: 'T2N' },
//   { name: 'Beltline', postalCode: 'T2G' },
//   { name: 'Mission', postalCode: 'T2S' },
//   { name: 'Inglewood', postalCode: 'T2G' },
//   { name: 'Bridgeland', postalCode: 'T2E' },
//   { name: 'Eau Claire', postalCode: 'T2P' },
//   { name: 'Chinatown', postalCode: 'T2E' },
//   { name: 'East Village', postalCode: 'T2G' },
//   { name: 'Sunalta', postalCode: 'T2R' },
//   { name: 'Lower Mount Royal', postalCode: 'T2R' },
//   { name: 'Upper Mount Royal', postalCode: 'T2R' },
//   { name: 'Rosedale', postalCode: 'T2N' },
//   { name: 'Crescent Heights', postalCode: 'T2N' },
//   { name: 'Sunnyside', postalCode: 'T2N' },
//   { name: 'Marda Loop', postalCode: 'T2T' },
//   { name: 'Kingsland', postalCode: 'T2V' },
//   { name: 'Forest Lawn', postalCode: 'T2B' },
//   { name: 'Marlborough', postalCode: 'T2A' },
//   { name: 'Temple', postalCode: 'T2K' },
//   { name: 'Thorncliffe', postalCode: 'T2K' },
//   { name: 'Highland Park', postalCode: 'T2E' },
//   { name: 'Renfrew', postalCode: 'T2E' },
//   { name: 'Bankview', postalCode: 'T2T' },
//   { name: 'Richmond', postalCode: 'T2T' },
//   { name: 'Knob Hill', postalCode: 'T2M' },
//   { name: 'Capitol Hill', postalCode: 'T2M' },
//   { name: 'Mount Pleasant', postalCode: 'T2N' },
//   { name: 'Tuxedo Park', postalCode: 'T2N' },
//   { name: 'Winston Heights', postalCode: 'T2K' }
// ];

// // Utility functions
// const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// const getRandomElements = (array, count) => {
//   const shuffled = [...array].sort(() => 0.5 - Math.random());
//   return shuffled.slice(0, count);
// };

// const generatePhoneNumber = () => {
//   const areaCode = Math.floor(Math.random() * 900) + 100;
//   const exchange = Math.floor(Math.random() * 900) + 100;
//   const number = Math.floor(Math.random() * 9000) + 1000;
//   return `(${areaCode}) ${exchange}-${number}`;
// };

// const generateEmail = (firstName, lastName) => {
//   const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'email.com'];
//   const domain = getRandomElement(domains);
//   const emailVariations = [
//     `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
//     `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
//     `${firstName.toLowerCase()}${lastName.charAt(0).toLowerCase()}@${domain}`,
//     `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}@${domain}`
//   ];
//   return getRandomElement(emailVariations);
// };

// const generateAddress = () => {
//   const streetNumber = Math.floor(Math.random() * 2999) + 1; // Calgary uses higher street numbers
//   const streetName = getRandomElement(streetNames);
//   const neighborhood = getRandomElement(calgaryNeighborhoods);
//   const postalCodeSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
//   const postalCode = `${neighborhood.postalCode} ${postalCodeSuffix}`;
  
//   return `${streetNumber} ${streetName}, Calgary, AB ${postalCode}`;
// };

// const generateHireDate = () => {
//   const start = new Date(2020, 0, 1); // Start from Jan 1, 2020
//   const end = new Date();
//   const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
//   return new Date(randomTime).toISOString().split('T')[0];
// };

// const generateTerminationDate = (hireDate, status) => {
//   if (status !== 'terminated') return null;
  
//   const hire = new Date(hireDate);
//   const now = new Date();
//   const randomTime = hire.getTime() + Math.random() * (now.getTime() - hire.getTime());
//   return new Date(randomTime).toISOString().split('T')[0];
// };

// const generateEmployeeCode = (index) => {
//   return `EMP-${String(index + 1).padStart(4, '0')}`;
// };

// // Generate single employee record
// const generateEmployee = (index) => {
//   const firstName = getRandomElement(firstNames);
//   const lastName = getRandomElement(lastNames);
//   const email = generateEmail(firstName, lastName);
//   const position = getRandomElement(positions);
//   const status = getRandomElement(statuses);
//   const hireDate = generateHireDate();
  
//   // Weight status distribution to be more realistic
//   const weightedStatus = Math.random() < 0.7 ? 'active' : getRandomElement(statuses);

//   return {
//     first_name: firstName,
//     last_name: lastName,
//     email: email,
//     phone_number: generatePhoneNumber(),
//     employee_code: generateEmployeeCode(index),
//     position: position,
//     status: weightedStatus,
//     hire_date: hireDate,
//     termination_date: generateTerminationDate(hireDate, weightedStatus),
//     assigned_locations: [], // Empty array as requested
//     profile_image_url: `https://i.pravatar.cc/150?u=${email}`, // Random avatar
//     contact: {
//       phone: generatePhoneNumber(),
//       emergencyContact: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)} - ${generatePhoneNumber()}`,
//       address: generateAddress()
//     }
//   };
// };

// // Main function to generate and insert employees
// const generateAndInsertEmployees = async (token, count = 50) => {
//   console.log(`Starting generation of ${count} employee records...`);
  
//   const employees = [];
//   const errors = [];
  
//   // Generate employee data
//   for (let i = 0; i < count; i++) {
//     try {
//       const employee = generateEmployee(i);
//       employees.push(employee);
//     } catch (error) {
//       console.error(`Error generating employee ${i + 1}:`, error);
//       errors.push({ index: i + 1, error: error.message });
//     }
//   }
  
//   console.log(`Generated ${employees.length} employee records`);
//   console.log('Sample employee record:');
//   console.log(JSON.stringify(employees[0], null, 2));
  
//   // Insert employees into database
//   let successCount = 0;
//   let failCount = 0;
  
//   for (let i = 0; i < employees.length; i++) {
//     try {
//       console.log(`Inserting employee ${i + 1}/${employees.length}: ${employees[i].first_name} ${employees[i].last_name}`);
      
//       await api.employees.createEmployee(employees[i], token);
//       successCount++;
      
//       // Add small delay to prevent overwhelming the API
//       await new Promise(resolve => setTimeout(resolve, 100));
      
//     } catch (error) {
//       console.error(`Failed to insert employee ${i + 1}:`, error.message);
//       errors.push({
//         employee: `${employees[i].first_name} ${employees[i].last_name}`,
//         error: error.message
//       });
//       failCount++;
//     }
//   }
  
//   console.log('\n=== INSERTION SUMMARY ===');
//   console.log(`Successfully inserted: ${successCount} employees`);
//   console.log(`Failed insertions: ${failCount} employees`);
  
//   if (errors.length > 0) {
//     console.log('\nErrors encountered:');
//     errors.forEach((error, index) => {
//       console.log(`${index + 1}. ${error.employee || `Employee ${error.index}`}: ${error.error}`);
//     });
//   }
  
//   console.log('\nEmployee generation completed!');
  
//   return {
//     totalGenerated: employees.length,
//     successfulInsertions: successCount,
//     failedInsertions: failCount,
//     errors: errors
//   };
// };

// // Export function for use in your application
// export { generateAndInsertEmployees, generateEmployee };

// // Example usage (uncomment to run):
// /*
// // You would call this in your application like:
// import { useAuth } from '@/components/providers/AuthProvider';

// const MyComponent = () => {
//   const { token } = useAuth();
  
//   const handleGenerateEmployees = async () => {
//     try {
//       const result = await generateAndInsertEmployees(token, 50);
//       console.log('Generation complete:', result);
//     } catch (error) {
//       console.error('Failed to generate employees:', error);
//     }
//   };
  
//   return (
//     <button onClick={handleGenerateEmployees}>
//       Generate 50 Employees
//     </button>
//   );
// };
// */

// // If you want to run this as a standalone script, uncomment below:
// /*
// // For standalone execution
// const runGenerator = async () => {
//   const YOUR_AUTH_TOKEN = 'your-auth-token-here'; // Replace with your actual token
//   const EMPLOYEE_COUNT = 50; // Adjust as needed
  
//   try {
//     const result = await generateAndInsertEmployees(YOUR_AUTH_TOKEN, EMPLOYEE_COUNT);
//     console.log('Final Result:', result);
//   } catch (error) {
//     console.error('Script failed:', error);
//   }
// };

// // Uncomment to run immediately
// // runGenerator();
// */


// // // Employee Data Generator Script
// // // Run this script to generate and insert 50+ employee records into your database

// // import { api } from '@/lib/api'; // Adjust path as needed

// // // Sample data arrays for generating realistic employee information
// // const firstNames = [
// //   'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
// //   'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
// //   'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
// //   'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
// //   'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
// //   'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah',
// //   'Timothy', 'Dorothy', 'Ronald', 'Lisa', 'Jason', 'Nancy', 'Edward', 'Karen',
// //   'Jeffrey', 'Betty', 'Ryan', 'Helen', 'Jacob', 'Sandra', 'Gary', 'Donna',
// //   'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon', 'Stephen', 'Michelle',
// //   'Larry', 'Laura', 'Justin', 'Sarah', 'Scott', 'Kimberly', 'Brandon', 'Deborah'
// // ];

// // const lastNames = [
// //   'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
// //   'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
// //   'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
// //   'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
// //   'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
// //   'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
// //   'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
// //   'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
// //   'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey'
// // ];

// // const positions = [
// //   'Manager',
// //   'Supervisor', 
// //   'Team Leader',
// //   'Cleaning Technician',
// //   'Janitor',
// //   'Sanitation Specialist',
// //   'Floor Care Specialist',
// //   'Window Cleaner',
// //   'Carpet Cleaner',
// //   'Restroom Attendant',
// //   'Waste Management Operator',
// //   'Disinfection Specialist',
// //   'Green Cleaning Specialist'
// // ];

// // const statuses = ['active', 'on_leave', 'terminated', 'inactive', 'suspended'];

// // const streetNames = [
// //   'Main St', 'Oak Ave', 'Pine St', 'Maple Ave', 'Cedar St', 'Elm St', 'Washington Ave',
// //   'Lincoln St', 'Park Ave', 'First St', 'Second St', 'Third St', 'Fourth St',
// //   'Church St', 'Market St', 'Water St', 'Mill St', 'School St', 'High St',
// //   'North St', 'South St', 'East St', 'West St', 'Center St', 'Spring St'
// // ];

// // const cities = [
// //   { name: 'New York', state: 'NY', zip: '10001' },
// //   { name: 'Los Angeles', state: 'CA', zip: '90001' },
// //   { name: 'Chicago', state: 'IL', zip: '60601' },
// //   { name: 'Houston', state: 'TX', zip: '77001' },
// //   { name: 'Phoenix', state: 'AZ', zip: '85001' },
// //   { name: 'Philadelphia', state: 'PA', zip: '19101' },
// //   { name: 'San Antonio', state: 'TX', zip: '78201' },
// //   { name: 'San Diego', state: 'CA', zip: '92101' },
// //   { name: 'Dallas', state: 'TX', zip: '75201' },
// //   { name: 'San Jose', state: 'CA', zip: '95101' },
// //   { name: 'Austin', state: 'TX', zip: '73301' },
// //   { name: 'Jacksonville', state: 'FL', zip: '32099' },
// //   { name: 'Fort Worth', state: 'TX', zip: '76101' },
// //   { name: 'Columbus', state: 'OH', zip: '43085' },
// //   { name: 'Charlotte', state: 'NC', zip: '28201' }
// // ];

// // const sampleLocations = [
// //   'Downtown Office Complex',
// //   'Westfield Shopping Mall',
// //   'Metropolitan Hospital',
// //   'Central High School',
// //   'Tech Park Building A',
// //   'Municipal Government Center',
// //   'Riverside Medical Clinic',
// //   'Corporate Headquarters',
// //   'University Campus',
// //   'Airport Terminal',
// //   'Convention Center',
// //   'Sports Arena',
// //   'Public Library',
// //   'Community Center',
// //   'Industrial Park'
// // ];

// // // Utility functions
// // const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// // const getRandomElements = (array, count) => {
// //   const shuffled = [...array].sort(() => 0.5 - Math.random());
// //   return shuffled.slice(0, count);
// // };

// // const generatePhoneNumber = () => {
// //   const areaCode = Math.floor(Math.random() * 900) + 100;
// //   const exchange = Math.floor(Math.random() * 900) + 100;
// //   const number = Math.floor(Math.random() * 9000) + 1000;
// //   return `(${areaCode}) ${exchange}-${number}`;
// // };

// // const generateEmail = (firstName, lastName) => {
// //   const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'email.com'];
// //   const domain = getRandomElement(domains);
// //   const emailVariations = [
// //     `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
// //     `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
// //     `${firstName.toLowerCase()}${lastName.charAt(0).toLowerCase()}@${domain}`,
// //     `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}@${domain}`
// //   ];
// //   return getRandomElement(emailVariations);
// // };

// // const generateAddress = () => {
// //   const streetNumber = Math.floor(Math.random() * 9999) + 1;
// //   const streetName = getRandomElement(streetNames);
// //   const city = getRandomElement(cities);
// //   return `${streetNumber} ${streetName}, ${city.name}, ${city.state} ${city.zip}`;
// // };

// // const generateHireDate = () => {
// //   const start = new Date(2020, 0, 1); // Start from Jan 1, 2020
// //   const end = new Date();
// //   const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
// //   return new Date(randomTime).toISOString().split('T')[0];
// // };

// // const generateTerminationDate = (hireDate, status) => {
// //   if (status !== 'terminated') return null;
  
// //   const hire = new Date(hireDate);
// //   const now = new Date();
// //   const randomTime = hire.getTime() + Math.random() * (now.getTime() - hire.getTime());
// //   return new Date(randomTime).toISOString().split('T')[0];
// // };

// // const generateEmployeeCode = (index) => {
// //   return `EMP${String(index + 1).padStart(4, '0')}`;
// // };

// // // Generate single employee record
// // const generateEmployee = (index) => {
// //   const firstName = getRandomElement(firstNames);
// //   const lastName = getRandomElement(lastNames);
// //   const email = generateEmail(firstName, lastName);
// //   const position = getRandomElement(positions);
// //   const status = getRandomElement(statuses);
// //   const hireDate = generateHireDate();
// //   const assignedLocationsCount = Math.floor(Math.random() * 4) + 1; // 1-4 locations
// //   const assignedLocations = getRandomElements(sampleLocations, assignedLocationsCount);
  
// //   // Weight status distribution to be more realistic
// //   const weightedStatus = Math.random() < 0.7 ? 'active' : getRandomElement(statuses);

// //   return {
// //     first_name: firstName,
// //     last_name: lastName,
// //     email: email,
// //     phone_number: generatePhoneNumber(),
// //     employee_code: generateEmployeeCode(index),
// //     position: position,
// //     status: weightedStatus,
// //     hire_date: hireDate,
// //     termination_date: generateTerminationDate(hireDate, weightedStatus),
// //     assigned_locations: assignedLocations,
// //     profile_image_url: `https://i.pravatar.cc/150?u=${email}`, // Random avatar
// //     contact: {
// //       phone: generatePhoneNumber(),
// //       emergencyContact: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)} - ${generatePhoneNumber()}`,
// //       address: generateAddress()
// //     }
// //   };
// // };

// // // Main function to generate and insert employees
// // const generateAndInsertEmployees = async (token, count = 50) => {
// //   console.log(`Starting generation of ${count} employee records...`);
  
// //   const employees = [];
// //   const errors = [];
  
// //   // Generate employee data
// //   for (let i = 0; i < count; i++) {
// //     try {
// //       const employee = generateEmployee(i);
// //       employees.push(employee);
// //     } catch (error) {
// //       console.error(`Error generating employee ${i + 1}:`, error);
// //       errors.push({ index: i + 1, error: error.message });
// //     }
// //   }
  
// //   console.log(`Generated ${employees.length} employee records`);
// //   console.log('Sample employee record:');
// //   console.log(JSON.stringify(employees[0], null, 2));
  
// //   // Insert employees into database
// //   let successCount = 0;
// //   let failCount = 0;
  
// //   for (let i = 0; i < employees.length; i++) {
// //     try {
// //       console.log(`Inserting employee ${i + 1}/${employees.length}: ${employees[i].first_name} ${employees[i].last_name}`);
      
// //       await api.employees.createEmployee(employees[i], token);
// //       successCount++;
      
// //       // Add small delay to prevent overwhelming the API
// //       await new Promise(resolve => setTimeout(resolve, 100));
      
// //     } catch (error) {
// //       console.error(`Failed to insert employee ${i + 1}:`, error.message);
// //       errors.push({
// //         employee: `${employees[i].first_name} ${employees[i].last_name}`,
// //         error: error.message
// //       });
// //       failCount++;
// //     }
// //   }
  
// //   console.log('\n=== INSERTION SUMMARY ===');
// //   console.log(`Successfully inserted: ${successCount} employees`);
// //   console.log(`Failed insertions: ${failCount} employees`);
  
// //   if (errors.length > 0) {
// //     console.log('\nErrors encountered:');
// //     errors.forEach((error, index) => {
// //       console.log(`${index + 1}. ${error.employee || `Employee ${error.index}`}: ${error.error}`);
// //     });
// //   }
  
// //   console.log('\nEmployee generation completed!');
  
// //   return {
// //     totalGenerated: employees.length,
// //     successfulInsertions: successCount,
// //     failedInsertions: failCount,
// //     errors: errors
// //   };
// // };

// // // Export function for use in your application
// // export { generateAndInsertEmployees, generateEmployee };

// // // Example usage (uncomment to run):
// // /*
// // // You would call this in your application like:
// // import { useAuth } from '@/components/providers/AuthProvider';

// // const MyComponent = () => {
// //   const { token } = useAuth();
  
// //   const handleGenerateEmployees = async () => {
// //     try {
// //       const result = await generateAndInsertEmployees(token, 50);
// //       console.log('Generation complete:', result);
// //     } catch (error) {
// //       console.error('Failed to generate employees:', error);
// //     }
// //   };
  
// //   return (
// //     <button onClick={handleGenerateEmployees}>
// //       Generate 50 Employees
// //     </button>
// //   );
// // };
// // */

// // // If you want to run this as a standalone script, uncomment below:
// // /*
// // // For standalone execution
// // const runGenerator = async () => {
// //   const YOUR_AUTH_TOKEN = 'your-auth-token-here'; // Replace with your actual token
// //   const EMPLOYEE_COUNT = 50; // Adjust as needed
  
// //   try {
// //     const result = await generateAndInsertEmployees(YOUR_AUTH_TOKEN, EMPLOYEE_COUNT);
// //     console.log('Final Result:', result);
// //   } catch (error) {
// //     console.error('Script failed:', error);
// //   }
// // };

// // // Uncomment to run immediately
// // // runGenerator();
// // */