import "dotenv/config";
import bcrypt from 'bcrypt';
import { pool } from './database.js';

const SALT_ROUNDS = 10;

async function createAdminFromEnv() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.log('ADMIN_EMAIL and ADMIN_PASSWORD not set. Skipping admin creation.');
      process.exit(0);
    }

    console.log('\nCreating admin user from environment variables...');

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      if (user.role === 'admin') {
        console.log('Admin user already exists. Skipping.');
        process.exit(0);
      } else {
        // Update to admin
        await pool.query(
          'UPDATE users SET role = $1 WHERE id = $2',
          ['admin', user.id]
        );
        console.log('Existing user updated to admin role.');
        process.exit(0);
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create admin user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, email_verified, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, created_at`,
      [email.toLowerCase(), passwordHash, true, 'admin']
    );

    const admin = result.rows[0];
    console.log('Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminFromEnv();
