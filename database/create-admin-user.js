import "dotenv/config";
import bcrypt from 'bcrypt';
import { pool } from './database.js';
import readline from 'readline';

const SALT_ROUNDS = 10;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
  try {
    console.log('\n========================================');
    console.log('Create Initial Admin User');
    console.log('========================================\n');

    // Get email
    const email = await question('Admin email: ');
    if (!email || !email.includes('@')) {
      console.error('Invalid email format');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      if (user.role === 'admin') {
        console.log('\nThis user is already an admin.');
        const updateRole = await question('Do you want to continue anyway? (y/n): ');
        if (updateRole.toLowerCase() !== 'y') {
          console.log('Cancelled.');
          process.exit(0);
        }
      } else {
        console.log('\nUser exists but is not an admin.');
        const updateRole = await question('Update this user to admin? (y/n): ');
        if (updateRole.toLowerCase() === 'y') {
          await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2',
            ['admin', user.id]
          );
          console.log('\nUser role updated to admin successfully!');
          process.exit(0);
        } else {
          console.log('Cancelled.');
          process.exit(0);
        }
      }
    }

    // Get password (note: readline doesn't hide input, for production use a proper password input library)
    const password = await question('Admin password (min 6 characters): ');
    if (!password || password.length < 6) {
      console.error('Password must be at least 6 characters');
      process.exit(1);
    }

    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      process.exit(1);
    }

    // Hash password
    console.log('\nCreating admin user...');
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create admin user with verified email
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, email_verified, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, created_at`,
      [email.toLowerCase(), passwordHash, true, 'admin']
    );

    const admin = result.rows[0];

    console.log('\n========================================');
    console.log('Admin user created successfully!');
    console.log('========================================');
    console.log(`ID: ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Created: ${admin.created_at}`);
    console.log('\nYou can now log in and start sending invitations.');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\nError creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
