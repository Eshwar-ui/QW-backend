# Update Users to Sample Data

This script updates all existing users in the database with sample data for testing purposes.

## What It Does

1. **Updates All User Details:**
   - First name, last name
   - Email, mobile number
   - Date of birth, joining date
   - Department, designation, grade
   - Address, bank details
   - PAN, UAN, ESI numbers
   - All other employee fields

2. **Sets Same Password for All Users:**
   - Password: `Test@123`
   - All users (including admins) will have this password

3. **Generates Sample Attendance Data:**
   - Creates attendance records for the last 3 months
   - Includes punch in/out times
   - Calculates working hours and break times
   - Skips weekends
   - 80% attendance rate (random)

4. **Generates Sample Leave Data:**
   - Creates 2-5 leave records per user
   - Various leave types (Sick, Casual, Earned, etc.)
   - Different statuses (New, Approved, Rejected)
   - Random dates from joining date to present

## How to Run

### Option 1: Using npm script
```bash
cd Back-end
npm run update-sample-data
```

### Option 2: Direct node command
```bash
cd Back-end
node updateUsersToSampleData.js
```

## Important Notes

⚠️ **WARNING:** This script will:
- **Update ALL existing users** with new sample data
- **Delete ALL existing attendance records** and create new ones
- **Delete ALL existing leave records** and create new ones
- **Change all passwords** to `Test@123`

⚠️ **Backup your database** before running this script if you have important data!

## What Gets Updated

### Employee Fields Updated:
- ✅ First Name & Last Name
- ✅ Email (new format: firstname.lastname{index}@quantumworks.in)
- ✅ Mobile Number
- ✅ Date of Birth
- ✅ Joining Date
- ✅ Password (all set to `Test@123`)
- ✅ Department
- ✅ Designation
- ✅ Gender
- ✅ Grade
- ✅ Address
- ✅ Bank Name
- ✅ Account Number
- ✅ IFSC Code
- ✅ PAN Number
- ✅ UAN Number
- ✅ ESI Number
- ✅ Father's Name
- ✅ Mobile Access Enabled (random)

### Data Generated:
- ✅ Attendance records (last 3 months)
- ✅ Leave records (2-5 per user)

## Sample Output

```
Starting user data update...

Found 10 employees to update

Test password: Test@123 (hashed)

Clearing existing attendance and leave records...
Cleared existing records

Processing 1/10: QWIT-1001 - Admin User
  ✓ Updated employee data
  ✓ Created 45 attendance records
  ✓ Created 3 leave records

Processing 2/10: QWIT-1002 - HR Administrator
  ✓ Updated employee data
  ✓ Created 42 attendance records
  ✓ Created 4 leave records

...

==================================================
Update Summary:
==================================================
✓ Updated 10 employees
✓ Created 425 attendance records
✓ Created 32 leave records

All users now have password: Test@123
==================================================
```

## Testing Credentials

After running the script, you can login with any user using:
- **Email:** Any user's email (check database)
- **Password:** `Test@123`

## Customization

You can modify the script to:
- Change the test password (line 12)
- Adjust attendance generation logic
- Change leave generation parameters
- Modify sample data arrays (firstNames, departments, etc.)

## Troubleshooting

If you encounter errors:
1. Make sure MongoDB is running
2. Check database connection in `.env`
3. Verify all models are correctly imported
4. Check console for specific error messages

